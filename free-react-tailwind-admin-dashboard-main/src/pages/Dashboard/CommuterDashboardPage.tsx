import React, { useEffect } from 'react';
import useBooking from '../../hooks/useBooking';
import QuickLinksCard from '../../components/Dashboard/Commuter/QuickLinksCard';
import ActiveBookingsCard from '../../components/Dashboard/Commuter/ActiveBookingsCard';
import PageMeta from '../../components/common/PageMeta';

const CommuterDashboardPage: React.FC = () => {
  const { userBookings, fetchUserBookings, isLoading, error } = useBooking();

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  // Optional: Display error message
  if (error) {
    // You might want a more sophisticated error display component
    // console.error("Error fetching bookings:", error); 
  }

  return (
    <>
      <PageMeta title="Commuter Dashboard" description='' />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Commuter Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickLinksCard />
          </div>
          <div className="lg:col-span-1">
            <ActiveBookingsCard userBookings={userBookings} isLoading={isLoading} />
          </div>
          {/* Add more cards or sections here */}
        </div>
      </div>
    </>
  );
};

export default CommuterDashboardPage;