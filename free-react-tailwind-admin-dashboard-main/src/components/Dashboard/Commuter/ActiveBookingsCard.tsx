import React from 'react';
import ComponentCard from '../../common/ComponentCard';
import { Booking } from '../../../api/bookingService';
import { Percent } from 'lucide-react';

interface ActiveBookingsCardProps {
  userBookings: Booking[];
  isLoading: boolean;
}

const ActiveBookingsCard: React.FC<ActiveBookingsCardProps> = ({ userBookings, isLoading }) => {
  const activeStatuses = ['confirmed', 'pending', 'active']; // Define active statuses

  const activeBookings = userBookings.filter(booking => 
    activeStatuses.includes(booking.status.toLowerCase())
  );

  const totalBookings = userBookings.length;
  const activeBookingsCount = activeBookings.length;
  const percentageActive = totalBookings > 0 ? (activeBookingsCount / totalBookings) * 100 : 0;

  if (isLoading) {
    return (
      <ComponentCard title="Active Bookings">
        <div className="p-4 space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Active Bookings">
      <div className="p-4">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {activeBookingsCount}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Currently active bookings
        </p>
        {totalBookings > 0 && (
          <div className="mt-3 flex items-center text-sm">
            <span 
              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                ${percentageActive > 50 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}
            >
              <Percent size={12} />
              {percentageActive.toFixed(0)}% of all your bookings are active
            </span>
          </div>
        )}
         {totalBookings === 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No bookings found.</p>
        )}
      </div>
    </ComponentCard>
  );
};

export default ActiveBookingsCard;