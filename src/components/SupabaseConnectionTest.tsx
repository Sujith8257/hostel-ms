import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SupabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Test basic connection
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key (first 20 chars):', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');

      // Test auth connection
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      console.log('Auth test result:', { authUser, authError });

      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      console.log('Database test result:', { dbTest, dbError });

      if (authError || dbError) {
        throw new Error(`Connection failed: ${authError?.message || dbError?.message}`);
      }

      setConnectionStatus('success');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Supabase connection successful! ✅';
      case 'error':
        return `Connection failed: ${errorMessage}`;
      default:
        return 'Click to test Supabase connection';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Project ID: {import.meta.env.VITE_SUPABASE_PROJECT_ID}
          </p>
          <p className="text-sm text-muted-foreground">
            URL: {import.meta.env.VITE_SUPABASE_URL}
          </p>
        </div>

        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {connectionStatus !== 'idle' && (
          <Alert variant={connectionStatus === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>
              {getStatusMessage()}
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'error' && (
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Common Solutions:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check Supabase project status</li>
              <li>Verify API keys are correct</li>
              <li>Add localhost:5173 to allowed origins in Supabase dashboard</li>
              <li>Try a different browser or incognito mode</li>
              <li>Restart the development server</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}