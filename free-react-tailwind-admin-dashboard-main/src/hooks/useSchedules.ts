import { useQuery } from '@tanstack/react-query';
import { schedulesApi, ScheduleParams, Schedule } from '@/lib/api/schedules';
import { ApiError } from '@/lib/api';
import { useState } from 'react';

export const useSchedules = (initialParams: ScheduleParams = {}) => {
  const [params, setParams] = useState<ScheduleParams>(initialParams);

  // Query for schedules
  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['schedules', params],
    queryFn: () => schedulesApi.getSchedules(params),
    select: (response) => response.data,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 60 * 1000, // 1 minute
  });

  // Function to update search parameters
  const searchSchedules = (newParams: ScheduleParams) => {
    setParams({ ...params, ...newParams });
  };

  return {
    schedules: data || [],
    isLoading,
    isFetching,
    error: error as ApiError | null,
    searchSchedules,
    currentParams: params,
  };
}; 