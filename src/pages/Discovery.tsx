import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DiscoveryMode } from '@/components/DiscoveryMode';

export default function Discovery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Discovery</h1>
        </div>

        {/* Discovery Component */}
        <DiscoveryMode />
      </div>
    </div>
  );
}
