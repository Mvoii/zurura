import React, { useState, useEffect, useMemo } from 'react';
import { RouteStop } from '../../api/routeService';
import Button from '../ui/button/Button';
import Select from '../form/Select';
import { ArrowRight, BusFront } from 'lucide-react';

interface StopSearchFormProps {
  stops: RouteStop[];
  routeId: string; // Add routeId to props
  onSearch: (boardingStopName: string, alightingStopName: string) => void; // Change to use names not IDs
  isLoading?: boolean;
}

const StopSearchForm: React.FC<StopSearchFormProps> = ({ stops, routeId, onSearch, isLoading = false }) => {
  const [boardingStop, setBoardingStop] = useState<string>('');
  const [alightingStop, setAlightingStop] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Memoize stop options to prevent recalculation
  const stopOptions = useMemo(() => 
    stops
      .sort((a, b) => a.stop_order - b.stop_order)
      .map(stop => ({
        value: stop.id || stop.stop_id || `stop-${stop.stop_order}`,
        label: `${stop.name} (Order: ${stop.stop_order})`
      })),
    [stops]
  );

  // Reset selections when stops change
  useEffect(() => {
    setBoardingStop('');
    setAlightingStop('');
    setError(null);
  }, [stops]);

  // Filter alighting stop options based on boarding stop
  const alightingStopOptions = useMemo(() => {
    if (!boardingStop) return stopOptions;
    
    return stopOptions.filter(option => {
      const boardingStopObj = stops.find(s => 
        (s.id || s.stop_id || `stop-${s.stop_order}`) === boardingStop
      );
      const currentStopObj = stops.find(s => 
        (s.id || s.stop_id || `stop-${s.stop_order}`) === option.value
      );
      
      if (!boardingStopObj || !currentStopObj) return true;
      return currentStopObj.stop_order > boardingStopObj.stop_order;
    });
  }, [boardingStop, stopOptions, stops]);

  const handleSearch = () => {
    setError(null);
    if (!boardingStop || !alightingStop) {
      setError('Please select both boarding and alighting stops.');
      return;
    }

    const boardingStopObj = stops.find(s => (s.id || s.stop_id || `stop-${s.stop_order}`) === boardingStop);
    const alightingStopObj = stops.find(s => (s.id || s.stop_id || `stop-${s.stop_order}`) === alightingStop);

    if (!boardingStopObj || !alightingStopObj) {
      setError('Selected stops not found. Please try again.');
      return;
    }

    if (boardingStopObj.stop_order >= alightingStopObj.stop_order) {
      setError('Alighting stop must be after the boarding stop.');
      return;
    }
    
    if (boardingStop === alightingStop) {
      setError('Boarding and alighting stops cannot be the same.');
      return;
    }

    // Pass the stop names instead of IDs
    onSearch(boardingStopObj.name, alightingStopObj.name);
  };

  // We'll use className to visually indicate disabled state instead of the disabled prop
  const isSelectionsDisabled = isLoading || stopOptions.length === 0;
  const selectClassName = isSelectionsDisabled ? 
    "opacity-60 cursor-not-allowed" : "";
  
  // Determine if alighting select should be visually disabled
  const isAlightingDisabled = isSelectionsDisabled || !boardingStop;
  const alightingClassName = isAlightingDisabled ? 
    "opacity-60 cursor-not-allowed" : "";

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Find Your Bus</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          options={isSelectionsDisabled ? [] : stopOptions}
          defaultValue={boardingStop}
          onChange={(value) => !isSelectionsDisabled && setBoardingStop(value as string)}
          placeholder="Select your boarding stop"
          className={selectClassName}
        />
        <Select
          options={isAlightingDisabled ? [] : alightingStopOptions}
          defaultValue={alightingStop}
          onChange={(value) => !isAlightingDisabled && setAlightingStop(value as string)}
          placeholder="Select your alighting stop"
          className={alightingClassName}
        />
      </div>
      
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      
      <Button
        onClick={handleSearch}
        disabled={isLoading || !boardingStop || !alightingStop || stopOptions.length < 2}
        className="w-full md:w-auto"
        isLoading={isLoading}
      >
        <BusFront size={18} className="mr-2" />
        Find Available Buses
        <ArrowRight size={18} className="ml-2" />
      </Button>
    </div>
  );
};

export default StopSearchForm;