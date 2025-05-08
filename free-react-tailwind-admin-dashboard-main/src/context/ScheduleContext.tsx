import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { 
  getSchedules, 
  getScheduleById, 
  createSchedule,
  createScheduleWithPayload,
  ScheduleFrontendData, 
  ScheduleParams,
  CreateSchedulePayload,
  ScheduleOperationResult,
//   ListSchedulesResult
} from '../api/scheduleService';

// Operation result types are already defined in scheduleService.ts

// Define the context shape
interface ScheduleContextType {
  schedules: ScheduleFrontendData[];
  currentSchedule: ScheduleFrontendData | null;
  isLoading: boolean;
  error: string | null;
  
  // Schedule operations
  fetchSchedules: (params?: ScheduleParams) => Promise<ScheduleFrontendData[]>;
  fetchSchedule: (id: string) => Promise<ScheduleFrontendData | null>;
  addSchedule: (scheduleData: Partial<ScheduleFrontendData>) => Promise<ScheduleOperationResult>;
  addScheduleWithPayload: (payload: CreateSchedulePayload) => Promise<ScheduleOperationResult>;
  
  // Utility operations
  clearCurrentSchedule: () => void;
  clearError: () => void;
}

// Create the context with undefined default
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Props for the provider
interface ScheduleProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes schedule management available
 */
export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [schedules, setSchedules] = useState<ScheduleFrontendData[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleFrontendData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all schedules or filter by params
   */
  const fetchSchedules = useCallback(async (params: ScheduleParams = {}): Promise<ScheduleFrontendData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getSchedules(params);
      
      if (result.success && result.data) {
        setSchedules(result.data);
        setError(null);
        return result.data;
      } else {
        const errorMessage = result.error || 'Failed to fetch schedules';
        setError(errorMessage);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schedules';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a single schedule by ID
   */
  const fetchSchedule = useCallback(async (id: string): Promise<ScheduleFrontendData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getScheduleById(id);
      
      if (result.success && result.data) {
        setCurrentSchedule(result.data);
        setError(null);
        return result.data;
      } else {
        const errorMessage = result.error || `Failed to fetch schedule ${id}`;
        setError(errorMessage);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch schedule ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new schedule using frontend data model
   */
  const addSchedule = useCallback(async (scheduleData: Partial<ScheduleFrontendData>): Promise<ScheduleOperationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createSchedule(scheduleData);
      
      if (result.success) {
        // Optionally refetch schedules to update the list
        // await fetchSchedules();
        setError(null);
      } else {
        setError(result.error || 'Failed to create schedule');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new schedule using direct payload
   */
  const addScheduleWithPayload = useCallback(async (payload: CreateSchedulePayload): Promise<ScheduleOperationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createScheduleWithPayload(payload);
      
      if (result.success) {
        // Optionally refetch schedules to update the list
        // await fetchSchedules();
        setError(null);
      } else {
        setError(result.error || 'Failed to create schedule');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the currently selected schedule
   */
  const clearCurrentSchedule = useCallback((): void => {
    setCurrentSchedule(null);
  }, []);

  /**
   * Clear any errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // The value to be provided to consumers
  const contextValue: ScheduleContextType = {
    schedules,
    currentSchedule,
    isLoading,
    error,
    fetchSchedules,
    fetchSchedule,
    addSchedule,
    addScheduleWithPayload,
    clearCurrentSchedule,
    clearError
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};

// Custom hook to use the schedule context
// export const useSchedule = () => {
//   const context = React.useContext(ScheduleContext);
  
//   if (context === undefined) {
//     throw new Error('useSchedule must be used within a ScheduleProvider');
//   }
  
//   return context;
// };

export default ScheduleContext;