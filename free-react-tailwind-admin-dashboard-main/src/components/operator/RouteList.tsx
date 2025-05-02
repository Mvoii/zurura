import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRoute from "../../hooks/useRoute";
import useAccess from "../../hooks/useAccess"; // Import the centralized access hook
import { RouteForm } from "./RouteForm";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import { Edit2, Trash2, Plus, Search, Map } from "lucide-react";
import type { RouteFrontendData } from "../../api/routeService";

// Added showOperatorControls prop for flexibility between /routes and /operator/routes
const RouteList = ({ showOperatorControls = true }) => {
  const navigate = useNavigate();
  const { routes, isLoading, error, fetchRoutes, removeRoute } = useRoute();
  const { routes: routeAccess, can } = useAccess(); // Use the access hook

  // State for route management (remains the same)
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteFrontendData | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // State for table functionality (remains the same)
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<string>("route_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Handle opening the form for adding a new route
  const handleAdd = () => {
    if (!routeAccess.canCreate) return; // Guard against unauthorized access
    setEditingRoute(null); // Ensure we are not in edit mode
    setIsAddRouteOpen(true);
  };

  // Handle opening the form for editing an existing route
  const handleEdit = (route: RouteFrontendData) => {
    if (!routeAccess.canEdit) return; // Guard against unauthorized access
    setEditingRoute(route); // Set the route to be edited
    setIsAddRouteOpen(true); // Open the modal
  };

  // Handle route deletion
  const handleDelete = async (id: string) => {
    if (!routeAccess.canDelete) return; // Guard against unauthorized access
    const result = await removeRoute(id);
    if (result.success) {
      setShowConfirmDelete(null);
    }
  };

  // Handle form modal closing
  const handleAddRouteClose = () => {
    setIsAddRouteOpen(false);
    setEditingRoute(null); // Clear editing state on close
  };

  // Sorting and filtering logic remains the same...
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredRoutes = routes
    .filter(
      (route) =>
        (route.route_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a] || "";
      const fieldB = b[sortField as keyof typeof b] || "";

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      return sortDirection === "asc"
        ? fieldA > fieldB
          ? 1
          : -1
        : fieldB > fieldA
        ? 1
        : -1;
    });

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  return (
    <>
      <ComponentCard title="Route Management" className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Search input remains the same */}
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Show Add Route button only if allowed and controls are enabled */}
          {showOperatorControls && routeAccess.canCreate && (
            <Button
              onClick={handleAdd} // Use handleAdd to ensure editingRoute is null
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Route
            </Button>
          )}
        </div>

        {/* Loading, error, empty states remain the same */}
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchRoutes()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? (
              <p>No routes matching "{searchTerm}" found.</p>
            ) : (
              <p>No routes found. Add your first route to get started.</p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("route_name")}
                    >
                      <div className="flex items-center">
                        Route Name {renderSortIcon("route_name")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("origin")}
                    >
                      <div className="flex items-center">
                        Origin {renderSortIcon("origin")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("destination")}
                    >
                      <div className="flex items-center">
                        Destination {renderSortIcon("destination")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center">
                        Description {renderSortIcon("description")}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Created {renderSortIcon("created_at")}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="text-right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        {route.route_name}
                      </TableCell>
                      <TableCell>{route.origin || '-'}</TableCell>
                      <TableCell>{route.destination || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {route.description && route.description.length > 40
                          ? `${route.description.substring(0, 40)}...`
                          : route.description || '-'}
                      </TableCell>
                      <TableCell>
                        {route.created_at 
                          ? new Date(route.created_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Stops button */}
                          {can("view", "stop") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/routes/${route.id}/stops`)
                              }
                              className="p-2"
                            >
                              <Map size={16} />
                            </Button>
                          )}

                          {/* Edit/Delete buttons */}
                          {showOperatorControls && (
                            <>
                              {routeAccess.canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(route)}
                                  className="p-2"
                                >
                                  <Edit2 size={16} />
                                </Button>
                              )}
                              {routeAccess.canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setShowConfirmDelete(route.id || "")
                                  }
                                  className="p-2 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination remains the same */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {firstIndex + 1}-
                {Math.min(lastIndex, filteredRoutes.length)} of{" "}
                {filteredRoutes.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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

      {/* Route Form Modal - Render if modal is open AND user has create OR edit permission */}
      {isAddRouteOpen && (routeAccess.canCreate || routeAccess.canEdit) && (
        <RouteForm
          isOpen={isAddRouteOpen}
          onClose={handleAddRouteClose}
          editingRoute={editingRoute} // Pass the editingRoute state here
        />
      )}

      {/* Delete Confirmation Modal - Render if delete confirmation is needed AND user has delete permission */}
      {showConfirmDelete && routeAccess.canDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this route? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  showConfirmDelete && handleDelete(showConfirmDelete)
                }
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

export default RouteList;