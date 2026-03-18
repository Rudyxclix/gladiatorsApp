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

  const statCards = [
    { title: 'Total Collection', value: stats.totalCollection, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', wide: true, isCurrency: true },
    { title: 'Programs', value: stats.totalPrograms, icon: Presentation, color: 'text-brand-orange', bg: 'bg-brand-orange/10', border: 'border-brand-orange/20' },
    { title: 'Members', value: stats.totalMembers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'Books Issued', value: stats.booksIssued, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { title: 'Books Returned', value: stats.booksReturned, icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  ];

  const navCards = [
    { to: '/programs', title: 'Manage Programs', desc: 'Create new fundraising events, configure coupon types, and monitor status.', icon: Presentation, accent: 'brand-orange', accentColor: 'text-brand-orange' },
    { to: '/inventory', title: 'Book Inventory', desc: 'Assign books to members, track returns, and record collected funds.', icon: BookOpen, accent: 'purple-500', accentColor: 'text-purple-400' },
    { to: '/members', title: 'Manage Members', desc: 'Register new club executives, manage roles, and deactivate inactive members.', icon: Users, accent: 'blue-500', accentColor: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen pb-24 bg-brand-grey">
      {/* Header */}
      <header className="bg-brand-card-bg/70 backdrop-blur-xl border-b border-brand-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-[4.5rem] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-dark-bg rounded-xl flex items-center justify-center border border-brand-border/30">
              <span className="text-white font-heading font-bold text-base sm:text-lg">G</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight m-0 leading-tight text-white">Gladiators</h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-brand-orange uppercase tracking-widest">Treasurer</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium active:scale-[0.95]"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12 fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Overview</h2>
          <p className="text-white/45 mt-1 sm:mt-2 font-light text-base sm:text-lg">Platform statistics & financials.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-[100px] sm:h-[120px] bg-brand-card-bg rounded-[1.25rem] sm:rounded-[1.5rem] border border-brand-border/30 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5 mb-10 sm:mb-16">
            {statCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div key={idx} className={`card flex items-center gap-3 sm:gap-5 group hover:translate-y-[-2px] fade-in-up delay-${idx + 1} ${card.wide ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center ${card.bg} border ${card.border} transition-colors duration-500 shrink-0`}>
                    <IconComponent className={card.color} size={20} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-white/45 font-semibold uppercase tracking-widest mb-1">{card.title}</p>
                    <h3 className="text-lg sm:text-2xl font-semibold text-white tracking-tight whitespace-nowrap">
                      {card.isCurrency ? `₹${card.value.toLocaleString('en-IN')}` : card.value}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {navCards.map((nav, idx) => {
            const IconComponent = nav.icon;
            return (
              <Link key={idx} to={nav.to} className={`card group hover:border-${nav.accent}/30 overflow-hidden relative fade-in-up delay-${idx + 5}`}>
                <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-${nav.accent}/10 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-13 sm:h-13 bg-brand-dark-bg border border-brand-border/40 rounded-[1.25rem] flex items-center justify-center group-hover:bg-${nav.accent}/10 transition-colors duration-500`}>
                    <IconComponent className={`text-white/70 group-hover:${nav.accentColor} transition-colors`} size={22} strokeWidth={1.5} />
                  </div>
                  <TrendingUp className={`text-white/20 group-hover:${nav.accentColor} transition-colors`} size={18} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 sm:mb-3 text-white">{nav.title}</h3>
                <p className="text-white/45 leading-relaxed font-light text-sm sm:text-base">
                  {nav.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
