import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import BusAssignmentList from '../../components/operator/BusAssignmentList';
import BusAssignmentForm from '../../components/operator/BusAssignmentForm';
import useBus from '../../hooks/useBus';
import useAccess from '../../hooks/useAccess';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { Plus, ArrowLeft } from 'lucide-react';
import type { BusAssignmentFrontendData, BusFrontendData } from '../../api/busService';

const ManageAssignmentsPage: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const { 
    fetchBus, 
    currentBus, 
    isLoading, 
    error,
    fetchBusAssignments 
  } = useBus();
  const { can } = useAccess();
  
  // State for assignment management
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<BusAssignmentFrontendData | null>(null);
  const [assignments, setAssignments] = useState<BusAssignmentFrontendData[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  // Fetch bus data and assignments when component mounts or busId changes
  useEffect(() => {
    if (busId) {
      // Load bus details
      fetchBus(busId);
      
      // Load assignments directly
      const loadAssignments = async () => {
        setIsLoadingAssignments(true);
        setAssignmentsError(null);
        try {
          const result = await fetchBusAssignments(busId);
          setAssignments(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load assignments';
          setAssignmentsError(message);
        } finally {
          setIsLoadingAssignments(false);
        }
      };
      
      loadAssignments();
    }
  }, [busId, fetchBus, fetchBusAssignments]);

  // Handle opening form for new assignment
  const handleAddAssignment = useCallback(() => {
    if (!can('create', 'vehicle')) return; // Using vehicle as the resource type
    setEditingAssignment(null);
    setIsAddAssignmentOpen(true);
  }, [can]);

  // Handle editing an assignment
  const handleEditAssignment = useCallback((assignment: BusAssignmentFrontendData) => {
    setEditingAssignment(assignment);
    setIsAddAssignmentOpen(true);
  }, []);

  // Handle form close with refresh
  const handleFormClose = useCallback(() => {
    setIsAddAssignmentOpen(false);
    setEditingAssignment(null);
    
    // Refresh assignments when the form is closed (in case changes were made)
    if (busId) {
      fetchBusAssignments(busId).then(result => {
        setAssignments(result);
      }).catch(error => {
        const message = error instanceof Error ? error.message : 'Failed to refresh assignments';
        setAssignmentsError(message);
      });
    }
  }, [busId, fetchBusAssignments]);

  return (
    <>
      <div className="mb-4">
        <Link to="/operator/buses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Buses
        </Link>
      </div>
      
      {/* Main content card with title */}
      <ComponentCard title="Bus Assignment Management" className="mb-6">
        {/* {error && <Alert variant="error" title="Error" message={error} />} */}
        {assignmentsError && <Alert variant="error" title="Assignment Error" message={assignmentsError} />}
        
        {/* {isLoading && !currentBus ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentBus ? (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium">{currentBus.registrationPlate}</h3>
                <p className="text-sm text-gray-500">Capacity: {currentBus.capacity} passengers</p>
              </div>
              
              {can('create', 'vehicle') && (
                <Button
                  onClick={handleAddAssignment}
                  className="flex items-center mt-4 md:mt-0 gap-2"
                >
                  <Plus size={16} />
                  Add Assignment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Alert
            variant="info"
            title="Bus Not Found"
            message="The requested bus could not be found."
          />
        )} */}
      </ComponentCard>
      
      {/* Bus Assignment List - Pass the assignments directly */}
      {busId && (
        <BusAssignmentList 
          busId={busId}
          assignments={assignments}
          isLoading={isLoadingAssignments}
          onEditItem={handleEditAssignment}
          onAddItem={handleAddAssignment} // Add this line
        />
      )}
      
      {/* Assignment Form Modal */}
      {isAddAssignmentOpen && busId && (
        <BusAssignmentForm
          isOpen={isAddAssignmentOpen}
          onClose={handleFormClose}
          busId={busId}
          editingAssignment={editingAssignment}
        />
      )}
    </>
  );
};

export default ManageAssignmentsPage;