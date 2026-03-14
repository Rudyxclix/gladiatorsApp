import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, BookOpen, Activity, AlertCircle } from 'lucide-react';

const ExecutiveDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalAssigned: 0, totalCollected: 0, completed: 0 });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // For executive, we need to fetch all programs they are part of, or a specific program
      // For MVP, we'll fetch the first active program and get books assigned to them.
      const programsRes = await axios.get('http://localhost:5001/api/programs', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const activeProgram = programsRes.data.find(p => p.status === 'Active');
      
      if (activeProgram) {
        const booksRes = await axios.get(`http://localhost:5001/api/books/inventory/${activeProgram._id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        setBooks(booksRes.data);
        
        // Calculate basic stats for this executive
        const collected = booksRes.data.reduce((sum, b) => sum + (b.collectionAmount || 0), 0);
        const completedCount = booksRes.data.filter(b => b.status === 'Completed').length;
        
        setStats({
          totalAssigned: booksRes.data.length,
          totalCollected: collected,
          completed: completedCount
        });
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-24 bg-[#fafafa]">
      {/* Header */}
      <header className="bg-brand-charcoal text-white rounded-b-[2.5rem] pb-12 pt-8 px-6 shadow-[0_20px_40px_rgb(0,0,0,0.1)] mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none rounded-b-[2.5rem]">
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] rounded-full bg-brand-orange/20 blur-[60px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center border border-white/20 shadow-sm">
              <span className="text-white font-heading font-bold text-xl">G</span>
            </div>
            <span className="font-semibold tracking-tight text-white/90">
                {user.role === 'Executive' ? 'Executive Portal' : 'Member Portal'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 pt-4">
          <p className="text-brand-orange text-xs font-semibold mb-2 uppercase tracking-widest">Welcome back,</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white m-0 tracking-tight">{user.name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 hover:translate-y-[-2px] transition-transform duration-500">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
              <BookOpen size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] text-brand-charcoal/50 font-semibold uppercase tracking-widest mb-1.5">Assigned</p>
            <h3 className="text-3xl font-semibold tracking-tight">{stats.totalAssigned} Books</h3>
          </div>
          <div className="card bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 -z-0 transition-transform duration-700 group-hover:scale-125" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-200/50">
                <span className="font-semibold text-lg">₹</span>
              </div>
              <p className="text-[10px] text-brand-charcoal/50 font-semibold uppercase tracking-widest mb-1.5">Collected</p>
              <h3 className="text-4xl font-semibold text-emerald-600 tracking-tight">₹{stats.totalCollected.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          
          <div className="card bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 col-span-2 md:col-span-1 hover:translate-y-[-2px] transition-transform duration-500">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 border border-purple-100/50">
              <Activity size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] text-brand-charcoal/50 font-semibold uppercase tracking-widest mb-1.5">Completed</p>
            <h3 className="text-3xl font-semibold tracking-tight">{stats.completed} / {stats.totalAssigned}</h3>
            
            {stats.totalAssigned > 0 && (
              <div className="w-full bg-[#fafafa] border border-black/[0.03] rounded-full h-2 mt-6 overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(stats.completed / stats.totalAssigned) * 100}%` }}></div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Your Active Books</h2>
          <p className="text-brand-charcoal/60 mt-1 font-light text-sm">Coupon books currently assigned to you.</p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-black/[0.03] rounded-[1.5rem] w-full"></div>)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 px-6 card border-dashed border-black/10 bg-[#fafafa]">
            <AlertCircle className="mx-auto text-brand-charcoal/20 mb-4" size={48} strokeWidth={1.5} />
            <p className="text-xl text-brand-charcoal font-semibold tracking-tight">No books assigned yet</p>
            <p className="text-brand-charcoal/50 mt-2 font-light max-w-sm mx-auto">Contact the Treasurer to receive your coupon books.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {books.map(book => (
              <div key={book._id} className="card p-6 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:translate-y-0">
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 font-mono font-medium text-sm border
                    ${book.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-inner' 
                    : book.status === 'Returned' ? 'bg-orange-50 text-orange-600 border-orange-100/50 shadow-inner'
                    : 'bg-blue-50 text-blue-600 border-blue-100/50 shadow-inner'}
                  `}>
                    #{book.bookNumber}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg tracking-tight text-brand-charcoal mb-1">{book.bookType?.name ?? 'Book'}</h4>
                    <p className="text-xs text-brand-charcoal/50 font-medium">ISSUED: {new Date(book.issueDate).toLocaleDateString()}</p>
                    
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                      bg-[#fafafa] text-brand-charcoal/50 border border-black/5"
                    >
                      Status: <span className={
                        book.status === 'Completed' ? 'text-emerald-600' :
                        book.status === 'Returned' ? 'text-orange-600' : 'text-blue-600'
                      }>{book.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#fafafa] rounded-[1.25rem] p-4 text-center sm:text-right border border-black/[0.03]">
                  <p className="text-[10px] text-brand-charcoal/40 font-semibold uppercase tracking-widest mb-1.5">Collection</p>
                  <p className="font-mono font-semibold text-xl text-emerald-600 tracking-tight">
                    {book.collectionAmount > 0 ? `₹${book.collectionAmount.toLocaleString('en-IN')}` : '₹0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExecutiveDashboard;
