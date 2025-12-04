import React from 'react';
import { ModuleDetails } from '../types';

interface ModuleCardProps {
  title: string;
  data: ModuleDetails;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, data }) => {
  const statusColors = {
    Green: 'border-green-500 bg-green-50/50',
    Yellow: 'border-yellow-500 bg-yellow-50/50',
    Red: 'border-red-500 bg-red-50/50',
  };

  const textColors = {
    Green: 'text-green-700',
    Yellow: 'text-yellow-700',
    Red: 'text-red-700',
  };

  const badgeColors = {
    Green: 'bg-green-100 text-green-800',
    Yellow: 'bg-yellow-100 text-yellow-800',
    Red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`rounded-lg border-l-4 p-5 shadow-sm bg-white hover:shadow-md transition-shadow ${statusColors[data.status]}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${badgeColors[data.status]}`}>
          {data.status}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-gray-900">{data.score}</span>
          <span className="text-sm text-gray-500 mb-1">/ {data.maxScore}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div 
            className={`h-1.5 rounded-full ${data.status === 'Green' ? 'bg-green-500' : data.status === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} 
            style={{ width: `${(data.score / data.maxScore) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        {data.feedback.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fixes Required</p>
            <ul className="space-y-1">
              {data.feedback.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.positivePoints.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">What worked</p>
            <ul className="space-y-1">
              {data.positivePoints.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                   <span className="text-green-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;