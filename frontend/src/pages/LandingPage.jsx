import { MapPin, Instagram, Activity, Music, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation Bar (Minimalist) */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="font-heading font-bold text-xl tracking-tight text-brand-charcoal">
          Gladiators
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-brand-charcoal bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-black/5 hover:bg-white hover:shadow-sm transition-all"
        >
          Member Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-orange-100/50 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-black/[0.03] text-xs font-medium uppercase tracking-widest text-brand-charcoal-light mb-12 shadow-sm">
            <MapPin size={12} className="text-brand-orange" />
            Padanilam, Kerala
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-heading font-semibold text-brand-charcoal leading-[1.05] tracking-tight mb-8">
            Community, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-charcoal to-brand-charcoal/60">
              elevated.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-brand-charcoal/60 max-w-2xl mx-auto mb-16 font-light leading-relaxed">
            The premier arts and sports club dedicated to fostering talent and cultural heritage.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="bg-brand-charcoal text-white text-lg px-10 py-4 rounded-full font-medium hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
          >
            Access Portal
          </button>
        </div>
      </section>

      {/* About Section (Apple-style bold typography) */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium text-brand-charcoal leading-tight tracking-tight mb-8">
          More than just a club. <br className="hidden md:block" />
          <span className="text-brand-charcoal/40">A movement for the community.</span>
        </h2>
        <p className="text-lg md:text-xl text-brand-charcoal/60 leading-relaxed font-light max-w-3xl mx-auto">
          We organize premium cultural programs and athletic events, creating a unified platform for local talent to shine and communities to bond.
        </p>
      </section>

      {/* Activities Section */}
      <section className="py-24 px-6 bg-white border-y border-black/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold tracking-tight">Our Focus</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Arts', icon: Music, desc: 'Cultivating local artistic expressions.', color: 'text-brand-charcoal' },
              { title: 'Sports', icon: Activity, desc: 'Promoting health and athletic excellence.', color: 'text-brand-orange' },
              { title: 'Community', icon: Users, desc: 'Building strong communal ties.', color: 'text-brand-charcoal' },
              { title: 'Fundraising', icon: Heart, desc: 'Sustaining our collective future.', color: 'text-brand-charcoal/60' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/[0.02] group-hover:scale-110 transition-transform duration-500">
                  <item.icon className={item.color} size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium mb-3 tracking-tight">{item.title}</h3>
                <p className="text-brand-charcoal/60 text-sm leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Connect */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
          <Instagram className="text-brand-charcoal" size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">Stay Connected.</h2>
        <p className="text-xl text-brand-charcoal/60 mb-12 font-light">Follow our journey and witness the community in action.</p>
        <a 
          href="https://www.instagram.com/gladiatorspadanilam/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-brand-charcoal hover:text-brand-orange transition-colors border-b border-black/10 hover:border-brand-orange pb-1"
        >
          @gladiatorspadanilam
        </a>
      </section>

      {/* Footer Minimal */}
      <footer className="bg-white border-t border-black/[0.05] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-heading font-semibold text-brand-charcoal tracking-tight">Gladiators</h3>
            <p className="text-brand-charcoal/40 text-sm mt-1">Arts and Sports Club</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-brand-charcoal/60 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> Padanilam</span>
            <a href="https://www.instagram.com/gladiatorspadanilam/" className="flex items-center gap-1.5 hover:text-brand-charcoal transition-colors">
              <Instagram size={14} /> Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
