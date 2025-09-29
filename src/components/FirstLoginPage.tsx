import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';
import { Building2, Upload, User, Phone, MapPin, FileText } from 'lucide-react';

export function FirstLoginPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    idProof: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { completeFirstLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, idProof: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.address || !formData.idProof) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await completeFirstLogin(formData);
      
      if (success) {
        toast.success('Profile completed successfully!');
        navigate('/dashboard/employee');
      } else {
        toast.error('Failed to complete profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('An error occurred while completing your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">Please provide your details to get started</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              This information will be used for document verification and signing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  className="bg-input-background resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idProof" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ID Proof Upload *
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="idProof"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="idProof"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      {formData.idProof ? (
                        <span className="text-green-600">
                          ✓ {formData.idProof.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-primary">Click to upload</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PDF, JPG, JPEG or PNG (max 10MB)
                    </div>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving Profile...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Your information is secure and will only be used for document verification.
        </div>
      </div>
    </div>
  );
}