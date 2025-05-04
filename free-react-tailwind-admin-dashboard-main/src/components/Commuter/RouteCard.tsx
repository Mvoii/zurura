import React from 'react';
import { RouteFrontendData } from '../../api/routeService';
import ComponentCard from '../common/ComponentCard'; // Import ComponentCard
import Button from '../ui/button/Button'; // Assuming path
import { MapPin, ArrowRight } from 'lucide-react'; // Icons are used

interface RouteCardProps {
  // Ensure this type matches the { route: {...}, stops: [] } structure
  route: RouteFrontendData; 
  className?: string;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, className }) => {
  console.log('RouteCard received route:', route); 
  console.log(route)
  // Access data from the nested 'route' object
  const routeDetails = route; 
    console.log('Route details:', routeDetails);
    
  if (!routeDetails) {
    // Handle cases where the nested route object might be missing
    return (
      <ComponentCard title="Route Data Missing" desc="Could not load route details.">
        <p>No additional information is available.</p>
      </ComponentCard>
    );
  }

  return (
      <ComponentCard
        title={routeDetails.route_name || 'Unnamed Route'} 
        desc={routeDetails.description} 
      >
        {/* ... Card content using routeDetails ... */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>{routeDetails.origin || 'N/A'}</span>
          </div>
          <ArrowRight size={16} className="mx-2 text-gray-400" />
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>{routeDetails.destination || 'N/A'}</span>
          </div>
        </div>
        {/* Add buttons or other elements as needed */}
      </ComponentCard>
  );
};

export default RouteCard;