import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { ArrowLeft, LogIn } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        phone,
        password,
      });

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));

      // Redirect based on role
      if (data.role === 'Treasurer') {
        navigate('/dashboard');
      } else if (data.role === 'Executive' || data.role === 'Member') {
        navigate('/portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative bg-brand-grey">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-brand-orange/8 blur-[120px]" />
      </div>

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 p-3 rounded-full hover:bg-brand-border/50 transition-colors text-white/60 hover:text-white active:scale-[0.95]"
        aria-label="Back to home"
      >
        <ArrowLeft size={22} strokeWidth={1.5} />
      </button>

      <div className="card w-full max-w-md p-8 sm:p-10 mt-12 md:mt-0 relative z-10 fade-in-up shadow-[0_8px_40px_rgb(0,0,0,0.35)]">
        <div className="text-center mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-dark-bg text-white rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgb(0,0,0,0.2)] border border-brand-border/30">
            <LogIn size={26} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Access Portal</h2>
          <p className="text-white/45 mt-2 font-light text-sm">Sign in to your Gladiators account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm mb-8 border border-red-500/20 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/50">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/50">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary flex justify-center items-center gap-2 mt-8 w-full"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
