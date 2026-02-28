import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  UserPlus, 
  CreditCard, 
  FileText, 
  Target, 
  BookOpen, 
  TrendingUp,
  Trophy,
  GraduationCap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up in under a minute with just your email. Select your target subjects (up to 3 domain subjects) and set your CUET goals. Your personalized dashboard awaits!",
    icon: UserPlus,
    image: "/step-signup.png",
    color: "from-blue-500 to-blue-600",
    hasImage: true
  },
  {
    number: 2,
    title: "Choose Your Plan",
    description: "Start with a free mock per subject to experience the platform. When ready, upgrade to Pro (₹999/month) or Premium (₹1499/month) for unlimited practice and advanced analytics.",
    icon: CreditCard,
    image: "/step-pricing.png",
    color: "from-green-500 to-green-600",
    hasImage: true
  },
  {
    number: 3,
    title: "Take Your First Mock",
    description: "Dive into your first full-length mock test with 50 CUET-pattern questions. Experience real exam conditions with our timed interface and detailed solutions.",
    icon: FileText,
    image: "/step-mock.png",
    color: "from-purple-500 to-purple-600",
    hasImage: true
  },
  {
    number: 4,
    title: "Identify Your Weak Areas",
    description: "After each mock, get a detailed breakdown of your performance. See exactly which topics need work — whether it's Calculus in Math or Modern History in History.",
    icon: Target,
    image: "/step-analysis.png",
    color: "from-orange-500 to-orange-600",
    hasImage: true
  },
  {
    number: 5,
    title: "Study & Improve",
    description: "Focus on your weak areas using our detailed explanations. Each question comes with step-by-step solutions to help you understand concepts deeply, not just memorize answers.",
    icon: BookOpen,
    image: "/step-study.png",
    color: "from-pink-500 to-pink-600",
    hasImage: true
  },
  {
    number: 6,
    title: "Retake & Track Progress",
    description: "Take more mocks and watch your scores climb. Our dashboard tracks your improvement over time, showing you exactly how much you've grown with each attempt.",
    icon: TrendingUp,
    image: "/step-progress.png",
    color: "from-cyan-500 to-cyan-600",
    hasImage: true
  },
  {
    number: 7,
    title: "Compete on the Leaderboard",
    description: "See where you rank among thousands of CUET aspirants nationwide. Check your percentile, compare with nearby competitors, and get motivated to push harder!",
    icon: Trophy,
    image: "/step-leaderboard.png",
    color: "from-amber-500 to-amber-600",
    hasImage: true
  },
  {
    number: 8,
    title: "Ace Your CUET Exam!",
    description: "Walk into your exam hall confident and prepared. With consistent practice on Crack CUET, you'll be ready to score in the top percentiles and secure admission to your dream college!",
    icon: GraduationCap,
    image: "/step-success.png",
    color: "from-emerald-500 to-emerald-600",
    hasImage: true
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-cta hover:bg-cta-hover text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 text-white relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0B3C5D 0%, #072a42 50%, #050d1a 100%)'}}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-[140px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="text-sm font-medium text-amber-300">Trusted by 460+ CUET aspirants across India</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            From Zero to <span className="text-amber-400">Top Percentile</span> —<br className="hidden md:block" /> Here's Your Game Plan
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            8 simple steps. 15 subjects. Unlimited AI-generated mocks. Follow the exact playbook that top scorers use to crack CUET.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-brand hover:bg-gray-100 text-lg px-8 w-full sm:w-auto">
                Start Practising Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 w-full sm:w-auto">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200 transform -translate-x-1/2" />
            
            {steps.map((step, index) => (
              <div key={step.number} className="relative mb-16 md:mb-24 last:mb-0">
                {/* Step Number Circle on Timeline */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </div>
                </div>
                
                <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
                  {/* Content Side */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    {/* Mobile Step Number */}
                    <div className="md:hidden flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                        <span className="text-white font-bold">{step.number}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    
                    {/* Desktop Title */}
                    <div className={`hidden md:flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <step.icon className={`h-8 w-8 text-transparent bg-gradient-to-br ${step.color} bg-clip-text`} style={{color: index % 2 === 0 ? '#3b82f6' : '#8b5cf6'}} />
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Image/Screenshot Side */}
                  <div className="flex-1">
                    <Card className="border-0 shadow-xl overflow-hidden">
                      <CardContent className="p-0">
                        {step.hasImage ? (
                          <img 
                            src={step.image} 
                            alt={step.title}
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        ) : (
                          <div className={`aspect-video bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10">
                              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} rounded-full blur-3xl`} />
                              <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br ${step.color} rounded-full blur-2xl`} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl mb-4`}>
                                <step.icon className="h-12 w-12 text-white" />
                              </div>
                              <span className={`text-sm font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                                Step {step.number}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Results Speak for Themselves</h2>
            <p className="text-gray-400 text-lg">Students who follow our process consistently see remarkable improvements</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "23%", label: "Avg. Score Improvement" },
              { value: "15+", label: "Percentile Jump" },
              { value: "3x", label: "More Practice Done" },
              { value: "99%", label: "Student Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-amber-400 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-brand to-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of students who are already on their path to CUET success
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-brand hover:bg-gray-100 text-lg px-8 w-full sm:w-auto">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Create Free Account
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-full.png" alt="Crack CUET" className="h-8 brightness-0 invert" />
          </Link>
          <p className="text-sm">© 2025 Crack CUET. All rights reserved.</p>
          <p className="text-sm mt-2">info@CrackCUET.com</p>
        </div>
      </footer>
    </div>
  );
}
