import React from 'react';
import { ScheduleFrontendData } from '../../api/scheduleService';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { Calendar, Clock, MapPin, Bus, Users, User } from 'lucide-react';

interface ScheduleCardModalProps {
  schedule: ScheduleFrontendData;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleCardModal: React.FC<ScheduleCardModalProps> = ({ 
  schedule, 
  isOpen, 
  onClose 
}) => {
  // Format date for display
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-md w-full"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Schedule Details</h2>
        
        {/* Schedule Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">{schedule.route.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {schedule.route.description}
          </p>
          
          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <span>Departure: {formatDateTime(schedule.departureTime)}</span>
          </div>
        </div>
        
        {/* Bus Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            <Bus className="h-4 w-4 mr-2" /> 
            Bus Information
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Registration:</div>
            <div>{schedule.bus.plateNumber}</div>
            
            <div className="font-medium">Total Capacity:</div>
            <div>{schedule.bus.capacity} passengers</div>
            
            <div className="font-medium">Available Seats:</div>
            <div>
              {schedule.bus.availableSeats} 
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({Math.round((schedule.bus.availableSeats / schedule.bus.capacity) * 100)}% available)
              </span>
            </div>
          </div>
        </div>
        
        {/* Driver Info */}
        {schedule.driver && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-md font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" /> 
              Driver Information
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Name:</div>
              <div>{schedule.driver.firstName} {schedule.driver.lastName}</div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          {/* Add more actions here like "Book This Trip" button if needed */}
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleCardModal;