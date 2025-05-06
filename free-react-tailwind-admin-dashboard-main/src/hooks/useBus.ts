import { useContext } from 'react';
import BusContext from '../context/BusContext';
import type { BusFrontendData, BusAssignmentFrontendData } from '../api/busService';

/**
 * Interface for the result of bus operations
 */
export interface BusResult {
  success: boolean;
  data?: BusFrontendData | BusFrontendData[] | string;
  error?: string;
}

/**
 * Interface for the result of assignment operations
 */
export interface AssignmentResult {
  success: boolean;
  data?: BusAssignmentFrontendData;
  error?: string;
}

/**
 * Interface for the useBus hook return value
 */
export interface UseBusReturn {
  // State
  buses: BusFrontendData[];
  currentBus: BusFrontendData | null;
  isLoading: boolean;
  error: string | null;
  
  // Bus operations
  fetchBuses: () => Promise<BusFrontendData[]>;
  fetchBus: (id: string) => Promise<BusFrontendData | null>;
  addBus: (busData: BusFrontendData) => Promise<BusResult>;
  editBus: (id: string, busData: Partial<BusFrontendData>) => Promise<BusResult>;
  removeBus: (id: string) => Promise<BusResult>;
  
  // Bus assignment operations
  assignBusToRoute: (assignmentData: BusAssignmentFrontendData) => Promise<AssignmentResult>;
  fetchBusAssignments: (busId: string) => Promise<BusAssignmentFrontendData[]>;
  updateBusAssignment: (assignmentId: string, assignmentData: Partial<BusAssignmentFrontendData>) => Promise<AssignmentResult>;
  deleteBusAssignment: (assignmentId: string) => Promise<BusResult>;
  
  clearError: () => void;
}

/**
 * Custom hook to access bus functionality throughout the app
 * @returns Bus state and methods
 */
const useBus = (): UseBusReturn => {
  const context = useContext(BusContext);
  
  if (context === undefined) {
    throw new Error('useBus must be used within a BusProvider');
  }
  
  return context;
};

export default useBus;