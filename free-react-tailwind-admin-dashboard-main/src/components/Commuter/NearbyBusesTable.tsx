import React, { useEffect } from 'react';
import useRoute from '../../hooks/useRoute';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';

interface NearbyBusesTableProps {
  routeId: string;
  boardingStopName: string;
  onBusSelect: (busId: string) => void;
  onBack: () => void;
}

const NearbyBusesTable: React.FC<NearbyBusesTableProps> = ({ routeId, boardingStopName, onBusSelect, onBack }) => {
  const { fetchNearbyBuses, nearbyBuses, isLoading, error } = useRoute();

  useEffect(() => {
    fetchNearbyBuses(routeId, boardingStopName);
  }, [routeId, boardingStopName, fetchNearbyBuses]);

  return (
    <ComponentCard title="Nearby Buses">
      {isLoading ? (
        <p>Loading nearby buses...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Capacity</th>
              <th>Available Seats</th>
            </tr>
          </thead>
          <tbody>
            {nearbyBuses.map((bus) => (
              <tr key={bus.bus_id} onClick={() => onBusSelect(bus.bus_id)} className="cursor-pointer hover:bg-gray-100">
                <td>{bus.registration_plate}</td>
                <td>{bus.capacity}</td>
                <td>{bus.capacity - bus.current_occupancy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
    </ComponentCard>
  );
};

export default NearbyBusesTable;