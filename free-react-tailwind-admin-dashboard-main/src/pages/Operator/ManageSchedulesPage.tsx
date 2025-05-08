import React, { useCallback, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import ScheduleForm from '../../components/operator/ScheduleForm';
import useSchedule from '../../hooks/useSchedule';
import { useModal } from '../../hooks/useModal';
import useAccess from '../../hooks/useAccess';
import { toast } from 'react-toastify';
import type { CreateSchedulePayload } from '../../api/scheduleService';

const ManageSchedulesPage: React.FC = () => {
  const { isOpen: isCreateFormOpen, openModal: openCreateForm, closeModal: closeCreateForm } = useModal();
  const { addScheduleWithPayload, isLoading, error, clearError } = useSchedule();
  const { schedules: schedulePermissions } = useAccess();
  
  // State for success notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use the permissions object from useAccess for better consistency
  const canCreateSchedule = useMemo(() => schedulePermissions.canCreate, [schedulePermissions.canCreate]);
  
  // Handle opening create form
  const handleOpenCreateForm = useCallback(() => {
    if (!canCreateSchedule) {
      toast.error('You do not have permission to create schedules');
      return;
    }
    
    clearError();
    openCreateForm();
  }, [canCreateSchedule, clearError, openCreateForm]);
  
  // Handle form submission
  const handleCreateFormSubmit = useCallback(async (formData: CreateSchedulePayload) => {
    try {
      const result = await addScheduleWithPayload(formData);
      
      if (result.success) {
        closeCreateForm();
        setSuccessMessage('Schedule created successfully');
        toast.success('Schedule created successfully');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      // Error is handled by useSchedule and passed via props
      console.error('Form submission error:', err);
    }
  }, [addScheduleWithPayload, closeCreateForm]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Schedules</h1>
        
        <Button
          onClick={handleOpenCreateForm}
          disabled={isLoading || !canCreateSchedule}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Schedule
        </Button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          message={successMessage}
          // className="mb-6"
        />
      )}
      
      {/* Optional: Display some instructions or context */}
      <ComponentCard title="Schedule Management" className="mb-6">
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-400">
            Create new bus schedules by clicking the "Create New Schedule" button above.
            You'll need to select a route, bus, and driver, and specify the departure time.
          </p>
          
          <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Tips for Creating Schedules:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Ensure the bus is not already assigned to another route at the same time</li>
              <li>Schedule departures at least 30 minutes in advance</li>
              <li>Consider peak hours when planning your schedule</li>
              <li>Drivers must have at least 30 minutes between schedules</li>
            </ul>
          </div>
        </div>
      </ComponentCard>
      
      {/* The Schedule Form Modal */}
      <ScheduleForm
        isOpen={isCreateFormOpen}
        onClose={closeCreateForm}
        onSubmit={handleCreateFormSubmit}
        isSubmitting={isLoading}
        submissionError={error}
      />
    </div>
  );
};

export default ManageSchedulesPage;