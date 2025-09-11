import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  type FromState = { from?: { pathname?: string } } | null;
  const locState = (location.state ?? null) as FromState;
  const rawFromPath = locState?.from?.pathname || '/dashboard';
  const fromPath = rawFromPath?.startsWith('/login') ? '/dashboard' : rawFromPath;

  // Redirect if already logged in
  useEffect(() => {
    if (user || session) {
      const isAdmin = user?.role === 'admin';
      const isStudent = user?.role === 'student';
      let dest = fromPath || '/dashboard';
      
      if (isAdmin) {
        dest = '/admin';
      } else if (isStudent) {
        dest = '/dashboard';
      }
      
      if (location.pathname !== dest) {
        console.info('[LoginPage] Detected auth (user or session), navigating', { to: dest, role: user?.role, hasUser: !!user, hasSession: !!session });
        try {
          navigate(dest, { replace: true });
        } catch {
          window.location.replace(dest);
        }
      }
    }
  }, [user, session, navigate, fromPath, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    console.info('[LoginPage] Login attempt finished', { success: result.success, error: result.error, role: result.role });
    if (result.success) {
      // Use role directly from login response
      const isAdmin = result.role === 'admin';
      const isStudent = result.role === 'student';
      let destination = fromPath;
      
      if (isAdmin) {
        destination = '/admin';
      } else if (isStudent) {
        destination = '/student-dashboard';
      }
      
      console.info('[LoginPage] Login success, redirecting', { to: destination, role: result.role });
      try {
        navigate(destination, { replace: true });
      } catch {
        window.location.replace(destination);
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

    const testCredentials = [
    { 
      email: '99220041542@klu.ac.in', 
      password: 'klu123456', 
      role: 'Administrator', 
      variant: 'destructive' as const,
      name: 'Admin User 41542'
    },
    { 
      email: '99220041552@klu.ac.in', 
      password: 'klu123456', 
      role: 'Warden', 
      variant: 'default' as const,
      name: 'Warden User 41552'
    },
    { 
      email: '99220041565@klu.ac.in', 
      password: 'klu123456', 
      role: 'Warden', 
      variant: 'default' as const,
      name: 'Warden User 41565'
    },
    { 
      email: '99220041512@klu.ac.in', 
      password: 'klu123456', 
      role: 'Student', 
      variant: 'outline' as const,
      name: 'Student User 41512'
    },
  ];

  const quickLogin = (credentials: typeof testCredentials[0]) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Left Side - Login Form */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-sm mx-auto w-full space-y-6"
              >
                {/* Logo and Title */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="p-2 bg-primary rounded-xl shadow-lg">
                      <Shield className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Welcome back
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    New to HostelMS? <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">Create an account</Link>
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="rounded border-input"
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" size="sm" className="text-primary">
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>

                {/* Test Credentials */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        KLU Demo Accounts - Quick Login
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {testCredentials.map((cred) => (
                        <Button
                          key={cred.email}
                          variant="outline"
                          size="sm"
                          onClick={() => quickLogin(cred)}
                          className="w-full justify-between text-left"
                        >
                          <div className="flex flex-col items-start space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={cred.variant} className="text-xs">
                                {cred.role}
                              </Badge>
                              <span className="text-xs font-medium">{cred.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{cred.email}</span>
                          </div>
                          <span className="text-xs text-primary">Use</span>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="relative w-full max-w-xs">
                  <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&crop=center"
                    alt="Modern Hostel Management Technology"
                    className="w-full h-auto rounded-xl shadow-xl"
                  />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl flex items-end p-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-white"
                    >
                      <h3 className="text-lg font-bold mb-1">
                        Smart Hostel Management
                      </h3>
                      <p className="text-xs opacity-90">
                        Ensuring student safety through advanced security monitoring and seamless hostel operations management.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-foreground rounded-full"></div>
                <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-primary-foreground rounded-full"></div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
