import React, { useState } from 'react';
import Button from '../ui/button/Button';
import Select from '../form/Select';
import ComponentCard from '../common/ComponentCard';

interface StopSelectionFormProps {
  stops: { name: string; stop_order: number }[];
  onSelect: (from: string, to: string) => void;
  onBack: () => void;
}

const StopSelectionForm: React.FC<StopSelectionFormProps> = ({ stops, onSelect, onBack }) => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (from && to) {
      const fromOrder = stops.find((stop) => stop.name === from)?.stop_order || 0;
      const toOrder = stops.find((stop) => stop.name === to)?.stop_order || 0;

      if (fromOrder < toOrder) {
        onSelect(from, to);
      } else {
        alert('The alighting stop must come after the boarding stop.');
      }
    }
  };

  const stopOptions = stops.map((stop) => ({ value: stop.name, label: stop.name }));

  return (
    <ComponentCard title="Select Stops">
      <div className="space-y-4">
        <Select
          options={stopOptions}
          onChange={(value) => setFrom(value)}
          placeholder="Select Boarding Stop"
        />
        <Select
          options={stopOptions}
          onChange={(value) => setTo(value)}
          placeholder="Select Alighting Stop"
        />
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!from || !to}>
            Next
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
};

export default StopSelectionForm;