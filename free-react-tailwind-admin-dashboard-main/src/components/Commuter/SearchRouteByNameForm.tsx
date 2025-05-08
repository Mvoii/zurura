import React, { useState } from 'react';
import Form from '../form/Form';
import Label from '../form/Label';
import Select from '../form/Select';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { RouteFrontendData } from '../../api/routeService';
import { Search } from 'lucide-react';

interface SearchRouteByNameFormProps {
  routes: RouteFrontendData[];
  onSearch: (routeName: string) => void;
  isLoading: boolean;
}

const SearchRouteByNameForm: React.FC<SearchRouteByNameFormProps> = ({
  routes,
  onSearch,
  isLoading
}) => {
  const [selectedRouteName, setSelectedRouteName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRouteName) {
      onSearch(selectedRouteName);
    }
  };

  // Create options for the select dropdown from routes
  const routeOptions = [
    { value: '', label: 'Select a route' },
    ...routes.map(route => ({
      value: route.route_name || '',
      label: route.route_name || 'Unnamed Route'
    }))
  ];

  return (
    <ComponentCard title="Find Route by Name">
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="routeName">Route Name</Label>
            <Select
              options={routeOptions}
              onChange={(value) => setSelectedRouteName(value)}
              defaultValue=""
              placeholder="Select a route"
            //   disabled={isLoading}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !selectedRouteName}
              className="flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search Route'}
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
};

export default SearchRouteByNameForm;