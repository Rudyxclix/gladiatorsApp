import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const { data } = await axios.post('http://localhost:5001/api/auth/login', {
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
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#fafafa]">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 p-3 rounded-full hover:bg-black/5 transition-colors text-brand-charcoal"
        aria-label="Back to home"
      >
        <ArrowLeft size={24} strokeWidth={1.5} />
      </button>

      <div className="card w-full max-w-md p-10 mt-12 md:mt-0">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-charcoal text-white rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <LogIn size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">Access Portal</h2>
          <p className="text-brand-charcoal/60 mt-2 font-light text-sm">Sign in to your Gladiators account</p>
        </div>

        {error && (
          <div className="bg-red-50/50 text-red-600 p-4 rounded-2xl text-sm mb-8 border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">
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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">
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
