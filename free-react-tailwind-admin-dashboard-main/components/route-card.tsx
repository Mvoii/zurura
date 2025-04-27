import Link from 'next/link';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RouteCardProps {
  route: {
    id: string;
    route_name: string;
    description: string;
    base_fare: number;
    origin: string;
    destination: string;
  };
  showBookButton?: boolean;
}

export function RouteCard({ route, showBookButton = true }: RouteCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{route.route_name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{route.description}</p>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium text-sm">
              KES {typeof route.base_fare === 'number' ? route.base_fare.toFixed(2) : parseFloat(route.base_fare).toFixed(2)}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-3 mt-1">
                <div className="h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                <div className="h-10 w-0 border-l border-dashed border-primary"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">From</p>
                </div>
                <p className="text-sm">{route.origin}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-3 mt-1">
                <div className="h-4 w-4 rounded-full bg-primary"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">To</p>
                </div>
                <p className="text-sm">{route.destination}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-6 md:w-56 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Estimated time and distance info could be added here */}
          </div>
          
          <div className="mt-6 space-y-2">
            <Link href={`/commuter/routes/${route.id}`} passHref>
              <Button className="w-full" variant="outline" size="sm">View Details</Button>
            </Link>
            
            {showBookButton && (
              <Link href={`/commuter/booking?route_id=${route.id}`} passHref>
                <Button className="w-full" size="sm">Book Now</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 