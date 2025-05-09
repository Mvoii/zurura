import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComponentCard from '../../common/ComponentCard';
import Button from '../../ui/button/Button';
import { Ticket, BookOpen } from 'lucide-react';

const QuickLinksCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ComponentCard title="Quick Links">
      <div className="p-4 space-y-3">
        <Button
          onClick={() => navigate('/routes')}
          className="w-full flex items-center justify-center gap-2"
          variant="primary"
        >
          <Ticket size={18} />
          Start New Booking
        </Button>
        <Button
          onClick={() => navigate('/bookings')}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          <BookOpen size={18} />
          My Bookings
        </Button>
      </div>
    </ComponentCard>
  );
};

export default QuickLinksCard;