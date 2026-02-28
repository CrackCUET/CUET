import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import {
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Users,
  Lock,
  BarChart2,
  Globe,
  FileText,
  Trophy,
  Infinity,
  PieChart,
  Award,
  Target,
  RotateCcw,
  Bookmark,
  Check,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import {
  navLinks,
  heroBullets,
  painPoints,
  features,
  pricingPlans,
  testimonials,
  faqs,
  stats
} from '../data/mock';

// Icon mapping for dynamic rendering
const iconMap = {
  AlertTriangle,
  Users,
  Lock,
  BarChart2,
  Globe,
  FileText,
  Trophy,
  Infinity,
  PieChart,
  Award,
  Target,
  RotateCcw,
  Bookmark
};

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3' : 'bg-white py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo-full.png" alt="Crack CUET" className="h-10 md:h-12" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {link.hasDropdown ? (
                    <>
                      <button className="flex items-center text-sm font-medium text-gray-700 hover:text-brand transition-colors">
                        {link.label}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      {activeDropdown === link.id && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                          {link.dropdownItems.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : link.isRoute ? (
                    <Link
                      to={link.href}
                      className={`text-sm font-medium transition-colors ${
                        link.id === 'leaderboard'
                          ? 'text-brand hover:text-brand-dark'
                          : 'text-gray-700 hover:text-brand'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`text-sm font-medium transition-colors ${
                        link.id === 'leaderboard'
                          ? 'text-brand hover:text-brand-dark'
                          : 'text-gray-700 hover:text-brand'
                      }`}
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => navigate('/auth')}>
                Login
              </Button>
              <Button className="bg-cta hover:bg-cta-hover text-white font-semibold" onClick={() => navigate('/auth')}>
                Try Free Mock
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-4 space-y-4">
              {navLinks.map((link) => (
                <div key={link.id}>
                  {link.hasDropdown ? (
                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-gray-700">{link.label}</span>
                      {link.dropdownItems.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.href}
                          className="block pl-4 text-sm text-gray-600 hover:text-brand"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ) : link.isRoute ? (
                    <Link to={link.href} className="block text-sm font-medium text-gray-700 hover:text-brand">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="block text-sm font-medium text-gray-700 hover:text-brand">
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full border-gray-300" onClick={() => navigate('/auth')}>
                  Login
                </Button>
                <Button className="w-full bg-cta hover:bg-cta-hover text-white font-semibold" onClick={() => navigate('/auth')}>
                  Try Free Mock
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4">
        <Button className="w-full bg-cta hover:bg-cta-hover text-white font-semibold py-3" onClick={() => navigate('/auth')}>
          Try Free Mock
        </Button>
      </div>
    </>
  );
};

// Hero Section
const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary leading-tight">
                Practice like a topper — Get closer to the{' '}
                <span className="text-cta">99.9th percentile</span>.
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Unlimited CUET mocks, deep performance analytics, and a live nationwide leaderboard — 
                designed for students who want to compete with India's best and push for top ranks.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-cta hover:bg-cta-hover text-white font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => navigate('/auth')}
              >
                Try 1 Mock Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-brand text-brand hover:bg-brand hover:text-white font-semibold text-lg px-8 py-6"
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Compare Plans
              </Button>
            </div>
            <p className="text-sm text-gray-500">No card required • Instant access</p>

            {/* Bullets */}
            <div className="space-y-3 pt-4">
              {heroBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{bullet}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 pt-2">
              *Percentile targets are illustrative; results depend on individual practice and effort.
            </p>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-section rounded-2xl p-8 shadow-xl">
              {/* Mock Dashboard Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                {/* Leaderboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary flex items-center">
                      <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                      Nationwide Leaderboard
                    </h3>
                    <Badge className="bg-green-100 text-green-700 border-0">Live</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: 'You', score: 232, percentile: '99.8%ile' },
                      { rank: 2, name: 'Aarav Sharma', score: 228, percentile: '99.5%ile' },
                      { rank: 3, name: 'Priya Verma', score: 225, percentile: '99.2%ile' }
                    ].map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.rank === 1 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-bold ${
                              entry.rank === 1 ? 'text-amber-600' : 'text-gray-500'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          <span className="font-medium text-primary">
                            {entry.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-primary">
                            {entry.score}/250
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {entry.percentile}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Preview */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary flex items-center">
                      <PieChart className="h-5 w-5 text-cta mr-2" />
                      Performance Analytics
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cta">+15</div>
                      <div className="text-xs text-gray-500">Rank Improved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">45m</div>
                      <div className="text-xs text-gray-500">Avg Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cta/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand/10 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <p className="text-center text-gray-600 mb-8 text-lg">
            Designed by students from <span className="font-semibold text-primary">SRCC</span>, <span className="font-semibold text-primary">St. Stephen's</span>, <span className="font-semibold text-primary">Hindu College</span> & other top DU colleges
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold text-brand">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Pain Points Section
const PainPointsSection = () => {
  return (
    <section className="py-20 bg-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            What most CUET mock platforms get wrong
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We built Crack CUET because we were frustrated with what's out there.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {painPoints.map((point) => {
            const IconComponent = iconMap[point.icon];
            return (
              <div
                key={point.id}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium">{point.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Practice smarter. Compete harder. Score higher.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to maximize your CUET score — nothing you don't.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <Card
                key={feature.id}
                className="border-gray-100 hover:border-cta/30 hover:shadow-lg transition-all group"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand/5 flex items-center justify-center mb-4 group-hover:bg-cta/10 transition-colors">
                    <IconComponent className="h-6 w-6 text-brand group-hover:text-cta transition-colors" />
                  </div>
                  <CardTitle className="text-lg text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const navigate = useNavigate();
  
  const getPlanStyle = (planId, isPopular) => {
    if (planId === 'premium') {
      return {
        card: 'border-2 border-amber-400 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      };
    }
    if (isPopular) {
      return {
        card: 'border-2 border-cta shadow-xl shadow-cta/10',
        button: 'bg-cta hover:bg-cta-hover text-white',
        badge: 'bg-cta text-white'
      };
    }
    return {
      card: 'border-2 border-gray-200',
      button: 'bg-brand hover:bg-brand-dark text-white',
      badge: ''
    };
  };

  return (
    <section id="pricing" className="py-20 bg-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Simple plans. Serious results.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your preparation intensity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => {
            const style = getPlanStyle(plan.id, plan.popular);
            return (
              <Card
                key={plan.id}
                className={`relative ${style.card}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className={`${style.badge} border-0 px-4 py-1`}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.id === 'premium' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className={`${style.badge} border-0 px-4 py-1`}>
                      Best Value
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-primary">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-6">
                  <Button
                    onClick={() => navigate('/auth')}
                    className={`w-full py-6 text-lg font-semibold ${style.button}`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              1 Free Mock per Subject
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              7-day money-back guarantee
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            What top scorers say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real results from real students who took their CUET prep seriously.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-gray-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-base text-primary">{testimonial.name}</CardTitle>
                    <CardDescription>{testimonial.city}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge className="bg-green-100 text-green-700 border-0">
                  {testimonial.achievement}
                </Badge>
                <p className="text-gray-600">"{testimonial.review}"</p>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  return (
    <section id="faqs" className="py-20 bg-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about Crack CUET.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${faq.id}`}
              className="bg-white rounded-xl border border-gray-200 px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

// Contact Form Section
const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    
    setSubmitting(false);
  };
  
  return (
    <section id="contact-form" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600">
            Have questions? We'd love to hear from you. Send us a message!
          </p>
        </div>
        
        {submitted ? (
          <Card className="border-0 shadow-lg bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
              <p className="text-green-700">Thank you for reaching out. We'll get back to you soon at info@CrackCUET.com</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-brand hover:bg-brand-dark text-white py-6 text-lg"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 bg-brand">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Ready to push for the top CUET ranks?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join serious aspirants using competitive practice, real analytics, and nationwide ranking 
          to maximize their CUET score.
        </p>
        <Button
          size="lg"
          className="bg-white text-brand hover:bg-gray-100 font-semibold text-lg px-10 py-6 shadow-lg"
          onClick={() => navigate('/auth')}
        >
          Try 1 Mock Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-white/60 text-sm mt-4">No card required • Instant access</p>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer id="contact" className="bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src="/logo-full.png" alt="Crack CUET" className="h-10 brightness-0 invert" />
              <p className="text-gray-400 mt-4 max-w-md">
                India's most competitive CUET mock test platform. Practice like a topper, 
                compete nationwide, and achieve your dream percentile.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">All Mocks</a></li>
              <li><a href="#leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                info@CrackCUET.com
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Crack CUET. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <PainPointsSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
        <FinalCTASection />
      </main>
      <Footer />
      {/* Spacer for mobile sticky CTA */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
}
