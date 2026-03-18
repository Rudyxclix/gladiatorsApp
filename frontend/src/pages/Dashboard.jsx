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

  const StatCard = ({ title, value, icon, color, bg, wide }) => {
    const IconComponent = icon;
    return (
      <div className={`card flex items-center gap-4 sm:gap-6 group hover:translate-y-[-2px] ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${bg} shadow-sm border border-brand-border/50 transition-colors duration-500 shrink-0`}>
          <IconComponent className={color} size={22} strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] text-white/60 font-semibold uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight truncate">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-[4.5rem] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-charcoal rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-heading font-bold text-base sm:text-lg">G</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight m-0 leading-tight text-white">Gladiators</h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-white/60 uppercase tracking-widest">Treasurer</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-white/70 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Overview</h2>
          <p className="text-white/60 mt-1 sm:mt-2 font-light text-base sm:text-lg">Platform statistics & financials.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-[100px] sm:h-[120px] bg-brand-card-bg rounded-[1.25rem] sm:rounded-[1.5rem] border border-brand-border/50 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6 mb-10 sm:mb-16">
            <StatCard 
              title="Total Collection" 
              value={stats.totalCollection} 
              icon={IndianRupee} 
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              wide={true}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Quick Actions / Navigation */}
          <Link to="/programs" className="card group hover:border-brand-orange/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-brand-orange/20 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors duration-500">
                <Presentation className="text-white group-hover:text-brand-orange transition-colors" size={22} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-brand-orange transition-colors" size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 sm:mb-3 text-white">Manage Programs</h3>
            <p className="text-white/60 leading-relaxed font-light text-sm sm:text-base">
              Create new fundraising events, configure coupon types, and monitor status.
            </p>
          </Link>

          <Link to="/inventory" className="card group hover:border-purple-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-purple-500/10 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors duration-500">
                <BookOpen className="text-white group-hover:text-purple-400 transition-colors" size={22} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-purple-400 transition-colors" size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 sm:mb-3 text-white">Book Inventory</h3>
            <p className="text-white/60 leading-relaxed font-light text-sm sm:text-base">
              Assign books to members, track returns, and record collected funds.
            </p>
          </Link>

          <Link to="/members" className="card group hover:border-blue-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/10 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-card-bg border border-brand-border/50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-500">
                <Users className="text-white group-hover:text-blue-400 transition-colors" size={22} strokeWidth={1.5} />
              </div>
              <TrendingUp className="text-white/30 group-hover:text-blue-400 transition-colors" size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 sm:mb-3 text-white">Manage Members</h3>
            <p className="text-white/60 leading-relaxed font-light text-sm sm:text-base">
              Register new club executives, manage roles, and deactivate inactive members.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
