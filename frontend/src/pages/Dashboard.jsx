import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../apiClient';
import { Activity, BookOpen, IndianRupee, Users, LogOut, TrendingUp, Presentation } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalMembers: 0,
    booksIssued: 0,
    booksReturned: 0,
    totalCollection: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await api.get('/collections/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [handleLogout]);

  const StatCard = ({ title, value, icon, color, bg }) => {
    const IconComponent = icon;
    return (
      <div className="card flex items-center gap-6 group hover:translate-y-[-2px]">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} shadow-sm border border-brand-border/50 transition-colors duration-500`}>
          <IconComponent className={color} size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] text-white/60 font-semibold uppercase tracking-widest mb-1.5">{title}</p>
          <h3 className="text-3xl font-semibold text-white tracking-tight">
            {title.includes('Collection') ? `₹${value.toLocaleString('en-IN')}` : value}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-grey">
      {/* Header Minimal */}
      <header className="bg-brand-card-bg/70 backdrop-blur-xl border-b border-brand-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-[4.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-heading font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-tight m-0 leading-tight text-white">Gladiators</h1>
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-widest">Treasurer</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white/70 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
          <p className="text-white/60 mt-2 font-light text-lg">Platform statistics & financials.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[120px] bg-brand-card-bg rounded-[1.5rem] border border-brand-border/50"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            <StatCard 
              title="Total Collection" 
              value={stats.totalCollection} 
              icon={IndianRupee} 
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
            <StatCard 
              title="Programs" 
              value={stats.totalPrograms} 
              icon={Presentation} 
              color="text-brand-orange"
              bg="bg-brand-orange/10"
            />
            <StatCard 
              title="Members" 
              value={stats.totalMembers} 
              icon={Users} 
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            <StatCard 
              title="Books Issued" 
              value={stats.booksIssued} 
              icon={BookOpen} 
              color="text-purple-400"
              bg="bg-purple-500/10"
            />
            <StatCard 
              title="Books Returned" 
              value={stats.booksReturned} 
              icon={Activity} 
              color="text-teal-400"
              bg="bg-teal-500/10"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions / Navigation */}
          <Link to="/programs" className="card group hover:border-brand-orange/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors duration-500">
                <Presentation className="text-white group-hover:text-brand-orange transition-colors" size={24} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-brand-orange transition-colors" size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 text-white">Manage Programs</h3>
            <p className="text-white/60 leading-relaxed font-light">
              Create new fundraising events, configure coupon types, and monitor organizational status.
            </p>
          </Link>

          <Link to="/inventory" className="card group hover:border-purple-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors duration-500">
                <BookOpen className="text-white group-hover:text-purple-400 transition-colors" size={24} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-purple-400 transition-colors" size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 text-white">Book Inventory</h3>
            <p className="text-white/60 leading-relaxed font-light">
              Assign books to members, track returns, and securely record all collected organizational funds.
            </p>
          </Link>

          <Link to="/members" className="card group hover:border-blue-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-500">
                <Users className="text-white group-hover:text-blue-400 transition-colors" size={24} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-blue-400 transition-colors" size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 text-white">Manage Members</h3>
            <p className="text-white/60 leading-relaxed font-light">
              Register new club executives, manage roles, and deactivate inactive members safely.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
