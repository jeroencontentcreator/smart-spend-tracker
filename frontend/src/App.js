import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { 
  Plus, 
  TrendingUp, 
  PieChart, 
  Target, 
  Wallet,
  Calendar,
  DollarSign,
  ShoppingBag,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  FileText,
  GraduationCap,
  MoreHorizontal
} from "lucide-react";
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Category icons mapping
const categoryIcons = {
  'Food': Utensils,
  'Travel': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Gamepad2,
  'Healthcare': Heart,
  'Bills': FileText,
  'Education': GraduationCap,
  'Other': MoreHorizontal
};

// Category colors
const categoryColors = {
  'Food': '#FF6B6B',
  'Travel': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Healthcare': '#FECA57',
  'Bills': '#FF9FF3',
  'Education': '#54A0FF',
  'Other': '#C7ECEE'
};

const Dashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your financial insights...</div>
      </div>
    );
  }

  const budgetPercentage = dashboardData ? (dashboardData.total_expenses_month / dashboardData.monthly_limit) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SmartSpend</h1>
          <p className="text-gray-600">Money Made Mindful</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Today's Spending</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{dashboardData?.total_expenses_today?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{dashboardData?.total_expenses_month?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  {isOverBudget ? 'Over Budget' : 'Remaining Budget'}
                </p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{Math.abs(dashboardData?.remaining_budget || 0).toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isOverBudget ? 'bg-red-100' : 'bg-purple-100'}`}>
                <Target className={`h-6 w-6 ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{budgetPercentage.toFixed(1)}% of monthly limit</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => onNavigate('add-expense')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center"
          >
            <Plus className="h-8 w-8 mb-2" />
            <span className="font-medium">Add Expense</span>
          </button>
          
          <button 
            onClick={() => onNavigate('analytics')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center"
          >
            <TrendingUp className="h-8 w-8 mb-2" />
            <span className="font-medium">Analytics</span>
          </button>
          
          <button 
            onClick={() => onNavigate('goals')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center"
          >
            <Target className="h-8 w-8 mb-2" />
            <span className="font-medium">Goals</span>
          </button>
          
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center">
            <PieChart className="h-8 w-8 mb-2" />
            <span className="font-medium">Insights</span>
          </button>
        </div>

        {/* Category Breakdown */}
        {dashboardData?.expenses_by_category && Object.keys(dashboardData.expenses_by_category).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.expenses_by_category).map(([category, amount]) => {
                const IconComponent = categoryIcons[category] || MoreHorizontal;
                return (
                  <div key={category} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="p-2 rounded-full mr-3"
                      style={{ backgroundColor: categoryColors[category] + '20' }}
                    >
                      <IconComponent 
                        className="h-5 w-5" 
                        style={{ color: categoryColors[category] }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{category}</p>
                      <p className="font-semibold text-gray-800">₹{amount.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        {dashboardData?.recent_expenses && dashboardData.recent_expenses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h3>
            <div className="space-y-3">
              {dashboardData.recent_expenses.map((expense) => {
                const IconComponent = categoryIcons[expense.category] || MoreHorizontal;
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="p-2 rounded-full mr-3"
                        style={{ backgroundColor: categoryColors[expense.category] + '20' }}
                      >
                        <IconComponent 
                          className="h-5 w-5" 
                          style={{ color: categoryColors[expense.category] }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{expense.description}</p>
                        <p className="text-sm text-gray-600">{expense.category} • {expense.date}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">₹{expense.amount.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddExpense = ({ onNavigate, onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Bills', 'Education', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      await axios.post(`${API}/expenses`, {
        amount: parseFloat(amount),
        category,
        description
      });
      
      setAmount('');
      setDescription('');
      onExpenseAdded();
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did you spend on?"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Analytics = ({ onNavigate }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = {
    labels: Object.keys(analyticsData?.category_breakdown || {}),
    datasets: [{
      data: Object.values(analyticsData?.category_breakdown || {}),
      backgroundColor: Object.keys(analyticsData?.category_breakdown || {}).map(cat => categoryColors[cat] || '#ccc'),
      borderWidth: 0
    }]
  };

  const trendData = {
    labels: analyticsData?.spending_trends?.slice(-7).map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [{
      label: 'Daily Spending',
      data: analyticsData?.spending_trends?.slice(-7).map(item => item.amount) || [],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md"
          >
            ←
          </button>
          <h2 className="text-3xl font-bold text-gray-800">Analytics</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spending</h3>
            <p className="text-3xl font-bold text-blue-600">
              ₹{analyticsData?.monthly_summary?.total_spending?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Daily Average</h3>
            <p className="text-3xl font-bold text-green-600">
              ₹{analyticsData?.monthly_summary?.average_daily?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500">Per day</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Transactions</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analyticsData?.monthly_summary?.total_transactions || 0}
            </p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h3>
            {Object.keys(analyticsData?.category_breakdown || {}).length > 0 ? (
              <div className="h-64">
                <Doughnut 
                  data={categoryData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Spending Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Spending Trends</h3>
            {analyticsData?.spending_trends?.length > 0 ? (
              <div className="h-64">
                <Line 
                  data={trendData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Goals = ({ onNavigate }) => {
  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) return;

    try {
      await axios.post(`${API}/goals`, {
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount)
      });
      
      setNewGoal({ title: '', target_amount: '' });
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md"
            >
              ←
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Savings Goals</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund, Vacation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first savings goal!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{goal.title}</h3>
                      <p className="text-gray-600">₹{goal.current_amount.toFixed(2)} of ₹{goal.target_amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{progress.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Complete</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining: ₹{(goal.target_amount - goal.current_amount).toFixed(2)}</span>
                    {goal.deadline && <span>Due: {goal.deadline}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      {currentView === 'dashboard' && (
        <Dashboard key={refreshTrigger} onNavigate={setCurrentView} />
      )}
      {currentView === 'add-expense' && (
        <AddExpense onNavigate={setCurrentView} onExpenseAdded={handleExpenseAdded} />
      )}
      {currentView === 'analytics' && (
        <Analytics onNavigate={setCurrentView} />
      )}
      {currentView === 'goals' && (
        <Goals onNavigate={setCurrentView} />
      )}
    </div>
  );
}

export default App;
