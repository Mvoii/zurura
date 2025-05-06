import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import useBus from "../../hooks/useBus";
import type { BusFrontendData } from "../../api/busService";
import { AlertCircle, CheckCircle } from "lucide-react";

// Import form components
import Form from "../form/Form";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import NumericInput from "../form/input/NumericInput"; // Assuming you have this component

interface BusFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBus?: BusFrontendData | null;
}

export const BusForm: React.FC<BusFormProps> = ({
  isOpen,
  onClose,
  editingBus = null
}) => {
  const { addBus, editBus, isLoading } = useBus();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!editingBus;
  
  // Form state
  const [formData, setFormData] = useState({
    registrationPlate: "",
    capacity: 0,
    busPhotoUrl: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    registrationPlate: "",
    capacity: ""
  });

  // Populate form with bus data when in edit mode
  useEffect(() => {
    if (editingBus) {
      setFormData({
        registrationPlate: editingBus.registrationPlate || '',
        capacity: editingBus.capacity || 0,
        busPhotoUrl: editingBus.busPhotoUrl || ''
      });
    } else {
      // Reset form for new bus
      setFormData({
        registrationPlate: "",
        capacity: 0,
        busPhotoUrl: ""
      });
    }
    
    // Clear any previous errors
    setFormErrors({
      registrationPlate: "",
      capacity: ""
    });
    
  }, [editingBus, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric input for capacity
    if (name === 'capacity') {
      const numericValue = parseInt(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: isNaN(numericValue) ? 0 : numericValue 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (name in formErrors && formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      registrationPlate: "",
      capacity: ""
    };
    
    // Registration plate validation
    if (!formData.registrationPlate.trim()) {
      errors.registrationPlate = "Registration plate is required";
      isValid = false;
    } else if (formData.registrationPlate.length > 20) {
      errors.registrationPlate = "Registration plate cannot exceed 20 characters";
      isValid = false;
    }
    
    // Capacity validation
    if (formData.capacity <= 0) {
      errors.capacity = "Capacity must be greater than 0";
      isValid = false;
    } else if (formData.capacity > 100) {
      errors.capacity = "Capacity cannot exceed 100";
      isValid = false;
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
      const busData: BusFrontendData = {
        ...formData,
        id: isEditMode && editingBus?.id ? editingBus.id : undefined
      };
      
      if (isEditMode && editingBus?.id) {
        result = await editBus(editingBus.id, busData);
      } else {
        result = await addBus(busData);
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
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Bus Details' : 'Add New Bus'}
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
                {isEditMode ? 'Bus updated successfully!' : 'Bus added successfully!'}
              </span>
            </div>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="registrationPlate">
                  Registration Plate<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="registrationPlate"
                  name="registrationPlate"
                  type="text"
                  placeholder="KAA 123A"
                  value={formData.registrationPlate}
                  onChange={handleChange}
                  className={`w-full ${formErrors.registrationPlate ? 'border-error-500' : ''}`}
                  disabled={isEditMode} // Registration plates typically can't be edited
                />
                {formErrors.registrationPlate && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.registrationPlate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="capacity">
                  Capacity<span className="text-error-500">*</span>
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="30"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={`w-full ${formErrors.capacity ? 'border-error-500' : ''}`}
                />
                {formErrors.capacity && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.capacity}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="busPhotoUrl">
                  Photo URL <span className="text-gray-400 text-sm">(optional)</span>
                </Label>
                <Input
                  id="busPhotoUrl"
                  name="busPhotoUrl"
                  type="text"
                  placeholder="https://example.com/bus-photo.jpg"
                  value={formData.busPhotoUrl}
                  onChange={handleChange}
                />
                {formData.busPhotoUrl && (
                  <div className="mt-2">
                    <Label>Preview:</Label>
                    <div className="h-32 w-full mt-1 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                      <img 
                        src={formData.busPhotoUrl} 
                        alt="Bus preview" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                // Don't add type="submit" - Form's onSubmit handler will take care of this
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center"
              >
                {isLoading && (
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                )}
                {isLoading ? 'Saving...' : isEditMode ? 'Update Bus' : 'Add Bus'}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default BusForm;