import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Form from '../../components/form/Form';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { Calendar, Bus, User, Clock, Route, Save, X } from 'lucide-react';
import useBus from '../../hooks/useBus';
import useRoute from '../../hooks/useRoute';
import type { CreateSchedulePayload } from '../../api/scheduleService';

// Mock driver data - Replace with actual useDriver hook when available
const mockDrivers = [
  { id: 'driver1', firstName: 'John', lastName: 'Doe' },
  { id: 'driver2', firstName: 'Jane', lastName: 'Smith' },
  { id: 'driver3', firstName: 'Bob', lastName: 'Johnson' },
];

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateSchedulePayload) => Promise<void>;
  isSubmitting: boolean;
  submissionError: string | null;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  submissionError
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateSchedulePayload>({
    route_id: '',
    bus_id: '',
    driver_id: '',
    departure_time: new Date().toISOString().slice(0, 16) // Current time in format yyyy-MM-ddThh:mm
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Get routes and buses using hooks
  const { routes, fetchRoutes, isLoading: isLoadingRoutes } = useRoute();
  const { buses, fetchBuses, isLoading: isLoadingBuses } = useBus();
  
  // Fetch routes and buses on component mount
  useEffect(() => {
    // if (isOpen) {
      fetchRoutes(); // Explicitly pass empty object
      fetchBuses();
    // }
  }, [fetchRoutes, fetchBuses, isOpen]);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle select changes for dropdowns
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!formData.route_id) {
      errors.route_id = 'Please select a route';
    }
    
    if (!formData.bus_id) {
      errors.bus_id = 'Please select a bus';
    }
    
    if (!formData.driver_id) {
      errors.driver_id = 'Please select a driver';
    }
    
    if (!formData.departure_time) {
      errors.departure_time = 'Please select a departure time';
    } else {
      // Ensure departure time is in the future
      const departureDate = new Date(formData.departure_time);
      const now = new Date();
      
      if (departureDate <= now) {
        errors.departure_time = 'Departure time must be in the future';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Submit form
    await onSubmit({
      ...formData,
      departure_time: new Date(formData.departure_time).toISOString()
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
        <h2 className="text-xl font-bold mb-4">Create New Schedule</h2>
        
        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Route Selection */}
            <div>
              <Label htmlFor="route_id" className="flex items-center">
                <Route className="h-4 w-4 mr-2" /> Route
              </Label>
              <Select
                options={[
                  { value: "", label: "Select a route" },
                  ...routes.map(route => ({
                    value: route.id ?? '', // Added null coalescing operator
                    label: route.route_name 
                      ? (route.origin && route.destination)
                        ? `${route.route_name} (${route.origin} to ${route.destination})`
                        : route.route_name
                      : "Unnamed Route"
                  }))
                ]}
                placeholder="Select a route"
                onChange={(value) => handleSelectChange('route_id', value)}
                defaultValue={formData.route_id}
                className={formErrors.route_id ? 'border-error-500' : ''}
              />
              {formErrors.route_id && (
                <p className="text-error-500 text-sm mt-1">{formErrors.route_id}</p>
              )}
              {isLoadingRoutes && (
                <p className="text-sm text-gray-500 italic mt-1">Loading routes...</p>
              )}
            </div>
            
            {/* Bus Selection */}
            <div>
              <Label htmlFor="bus_id" className="flex items-center">
                <Bus className="h-4 w-4 mr-2" /> Bus
              </Label>
              <Select
                options={[
                  { value: "", label: "Select a bus" },
                  ...buses.map(bus => ({
                    value: bus.id ?? '', // Added null coalescing operator
                    label: `${bus.registrationPlate} (${bus.capacity} seats)`
                  }))
                ]}
                placeholder="Select a bus"
                onChange={(value) => handleSelectChange('bus_id', value)}
                defaultValue={formData.bus_id}
                className={formErrors.bus_id ? 'border-error-500' : ''}
              />
              {formErrors.bus_id && (
                <p className="text-error-500 text-sm mt-1">{formErrors.bus_id}</p>
              )}
              {isLoadingBuses && (
                <p className="text-sm text-gray-500 italic mt-1">Loading buses...</p>
              )}
            </div>
            
            {/* Driver Selection */}
            <div>
              <Label htmlFor="driver_id" className="flex items-center">
                <User className="h-4 w-4 mr-2" /> Driver
              </Label>
              <Select
                options={[
                  { value: "", label: "Select a driver" },
                  ...mockDrivers.map(driver => ({
                    value: driver.id,
                    label: `${driver.firstName} ${driver.lastName}`
                  }))
                ]}
                placeholder="Select a driver"
                onChange={(value) => handleSelectChange('driver_id', value)}
                defaultValue={formData.driver_id}
                className={formErrors.driver_id ? 'border-error-500' : ''}
              />
              {formErrors.driver_id && (
                <p className="text-error-500 text-sm mt-1">{formErrors.driver_id}</p>
              )}
            </div>
            
            {/* Departure Time */}
            <div>
              <Label htmlFor="departure_time" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Departure Date & Time
              </Label>
              <div className="relative">
                <Input
                  id="departure_time"
                  name="departure_time"
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  className={`pl-10 ${formErrors.departure_time ? 'border-error-500' : ''}`}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.departure_time && (
                <p className="text-error-500 text-sm mt-1">{formErrors.departure_time}</p>
              )}
            </div>
            
            {/* Error Display */}
            {submissionError && (
              <Alert
                variant="error"
                title="Error"
                message={submissionError}
              />
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Create Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleForm;