import { useState, useEffect, useRef } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import useBus from "../../hooks/useBus";
import useRoute from "../../hooks/useRoute";
import type { BusAssignmentFrontendData } from "../../api/busService";
import type { RouteFrontendData } from "../../api/routeService";
import { AlertCircle, CheckCircle, CalendarRange, Calendar as CalendarIcon } from "lucide-react";

// Import FullCalendar and related modules
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";

// Import form components
import Form from "../form/Form";
import Label from "../form/Label";
import Select from "../form/Select";

interface BusAssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  busId: string;
  editingAssignment?: BusAssignmentFrontendData | null;
}

export const BusAssignmentForm: React.FC<BusAssignmentFormProps> = ({
  isOpen,
  onClose,
  busId,
  editingAssignment = null
}) => {
  const { assignBusToRoute, updateBusAssignment, isLoading } = useBus();
  const { routes, fetchRoutes } = useRoute();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!editingAssignment;
  const calendarRef = useRef<FullCalendar>(null);
  
  // State for calendar display
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarSelectionMode, setCalendarSelectionMode] = useState<'start' | 'end'>('start');
  
  // Form state
  const [formData, setFormData] = useState({
    busId: busId,
    routeId: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Default to one month from now
  });
  
  const [formErrors, setFormErrors] = useState({
    routeId: "",
    startDate: "",
    endDate: ""
  });

  // Fetch routes when the component mounts
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Populate form with assignment data when in edit mode
  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        busId: busId,
        routeId: editingAssignment.routeId || '',
        startDate: editingAssignment.startDate || new Date(),
        endDate: editingAssignment.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1))
      });
    } else {
      // Reset form for new assignment
      setFormData({
        busId: busId,
        routeId: "",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      });
    }
    
    // Clear any previous errors
    setFormErrors({
      routeId: "",
      startDate: "",
      endDate: ""
    });
    
  }, [editingAssignment, busId, isOpen]);

  // Handler for route selection
  const handleRouteChange = (value: string) => {
    setFormData(prev => ({ ...prev, routeId: value }));
    
    // Clear error for this field when user selects a route
    if (formErrors.routeId) {
      setFormErrors(prev => ({ ...prev, routeId: "" }));
    }
  };
  
  // Handle calendar date selection
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = new Date(selectInfo.startStr);
    
    if (calendarSelectionMode === 'start') {
      // If the selected start date is after the current end date, also update end date
      const updatedEndDate = selectedDate >= formData.endDate 
        ? new Date(selectedDate.getTime() + 86400000) // Add one day
        : formData.endDate;
        
      setFormData(prev => ({
        ...prev,
        startDate: selectedDate,
        endDate: updatedEndDate
      }));
      
      // Clear error for start date
      if (formErrors.startDate) {
        setFormErrors(prev => ({ ...prev, startDate: "" }));
      }
      
      // Automatically switch to end date selection
      setCalendarSelectionMode('end');
    } else {
      // Make sure end date is not before start date
      if (selectedDate < formData.startDate) {
        setFormErrors(prev => ({ 
          ...prev, 
          endDate: "End date must be after start date" 
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: selectedDate
      }));
      
      // Clear error for end date
      if (formErrors.endDate) {
        setFormErrors(prev => ({ ...prev, endDate: "" }));
      }
      
      // Close the calendar after selecting end date
      setShowCalendar(false);
    }
  };
  
  // Open the calendar for date selection
  const openCalendar = (mode: 'start' | 'end') => {
    setCalendarSelectionMode(mode);
    setShowCalendar(true);
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      routeId: "",
      startDate: "",
      endDate: ""
    };
    
    // Route validation
    if (!formData.routeId) {
      errors.routeId = "Please select a route";
      isValid = false;
    }
    
    // Date validation
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    }
    
    if (!formData.endDate) {
      errors.endDate = "End date is required";
      isValid = false;
    }
    
    // Ensure end date is after start date
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      errors.endDate = "End date must be after start date";
      isValid = false;
    }
    
    // Ensure start date is not in the past unless editing
    if (!isEditMode) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = "Start date cannot be in the past";
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }
    
    try {
      let result;
      
      // Create frontend data object with all fields
      const assignmentData: BusAssignmentFrontendData = {
        ...formData,
        id: isEditMode && editingAssignment?.id ? editingAssignment.id : undefined
      };
      
      if (isEditMode && editingAssignment?.id) {
        result = await updateBusAssignment(editingAssignment.id, assignmentData);
      } else {
        result = await assignBusToRoute(assignmentData);
      }
      
      if (result.success) {
        setSuccess(true);
        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || "An error occurred while saving");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-md w-full"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <CalendarRange className="mr-2" size={20} />
          {isEditMode ? 'Update Assignment' : 'Assign Bus to Route'}
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/80">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/80">
            <div className="flex">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                {isEditMode ? 'Assignment updated successfully!' : 'Bus assigned to route successfully!'}
              </span>
            </div>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="routeId">
                  Route<span className="text-error-500">*</span>
                </Label>
                <Select
                  options={routes.map((route: RouteFrontendData) => ({
                    value: route.id || '',
                    label: `${route.route_name} (${route.origin} to ${route.destination})`
                  }))}
                  placeholder="Select a route"
                  onChange={handleRouteChange}
                  defaultValue={formData.routeId}
                  className={formErrors.routeId ? 'border-error-500' : ''}
                />
                {formErrors.routeId && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.routeId}</p>
                )}
              </div>
              
              {/* Date Selection with Calendar Toggle */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startDate">
                    Start Date<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <div 
                      onClick={() => openCalendar('start')}
                      className={`flex items-center justify-between cursor-pointer w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
                        formErrors.startDate ? 'border-error-500' : ''
                      }`}
                    >
                      <span>{formatDateForDisplay(formData.startDate)}</span>
                      <CalendarIcon size={16} className="text-gray-500" />
                    </div>
                  </div>
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.startDate}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="endDate">
                    End Date<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <div 
                      onClick={() => openCalendar('end')}
                      className={`flex items-center justify-between cursor-pointer w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
                        formErrors.endDate ? 'border-error-500' : ''
                      }`}
                    >
                      <span>{formatDateForDisplay(formData.endDate)}</span>
                      <CalendarIcon size={16} className="text-gray-500" />
                    </div>
                  </div>
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.endDate}</p>
                  )}
                </div>
              </div>
              
              {/* Calendar Component */}
              {showCalendar && (
                <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-center text-sm font-medium">
                    Select {calendarSelectionMode === 'start' ? 'Start' : 'End'} Date
                  </div>
                  <div className="p-2 custom-calendar calendar-mini">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: 'today'
                      }}
                      height="auto"
                      selectable={true}
                      select={handleDateSelect}
                      initialDate={
                        calendarSelectionMode === 'start' 
                          ? formData.startDate 
                          : formData.endDate
                      }
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                className="flex items-center justify-center"
                type="submit"
              >
                {isLoading && (
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                )}
                {isLoading ? 'Saving...' : isEditMode ? 'Update Assignment' : 'Assign Bus'}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default BusAssignmentForm;