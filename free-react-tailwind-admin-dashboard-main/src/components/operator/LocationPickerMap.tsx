import React, { useState } from 'react';
import MapView from '../Commuter/MapView';

interface LocationPickerMapProps {
  initialCenter: [number, number]; // [latitude, longitude]
  initialZoom: number;
  onLocationChange: (coords: { lat: number, lng: number }) => void;
  markerPosition?: { lat: number, lng: number }; // Optional initial marker position
  height?: string;
  className?: string;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialCenter,
  initialZoom,
  onLocationChange,
  markerPosition,
  height = '300px',
  className = '',
}) => {
  // Initialize with provided marker position or null
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    markerPosition ? [markerPosition.lat, markerPosition.lng] : null
  );

  // Handle location selection from the map
  const handleLocationSelect = (position: [number, number]) => {
    setSelectedPosition(position);
    onLocationChange({ lat: position[0], lng: position[1] });
  };

  return (
    <div className="space-y-2">
      <MapView 
        center={initialCenter}
        zoom={initialZoom}
        height={height}
        className={className}
        selectionMode={true}
        onLocationSelect={handleLocationSelect}
        markers={selectedPosition ? [
          {
            id: 'selected-location',
            position: selectedPosition,
            draggable: true,
            popup: 'Selected Location'
          }
        ] : []}
        onMarkerDrag={(id, position) => {
          if (id === 'selected-location') {
            setSelectedPosition(position);
            onLocationChange({ lat: position[0], lng: position[1] });
          }
        }}
      />
      
      {/* Coordinate display with copy button */}
      {selectedPosition && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
          <div>
            <span className="font-medium">Lat:</span> {selectedPosition[0].toFixed(6)}, 
            <span className="font-medium ml-2">Lng:</span> {selectedPosition[1].toFixed(6)}
          </div>
          <button 
            className="text-blue-600 hover:text-blue-800 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(
                `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`
              );
            }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPickerMap;