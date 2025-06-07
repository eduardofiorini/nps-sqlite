import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface NpsDoughnutProps {
  npsScore: number;
  width?: number;
  height?: number;
}

export const NpsDoughnut: React.FC<NpsDoughnutProps> = ({ npsScore, width = 200, height = 200 }) => {
  // Calculate the color based on NPS score
  const getScoreColor = () => {
    if (npsScore >= 50) return '#4ADE80'; // Green for good
    if (npsScore >= 0) return '#FBBF24'; // Yellow for neutral
    return '#F87171'; // Red for poor
  };

  const data = {
    datasets: [
      {
        data: [npsScore + 100, 200 - (npsScore + 100)], // Normalize to 0-200 scale
        backgroundColor: [getScoreColor(), '#E5E7EB'],
        borderColor: ['transparent', 'transparent'],
        borderWidth: 1,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    maintainAspectRatio: false,
    cutout: '75%',
  };

  return (
    <div className="relative" style={{ width, height }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ top: '40%' }}>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: getScoreColor() }}>
            {npsScore}
          </div>
          <div className="text-sm text-gray-500">NPS Score</div>
        </div>
      </div>
    </div>
  );
};

interface NpsDistributionProps {
  promoters: number;
  passives: number;
  detractors: number;
}

export const NpsDistribution: React.FC<NpsDistributionProps> = ({ 
  promoters, 
  passives, 
  detractors 
}) => {
  const total = promoters + passives + detractors || 1; // Avoid division by zero
  
  const data = {
    labels: ['Detractors', 'Passives', 'Promoters'],
    datasets: [
      {
        data: [detractors, passives, promoters],
        backgroundColor: ['#F87171', '#FBBF24', '#4ADE80'],
        borderColor: ['transparent', 'transparent', 'transparent'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = Math.round((value / total) * 100);
            return `${value} responses (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Doughnut data={data} options={options} />;
};

interface NpsTrendProps {
  data: { date: string; nps: number }[];
}

export const NpsTrend: React.FC<NpsTrendProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'NPS Score',
        data: data.map(item => item.nps),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'NPS Trend Over Time',
      },
    },
    scales: {
      y: {
        min: -100,
        max: 100,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};