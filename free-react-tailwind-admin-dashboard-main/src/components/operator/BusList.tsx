import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBus from "../../hooks/useBus";
import useAccess from "../../hooks/useAccess"; 
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import { Edit2, Trash2, Plus, Search, CalendarRange } from "lucide-react";
import type { BusFrontendData } from "../../api/busService";
import BusForm from "./BusForm"; // Add this import

const BusList = () => {
  const navigate = useNavigate();
  const { buses, isLoading, error, fetchBuses, removeBus } = useBus();
  const { can } = useAccess();
  
  // State for bus management
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusFrontendData | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  // State for table functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<string>("registrationPlate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Fetch buses on component mount
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);
  
  // Handle opening the form for adding a new bus
  const handleAdd = () => {
    if (!can('create', 'vehicle')) return;
    setEditingBus(null);
    setIsAddBusOpen(true);
  };
  
  // Handle opening the form for editing an existing bus
  const handleEdit = (bus: BusFrontendData) => {
    if (!can('update', 'vehicle')) return;
    setEditingBus(bus);
    setIsAddBusOpen(true);
  };
  
  // Handle bus deletion
  const handleDelete = async (id: string) => {
    if (!can('delete', 'vehicle')) return;
    const result = await removeBus(id);
    if (result.success) {
      setShowConfirmDelete(null);
    }
  };
  
  // Handle form modal closing
  const handleAddBusClose = () => {
    setIsAddBusOpen(false);
    setEditingBus(null);
  };
  
  // Handle sort changes
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort buses
  const filteredBuses = buses.filter(bus => 
    bus.registrationPlate.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Handle different field types appropriately
    if (sortField === 'capacity') {
      return sortDirection === 'asc' 
        ? (a.capacity || 0) - (b.capacity || 0) 
        : (b.capacity || 0) - (a.capacity || 0);
    }
    
    if (sortField === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Default string comparison
    const fieldA = String(a[sortField as keyof BusFrontendData] || '').toLowerCase();
    const fieldB = String(b[sortField as keyof BusFrontendData] || '').toLowerCase();
    return sortDirection === 'asc' 
      ? fieldA.localeCompare(fieldB) 
      : fieldB.localeCompare(fieldA);
  });

  // Calculate pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentBuses = filteredBuses.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  
  // Render sort indicator
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };
  
  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <ComponentCard title="Bus Management" className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search buses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Add Bus button - only for operators */}
          {can('create', 'vehicle') && (
            <Button
              onClick={handleAdd}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Bus
            </Button>
          )}
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
              onClick={() => fetchBuses()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? (
              <p>No buses matching "{searchTerm}" found.</p>
            ) : (
              <p>No buses found. Add your first bus to get started.</p>
            )}
          </div>
        ) : (
          <>
            {/* Table rendering */}
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("registrationPlate")}
                    >
                      <div className="flex items-center">
                        Registration Plate {renderSortIcon("registrationPlate")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("capacity")}
                    >
                      <div className="flex items-center">
                        Capacity {renderSortIcon("capacity")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Created On {renderSortIcon("createdAt")}
                      </div>
                    </TableCell>
                    <TableCell isHeader>
                      Photo
                    </TableCell>
                    <TableCell isHeader className="text-right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {currentBuses.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell className="font-medium">{bus.registrationPlate}</TableCell>
                      <TableCell>{bus.capacity}</TableCell>
                      <TableCell>{formatDate(bus.createdAt)}</TableCell>
                      <TableCell>
                        {bus.busPhotoUrl ? (
                          <img 
                            src={bus.busPhotoUrl} 
                            alt={`Bus ${bus.registrationPlate}`} 
                            className="h-10 w-16 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No photo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Assignments button */}
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/operator/buses/${bus.id}/assignments`)}
                            className="p-2"
                            title="View Assignments"
                          >
                            <CalendarRange size={16} />
                          </Button>
                          
                          {/* Edit button */}
                          {can('update', 'vehicle') && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(bus)}
                              className="p-2"
                              title="Edit Bus"
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}
                          
                          {/* Delete button */}
                          {can('delete', 'vehicle') && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setShowConfirmDelete(bus.id || "")}
                              className="p-2 text-red-500 hover:text-red-700"
                              title="Delete Bus"
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
            
            {/* Pagination */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {firstIndex + 1}-{Math.min(lastIndex, filteredBuses.length)} of {filteredBuses.length}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </ComponentCard>
      
      {/* Bus Form Modal */}
      {isAddBusOpen && can(editingBus ? 'update' : 'create', 'vehicle') && (
        <BusForm
          isOpen={isAddBusOpen}
          onClose={handleAddBusClose}
          editingBus={editingBus}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && can('delete', 'vehicle') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this bus? This action cannot be undone.
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
    </>
  );
};

export default BusList;