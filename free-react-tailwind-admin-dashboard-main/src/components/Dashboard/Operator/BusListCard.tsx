import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComponentCard from '../../common/ComponentCard';
import { BusFrontendData } from '../../../api/busService';
// import { List } from 'lucide-react';
import Button from '../../ui/button/Button';

interface BusListCardProps {
  buses: BusFrontendData[];
  isLoading: boolean;
}

const BusListCard: React.FC<BusListCardProps> = ({ buses, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <ComponentCard title="Bus Fleet Overview">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Bus Fleet Overview">
      <div className="p-1"> {/* Reduced padding for denser list if needed */}
        {buses.length === 0 ? (
          <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No buses in the fleet yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto custom-scrollbar">
            {buses.map(bus => (
              <li key={bus.id} className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {bus.registrationPlate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Capacity: {bus.capacity} seats
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/operator/buses/${bus.id}/assignments`)}
                    title="Manage Assignments"
                  >
                    Assignments
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 mt-2">
            <Button 
                onClick={() => navigate('/operator/buses')}
                className="w-full"
                // variant="ghost"
            >
                View All Buses
            </Button>
        </div>
      </div>
       {/* Note: A true "pending assignment" status per bus would require more specific data 
           or complex logic based on all assignments and schedules. 
           This list provides an overview of the fleet. */}
    </ComponentCard>
  );
};

export default BusListCard;