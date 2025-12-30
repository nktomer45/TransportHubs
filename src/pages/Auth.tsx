import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Truck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    try {
      authSchema.parse({
        email,
        password,
        fullName: isLogin ? undefined : fullName,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
        });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Account Exists',
              description: 'An account with this email already exists. Please log in.',
              variant: 'destructive',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Sign Up Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Account Created!',
          description: 'You can now log in with your credentials.',
        });
        navigate('/');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="font-display text-3xl font-bold text-primary-foreground">
                TransportHub
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Streamline Your<br />
              Logistics Operations
            </h1>

            <p className="text-primary-foreground/80 text-lg max-w-md">
              Manage shipments, track deliveries, and optimize your supply chain with our comprehensive transportation management system.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground">500+</div>
                <div className="text-sm text-primary-foreground/70">Active Shipments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground">98%</div>
                <div className="text-sm text-primary-foreground/70">On-Time Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground">24/7</div>
                <div className="text-sm text-primary-foreground/70">Tracking</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/10 to-transparent" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">TransportHub</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Get started with your free account today'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground h-11"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="ml-1 text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
