import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  BarChart3,
  Activity,
  DollarSign,
  UserPlus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import type { AdminStats } from '../../types/admin';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCampaigns: 0,
    totalResponses: 0,
    revenue: { monthly: 0, total: 0 },
    growth: { users: 0, revenue: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading admin stats
      // In a real app, this would fetch from your admin API
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalCampaigns: 3456,
          totalResponses: 28934,
          revenue: { monthly: 45600, total: 234500 },
          growth: { users: 12.5, revenue: 8.3 }
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatGrowth = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="ml-1">{Math.abs(value)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão geral da plataforma e métricas principais
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {formatGrowth(stats.growth.users)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs mês anterior</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% do total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Activity size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Mensal</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenue.monthly)}</p>
                  <div className="flex items-center mt-1">
                    {formatGrowth(stats.growth.revenue)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs mês anterior</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Respostas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalResponses.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.totalCampaigns.toLocaleString()} campanhas
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Crescimento de Usuários" />
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                      {
                        label: 'Novos Usuários',
                        data: [65, 89, 123, 156, 189, 234],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Receita por Plano" />
            <CardContent>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Iniciante', 'Profissional', 'Empresarial'],
                    datasets: [
                      {
                        label: 'Receita (R$)',
                        data: [12400, 28900, 15600],
                        backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6'],
                        borderColor: 'transparent',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'R$ ' + value.toLocaleString();
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Atividade Recente" />
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'user', message: 'Novo usuário registrado: joão@empresa.com', time: '2 min atrás', icon: <UserPlus size={16} className="text-green-500" /> },
                { type: 'payment', message: 'Pagamento recebido: R$ 99,00 - Plano Profissional', time: '15 min atrás', icon: <CreditCard size={16} className="text-blue-500" /> },
                { type: 'campaign', message: 'Nova campanha criada: "Satisfação Q1 2025"', time: '1 hora atrás', icon: <BarChart3 size={16} className="text-purple-500" /> },
                { type: 'user', message: 'Usuário suspenso: spam@example.com', time: '2 horas atrás', icon: <Users size={16} className="text-red-500" /> },
              ].map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="mr-3">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;