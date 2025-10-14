import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, User, Lock, Stethoscope, Pill, Heart, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";
import { getRoleDisplayName } from "@/data/mockData";

export default function LoginModern() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    const currentUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('access_token');
    
    if (currentUser && accessToken) {
      const user = JSON.parse(currentUser);
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    // Load remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }

    const canvas = document.getElementById('particles') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number}> = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);

        if (user.organization_id) {
          localStorage.setItem("selectedOrganization", user.organization_id);
        }

        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.first_name} ${user.last_name}!`,
        });

        // Force immediate navigation
        setTimeout(() => {
          if (user.role === 'super_admin') {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 100);
      } else {
        toast({
          title: "Authentication Failed",
          description: response.message || "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Connection Error",
        description: error.response?.data?.message || "Unable to connect. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex relative overflow-hidden">
      <canvas id="particles" className="absolute inset-0 pointer-events-none" />
      
      {/* Left Column - Medical Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 text-center space-y-8">
          {/* Medical Icons Arrangement */}
          <div className="relative w-80 h-80 mx-auto">
            {/* Center Logo */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-500 ${loading ? 'bg-white/40 scale-110 shadow-2xl shadow-white/20' : 'bg-white/20'}`}>
              <Package className={`w-10 h-10 text-white transition-all duration-300 ${loading ? 'animate-pulse' : ''}`} />
            </div>
            
            {/* Rotating Medical Icons Container */}
            <div 
              className={`absolute inset-0 transition-all duration-1000 ease-out ${loading ? 'animate-spin' : ''}`} 
              style={{
                animationDuration: loading ? '0.8s' : '2s',
                animationTimingFunction: loading ? 'linear' : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {/* Top Icon */}
              <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${loading ? 'bg-blue-500/50 scale-110 shadow-lg shadow-blue-500/30' : 'bg-blue-500/30'}`}>
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              {/* Right Icon */}
              <div className={`absolute top-1/2 right-8 transform -translate-y-1/2 w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${loading ? 'bg-green-500/50 scale-110 shadow-lg shadow-green-500/30' : 'bg-green-500/30'}`}>
                <Pill className="w-7 h-7 text-white" />
              </div>
              {/* Bottom Icon */}
              <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${loading ? 'bg-red-500/50 scale-110 shadow-lg shadow-red-500/30' : 'bg-red-500/30'}`}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              {/* Left Icon */}
              <div className={`absolute top-1/2 left-8 transform -translate-y-1/2 w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${loading ? 'bg-purple-500/50 scale-110 shadow-lg shadow-purple-500/30' : 'bg-purple-500/30'}`}>
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              drpharmas
            </h1>
            <p className="text-xl text-slate-300">
              Advanced Healthcare Management
            </p>
            <p className="text-slate-400 max-w-md mx-auto">
              Streamline your pharmacy operations with our comprehensive management system designed for modern healthcare providers.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">drpharmas</h1>
          </div>
          
          {/* Login Form */}
          <div className="space-y-6 p-8 border border-white/20 rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-300">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 focus:bg-white/20"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 pr-12 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 focus:bg-white/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/40"
                />
                <Label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer">
                  Remember my credentials
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}