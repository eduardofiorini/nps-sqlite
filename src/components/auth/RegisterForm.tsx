import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  Check, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const RegisterForm: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      period: 'month',
      description: 'Perfect for small teams getting started with NPS',
      icon: <Users size={24} />,
      color: 'from-green-400 to-green-600',
      features: [
        'Up to 500 responses/month',
        '2 active campaigns',
        'Basic analytics',
        'Email support',
        'Standard templates'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 79,
      period: 'month',
      description: 'Advanced features for growing businesses',
      icon: <BarChart3 size={24} />,
      color: 'from-blue-400 to-blue-600',
      popular: true,
      features: [
        'Up to 2,500 responses/month',
        'Unlimited campaigns',
        'Advanced analytics & reporting',
        'Priority support',
        'Custom branding',
        'API access',
        'Team collaboration'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'Complete solution for large organizations',
      icon: <Zap size={24} />,
      color: 'from-purple-400 to-purple-600',
      features: [
        'Unlimited responses',
        'Unlimited campaigns',
        'Advanced AI insights',
        'Dedicated account manager',
        'White-label solution',
        'SSO integration',
        'Custom integrations',
        'SLA guarantee'
      ]
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate registration and login
      const success = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
              <BarChart3 size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NPS Master</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Free Trial
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business and start collecting valuable customer feedback today.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 shadow-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star size={14} className="mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                      {plan.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 sticky top-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start your 14-day free trial, no credit card required
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="relative">
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    required
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <User size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@company.com"
                    required
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Mail size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    fullWidth
                    className="pl-10 pr-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                    fullWidth
                    className="pl-10 pr-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Selected Plan: {plans.find(p => p.id === selectedPlan)?.name}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        14-day free trial, then ${plans.find(p => p.id === selectedPlan)?.price}/month
                      </p>
                    </div>
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="h-12 text-base font-medium"
                  icon={<ArrowRight size={18} />}
                >
                  Start Free Trial
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                  </span>
                  <Link 
                    to="/login" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Choose NPS Master?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Analytics
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant insights into your customer satisfaction with live dashboards and reporting.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Team Collaboration
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Work together with your team to analyze feedback and implement improvements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Enterprise Security
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is protected with enterprise-grade security and compliance standards.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;