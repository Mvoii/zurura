import React, { useState } from 'react';
import { RouteFrontendData } from '../../api/routeService';
import Alert from '../ui/alert/Alert';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import { Loader2, Map, ArrowRight } from 'lucide-react';

interface RouteSearchResultListProps {
  routes: RouteFrontendData[];
  isLoading: boolean;
  error: string | null;
  onRouteSelect?: (routeId: string) => void;
}

const RouteSearchResultList: React.FC<RouteSearchResultListProps> = ({
  routes,
  isLoading,
  error,
  onRouteSelect,
}) => {
  // Add sorting functionality
  const [sortField, setSortField] = useState<string>("route_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort the routes
  const sortedRoutes = [...routes].sort((a, b) => {
    const fieldA = a[sortField as keyof typeof a] || "";
    const fieldB = b[sortField as keyof typeof b] || "";

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }

    return sortDirection === "asc"
      ? fieldA > fieldB ? 1 : -1
      : fieldB > fieldA ? 1 : -1;
  });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentRoutes = sortedRoutes.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedRoutes.length / itemsPerPage);

  // Helper for sort icons
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading routes...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error" title="Error" message={error} />;
  }

  if (routes.length === 0) {
    return (
      <Alert
        variant="info"
        title="No Routes Found"
        message="No routes matched your search criteria. Try different locations."
      />
    );
  }

  return (
    <ComponentCard title="Available Routes" className="mb-6">
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
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* View Details button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => route.id && onRouteSelect && onRouteSelect(route.id)}
                      className="p-2"
                    >
                      <ArrowRight size={16} />
                    </Button>
                    {/* View Stops button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => route.id && onRouteSelect && onRouteSelect(route.id + '/stops')}
                      className="p-2"
                    >
                      <Map size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {firstIndex + 1}-
            {Math.min(lastIndex, sortedRoutes.length)} of{" "}
            {sortedRoutes.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </ComponentCard>
  );
};

export default RouteSearchResultList;