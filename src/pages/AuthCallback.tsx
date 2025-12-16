import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Small delay to ensure auth state is updated
    const timer = setTimeout(() => {
      if (user) {
        // Redirect based on role
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'principal') navigate('/principal');
        else if (user.role === 'teacher') navigate('/teacher');
        else navigate('/');
      } else {
        // Auth failed, go back to login
        navigate('/login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Processing login...</p>
        </CardContent>
      </Card>
    </div>
  );
}
