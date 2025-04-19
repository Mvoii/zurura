import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import useRoute from "../../hooks/useRoute";
import type { RouteFrontendData } from "../../api/routeService";
import { AlertCircle, CheckCircle } from "lucide-react";

// Import form components
import Form from "../form/Form";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import TextArea from "../form/input/TextArea";

interface RouteFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoute?: RouteFrontendData | null;
}

export const RouteForm: React.FC<RouteFormProps> = ({
  isOpen,
  onClose,
  editingRoute = null
}) => {
  const { addRoute, editRoute, isLoading } = useRoute();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!editingRoute;
  
  // Use direct form state management like in the SignUp forms
  const [formData, setFormData] = useState({
    route_name: "",
    description: "",
    // origin: "",
    // destination: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    route_name: "",
    description: "",
    // origin: "",
    // destination: ""
  });

  // Populate form with route data when in edit mode
  useEffect(() => {
    if (editingRoute) {
      setFormData({
        route_name: editingRoute.route_name || '',
        description: editingRoute.description || '',
        // origin: editingRoute.origin || '',
        // destination: editingRoute.destination || ''
      });
    } else {
      // Reset form for new route
      setFormData({
        route_name: "",
        description: "",
        // origin: "",
        // destination: ""
      });
    }
    
    // Clear any previous errors
    setFormErrors({
      route_name: "",
      description: "",
    //   origin: "",
    //   destination: ""
    });
    
  }, [editingRoute, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (name in formErrors && formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      route_name: "",
      description: "",
    //   origin: "",
    //   destination: ""
    };
    
    // Route name validation
    if (!formData.route_name.trim()) {
      errors.route_name = "Route name is required";
      isValid = false;
    } else if (formData.route_name.length > 100) {
      errors.route_name = "Route name cannot exceed 100 characters";
      isValid = false;
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
      isValid = false;
    }
    
    // Origin validation - required for UI but not sent to backend
    // if (!formData.origin.trim()) {
    //   errors.origin = "Origin is required";
    //   isValid = false;
    // } else if (formData.origin.length > 100) {
    //   errors.origin = "Origin cannot exceed 100 characters";
    //   isValid = false;
    // }
    
    // // Destination validation - required for UI but not sent to backend
    // if (!formData.destination.trim()) {
    //   errors.destination = "Destination is required";
    //   isValid = false;
    // } else if (formData.destination.length > 100) {
    //   errors.destination = "Destination cannot exceed 100 characters";
    //   isValid = false;
    // }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
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
      const routeData: RouteFrontendData = {
        ...formData,
        id: isEditMode && editingRoute?.id ? editingRoute.id : undefined
      };
      
      if (isEditMode && editingRoute?.id) {
        // The context's editRoute function will filter out frontend-only fields
        result = await editRoute(editingRoute.id, routeData);
      } else {
        // The context's addRoute function will filter out frontend-only fields
        result = await addRoute(routeData);
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
      className="max-w-2xl w-full"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Route Details' : 'Add New Route'}
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
                {isEditMode ? 'Route updated successfully!' : 'Route added successfully!'}
              </span>
            </div>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="route_name">
                  Route Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="route_name"
                  name="route_name"
                  type="text"
                  placeholder="Central Business District to Westlands"
                  value={formData.route_name}
                  onChange={handleChange}
                  className={`w-full ${formErrors.route_name ? 'border-error-500' : ''}`}
                />
                {formErrors.route_name && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.route_name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">
                  Description<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Main commuter route with 10 stops"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full ${formErrors.description ? 'border-error-500' : ''}`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.description}</p>
                )}
              </div>
              
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">
                    Origin<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    placeholder="CBD"
                    value={formData.origin}
                    onChange={handleChange}
                    className={`w-full ${formErrors.origin ? 'border-error-500' : ''}`}
                  />
                  {formErrors.origin && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.origin}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="destination">
                    Destination<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="Westlands"
                    value={formData.destination}
                    onChange={handleChange}
                    className={`w-full ${formErrors.destination ? 'border-error-500' : ''}`}
                  />
                  {formErrors.destination && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.destination}</p>
                  )}
                </div>
              </div> */}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                // onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center justify-center"
              >
                {isLoading && (
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                )}
                {isLoading ? 'Saving...' : isEditMode ? 'Update Route' : 'Add Route'}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};