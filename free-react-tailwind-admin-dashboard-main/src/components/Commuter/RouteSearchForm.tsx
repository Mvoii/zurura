import React, { useState } from 'react';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard'; // Import ComponentCard
import Form from '../form/Form';
import Label from '../form/Label';
import type { RouteSearchParams } from '../../api/routeService';

interface RouteSearchFormProps {
  onSearch: (params: RouteSearchParams) => void;
  isLoading?: boolean;
  initialValues?: Partial<RouteSearchParams>;
}

const RouteSearchForm: React.FC<RouteSearchFormProps> = ({
  onSearch,
  isLoading = false,
  initialValues = {},
}) => {
  const [origin, setOrigin] = useState(initialValues.origin || '');
  const [destination, setDestination] = useState(initialValues.destination || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ origin: origin.trim(), destination: destination.trim() });
  };

  return (
    // Use ComponentCard, passing the title
    <ComponentCard title="Find Your Route">
      {/* Form goes directly inside ComponentCard */}
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="origin">
                Origin
              </Label>
              <Input
                id="origin"
                name="origin"
                type="text"
                placeholder="e.g., Westlands"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="destination">
                Destination
              </Label>
              <Input
                id="destination"
                name="destination"
                type="text"
                placeholder="e.g., CBD"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Routes'}
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
};

export default RouteSearchForm;