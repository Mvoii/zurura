import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useBus from "../../hooks/useBus";
import useAccess from "../../hooks/useAccess";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import { Edit2, Trash2, Plus, Calendar, List } from "lucide-react";
import type { BusAssignmentFrontendData } from "../../api/busService";
import BusAssignmentForm from "./BusAssignmentForm";
import BusAssignmentCalendar from "./BusAssignmentCalendar";

// Updated props interface
interface BusAssignmentListProps {
  busId?: string;
  onEditItem?: (assignment: BusAssignmentFrontendData) => void;
  onAddItem?: () => void; // Add this new prop
  hideAddButton?: boolean;
  // New props for external data management
  assignments?: BusAssignmentFrontendData[];
  isLoading?: boolean;
  error?: string | null;
}

const BusAssignmentList: React.FC<BusAssignmentListProps> = ({
  busId: externalBusId,
  onEditItem,
  onAddItem, // Add this new prop
  hideAddButton = false,
  // Use the new props with defaults for backward compatibility
  assignments: externalAssignments,
  isLoading: externalIsLoading,
  error: externalError
}) => {
  const { busId: urlBusId } = useParams<{ busId: string }>();
  const actualBusId = externalBusId || urlBusId;
  
  const { 
    fetchBusAssignments, 
    deleteBusAssignment, 
    isLoading: contextIsLoading, 
    error: contextError 
  } = useBus();
  const { can } = useAccess();
  
  // State for assignments - only used if no external assignments are provided
  const [localAssignments, setLocalAssignments] = useState<BusAssignmentFrontendData[]>([]);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<BusAssignmentFrontendData | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  // Determine which values to use (external or internal)
  const assignments = externalAssignments || localAssignments;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : (localIsLoading || contextIsLoading);
  const error = externalError || localError || contextError;
  
  // Wrap loadAssignments in useCallback to stabilize its reference
  const loadAssignments = useCallback(async () => {
    // Skip loading if external assignments are provided
    if (externalAssignments !== undefined) return;
    if (!actualBusId) return;
    
    setLocalIsLoading(true);
    setLocalError(null);
    
    try {
      const data = await fetchBusAssignments(actualBusId);
      setLocalAssignments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assignments';
      console.error("Failed to load assignments:", err);
      setLocalError(errorMessage);
    } finally {
      setLocalIsLoading(false);
    }
  }, [actualBusId, fetchBusAssignments, externalAssignments]);
  
  // Load assignments when the component mounts or when dependencies change
  // Only do this if we're not using external assignments
  useEffect(() => {
    if (actualBusId && externalAssignments === undefined) {
      loadAssignments();
    }
  }, [actualBusId, loadAssignments, externalAssignments]);

  // Handle opening the form for adding a new assignment
  const handleAdd = useCallback(() => {
    if (!can('create', 'vehicle')) return;
    
    if (onAddItem) {
      // Call the parent's handler if provided
      onAddItem();
    } else {
      // Otherwise handle locally
      setEditingAssignment(null);
      setIsAddAssignmentOpen(true);
    }
  }, [can, onAddItem]);

  // Handle opening the form for editing an existing assignment
  const handleEdit = useCallback((assignment: BusAssignmentFrontendData) => {
    if (!can('update', 'vehicle')) return;
    
    if (onEditItem) {
      // Use parent component's handler if provided
      onEditItem(assignment);
    } else {
      // Otherwise handle locally
      setEditingAssignment(assignment);
      setIsAddAssignmentOpen(true);
    }
  }, [can, onEditItem]);

  // Handle assignment deletion
  const handleDelete = useCallback(async (id: string) => {
    if (!can('delete', 'vehicle')) return;
    
    try {
      const result = await deleteBusAssignment(id);
      if (result.success) {
        setShowConfirmDelete(null);
        // Refresh assignments after deletion
        if (externalAssignments === undefined) {
          loadAssignments();
        }
        // If using external assignments, parent should handle refresh
      }
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  }, [can, deleteBusAssignment, loadAssignments, externalAssignments]);

  // Handle form modal closing with possible refresh
  const handleAssignmentFormClose = useCallback(() => {
    setIsAddAssignmentOpen(false);
    setEditingAssignment(null);
    // Refresh assignments to show new or updated data
    if (externalAssignments === undefined) {
      loadAssignments();
    }
    // If using external assignments, parent should handle refresh
  }, [loadAssignments, externalAssignments]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine assignment status
  const getAssignmentStatus = (assignment: BusAssignmentFrontendData) => {
    const now = new Date();
    
    if (assignment.endDate < now) {
      return <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">Expired</span>;
    }
    
    if (assignment.startDate > now) {
      return <span className="px-2 py-1 rounded-full bg-blue-200 text-blue-700 text-xs">Upcoming</span>;
    }
    
    return <span className="px-2 py-1 rounded-full bg-green-200 text-green-700 text-xs">Active</span>;
  };

  // Add handler for assignment click in calendar
  const handleCalendarAssignmentClick = useCallback((assignment: BusAssignmentFrontendData) => {
    handleEdit(assignment);
  }, [handleEdit]);

  return (
    <ComponentCard title="Bus Assignments" className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          {/* View toggle buttons */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4 dark:bg-gray-800">
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-white shadow dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <Calendar size={18} />
            </button>
          </div>
          
          {/* Add Assignment button - only if user has permission and not hidden */}
          {!hideAddButton && can('create', 'vehicle') && (
            <Button
              onClick={handleAdd}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Assignment
            </Button>
          )}
        </div>
      </div>
      
      {/* Content rendering (loading, error, empty states) */}
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline"
            onClick={() => externalAssignments === undefined ? loadAssignments() : null}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No assignments found for this bus.</p>
          {can('create', 'vehicle') && (
            <p className="mt-2">
              Click the "Add Assignment" button to assign this bus to a route.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Conditional rendering based on view mode */}
          {viewMode === 'list' ? (
            /* Table rendering */
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Route</TableCell>
                    <TableCell isHeader>Start Date</TableCell>
                    <TableCell isHeader>End Date</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader className="text-right">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.routeId}
                      </TableCell>
                      <TableCell>{formatDate(assignment.startDate)}</TableCell>
                      <TableCell>{formatDate(assignment.endDate)}</TableCell>
                      <TableCell>{getAssignmentStatus(assignment)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit button */}
                          {can('update', 'vehicle') && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(assignment)}
                              className="p-2"
                              title="Edit Assignment"
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}
                          
                          {/* Delete button */}
                          {can('delete', 'vehicle') && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setShowConfirmDelete(assignment.id || "")}
                              className="p-2 text-red-500 hover:text-red-700"
                              title="Delete Assignment"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Calendar rendering */
            <BusAssignmentCalendar 
              assignments={assignments} 
              onAssignmentClick={handleCalendarAssignmentClick}
            />
          )}
        </>
      )}
      
      {/* Assignment Form Modal - only rendered when we're handling editing locally */}
      {(!onEditItem && !onAddItem) && isAddAssignmentOpen && actualBusId && (
        <BusAssignmentForm
          isOpen={isAddAssignmentOpen}
          onClose={handleAssignmentFormClose}
          busId={actualBusId}
          editingAssignment={editingAssignment}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this assignment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => showConfirmDelete && handleDelete(showConfirmDelete)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </ComponentCard>
  );
};

export default BusAssignmentList;