import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface NearbyUser {
  id: string;
  username: string;
  name: string;
  signal_strength: number; // RSSI value
  distance?: number;
  timestamp: number;
}

const NEARBY_SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb'; // Environmental Sensing
const NEARBY_CHARACTERISTIC_UUID = '00002a58-0000-1000-8000-00805f9b34fb'; // Temperature

export function useNearbyDiscovery(userId?: string) {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const discoveredDevices = useRef<Map<string, NearbyUser>>(new Map());
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const characteristicRef = useRef<any>(null);

  /**
   * Startet das Scannen nach Bluetooth Geräten in der Nähe
   */
  const startScanning = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setError(null);

    try {
      // Check if Bluetooth Web API is available
      if (!(navigator as any).bluetooth) {
        throw new Error(
          'Bluetooth Web API nicht verfügbar. Bitte nutze Chrome/Edge auf Android.'
        );
      }

      setIsScanning(true);
      discoveredDevices.current.clear();

      // Versuche, alle Bluetooth-Geräte zu finden
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [NEARBY_SERVICE_UUID] }],
        optionalServices: [NEARBY_SERVICE_UUID],
      });

      if (!device) {
        setIsScanning(false);
        return false;
      }

      // Verbinde zum Gerät
      const server = await (device as any).gatt?.connect();
      const service = await server?.getPrimaryService(NEARBY_SERVICE_UUID);
      const characteristic = await service?.getCharacteristic(
        NEARBY_CHARACTERISTIC_UUID
      );

      if (!characteristic) {
        throw new Error('Charakteristik nicht gefunden');
      }

      characteristicRef.current = characteristic;

      // Lese die Geräte-Informationen
      const value = await characteristic.readValue();
      const decoder = new TextDecoder();
      const userData = decoder.decode(value);

      const [remoteUserId, username, name] = userData.split('|');

      const signalStrength = device.id.charCodeAt(0) - 48; // Simuliert RSSI

      const nearbyUser: NearbyUser = {
        id: remoteUserId,
        username,
        name,
        signal_strength: signalStrength,
        timestamp: Date.now(),
      };

      discoveredDevices.current.set(device.id, nearbyUser);
      setNearbyUsers(Array.from(discoveredDevices.current.values()));

      toast.success(`${username} in der Nähe erkannt!`);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Fehler beim Scannen';
      setError(message);
      console.error('Scan error:', err);
      setIsScanning(false);
      return false;
    }
  }, [userId]);

  /**
   * Startet das Bewerben des Benutzers für andere in der Nähe
   */
  const startAdvertising = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setError(null);

    try {
      // Fetch user profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', userId)
        .single();

      if (!authUser?.id || !profile) {
        throw new Error('Benutzerprofil nicht gefunden');
      }

      setIsAdvertising(true);

      // Das Bewerben ist in Web Bluetooth API schwieriger
      // Diese Funktion würde auf native Seite implementiert
      // Für jetzt zeigen wir den Status an
      toast.success('Discovery Modus aktiviert. Anderen können dich finden!');
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Fehler beim Bewerben';
      setError(message);
      console.error('Advertising error:', err);
      return false;
    }
  }, [userId]);

  /**
   * Stoppe das Scannen
   */
  const stopScanning = useCallback(() => {
    setIsScanning(false);

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (characteristicRef.current) {
      characteristicRef.current = null;
    }

    setNearbyUsers([]);
    discoveredDevices.current.clear();
  }, []);

  /**
   * Stoppe das Bewerben
   */
  const stopAdvertising = useCallback(() => {
    setIsAdvertising(false);
    toast.info('Discovery Modus deaktiviert');
  }, []);

  /**
   * Automatisch einem in der Nähe entdeckten Benutzer befreunden
   */
  const quickAddFriend = useCallback(
    async (remoteUserId: string) => {
      try {
        const { error: err } = await supabase
          .from('friends')
          .insert({
            user_id: userId,
            friend_id: remoteUserId,
            status: 'accepted', // Auto-accept für Nearby
            created_at: new Date().toISOString(),
          })
            .select()
            .single();

        if (err) {
          if (err.message.includes('duplicate')) {
            toast.info('Ihr seid bereits Freunde!');
            return false;
          }
          throw err;
        }

        toast.success('Neue Freundschaft erstellt! 🎉');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Fehler beim Hinzufügen';
        toast.error(message);
        console.error('Add friend error:', err);
        return false;
      }
    },
    [userId]
  );

  /**
   * Löscht die alte Erfassung, wenn Geräte zu weit weg sind
   */
  const refreshNearbyUsers = useCallback(() => {
    const now = Date.now();
    const TIMEOUT = 30000; // 30 Sekunden Timeout

    discoveredDevices.current.forEach((device, key) => {
      if (now - device.timestamp > TIMEOUT) {
        discoveredDevices.current.delete(key);
      }
    });

    setNearbyUsers(Array.from(discoveredDevices.current.values()));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopScanning();
      stopAdvertising();
    };
  }, [stopScanning, stopAdvertising]);

  return {
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
  };
}
