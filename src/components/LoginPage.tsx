import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';
import { Building2, Users, Shield } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('employee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, activeRole);
      if (success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">eSign Portal</h1>
          <p className="text-muted-foreground mt-2">Secure document signing platform</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Choose your role and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Intern/Employee
                </TabsTrigger>
                <TabsTrigger value="hr" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  HR/Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee" className="space-y-4 mt-0">
                <LoginForm 
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="hr" className="space-y-4 mt-0">
                <LoginForm 
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border border-muted bg-muted/50">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">Demo Credentials:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Employee:</strong> employee@company.com / password123
              </div>
              <div>
                <strong>HR Admin:</strong> hr@company.com / password123
              </div>
              <div>
                <strong>New User:</strong> newuser@company.com / password123
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm({ 
  email, 
  password, 
  setEmail, 
  setPassword, 
  onSubmit, 
  isLoading 
}: {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email / Phone</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email or phone"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-input-background"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-input-background"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Login'}
      </Button>

      <div className="text-center">
        <Link 
          to="/password-reset" 
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}