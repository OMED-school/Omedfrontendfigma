import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNearbyDiscovery } from '@/hooks/useNearbyDiscovery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Bluetooth,
  Radio,
  Wifi,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

export function DiscoveryMode() {
  const { user } = useAuth();
  const {
    isScanning,
    nearbyUsers,
    isAdvertising,
    error,
    startScanning,
    startAdvertising,
    stopScanning,
    stopAdvertising,
    quickAddFriend,
    refreshNearbyUsers,
  } = useNearbyDiscovery(user?.id);

  const [activeTab, setActiveTab] = useState<'scan' | 'advertise'>('scan');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  // Refresh nearby users periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(refreshNearbyUsers, 5000);
    }
    return () => clearInterval(interval);
  }, [isScanning, refreshNearbyUsers]);

  const handleQuickAdd = async (remoteUserId: string) => {
    setIsAdding(remoteUserId);
    const success = await quickAddFriend(remoteUserId);
    if (success) {
      // Remove from list after adding
      setTimeout(() => {
        refreshNearbyUsers();
      }, 500);
    }
    setIsAdding(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bluetooth className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Nearby Discovery</h2>
            <p className="text-sm text-muted-foreground">
              Finde Freunde in deiner Nähe wie AirDrop
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('scan')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'scan'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Scan
          </div>
        </button>
        <button
          onClick={() => setActiveTab('advertise')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'advertise'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Bewerben
          </div>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* SCAN TAB */}
      {activeTab === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Nach Freunden scannen
            </CardTitle>
            <CardDescription>
              Suche nach anderen Benutzern die in der Nähe sind
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => startScanning()}
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanne...
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4 mr-2" />
                    Scan starten
                  </>
                )}
              </Button>
              {isScanning && (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stoppen
                </Button>
              )}
            </div>

            {/* Nearby Users List */}
            <div className="space-y-2">
              {nearbyUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isScanning ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p>Suche nach Freunden...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Users className="h-8 w-8 mx-auto opacity-50" />
                      <p>Keine Freunde in der Nähe</p>
                      <p className="text-xs">
                        Klicke auf "Scan starten" um zu beginnen
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {nearbyUsers.length} in der Nähe
                  </p>
                  {nearbyUsers.map((user) => (
                    <Card key={user.id} className="bg-muted/50">
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Signal: {user.signal_strength}%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleQuickAdd(user.id)}
                          disabled={isAdding === user.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isAdding === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Hinzufügen
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Alert>
              <Bluetooth className="h-4 w-4" />
              <AlertDescription>
                Funktioniert beste auf Android mit Chrome/Edge. iOS braucht native
                Implementierung.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* ADVERTISE TAB */}
      {activeTab === 'advertise' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Dich bewerben
            </CardTitle>
            <CardDescription>
              Lass andere dich in ihrer Nähe entdecken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Control Buttons */}
            <Button
              onClick={() => (isAdvertising ? stopAdvertising() : startAdvertising())}
              className={`w-full ${
                isAdvertising ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isAdvertising ? (
                <>
                  <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                  Du wirst gefunden...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Freigeben aktivieren
                </>
              )}
            </Button>

            <Separator />

            {/* Status */}
            <div className="space-y-3">
              <p className="font-medium flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isAdvertising ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                Status
              </p>

              <Card className="bg-muted/50">
                <div className="p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Sichtbarkeit:</span>{' '}
                    {isAdvertising ? (
                      <Badge className="bg-green-600">Aktiv</Badge>
                    ) : (
                      <Badge variant="outline">Inaktiv</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAdvertising
                      ? 'Andere Benutzer können dich in ihrer Nähe finden'
                      : 'Aktiviere die Freigabe damit andere dich finden können'}
                  </p>
                </div>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Die native Implementierung für Hintergrund-Broadcasting wird in der
                Android/iOS Konfiguration durchgeführt.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
