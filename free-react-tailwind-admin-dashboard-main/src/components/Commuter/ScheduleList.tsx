import React, { useState } from 'react';
import { ScheduleFrontendData } from '../../api/scheduleService';
import Alert from '../ui/alert/Alert';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import { Loader2, ArrowRight, Clock, Users, Bus, ArrowUpDown } from 'lucide-react';

interface ScheduleListProps {
  schedulesData: ScheduleFrontendData[];
  isLoadingData: boolean;
  loadingError: string | null;
  onRetry: () => void;
  onViewDetails: (schedule: ScheduleFrontendData) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedulesData,
  isLoadingData,
  loadingError,
  onRetry,
  onViewDetails
}) => {
  // Add sorting functionality
  const [sortField, setSortField] = useState<keyof ScheduleFrontendData>('departureTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Sorting handler
  const handleSort = (field: keyof ScheduleFrontendData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort the schedules
  const sortedSchedules = [...schedulesData].sort((a, b) => {
    if (sortField === 'departureTime') {
      // Special handling for dates
      const dateA = new Date(a.departureTime);
      const dateB = new Date(b.departureTime);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    }
    
    if (sortField === 'route') {
      // Handle nested route.name property
      const nameA = a.route?.name || '';
      const nameB = b.route?.name || '';
      return sortDirection === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    if (sortField === 'bus') {
      // Handle nested bus.plateNumber property
      const plateA = a.bus?.plateNumber || '';
      const plateB = b.bus?.plateNumber || '';
      return sortDirection === 'asc'
        ? plateA.localeCompare(plateB)
        : plateB.localeCompare(plateA);
    }

    // Default case (though it shouldn't be reached with our current fields)
    const fieldA = String(a[sortField] || '');
    const fieldB = String(b[sortField] || '');
    return sortDirection === 'asc'
      ? fieldA.localeCompare(fieldB)
      : fieldB.localeCompare(fieldA);
  });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentSchedules = sortedSchedules.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);

  // Helper for sort icons
  const renderSortIcon = (field: keyof ScheduleFrontendData) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    return sortDirection === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading schedules...</span>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{loadingError}</p>
        <Button 
          variant="outline"
          onClick={onRetry}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (schedulesData.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No schedules matched your search criteria. Try different filters or check back later.</p>
      </div>
    );
  }

  return (
    <ComponentCard title="Available Schedules" className="mb-6">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="cursor-pointer"
                onClick={() => handleSort('route')}
              >
                <div className="flex items-center">
                  Route {renderSortIcon('route')}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="cursor-pointer"
                onClick={() => handleSort('departureTime')}
              >
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Departure Time {renderSortIcon('departureTime')}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="cursor-pointer"
                onClick={() => handleSort('bus')}
              >
                <div className="flex items-center">
                  <Bus className="mr-2 h-4 w-4" />
                  Bus {renderSortIcon('bus')}
                </div>
              </TableCell>
              <TableCell isHeader>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Available Seats
                </div>
              </TableCell>
              <TableCell isHeader className="text-right">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">
                  {schedule.route.name}
                </TableCell>
                <TableCell>{formatDate(schedule.departureTime)}</TableCell>
                <TableCell>{schedule.bus.plateNumber}</TableCell>
                <TableCell>
                  {schedule.bus.availableSeats} / {schedule.bus.capacity}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(schedule)}
                      className="p-2"
                    >
                      <ArrowRight size={16} />
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
            {Math.min(lastIndex, sortedSchedules.length)} of{" "}
            {sortedSchedules.length}
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

export default ScheduleList;