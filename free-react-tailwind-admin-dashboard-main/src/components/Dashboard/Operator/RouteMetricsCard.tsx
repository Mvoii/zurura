import React from 'react';
import ComponentCard from '../../common/ComponentCard';
import { RouteFrontendData } from '../../../api/routeService';
// import { Route as RouteIcon } from 'lucide-react'; // Renamed to avoid conflict

interface RouteMetricsCardProps {
  routes: RouteFrontendData[];
  isLoading: boolean;
}

const RouteMetricsCard: React.FC<RouteMetricsCardProps> = ({ routes, isLoading }) => {
  if (isLoading) {
    return (
      <ComponentCard title="Route Metrics">
        <div className="p-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mt-1"></div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Route Metrics">
      <div className="p-4">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {routes.length}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total routes managed
        </p>
      </div>
    </ComponentCard>
  );
};

export default RouteMetricsCard;