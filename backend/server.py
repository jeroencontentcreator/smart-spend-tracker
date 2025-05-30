from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Expense Categories
class ExpenseCategory(str, Enum):
    FOOD = "Food"
    TRAVEL = "Travel"
    SHOPPING = "Shopping"
    ENTERTAINMENT = "Entertainment"
    HEALTHCARE = "Healthcare"
    BILLS = "Bills"
    EDUCATION = "Education"
    OTHER = "Other"

# Models
class ExpenseCreate(BaseModel):
    amount: float
    category: ExpenseCategory
    description: str
    date: Optional[date] = Field(default_factory=date.today)

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    category: ExpenseCategory
    description: str
    date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: float
    deadline: Optional[date] = None

class SavingsGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardData(BaseModel):
    total_expenses_month: float
    total_expenses_today: float
    expenses_by_category: dict
    recent_expenses: List[Expense]
    monthly_limit: Optional[float] = 5000.0
    remaining_budget: float

class AnalyticsData(BaseModel):
    spending_trends: List[dict]
    category_breakdown: dict
    monthly_summary: dict
    weekly_comparison: dict

# Routes
@api_router.get("/")
async def root():
    return {"message": "SmartSpend API - Money Made Mindful"}

# Expense Routes
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate):
    expense_dict = expense_data.dict()
    expense_obj = Expense(**expense_dict)
    await db.expenses.insert_one(expense_obj.dict())
    return expense_obj

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(limit: int = 50):
    expenses = await db.expenses.find().sort("created_at", -1).limit(limit).to_list(limit)
    return [Expense(**expense) for expense in expenses]

@api_router.get("/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return Expense(**expense)

@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, expense_data: ExpenseCreate):
    existing_expense = await db.expenses.find_one({"id": expense_id})
    if not existing_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense_data.dict()
    await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
    
    updated_expense = await db.expenses.find_one({"id": expense_id})
    return Expense(**updated_expense)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# Savings Goal Routes
@api_router.post("/goals", response_model=SavingsGoal)
async def create_savings_goal(goal_data: SavingsGoalCreate):
    goal_dict = goal_data.dict()
    goal_obj = SavingsGoal(**goal_dict)
    await db.savings_goals.insert_one(goal_obj.dict())
    return goal_obj

@api_router.get("/goals", response_model=List[SavingsGoal])
async def get_savings_goals():
    goals = await db.savings_goals.find().sort("created_at", -1).to_list(100)
    return [SavingsGoal(**goal) for goal in goals]

@api_router.put("/goals/{goal_id}/add-amount")
async def add_to_goal(goal_id: str, amount: float):
    goal = await db.savings_goals.find_one({"id": goal_id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    new_amount = goal['current_amount'] + amount
    await db.savings_goals.update_one({"id": goal_id}, {"$set": {"current_amount": new_amount}})
    
    updated_goal = await db.savings_goals.find_one({"id": goal_id})
    return SavingsGoal(**updated_goal)

# Dashboard Route
@api_router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data():
    from datetime import datetime, timedelta
    
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    
    # Get month and today expenses
    monthly_expenses = await db.expenses.find({"date": {"$gte": month_start.isoformat()}}).to_list(1000)
    today_expenses = await db.expenses.find({"date": today.isoformat()}).to_list(1000)
    
    total_month = sum(exp['amount'] for exp in monthly_expenses)
    total_today = sum(exp['amount'] for exp in today_expenses)
    
    # Category breakdown
    category_breakdown = {}
    for exp in monthly_expenses:
        cat = exp['category']
        category_breakdown[cat] = category_breakdown.get(cat, 0) + exp['amount']
    
    # Recent expenses (last 5)
    recent = await db.expenses.find().sort("created_at", -1).limit(5).to_list(5)
    recent_expenses = [Expense(**exp) for exp in recent]
    
    monthly_limit = 5000.0  # Default limit
    remaining_budget = monthly_limit - total_month
    
    return DashboardData(
        total_expenses_month=total_month,
        total_expenses_today=total_today,
        expenses_by_category=category_breakdown,
        recent_expenses=recent_expenses,
        monthly_limit=monthly_limit,
        remaining_budget=remaining_budget
    )

# Analytics Route
@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics():
    from datetime import datetime, timedelta
    
    # Last 30 days for trends
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    expenses = await db.expenses.find({"created_at": {"$gte": thirty_days_ago}}).to_list(1000)
    
    # Daily spending trends
    daily_spending = {}
    category_totals = {}
    
    for exp in expenses:
        exp_date = exp['created_at'].date().isoformat()
        daily_spending[exp_date] = daily_spending.get(exp_date, 0) + exp['amount']
        
        cat = exp['category']
        category_totals[cat] = category_totals.get(cat, 0) + exp['amount']
    
    # Convert to chart format
    spending_trends = [{"date": k, "amount": v} for k, v in daily_spending.items()]
    spending_trends.sort(key=lambda x: x['date'])
    
    # Monthly summary
    total_spending = sum(exp['amount'] for exp in expenses)
    avg_daily = total_spending / 30 if total_spending > 0 else 0
    
    monthly_summary = {
        "total_spending": total_spending,
        "average_daily": avg_daily,
        "total_transactions": len(expenses)
    }
    
    # Weekly comparison (simplified)
    this_week_start = datetime.utcnow() - timedelta(days=7)
    this_week_expenses = [exp for exp in expenses if exp['created_at'] >= this_week_start]
    last_week_expenses = [exp for exp in expenses if exp['created_at'] < this_week_start and exp['created_at'] >= this_week_start - timedelta(days=7)]
    
    weekly_comparison = {
        "this_week": sum(exp['amount'] for exp in this_week_expenses),
        "last_week": sum(exp['amount'] for exp in last_week_expenses)
    }
    
    return AnalyticsData(
        spending_trends=spending_trends,
        category_breakdown=category_totals,
        monthly_summary=monthly_summary,
        weekly_comparison=weekly_comparison
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
