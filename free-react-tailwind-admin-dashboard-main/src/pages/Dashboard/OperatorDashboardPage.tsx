import React, { useEffect } from 'react';
import useRoute from '../../hooks/useRoute';
import useBus from '../../hooks/useBus';
import RouteMetricsCard from '../../components/Dashboard/Operator/RouteMetricsCard';
import BusMetricsCard from '../../components/Dashboard/Operator/BusMetricsCard';
import BusListCard from '../../components/Dashboard/Operator/BusListCard';
import PageMeta from '../../components/common/PageMeta';

const OperatorDashboardPage: React.FC = () => {
  const { routes, fetchRoutes, isLoading: isLoadingRoutes, error: errorRoutes } = useRoute();
  const { buses, fetchBuses, isLoading: isLoadingBuses, error: errorBuses } = useBus();

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, [fetchRoutes, fetchBuses]);

  // Optional: Handle errors
  if (errorRoutes) { 
    // console.error("Error fetching routes:", errorRoutes);
  }
  if (errorBuses) {
    // console.error("Error fetching buses:", errorBuses);
  }

  return (
    <>
      <PageMeta title="Operator Dashboard" description=''/>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Operator Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouteMetricsCard routes={routes} isLoading={isLoadingRoutes} />
          <BusMetricsCard buses={buses} isLoading={isLoadingBuses} />
          <div className="lg:col-span-3"> {/* BusListCard can take more space */}
            <BusListCard buses={buses} isLoading={isLoadingBuses} />
          </div>
          {/* Add more operator-specific cards or sections here */}
        </div>
      </div>
    </>
  );
};

export default OperatorDashboardPage;