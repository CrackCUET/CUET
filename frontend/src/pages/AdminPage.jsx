import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Users, FileText, TrendingUp, Search, 
  ChevronLeft, ChevronRight, Crown, Zap, Star,
  Lock, Eye, EyeOff
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ADMIN_SECRET = 'crackcuet_admin_2025';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const limit = 20;

  const authHeader = { 'Authorization': `Admin ${ADMIN_SECRET}` };

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchUsers();
    }
  }, [authenticated, page, search]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (secretInput === ADMIN_SECRET) {
      setAuthenticated(true);
    } else {
      alert('Invalid admin secret');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: authHeader });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `${API}/admin/users?skip=${page * limit}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const res = await fetch(url, { headers: authHeader });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalUsers(data.data.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  const fetchUserDetails = async (userId) => {
    try {
      const res = await fetch(`${API}/admin/users/${userId}/details`, { headers: authHeader });
      const data = await res.json();
      if (data.success) {
        setUserDetails(data.data);
        setSelectedUser(userId);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        if (selectedUser === userId) fetchUserDetails(userId);
        alert(`Plan updated to ${newPlan}`);
      }
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const getPlanBadge = (plan) => {
    if (plan === 'premium') return <Badge className="bg-amber-100 text-amber-700"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
    if (plan === 'pro') return <Badge className="bg-blue-100 text-blue-700"><Zap className="h-3 w-3 mr-1" />Pro</Badge>;
    return <Badge className="bg-gray-100 text-gray-600"><Star className="h-3 w-3 mr-1" />Free</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <p className="text-sm text-gray-500 mt-2">Enter admin secret to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Admin Secret"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full">Enter Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo-full.png" alt="Crack CUET" className="h-8" />
            <Badge variant="outline" className="text-blue-600 border-blue-200">Admin</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAuthenticated(false)}>Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_users}</p>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.today_signups}</p>
                    <p className="text-sm text-gray-500">Today's Signups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_attempts}</p>
                    <p className="text-sm text-gray-500">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Badge className="bg-gray-100 text-gray-600">{stats.plan_distribution.free} Free</Badge>
                  <Badge className="bg-blue-100 text-blue-600">{stats.plan_distribution.pro} Pro</Badge>
                  <Badge className="bg-amber-100 text-amber-600">{stats.plan_distribution.premium} Prem</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">Plan Distribution</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Users List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users ({totalUsers})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => fetchUserDetails(user.id)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${selectedUser === user.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.name || user.email}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPlanBadge(user.plan)}
                            <span className="text-xs text-gray-400">{user.attempt_count} attempts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                    <span className="text-sm text-gray-500">Page {page + 1} of {Math.ceil(totalUsers / limit)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * limit >= totalUsers}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* User Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Details</CardTitle>
            </CardHeader>
            <CardContent>
              {userDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{userDetails.user.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userDetails.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <div className="mt-1">{getPlanBadge(userDetails.user.plan)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{formatDate(userDetails.user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subjects</p>
                    <p className="font-medium">{userDetails.user.subjects?.join(', ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mocks Taken</p>
                    <p className="font-medium">{userDetails.user.total_mocks_taken || 0}</p>
                  </div>

                  {/* Change Plan */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Change Plan</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={userDetails.user.plan === 'free' ? 'default' : 'outline'}
                        onClick={() => updateUserPlan(userDetails.user.id, 'free')}
                        disabled={userDetails.user.plan === 'free'}
                      >
                        Free
                      </Button>
                      <Button
                        size="sm"
                        variant={userDetails.user.plan === 'pro' ? 'default' : 'outline'}
                        onClick={() => updateUserPlan(userDetails.user.id, 'pro')}
                        disabled={userDetails.user.plan === 'pro'}
                      >
                        Pro
                      </Button>
                      <Button
                        size="sm"
                        variant={userDetails.user.plan === 'premium' ? 'default' : 'outline'}
                        onClick={() => updateUserPlan(userDetails.user.id, 'premium')}
                        disabled={userDetails.user.plan === 'premium'}
                      >
                        Premium
                      </Button>
                    </div>
                  </div>

                  {/* Recent Attempts */}
                  {userDetails.recent_attempts?.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Recent Attempts</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {userDetails.recent_attempts.slice(0, 5).map((attempt, i) => (
                          <div key={i} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex justify-between">
                              <span className="font-medium">{attempt.subject}</span>
                              <span className="text-green-600">{attempt.score}%</span>
                            </div>
                            <p className="text-gray-400 text-xs">{formatDate(attempt.submitted_at)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Select a user to view details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
