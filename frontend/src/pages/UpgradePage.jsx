import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Check, Crown, Zap, ArrowLeft, Star, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/pricing/plans`);
      if (response.data.success) {
        setPlans(response.data.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const response = await axios.post(
        `${API}/upgrade-plan`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        updateUser(prev => ({ ...prev, plan: planId }));
        alert(`Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}! (Demo mode - Razorpay integration coming soon)`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Failed to upgrade. Please try again.');
    }
  };

  const getPlanIcon = (planId) => {
    if (planId === 'premium') return <Crown className="h-6 w-6 text-amber-500" />;
    if (planId === 'pro') return <Zap className="h-6 w-6 text-blue-500" />;
    return <Star className="h-6 w-6 text-gray-500" />;
  };

  const getPlanStyle = (planId, isPopular) => {
    if (planId === 'premium') {
      return {
        card: 'border-2 border-amber-400 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
        checkColor: 'text-amber-500'
      };
    }
    if (isPopular) {
      return {
        card: 'border-2 border-blue-500 shadow-xl',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        checkColor: 'text-blue-500'
      };
    }
    return {
      card: 'border-2 border-gray-200',
      button: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      checkColor: 'text-green-500'
    };
  };

  const isCurrentPlan = (planId) => {
    return user?.plan === planId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-section flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 mb-4 px-4 py-1">
            <Sparkles className="h-4 w-4 mr-1" />
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Your CUET Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to mock tests, advanced analytics, and compete on the nationwide leaderboard.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const style = getPlanStyle(plan.id, plan.popular);
            const isCurrent = isCurrentPlan(plan.id);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-transform hover:scale-[1.02] ${style.card}`}
                data-testid={`plan-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                {plan.id === 'premium' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Best Value
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getPlanIcon(plan.id)}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="mt-4">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price_display}</span>
                    <span className="text-gray-500 text-lg">{plan.period}</span>
                  </div>
                  {plan.id === 'pro' && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      8 mocks/subject/month
                    </p>
                  )}
                  {plan.id === 'premium' && (
                    <p className="text-sm text-amber-600 mt-2 font-medium">
                      10 mocks/subject/month + Premium Features
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3 px-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <Check className={`h-5 w-5 ${style.checkColor} flex-shrink-0 mt-0.5`} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                
                <CardFooter className="pt-6 pb-8 px-6">
                  {isCurrent ? (
                    <Button 
                      variant="outline" 
                      className="w-full py-6" 
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button 
                      variant="outline" 
                      className="w-full py-6"
                      disabled={user?.plan !== 'free'}
                    >
                      {user?.plan === 'free' ? 'Your Plan' : 'Downgrade Not Available'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-6 text-lg font-semibold ${style.button}`}
                      data-testid={`upgrade-${plan.id}-btn`}
                    >
                      {plan.id === 'premium' ? (
                        <>
                          <Crown className="h-5 w-5 mr-2" />
                          Go Premium
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Upgrade to Pro
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison Section */}
        <Card className="border-0 shadow-lg bg-white mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Upgrade?</CardTitle>
            <CardDescription>See what you're missing on the free plan</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-4 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-4 text-center text-gray-600 font-medium">Free</th>
                  <th className="py-4 px-4 text-center text-blue-600 font-medium">Pro</th>
                  <th className="py-4 px-4 text-center text-amber-600 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 px-4 text-gray-700">Mocks per subject</td>
                  <td className="py-4 px-4 text-center text-gray-500">1 (lifetime)</td>
                  <td className="py-4 px-4 text-center text-blue-600 font-medium">8/month</td>
                  <td className="py-4 px-4 text-center text-amber-600 font-medium">10/month</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Full Leaderboard Access</td>
                  <td className="py-4 px-4 text-center text-gray-400">Limited</td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-blue-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-amber-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Weak Topic Analysis</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-blue-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-amber-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI-Powered Feedback</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-blue-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-amber-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Rank Prediction</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-amber-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Detailed Reports</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center text-gray-400">-</td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-amber-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Pro & Premium users improve faster</h3>
              <p className="text-white/70">Data from thousands of CUET aspirants</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-extrabold text-amber-400">23%</p>
                <p className="text-white/70">Faster improvement</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-amber-400">3x</p>
                <p className="text-white/70">More mocks attempted</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-amber-400">15+</p>
                <p className="text-white/70">Percentile jump avg.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          * Razorpay payment integration coming soon. Upgrade is currently in demo mode.
        </p>
      </main>
    </div>
  );
}
