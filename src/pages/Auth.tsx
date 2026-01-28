import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      toast.error('Unesite validnu email adresu');
      return false;
    }
    if (password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera');
      return false;
    }
    if (!isLogin && !firstName) {
      toast.error('Unesite ime');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Pogrešan email ili lozinka');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Uspješna prijava!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Korisnik sa ovim emailom već postoji');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Uspješna registracija! Možete se prijaviti.');
          setIsLogin(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">IZVJEŠTAJI</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Report Management System</p>
        </div>

        {/* Auth Card */}
        <div className="section-card p-6 lg:p-8">
          <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 text-center">
            {isLogin ? 'Prijava' : 'Registracija'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">Ime</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      placeholder="Ime"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Prezime</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Prezime"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Lozinka</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? 'Prijava...' : 'Registracija...'}
                </>
              ) : (
                isLogin ? 'Prijavi se' : 'Registruj se'
              )}
            </Button>
          </form>

          <div className="mt-4 lg:mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin 
                ? 'Nemate račun? Registrujte se' 
                : 'Već imate račun? Prijavite se'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 lg:mt-6 px-4">
          Prvi registrovani korisnik automatski postaje administrator
        </p>
      </div>
    </div>
  );
}
