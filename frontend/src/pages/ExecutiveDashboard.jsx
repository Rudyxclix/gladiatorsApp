import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { LogOut, BookOpen, Activity, AlertCircle, CircleDollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ExecutiveDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalAssigned: 0, totalCollected: 0, completed: 0 });
  const [collectingBookId, setCollectingBookId] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const fetchMyBooks = useCallback(async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const booksRes = await api.get('/books/my-books', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        const booksData = booksRes.data || [];
        setBooks(booksData);
        
        // Calculate basic stats for this user across all programs
        const collected = booksData.reduce((sum, b) => sum + (b.collectionAmount || 0), 0);
        const completedCount = booksData.filter(b => b.status === 'Completed').length;
        
        setStats({
          totalAssigned: booksData.length,
          totalCollected: collected,
          completed: completedCount
        });
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    }, [handleLogout]);

  const handleRecordCollection = useCallback(async (bookId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const programsRes = await api.get('/programs', { headers: { Authorization: `Bearer ${token}` } });
      const activeProgram = programsRes.data.find(p => p.status === 'Active');
      
      if (activeProgram) {
        await api.post('/collections', 
          { 
            program: activeProgram._id,
            couponBook: bookId,
            amount: parseFloat(amount)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh data silently
        fetchMyBooks(true);
      }
    } catch (error) {
      console.error('Error recording collection:', error);
      toast.error('Failed to record collection. Please try again.');
    }
  }, [fetchMyBooks]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  return (
    <div className="min-h-screen pb-24 bg-brand-grey">
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
          <div className="card bg-brand-card-bg border-0 shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-6 md:p-8 hover:translate-y-[-2px] transition-transform duration-500">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <BookOpen size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-1.5">Assigned</p>
            <h3 className="text-3xl font-semibold tracking-tight text-white">{stats.totalAssigned} Books</h3>
          </div>
          <div className="card bg-brand-card-bg border-0 shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-6 md:p-8 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 -z-0 transition-transform duration-700 group-hover:scale-125" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                <span className="font-semibold text-lg">₹</span>
              </div>
              <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-1.5">Collected</p>
              <h3 className="text-4xl font-semibold text-emerald-400 tracking-tight">₹{stats.totalCollected.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          
          <div className="card bg-brand-card-bg border-0 shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-6 md:p-8 col-span-2 md:col-span-1 hover:translate-y-[-2px] transition-transform duration-500">
             <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
              <Activity size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-1.5">Completed</p>
            <h3 className="text-3xl font-semibold tracking-tight text-white">{stats.completed} / {stats.totalAssigned}</h3>
            
            {stats.totalAssigned > 0 && (
              <div className="w-full bg-brand-dark-bg border border-brand-border/50 rounded-full h-2 mt-6 overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(stats.completed / stats.totalAssigned) * 100}%` }}></div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Your Active Books</h2>
          <p className="text-white/60 mt-1 font-light text-sm">Coupon books currently assigned to you.</p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-brand-card-bg border border-brand-border/30 rounded-[1.5rem] w-full"></div>)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 px-6 card border-dashed border-brand-border/50 bg-brand-dark-bg">
            <AlertCircle className="mx-auto text-white/20 mb-4" size={48} strokeWidth={1.5} />
            <p className="text-xl text-white font-semibold tracking-tight">No books assigned yet</p>
            <p className="text-white/50 mt-2 font-light max-w-sm mx-auto">Contact the Treasurer to receive your coupon books.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {books.map(book => (
              <div key={book._id} className="card p-6 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:translate-y-0">
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 font-mono font-medium text-sm border
                    ${book.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-inner' 
                    : book.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-inner'
                    : book.status === 'Returned' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-inner'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-inner'}
                  `}>
                    #{book.bookNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg tracking-tight text-white m-0">{book.bookType?.name ?? 'Book'}</h4>
                      {book.program && (
                         <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider rounded border border-brand-orange/20">
                           {book.program.name}
                         </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 font-medium">ISSUED: {new Date(book.issueDate).toLocaleDateString()}</p>
                    
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                      bg-brand-dark-bg text-white/50 border border-brand-border/50"
                    >
                      Status: <span className={
                        book.status === 'Completed' ? 'text-emerald-400' :
                        book.status === 'Partial' ? 'text-yellow-400' :
                        book.status === 'Returned' ? 'text-orange-400' : 'text-blue-400'
                      }>{book.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-brand-dark-bg rounded-[1.25rem] p-4 text-center border border-brand-border/50">
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1.5">Collection</p>
                    <p className="font-mono font-semibold text-xl text-emerald-400 tracking-tight">
                      {book.collectionAmount > 0 ? `₹${book.collectionAmount.toLocaleString('en-IN')}` : '₹0'}
                    </p>
                  </div>
                  
                  {user.role === 'Treasurer' && book.status !== 'Completed' && (
                    <div className="flex flex-col items-center gap-2">
                      {collectingBookId === book._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            placeholder="Amount"
                            className="input-field w-24 text-center"
                            value={collectAmount}
                            onChange={(e) => setCollectAmount(e.target.value)}
                            min="1"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (collectAmount) {
                                  handleRecordCollection(book._id, collectAmount);
                                  setCollectingBookId(null);
                                  setCollectAmount('');
                                }
                              }}
                              className="btn-primary py-1 px-3 text-xs"
                            >
                              Record
                            </button>
                            <button
                              onClick={() => {
                                setCollectingBookId(null);
                                setCollectAmount('');
                              }}
                              className="btn-secondary py-1 px-3 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCollectingBookId(book._id)}
                          className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                        >
                          <CircleDollarSign size={16} />
                          Record Collection
                        </button>
                      )}
                    </div>
                  )}
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
