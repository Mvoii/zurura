import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
// This is needed because Webpack doesn't handle Leaflet's assets correctly
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Interface for marker data
export interface MarkerData {
  id: string;
  position: [number, number]; // [latitude, longitude]
  popup?: string;
  draggable?: boolean;
}

// Props for the MapView component
interface MapViewProps {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  markers?: MarkerData[];
  height?: string;
  width?: string;
  className?: string;
  onLocationSelect?: (position: [number, number]) => void;
  selectionMode?: boolean; // Enable click to select a location
  onMarkerDrag?: (id: string, position: [number, number]) => void;
}

// Component to handle map click events
const LocationSelector = ({ onLocationSelect }: { onLocationSelect: (position: [number, number]) => void }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
    },
  });
  return null;
};

// Component to re-center the map when center prop changes
const ChangeMapView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  markers = [],
  height = '400px',
  width = '100%',
  className = '',
  onLocationSelect,
  selectionMode = false,
  onMarkerDrag
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Handle location selection
  const handleLocationSelect = (position: [number, number]) => {
    setSelectedPosition(position);
    if (onLocationSelect) {
      onLocationSelect(position);
    }
  };

  // Handle marker drag end
  const handleMarkerDragEnd = (id: string, event: L.DragEndEvent) => {
    if (onMarkerDrag) {
      const marker = event.target;
      const position = marker.getLatLng();
      onMarkerDrag(id, [position.lat, position.lng]);
    }
  };

  return (
    <div style={{ height, width }} className={`rounded-lg overflow-hidden shadow-md ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Display all markers from props */}
        {markers.map((marker) => (
          <Marker 
            key={marker.id}
            position={marker.position}
            draggable={marker.draggable}
            eventHandlers={{
              dragend: (e) => handleMarkerDragEnd(marker.id, e)
            }}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
        
        {/* Display selected position marker if in selection mode */}
        {selectionMode && selectedPosition && (
          <Marker 
            position={selectedPosition}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleLocationSelect([position.lat, position.lng]);
              }
            }}
          >
            <Popup>Selected Location</Popup>
          </Marker>
        )}
        
        {/* Location selector component for handling map clicks */}
        {selectionMode && onLocationSelect && (
          <LocationSelector onLocationSelect={handleLocationSelect} />
        )}
        
        {/* Component to update map view when center changes */}
        <ChangeMapView center={center} zoom={zoom} />
      </MapContainer>
      
      {/* Optional: Display coordinates below the map in selection mode */}
      {selectionMode && selectedPosition && (
        <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded">
          Selected: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapView;