import React, { useState, useEffect } from 'react';
import Input from '../form/input/InputField';
import Select from '../form/Select';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import Form from '../form/Form';
import Label from '../form/Label';
import { Calendar, Search } from 'lucide-react';
import useRoute from '../../hooks/useRoute';
import type { ScheduleParams } from '../../api/scheduleService';

interface ScheduleFilterProps {
  initialFilters: ScheduleParams;
  onApplyFilters: (filters: ScheduleParams) => void;
  onClearFilters: () => void;
  isApplying?: boolean;
}

const ScheduleFilter: React.FC<ScheduleFilterProps> = ({
  initialFilters,
  onApplyFilters,
  onClearFilters,
  isApplying = false
}) => {
  const [localDate, setLocalDate] = useState(initialFilters.date || '');
  const [localRouteId, setLocalRouteId] = useState(initialFilters.route_id || '');
  const { routes, fetchRoutes, isLoading: isLoadingRoutes } = useRoute();
  
  // Fetch routes on component mount
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);
  
  // Update local state when initialFilters change
  useEffect(() => {
    setLocalDate(initialFilters.date || '');
    setLocalRouteId(initialFilters.route_id || '');
  }, [initialFilters]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({
      date: localDate,
      route_id: localRouteId
    });
  };
  
  // Handle clearing filters
  const handleClear = () => {
    setLocalDate('');
    setLocalRouteId('');
    onClearFilters();
  };
  
  return (
    <ComponentCard title="Find Schedules">
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">
                Date
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={localDate}
                  onChange={(e) => setLocalDate(e.target.value)}
                  className="mt-1 pl-10"
                  disabled={isApplying}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="route_id">
                Route
              </Label>
              <Select
                options={[
                  { value: "", label: "All Routes" },
                  ...routes.map((route) => ({
                    value: route.id || "",
                    label: route.route_name 
                      ? (route.origin && route.destination)
                        ? `${route.route_name} (${route.origin} to ${route.destination})`
                        : route.origin
                          ? `${route.route_name} (From: ${route.origin})`
                          : route.destination
                            ? `${route.route_name} (To: ${route.destination})`
                            : route.route_name
                      : "Unnamed Route"
                  }))
                ]}
                placeholder="Select a route"
                onChange={(value) => setLocalRouteId(value)}
                defaultValue={localRouteId}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isApplying}
            >
              Clear Filters
            </Button>
            <Button 
              type="submit" 
              disabled={isApplying}
              className="flex items-center"
            >
              <Search className="mr-2 h-4 w-4" />
              {isApplying ? 'Searching...' : 'Search Schedules'}
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
};

export default ScheduleFilter;