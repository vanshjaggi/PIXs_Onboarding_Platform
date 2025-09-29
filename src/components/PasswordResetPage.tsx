import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Building2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { apiService } from './api/ApiService';

export function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.resetPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
        toast.success(response.message);
      } else {
        toast.error('Failed to send reset link. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">eSign Portal</h1>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <br />
                <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Try different email
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">eSign Portal</h1>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email / Phone</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email or phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}