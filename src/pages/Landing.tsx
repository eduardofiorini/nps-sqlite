import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import LegalModals from '../components/legal/LegalModals';
import { 
  ArrowRight, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  Star,
  Play,
  Quote,
  Award,
  Target,
  Smartphone,
  Mail,
  MessageSquare,
  PieChart,
  LineChart,
  Settings,
  Crown,
  Building,
  Clock,
  HeartHandshake,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const { scrollY } = useScroll();

  // Check if user has already accepted cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => setShowCookieBanner(true), 2000);
    }
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowCookieBanner(false);
  };

  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: 'Análise em Tempo Real',
      description: 'Acompanhe seu NPS instantaneamente com dashboards interativos e métricas atualizadas em tempo real.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Users size={24} />,
      title: 'Gestão de Contatos',
      description: 'Organize seus clientes em grupos, segmente por características e gerencie campanhas direcionadas.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Smartphone size={24} />,
      title: 'Multi-canal',
      description: 'Colete feedback via WhatsApp, email, SMS, website e outros canais de comunicação.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <PieChart size={24} />,
      title: 'Relatórios Avançados',
      description: 'Gere insights profundos com relatórios personalizáveis e análises preditivas.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Zap size={24} />,
      title: 'Automação Inteligente',
      description: 'Configure fluxos automáticos de follow-up baseados nas respostas dos clientes.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <Shield size={24} />,
      title: 'Segurança LGPD',
      description: 'Totalmente conforme com LGPD e GDPR, garantindo a proteção dos dados dos seus clientes.',
      color: 'from-red-500 to-red-600'
    }
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Diretora de CX',
      company: 'TechCorp',
      content: 'O Meu NPS transformou nossa gestão de experiência do cliente. Conseguimos aumentar nosso NPS de 45 para 78 em apenas 6 meses.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      name: 'Carlos Mendes',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'Interface intuitiva e relatórios que realmente fazem diferença. Nossa equipe adotou a ferramenta em poucos dias.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      name: 'Marina Costa',
      role: 'Gerente de Marketing',
      company: 'E-commerce Plus',
      content: 'A automação de campanhas nos economiza 15 horas por semana. ROI fantástico!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  ];

  const stats = [
    { number: '10k+', label: 'Empresas Ativas' },
    { number: '2M+', label: 'Pesquisas Enviadas' },
    { number: '98%', label: 'Satisfação dos Usuários' },
    { number: '24/7', label: 'Suporte Disponível' }
  ];

  const plans = [
    {
      name: 'Iniciante',
      price: 49,
      description: 'Perfeito para pequenas equipes',
      features: [
        'Até 500 respostas/mês',
        '2 campanhas ativas',
        'Análises básicas',
        'Suporte por email',
        'Templates padrão'
      ],
      color: 'border-gray-200',
      buttonStyle: 'outline'
    },
    {
      name: 'Profissional',
      price: 99,
      description: 'Para empresas em crescimento',
      features: [
        'Até 2.500 respostas/mês',
        'Campanhas ilimitadas',
        'Análises avançadas',
        'Suporte prioritário',
        'Marca personalizada',
        'Acesso à API'
      ],
      color: 'border-[#00ac75] ring-2 ring-[#00ac75]/20',
      buttonStyle: 'primary',
      popular: true
    },
    {
      name: 'Empresarial',
      price: 249,
      description: 'Solução completa para grandes organizações',
      features: [
        'Respostas ilimitadas',
        'Campanhas ilimitadas',
        'Insights com IA',
        'Gerente dedicado',
        'White-label',
        'Integração SSO',
        'SLA garantido'
      ],
      color: 'border-gray-200',
      buttonStyle: 'outline'
    }
  ];

  const integrations = [
    { name: 'WhatsApp', icon: <MessageSquare size={24} className="text-green-600" /> },
    { name: 'Email', icon: <Mail size={24} className="text-blue-600" /> },
    { name: 'SMS', icon: <Smartphone size={24} className="text-purple-600" /> },
    { name: 'Slack', icon: <Building size={24} className="text-gray-700" /> },
    { name: 'Teams', icon: <Users size={24} className="text-blue-500" /> },
    { name: 'Zapier', icon: <Zap size={24} className="text-orange-500" /> }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Fixed Header */}
      <motion.header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src="/icone.png" alt="Meu NPS" className="w-10 h-10 mr-3" />
              <div>
                <span className="text-xl font-bold text-[#00ac75]">Meu NPS</span>
                <div className="text-xs text-gray-500">Gestão Inteligente de NPS</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#00ac75] transition-colors">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#00ac75] transition-colors">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-[#00ac75] transition-colors">Clientes</a>
              <a href="#contact" className="text-gray-600 hover:text-[#00ac75] transition-colors">Contato</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Teste Grátis</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-[#00ac75]">Recursos</a>
              <a href="#pricing" className="block text-gray-600 hover:text-[#00ac75]">Preços</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-[#00ac75]">Clientes</a>
              <a href="#contact" className="block text-gray-600 hover:text-[#00ac75]">Contato</a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/login" className="block">
                  <Button variant="outline" size="sm" fullWidth>Entrar</Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="primary" size="sm" fullWidth>Teste Grátis</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ac75]/5 via-white to-blue-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-[#00ac75]/10 text-[#00ac75] rounded-full text-sm font-medium mb-6">
                <Crown size={16} className="mr-2" />
                Plataforma #1 em Gestão de NPS no Brasil
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforme
                <span className="text-[#00ac75]"> Feedback </span>
                em Crescimento
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A plataforma mais completa para coletar, analisar e agir sobre o feedback dos seus clientes. 
                Aumente a satisfação e impulsione o crescimento do seu negócio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    icon={<ArrowRight size={20} />}
                    className="h-14 px-8 text-lg font-semibold"
                  >
                    Começar Teste Gratuito
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  icon={<Play size={20} />}
                  className="h-14 px-8 text-lg font-semibold"
                >
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  7 dias grátis
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Suporte em português
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Business professionals shaking hands"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                
                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20"
                >
                  <div className="text-3xl font-bold text-[#00ac75] mb-1">+78</div>
                  <div className="text-sm text-gray-600 font-medium">NPS Score</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20"
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">2,847</div>
                  <div className="text-sm text-gray-600 font-medium">Respostas este mês</div>
                </motion.div>
                
                {/* Additional floating element for more visual interest */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gradient-to-r from-[#00ac75] to-[#009966] text-white rounded-xl p-3 shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={20} />
                    <div>
                      <div className="text-lg font-bold">+32%</div>
                      <div className="text-xs opacity-90">Crescimento</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#00ac75]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Recursos que Fazem a Diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para uma gestão completa de NPS em uma única plataforma
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você estará coletando feedback valioso dos seus clientes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Configure sua Campanha',
                description: 'Crie campanhas personalizadas com nosso construtor visual intuitivo. Defina perguntas, design e automações.',
                icon: <Settings size={32} />,
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '02',
                title: 'Colete Respostas',
                description: 'Envie pesquisas via WhatsApp, email, SMS ou incorpore em seu site. Múltiplos canais, uma única plataforma.',
                icon: <MessageSquare size={32} />,
                color: 'from-green-500 to-green-600'
              },
              {
                step: '03',
                title: 'Analise e Aja',
                description: 'Visualize insights em tempo real, identifique tendências e tome decisões baseadas em dados concretos.',
                icon: <TrendingUp size={32} />,
                color: 'from-purple-500 to-purple-600'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas de todos os tamanhos confiam no Meu NPS para melhorar a experiência do cliente
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl shadow-xl p-8 lg:p-12"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}
                  </p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <Quote size={32} className="text-[#00ac75] mb-4" />
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {testimonials[activeTestimonial].content}
              </p>
              
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial ? 'bg-[#00ac75]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Escolha o plano ideal para sua empresa. Todos incluem teste gratuito de 7 dias.
            </p>
            
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle size={16} className="mr-2" />
              Economize 20% pagando anualmente
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#00ac75] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <Card className={`h-full transition-all duration-300 hover:shadow-xl ${plan.color}`}>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">R${plan.price}</span>
                        <span className="text-lg text-gray-600 ml-1">/mês</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Cobrado mensalmente</p>
                    </div>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-700">
                          <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/register">
                      <Button
                        variant={plan.buttonStyle as any}
                        fullWidth
                        size="lg"
                        className="h-12 font-semibold"
                        icon={<ArrowRight size={16} />}
                      >
                        Começar Teste Gratuito
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Integre com Suas Ferramentas Favoritas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conecte o Meu NPS com as ferramentas que você já usa no dia a dia
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  {integration.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{integration.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Por que Escolher o Meu NPS?
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Target size={24} />,
                    title: 'Foco no ROI',
                    description: 'Cada recurso foi pensado para gerar resultados mensuráveis e aumentar a satisfação dos clientes.'
                  },
                  {
                    icon: <HeartHandshake size={24} />,
                    title: 'Suporte Humanizado',
                    description: 'Equipe brasileira especializada em CX, pronta para ajudar você a alcançar seus objetivos.'
                  },
                  {
                    icon: <Shield size={24} />,
                    title: 'Segurança Garantida',
                    description: 'Conformidade total com LGPD e GDPR. Seus dados e dos seus clientes estão sempre protegidos.'
                  },
                  {
                    icon: <Zap size={24} />,
                    title: 'Implementação Rápida',
                    description: 'Configure sua primeira campanha em minutos. Interface intuitiva que não requer treinamento.'
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-[#00ac75]/10 rounded-xl flex items-center justify-center text-[#00ac75] flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#00ac75] to-[#009966] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Resultados Comprovados</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span>Aumento médio no NPS</span>
                    <span className="text-2xl font-bold">+32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Redução no churn</span>
                    <span className="text-2xl font-bold">-45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ROI médio em 6 meses</span>
                    <span className="text-2xl font-bold">380%</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-green-100">
                    *Baseado em dados de mais de 1.000 empresas clientes
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00ac75] to-[#009966]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Pronto para Transformar sua Experiência do Cliente?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Junte-se a milhares de empresas que já usam o Meu NPS para crescer de forma sustentável
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-white text-[#00ac75] border-white hover:bg-gray-50"
                  icon={<ArrowRight size={20} />}
                >
                  Começar Teste Gratuito
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg font-semibold border-white text-white hover:bg-white/10"
                icon={<Play size={20} />}
              >
                Agendar Demonstração
              </Button>
            </div>
            
            <p className="text-sm text-green-100 mt-6">
              Sem compromisso • Cancele quando quiser • Suporte em português
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <img src="/icone.png" alt="Meu NPS" className="w-10 h-10 mr-3" />
                <div>
                  <span className="text-xl font-bold">Meu NPS</span>
                  <div className="text-sm text-gray-400">Gestão Inteligente de NPS</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A plataforma mais completa para gestão de Net Promoter Score. 
                Transforme feedback em crescimento sustentável.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://linkedin.com/company/meunps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors group"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/meunps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors group"
                  title="Instagram"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/meunps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors group"
                  title="Twitter"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="https://youtube.com/@meunps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors group"
                  title="YouTube"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="mailto:contato@meunps.com" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="tel:+5511999999999" className="hover:text-white transition-colors">(11) 99999-9999</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Meu NPS. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Termos de Uso
              </button>
              <button 
                onClick={() => setShowLgpdModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                LGPD
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModals
        privacyOpen={showPrivacyModal}
        termsOpen={showTermsModal}
        lgpdOpen={showLgpdModal}
        onClosePrivacy={() => setShowPrivacyModal(false)}
        onCloseTerms={() => setShowTermsModal(false)}
        onCloseLgpd={() => setShowLgpdModal(false)}
      />

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-6 h-6 bg-[#00ac75]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield size={14} className="text-[#00ac75]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Utilizamos cookies para melhorar sua experiência
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Usamos cookies essenciais para o funcionamento do site e cookies de análise para melhorar nossos serviços. 
                      Você pode gerenciar suas preferências a qualquer momento.{' '}
                      <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-[#00ac75] hover:underline font-medium"
                      >
                        Saiba mais
                      </button>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeclineCookies}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Apenas Essenciais
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAcceptCookies}
                    className="bg-[#00ac75] hover:bg-[#009966]"
                  >
                    Aceitar Todos
                  </Button>
                  <button
                    onClick={() => setShowCookieBanner(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Fechar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;