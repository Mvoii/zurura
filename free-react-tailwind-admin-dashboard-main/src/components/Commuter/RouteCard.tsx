import React from 'react';
import ComponentCard from '../common/ComponentCard';
import Button from '../ui/button/Button';
import { MapPin, CreditCard, Calendar, Info } from 'lucide-react';

// Update the interface to match the route property from RouteSearchResponse
interface RouteCardProps {
  route: {
    id: string;
    route_name: string;
    description: string;
    origin: string;
    destination: string;
    created_at: string;
    updated_at: string;
    base_fare: number;
  };
  className?: string;
  onBookNow?: () => void; // Optional callback for booking action
}

const RouteCard: React.FC<RouteCardProps> = ({ route, className, onBookNow }) => {
  // Access data from the route object
  const routeDetails = route;
  
  if (!routeDetails) {
    return (
      <ComponentCard title="Route Data Missing" desc="Could not load route details.">
        <p>No additional information is available.</p>
      </ComponentCard>
    );
  }

  // Format dates if needed
  const createdDate = new Date(routeDetails.created_at).toLocaleDateString();
  
  return (
    <ComponentCard
      title={routeDetails.route_name || 'Unnamed Route'} 
      desc={routeDetails.description || 'No description available'}
      className={className}
    >
      {/* Origin-Destination with route visualization */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="flex flex-col items-center mr-2">
            <MapPin size={16} className="text-primary-500" />
            <div className="h-10 w-0.5 bg-gray-300 dark:bg-gray-700 my-1"></div>
            <MapPin size={16} className="text-error-500" />
          </div>
          <div>
            <p className="font-medium">{routeDetails.origin || 'N/A'}</p>
            <p className="mt-5 font-medium">{routeDetails.destination || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Route Details: Base Fare */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="flex items-center text-sm">
          <CreditCard size={16} className="mr-2 text-primary-500" />
          <span className="font-medium">Base Fare:</span>
          <span className="ml-2">KES {routeDetails.base_fare?.toFixed(2) || 'N/A'}</span>
        </div>
        
        {/* Route ID reference */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Info size={16} className="mr-2" />
          <span className="font-medium">Route ID:</span>
          <span className="ml-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {routeDetails.id.substring(0, 8)}
          </span>
        </div>
        
        {/* Created date */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={16} className="mr-2" />
          <span className="font-medium">Added on:</span>
          <span className="ml-2">{createdDate}</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      {onBookNow && (
        <div className="mt-5">
          <Button 
            onClick={onBookNow}
            className="w-full"
          >
            Book This Route
          </Button>
        </div>
      )}
    </ComponentCard>
  );
};

export default RouteCard;