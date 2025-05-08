import React from 'react';
import ScheduleContext from '../context/ScheduleContext';
import type { 
  ScheduleFrontendData, 
  ScheduleParams,
  CreateSchedulePayload,
  ScheduleOperationResult 
} from '../api/scheduleService';

/**
 * Custom hook to use the schedule context
 * Must be used within a component that is a child of ScheduleProvider
 */
export const useSchedule = () => {
  const context = React.useContext(ScheduleContext);
  
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  
  return context;
};

// Type definitions for better DX when using this hook
export type {
  ScheduleFrontendData,
  ScheduleParams,
  CreateSchedulePayload,
  ScheduleOperationResult
};

export default useSchedule;