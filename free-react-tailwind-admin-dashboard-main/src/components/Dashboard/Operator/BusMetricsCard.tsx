import React from 'react';
import ComponentCard from '../../common/ComponentCard';
import { BusFrontendData } from '../../../api/busService';
import { Percent } from 'lucide-react'; // Renamed to avoid conflict

interface BusMetricsCardProps {
  buses: BusFrontendData[];
  isLoading: boolean;
}

const BusMetricsCard: React.FC<BusMetricsCardProps> = ({ buses, isLoading }) => {
  const totalBuses = buses.length;
  // Assuming all listed buses are 'active' for operational purposes
  // A more specific 'active' status would require a status field on BusFrontendData
  const activeBusesPercentage = totalBuses > 0 ? 100 : 0; 

  if (isLoading) {
    return (
      <ComponentCard title="Bus Metrics">
        <div className="p-4 space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mt-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mt-2"></div>
        </div>
      </ComponentCard>
    );
  }
  
  return (
    <ComponentCard title="Bus Metrics">
      <div className="p-4">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {totalBuses}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total buses in fleet
        </p>
        {totalBuses > 0 && (
          <div className="mt-3 flex items-center text-sm">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <Percent size={12} />
              {activeBusesPercentage}% operationally active
            </span>
          </div>
        )}
      </div>
    </ComponentCard>
  );
};

export default BusMetricsCard;