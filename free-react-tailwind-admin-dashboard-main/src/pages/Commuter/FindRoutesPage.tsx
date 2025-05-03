import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoute from '../../hooks/useRoute';
import RouteSearchForm from '../../components/Commuter/RouteSearchForm';
import RouteSearchResultList from '../../components/Commuter/RouteSearchResultList';
import type { RouteSearchParams, RouteFrontendData } from '../../api/routeService';

const FindRoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const { routes, isLoading, error, fetchRoutes } = useRoute();
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Handle search submission
  const handleSearch = async (params: RouteSearchParams) => {
    try {
      await fetchRoutes(params);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching routes:', error);
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    // Check if the path includes '/stops' to handle both route details and stops view
    if (routeId.includes('/stops')) {
      const baseId = routeId.split('/')[0];
      navigate(`/routes/${baseId}/stops`);
    } else {
      navigate(`/routes/${routeId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Find Routes</h1>
      
      {/* Search Form */}
      <div className="mb-6">
        <RouteSearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
      
      {/* Search Results - Only show if a search has been performed */}
      {searchPerformed && (
        <RouteSearchResultList
          routes={routes}
          isLoading={isLoading}
          error={error}
          onRouteSelect={handleRouteSelect}
        />
      )}
    </div>
  );
};

export default FindRoutesPage;