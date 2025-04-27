import { useQuery, useQueryClient } from '@tanstack/react-query';
import { routesApi, FindRoutesParams, Route } from '@/lib/api/routes';
import { ApiError } from '@/lib/api';
import { useState } from 'react';

export const useRoutes = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<FindRoutesParams>({
    limit: 10,
    offset: 0,
  });

  // Query for searching routes
  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['routes', searchParams],
    queryFn: () => routesApi.findRoutes(searchParams),
    select: (response) => response.data,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 60 * 1000, // 1 minute
  });

  // Query for getting route details
  const getRouteDetails = (routeId: string) => {
    return useQuery({
      queryKey: ['route', routeId],
      queryFn: () => routesApi.getRouteDetails(routeId),
      select: (response) => response.data,
      enabled: !!routeId,
      retry: 1,
    });
  };

  // Search function
  const searchRoutes = (params: FindRoutesParams) => {
    setSearchParams({ ...searchParams, ...params, offset: 0 }); // Reset offset when searching
  };

  // Pagination function
  const changePage = (newOffset: number) => {
    setSearchParams({ ...searchParams, offset: newOffset });
  };

  return {
    routes: data?.routes || [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error: error as ApiError | null,
    searchRoutes,
    changePage,
    getRouteDetails,
    currentSearchParams: searchParams,
  };
}; 