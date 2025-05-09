import React from 'react';
import RouteList from '../../components/operator/RouteList';

const RoutesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Available Routes</h1>
      
      <div className="grid grid-cols-1 gap-4">
        <RouteList showOperatorControls={false} />
      </div>
    </div>
  );
};

export default RoutesPage;