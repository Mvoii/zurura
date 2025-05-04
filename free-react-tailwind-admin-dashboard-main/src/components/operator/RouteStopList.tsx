import React, { useState } from 'react';
import { RouteStop } from '../../api/routeService';
import useRoute from '../../hooks/useRoute';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';
import { Modal } from '../ui/modal';
import { useModal } from '../../hooks/useModal';
import { Clock, MapPin, Edit, Trash2, MoveUp, MoveDown, Map } from 'lucide-react';

interface RouteStopListProps {
  stops: RouteStop[];
  routeId: string;
}

const RouteStopList: React.FC<RouteStopListProps> = ({ stops, routeId }) => {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  
  // Add state for delete confirmation modal
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [stopToDelete, setStopToDelete] = useState<string | null>(null);
  
  const { removeRouteStop, reorderStops, isLoading, error } = useRoute();
  
  // Modified handle stop deletion to open confirmation modal
  const handleDeleteStop = (stopId: string) => {
    setStopToDelete(stopId);
    openDeleteModal();
  };
  
  // New function to handle the actual deletion after confirmation
  const confirmDelete = async () => {
    if (!stopToDelete) return;
    
    try {
      await removeRouteStop(routeId, stopToDelete);
      closeDeleteModal();
      setStopToDelete(null);
    } catch (error) {
      console.error('Failed to delete stop:', error);
    }
  };
  
  // Handle stop order changes
  const handleMoveStop = async (stopId: string, direction: 'up' | 'down') => {
    const currentIndex = stops.findIndex(stop => stop.id === stopId);
    if (currentIndex === -1) return;
    
    // Can't move up if already at the top
    if (direction === 'up' && currentIndex === 0) return;
    
    // Can't move down if already at the bottom
    if (direction === 'down' && currentIndex === stops.length - 1) return;
    
    const newOrder = stops.map(stop => ({
      id: stop.id,
      order: stop.stop_order
    }));
    
    // Swap positions
    if (direction === 'up') {
      const temp = newOrder[currentIndex].order;
      newOrder[currentIndex].order = newOrder[currentIndex - 1].order;
      newOrder[currentIndex - 1].order = temp;
    } else {
      const temp = newOrder[currentIndex].order;
      newOrder[currentIndex].order = newOrder[currentIndex + 1].order;
      newOrder[currentIndex + 1].order = temp;
    }
    
    try {
      await reorderStops(routeId, newOrder);
    } catch (error) {
      console.error('Failed to reorder stops:', error);
    }
  };
  
  // Handle edit modal
  const handleEditStop = (stop: RouteStop) => {
    setSelectedStop(stop);
    openEditModal();
  };
  
  // Get view on map URL
  const getMapUrl = (stop: RouteStop) => {
    return `https://www.google.com/maps/search/?api=1&query=${stop.latitude},${stop.longitude}`;
  };
  
  if (error) {
    return <Alert variant="error" title="Error" message={error} />;
  }
  
  if (stops.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No stops have been added to this route yet.</p>
        <p className="text-sm text-gray-400 mt-2">Click the "Add New Stop" button to add your first stop.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Order</TableCell>
              <TableCell isHeader>Stop Name</TableCell>
              <TableCell isHeader>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Location
                </div>
              </TableCell>
              <TableCell isHeader>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Travel Time
                </div>
              </TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops
              .sort((a, b) => a.stop_order - b.stop_order)
              .map((stop, index) => (
                <TableRow key={`${stop.id || stop.stop_id || `stop-${index}`}-${stop.stop_order}`}>
                  <TableCell className="font-bold text-center w-16">
                    {stop.stop_order}
                  </TableCell>
                  <TableCell className="font-medium">
                    {stop.name || 'Unnamed Stop'}
                    <div className="text-xs text-gray-500 mt-1">
                      {stop.timetable && stop.timetable.length > 0 
                        ? `Times: ${stop.timetable.join(', ')}` 
                        : 'No timetable'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {stop.landmark_description || 'No description'}
                  </TableCell>
                  <TableCell>
                    {stop.travel_time !== undefined 
                      ? `${stop.travel_time} min` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveStop(stop.id, 'up')}
                        disabled={stop.stop_order === 1 || isLoading}
                        title="Move Up"
                        className="p-1"
                      >
                        <MoveUp size={16} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveStop(stop.id, 'down')}
                        disabled={stop.stop_order === stops.length || isLoading}
                        title="Move Down"
                        className="p-1"
                      >
                        <MoveDown size={16} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getMapUrl(stop), '_blank')}
                        title="View on Map"
                        className="p-1"
                      >
                        <Map size={16} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStop(stop)}
                        title="Edit Stop"
                        className="p-1"
                      >
                        <Edit size={16} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStop(stop.id)}
                        disabled={isLoading}
                        title="Delete Stop"
                        className="p-1 text-red-500 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Stop Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        showCloseButton={true}
        className="max-w-2xl w-full"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Stop</h2>
          {/* When implementing the EditStopForm component, you would include it here */}
          {/* <EditStopForm
            routeId={routeId}
            stop={selectedStop}
            onClose={closeEditModal}
            onSuccess={() => {
              closeEditModal();
              setSelectedStop(null);
            }}
          /> */}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={closeEditModal}>Close</Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        showCloseButton={true}
        className="max-w-md w-full"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Delete Stop</h2>
          <p className="mb-6 text-gray-600">
            Are you sure you want to delete this stop? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={closeDeleteModal}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmDelete}
              isLoading={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RouteStopList;