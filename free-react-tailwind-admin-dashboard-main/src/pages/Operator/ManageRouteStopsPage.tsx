import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRoute from '../../hooks/useRoute';
import { useModal } from '../../hooks/useModal';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import { Modal } from '../../components/ui/modal';
import AddStopToRouteForm from '../../components/operator/AddStopToRouteForm';
import RouteCard from '../../components/Commuter/RouteCard';
import RouteStopList from '../../components/operator/RouteStopList';
import { Plus } from 'lucide-react';

const ManageRouteStopsPage: React.FC = () => {
  // Get route ID from URL params
  const { routeId } = useParams<{ routeId: string }>();
  
  // Use the modal hook for managing the Add Stop form visibility
  const { isOpen: isAddStopModalOpen, openModal: openAddStopModal, closeModal: closeAddStopModal } = useModal();
  
  // Get route data and operations from context
  const { 
    currentRoute, 
    fetchRoute, 
    isLoading, 
    error 
  } = useRoute();
  
  // Fetch route data when component mounts or routeId changes
  useEffect(() => {
    if (routeId) {
      fetchRoute(routeId);
    }
  }, [routeId, fetchRoute]);
  
  // Handle successful addition of a stop
  const handleStopAdded = () => {
    // Refresh the route data to include the new stop
    if (routeId) {
      fetchRoute(routeId);
    }
    // Close the modal
    closeAddStopModal();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Route Stops</h1>
      
      {error && <Alert variant="error" title="Error" message={error} />}
      
      {isLoading && !currentRoute ? (
        <div className="flex justify-center items-center p-12">
          <p>Loading route details...</p>
        </div>
      ) : currentRoute ? (
        <>
          {/* Route Details Card */}
          <ComponentCard title="Route Details" className="mb-6">
            <RouteCard route={currentRoute} />
          </ComponentCard>
          
          {/* Stops Management Section */}
          <ComponentCard 
            title="Route Stops" 
            desc="Manage stops for this route"
            className="mb-6"
          >
            <div className="flex justify-end mb-4">
              <Button
                variant="primary"
                onClick={openAddStopModal}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add New Stop
              </Button>
            </div>
            
            {/* List of route stops */}
            <RouteStopList 
              stops={currentRoute.stops || []} 
              routeId={routeId || ''} 
            />
          </ComponentCard>
          
          {/* Add Stop Modal */}
          <Modal
            isOpen={isAddStopModalOpen}
            onClose={closeAddStopModal}
            showCloseButton={true}
            className="max-w-2xl w-full"
          >
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Add Stop to Route</h2>
                {routeId && (
                <AddStopToRouteForm
                    routeId={routeId}
                    onClose={closeAddStopModal}
                    onSuccess={handleStopAdded}
                />
                )}
            </div>
          </Modal>
        </>
      ) : (
        <Alert
          variant="info"
          title="Route Not Found"
          message="The requested route could not be found."
        />
      )}
    </div>
  );
};

export default ManageRouteStopsPage;