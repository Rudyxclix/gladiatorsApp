import { MapPin, Instagram, Activity, Music, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-grey">
      {/* Navigation Bar (Minimalist) */}
      <nav className="absolute top-0 left-0 w-full px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center z-50">
        <div className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">
          Gladiators
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-white bg-brand-card-bg/50 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-brand-border/50 hover:bg-brand-card-bg hover:shadow-sm transition-all"
        >
          Member Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-orange/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-brand-card-bg/60 backdrop-blur-md border border-brand-border/50 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/70 mb-8 sm:mb-12 shadow-sm">
            <MapPin size={12} className="text-brand-orange" />
            Padanilam, Kerala
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-[5.5rem] font-heading font-semibold text-white leading-[1.05] tracking-tight mb-6 sm:mb-8">
            Community, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              elevated.
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 sm:mb-16 font-light leading-relaxed">
            The premier arts and sports club dedicated to fostering talent and cultural heritage.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="bg-brand-charcoal text-white text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-medium hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300"
          >
            Access Portal
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-32 px-5 sm:px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium text-white leading-tight tracking-tight mb-6 sm:mb-8">
          More than just a club. <br className="hidden md:block" />
          <span className="text-white/40">A movement for the community.</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/60 leading-relaxed font-light max-w-3xl mx-auto">
          We organize premium cultural programs and athletic events, creating a unified platform for local talent to shine and communities to bond.
        </p>
      </section>

      {/* Activities Section */}
      <section className="py-16 sm:py-24 px-5 sm:px-6 bg-brand-card-bg border-y border-brand-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Our Focus</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { title: 'Arts', icon: Music, desc: 'Cultivating local artistic expressions.', color: 'text-white' },
              { title: 'Sports', icon: Activity, desc: 'Promoting health and athletic excellence.', color: 'text-brand-orange' },
              { title: 'Community', icon: Users, desc: 'Building strong communal ties.', color: 'text-white' },
              { title: 'Fundraising', icon: Heart, desc: 'Sustaining our collective future.', color: 'text-white/60' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-card-bg/30 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-brand-border/20 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className={item.color} size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 tracking-tight text-white">{item.title}</h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Connect */}
      <section className="py-20 sm:py-32 px-5 sm:px-6 text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-card-bg/50 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 sm:mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-border/20">
          <Instagram className="text-white/60" size={28} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 sm:mb-6 text-white">Stay Connected.</h2>
        <p className="text-lg sm:text-xl text-white/60 mb-8 sm:mb-12 font-light">Follow our journey and witness the community in action.</p>
        <a 
          href="https://www.instagram.com/gladiatorspadanilam/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-white/70 hover:text-brand-orange transition-colors border-b border-brand-border/30 hover:border-brand-orange pb-1"
        >
          @gladiatorspadanilam
        </a>
      </section>

      {/* Footer Minimal */}
      <footer className="bg-brand-card-bg border-t border-brand-border/30 py-8 sm:py-12 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-heading font-semibold text-white tracking-tight">Gladiators</h3>
            <p className="text-white/40 text-sm mt-1">Arts and Sports Club</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/60 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> Padanilam</span>
            <a href="https://www.instagram.com/gladiatorspadanilam/" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Instagram size={14} /> Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
