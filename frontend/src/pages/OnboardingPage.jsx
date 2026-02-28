import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, ArrowRight, BookOpen, Globe, GraduationCap } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DOMAIN_SUBJECTS = [
  { name: "Physics", code: "PHY" },
  { name: "Chemistry", code: "CHE" },
  { name: "Mathematics", code: "MAT" },
  { name: "Biology", code: "BIO" },
  { name: "Economics", code: "ECO" },
  { name: "Business Studies", code: "BST" },
  { name: "Accountancy", code: "ACC" },
  { name: "History", code: "HIS" },
  { name: "Political Science", code: "POL" },
  { name: "Geography", code: "GEO" },
  { name: "Computer Science", code: "CSC" },
  { name: "Psychology", code: "PSY" },
  { name: "Sociology", code: "SOC" }
];

const LANGUAGES = [
  { name: "English", code: "ENG" },
  { name: "Hindi", code: "HIN" }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { token, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else if (selectedSubjects.length < 3) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleComplete = async () => {
    if (selectedSubjects.length !== 3) {
      setError('Please select exactly 3 domain subjects');
      return;
    }
    if (!selectedLanguage) {
      setError('Please select a language');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API}/onboarding`,
        {
          domain_subjects: selectedSubjects,
          language: selectedLanguage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update user context
        updateUser(prev => ({
          ...prev,
          preferences: response.data.data
        }));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-section">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={step >= 1 ? 'text-cta font-medium' : ''}>1. Subjects</span>
              <span>→</span>
              <span className={step >= 2 ? 'text-cta font-medium' : ''}>2. Language</span>
              <span>→</span>
              <span className={step >= 3 ? 'text-cta font-medium' : ''}>3. Confirm</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4">
        {/* Step 1: Select Domain Subjects */}
        {step === 1 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-cta" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Select Your Domain Subjects</CardTitle>
              <CardDescription>Choose exactly 3 subjects you'll be appearing for in CUET</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <Badge className={`${selectedSubjects.length === 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0`}>
                  {selectedSubjects.length}/3 subjects selected
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {DOMAIN_SUBJECTS.map((subject) => (
                  <button
                    key={subject.code}
                    onClick={() => toggleSubject(subject.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSubjects.includes(subject.name)
                        ? 'border-cta bg-cta/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${selectedSubjects.length >= 3 && !selectedSubjects.includes(subject.name) ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{subject.name}</span>
                      {selectedSubjects.includes(subject.name) && (
                        <CheckCircle className="h-5 w-5 text-cta" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={selectedSubjects.length !== 3}
                className="w-full bg-cta hover:bg-cta-hover text-white font-semibold py-5"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Language */}
        {step === 2 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-cta" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Select Your Language</CardTitle>
              <CardDescription>Choose the language for your mock tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.name)}
                    className={`p-6 rounded-xl border-2 text-center transition-all ${
                      selectedLanguage === lang.name
                        ? 'border-cta bg-cta/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg font-medium text-primary">{lang.name}</span>
                    {selectedLanguage === lang.name && (
                      <CheckCircle className="h-6 w-6 text-cta mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <p className="text-sm text-gray-600 text-center">
                  <strong>General Aptitude Test (GAT)</strong> will be automatically added to your mock tests.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 py-5"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedLanguage}
                  className="flex-1 bg-cta hover:bg-cta-hover text-white font-semibold py-5"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Ready to Begin!</CardTitle>
              <CardDescription>Confirm your preferences and start practicing</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-primary mb-2">Domain Subjects (3)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((subject) => (
                      <Badge key={subject} className="bg-cta/10 text-cta border-0">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-primary mb-2">Language</h3>
                  <Badge className="bg-brand/10 text-brand border-0">
                    {selectedLanguage}
                  </Badge>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-primary mb-2">General Test</h3>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    General Aptitude Test (Mandatory)
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mb-6">
                You can change these preferences later in Settings.
              </p>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 py-5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-cta hover:bg-cta-hover text-white font-semibold py-5"
                >
                  {loading ? 'Saving...' : 'Start Practicing'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
