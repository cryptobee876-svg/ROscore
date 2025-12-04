import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#ef4444'; // Red
  if (score >= 60) color = '#eab308'; // Yellow
  if (score >= 80) color = '#22c55e'; // Green

  return (
    <div className="relative h-48 w-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell key="score" fill={color} />
            <Cell key="rest" fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center -mt-8">
        <span className="text-4xl font-bold text-gray-800">{score}</span>
        <span className="text-sm font-medium text-gray-500">OUT OF 100</span>
      </div>
      <div className="text-center mt-[-20px]">
        <p className={`text-sm font-bold ${
          score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score >= 80 ? 'EXCELLENT' : score >= 60 ? 'AVERAGE' : 'NEEDS WORK'}
        </p>
      </div>
    </div>
  );
};

export default ScoreGauge;