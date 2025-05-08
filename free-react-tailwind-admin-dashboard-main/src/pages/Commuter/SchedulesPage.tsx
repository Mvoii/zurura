import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSchedule from '../../hooks/useSchedule';
import { useModal } from '../../hooks/useModal';
import useAccess from '../../hooks/useAccess';
import ScheduleFilter from '../../components/Commuter/ScheduleFilter';
import ScheduleList from '../../components/Commuter/ScheduleList';
import ScheduleCardModal from '../../components/Commuter/ScheduleCardModal';
import type { ScheduleFrontendData, ScheduleParams } from '../../api/scheduleService';
import Alert from '../../components/ui/alert/Alert';

const SchedulesPage: React.FC = () => {
  const { schedules, isLoading, error, fetchSchedules, clearError } = useSchedule();
  const { schedules: schedulePermissions } = useAccess(); // Only destructure what we need
  const [filterParams, setFilterParams] = useState<ScheduleParams>({ 
    route_id: '', 
    date: '' 
  });
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleFrontendData | null>(null);
  const { isOpen: isDetailModalOpen, openModal: openDetailModal, closeModal: closeDetailModal } = useModal();

  // Memoize filter params to prevent unnecessary re-renders
  const memoizedFilterParams = useMemo(() => filterParams, [filterParams.route_id, filterParams.date]);

  // Fetch schedules on initial load and when filter changes
  useEffect(() => {
    // We've already established schedule viewing is public, so no need to check permissions
    fetchSchedules(memoizedFilterParams);
    
    // Return cleanup function to cancel pending requests if component unmounts
    return () => {
      // If your fetchSchedules has a cancel mechanism, call it here
    };
  }, [fetchSchedules, memoizedFilterParams]); // Remove 'can' from dependencies

  // Handle applying new filter values - memoize with useCallback
  const handleFilterApply = useCallback((newFilters: ScheduleParams) => {
    setFilterParams(newFilters);
  }, []);

  // Handle clearing filters - memoize with useCallback
  const handleFilterClear = useCallback(() => {
    setFilterParams({ route_id: '', date: '' });
  }, []);

  // Handle retry button click - memoize with useCallback
  const handleRetryFetch = useCallback(() => {
    clearError();
    fetchSchedules(filterParams);
  }, [clearError, fetchSchedules, filterParams]);

  // Handle view schedule details - memoize with useCallback
  const handleViewDetails = useCallback((schedule: ScheduleFrontendData) => {
    setSelectedSchedule(schedule);
    openDetailModal();
  }, [openDetailModal]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Bus Schedules</h1>
      
      {/* Show any top-level errors */}
      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error} 
//             clas//   sName="mb-6"
        />
      )}
      
      {/* Filter Component */}
      <div className="mb-6">
        <ScheduleFilter
          initialFilters={filterParams}
          onApplyFilters={handleFilterApply}
          onClearFilters={handleFilterClear}
          isApplying={isLoading}
        />
      </div>
      
      {/* Schedule List Component */}
      <ScheduleList
        schedulesData={schedules}
        isLoadingData={isLoading}
        loadingError={error}
        onRetry={handleRetryFetch}
        onViewDetails={handleViewDetails}
      />
      
      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <ScheduleCardModal
          schedule={selectedSchedule}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default SchedulesPage;