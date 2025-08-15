import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import LegalModals from '../components/legal/LegalModals';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Crown,
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { themeColor } = useConfig();
  const navigate = useNavigate();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: 'Análise de NPS em Tempo Real',
      description: 'Acompanhe sua pontuação NPS e tendências em dashboards interativos e atualizados automaticamente.'
    },
    {
      icon: <Users size={24} />,
      title: 'Gestão Completa de Contatos',
      description: 'Organize seus clientes em grupos, adicione tags e mantenha um histórico completo de interações.'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Relatórios Avançados',
      description: 'Gere relatórios detalhados com insights acionáveis para melhorar a experiência do cliente.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Segurança e Conformidade',
      description: 'Totalmente conforme com LGPD e GDPR, garantindo a proteção dos dados dos seus clientes.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Automação Inteligente',
      description: 'Configure webhooks e automações para integrar o NPS ao seu fluxo de trabalho existente.'
    },
    {
      icon: <Globe size={24} />,
      title: 'Pesquisas Personalizáveis',
      description: 'Crie pesquisas com sua marca, cores e logotipo para uma experiência consistente.'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      company: 'TechCorp',
      role: 'Gerente de Customer Success',
      content: 'O Meu NPS transformou como coletamos e analisamos feedback. Aumentamos nossa satisfação em 40% em 6 meses.',
      rating: 5
    },
    {
      name: 'João Santos',
      company: 'StartupXYZ',
      role: 'CEO',
      content: 'Interface intuitiva e relatórios poderosos. Essencial para qualquer empresa que se preocupa com a experiência do cliente.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      company: 'Empresa ABC',
      role: 'Diretora de Marketing',
      content: 'A automação de campanhas nos economiza horas toda semana. ROI fantástico!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-16 h-16 mr-4 flex items-center justify-center">
                <img 
                  src="/icone.png" 
                  alt="Meu NPS" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-4xl font-bold dark:text-white" style={{ color: themeColor }}>
                  Meu NPS
                </h1>
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  Plataforma de Gestão de NPS
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Transforme Feedback em{' '}
              <span style={{ color: themeColor }}>Crescimento</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Colete, analise e aja sobre o feedback dos clientes com nossa plataforma completa de gestão NPS. 
              Impulsione a satisfação do cliente e o sucesso do negócio.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                // Show Dashboard button when logged in
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold"
                    style={{ backgroundColor: themeColor }}
                    icon={<LayoutDashboard size={20} />}
                  >
                    Ir para Dashboard
                  </Button>
                </Link>
              ) : (
                // Show login and register buttons when not logged in
                <>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold"
                      style={{ backgroundColor: themeColor }}
                      icon={<UserPlus size={20} />}
                    >
                      Teste Grátis por 7 Dias
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold"
                      icon={<LogIn size={20} />}
                    >
                      Entrar
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {!isAuthenticated && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-gray-500 dark:text-gray-400 mt-4"
              >
                ✨ Sem cartão de crédito • Acesso completo • Cancele quando quiser
              </motion.p>
            )}

            {isAuthenticated && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg inline-block"
              >
                <p className="text-green-800 dark:text-green-200">
                  👋 Bem-vindo de volta, <strong>{user.name}</strong>!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que você precisa para gerenciar NPS
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Recursos poderosos para coletar, analisar e agir sobre o feedback dos clientes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              O que nossos clientes dizem
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Empresas que já transformaram seu atendimento com o Meu NPS
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-600 dark:text-gray-400 mb-6 italic">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4"
                        style={{ backgroundColor: themeColor }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role} • {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {isAuthenticated 
                ? `Pronto para continuar, ${user?.name}?`
                : 'Pronto para começar?'
              }
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {isAuthenticated
                ? 'Acesse seu dashboard e continue gerenciando suas campanhas NPS'
                : 'Junte-se a centenas de empresas que já melhoraram sua experiência do cliente'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold"
                    style={{ backgroundColor: themeColor }}
                    icon={<LayoutDashboard size={20} />}
                  >
                    Acessar Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold"
                      style={{ backgroundColor: themeColor }}
                      icon={<Crown size={20} />}
                    >
                      Começar Teste Gratuito
                    </Button>
                  </Link>
                  
                  <Link to="/pricing">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold"
                      icon={<ArrowRight size={20} />}
                    >
                      Ver Planos
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
                  Cancele quando quiser
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 mr-3 flex items-center justify-center">
                  <img 
                    src="/icone.png" 
                    alt="Meu NPS" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold" style={{ color: themeColor }}>
                    Meu NPS
                  </span>
                  <span className="text-sm text-gray-400">
                    Plataforma de Gestão de NPS
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                A solução completa para coletar, analisar e agir sobre o feedback dos clientes. 
                Impulsione a satisfação e o crescimento do seu negócio.
              </p>
              <div className="flex space-x-4">
                <a href="mailto:contato@meunps.com" className="text-gray-400 hover:text-white transition-colors">
                  contato@meunps.com
                </a>
                <a href="tel:+5511999999999" className="text-gray-400 hover:text-white transition-colors">
                  (11) 99999-9999
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/pricing" className="hover:text-white transition-colors">Planos e Preços</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowLgpdModal(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    LGPD
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Meu NPS. Todos os direitos reservados.</p>
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
    </div>
  );
};

export default Landing;