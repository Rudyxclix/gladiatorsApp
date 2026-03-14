import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, UserCheck, Plus, CircleDollarSign, Trash2 } from 'lucide-react';

const BookInventory = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [books, setBooks] = useState([]);
  const [bookTypes, setBookTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddType, setShowAddType] = useState(false);
  const [showAddBooks, setShowAddBooks] = useState(false);
  const [assignBookId, setAssignBookId] = useState(null);
  const [assignUserIds, setAssignUserIds] = useState([]);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectBookId, setCollectBookId] = useState(null);

  // Bulk operation state
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Assignment Edit State
  const [editBookId, setEditBookId] = useState(null);
  const [editAssignmentData, setEditAssignmentData] = useState({ assignedTo: [], collectionAmount: 0, status: 'Assigned' });

  const [typeForm, setTypeForm] = useState({ name: '', leavesPerBook: 50, amountType: 'Fixed', fixedAmount: 50 });
  const [inventoryForm, setInventoryForm] = useState({ bookType: '', startNumber: 1, count: 10 });

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramData(selectedProgram);
    } else {
      setBooks([]);
      setBookTypes([]);
      setInventoryForm(prev => ({ ...prev, bookType: '' }));
    }
  }, [selectedProgram]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [programsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/programs', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPrograms(programsRes.data);
      setUsers(usersRes.data);
      if (programsRes.data.length > 0) {
        setSelectedProgram(programsRes.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProgramData = async (programId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [typesRes, booksRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/books/types/${programId}`, { headers }),
        axios.get(`http://localhost:5001/api/books/inventory/${programId}`, { headers })
      ]);
      setBookTypes(typesRes.data);
      setBooks(booksRes.data);
      setInventoryForm(prev => ({ ...prev, bookType: typesRes.data.length > 0 ? typesRes.data[0]._id : '' }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/books/types', 
        { ...typeForm, program: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddType(false);
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert('Failed to create book type');
    }
  };

  const handleGenerateBooks = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/books/inventory', 
        { 
          program: selectedProgram,
          bookType: inventoryForm.bookType,
          startNumber: parseInt(inventoryForm.startNumber),
          count: parseInt(inventoryForm.count)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddBooks(false);
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate books');
    }
  };

  const handleAssign = async (bookId) => {
    if (assignUserIds.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/books/${bookId}/assign`,
        { assignedTo: assignUserIds, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignBookId(null);
      setAssignUserIds([]);
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert('Failed to assign book');
    }
  };

  const handleCollection = async (e, bookId) => {
    e.preventDefault();
    
    // Front-end validation bounds check
    const book = books.find(b => b._id === bookId);
    if (book && book.bookType?.amountType === 'Fixed') {
       const maxPossible = book.bookType.fixedAmount * book.bookType.leavesPerBook;
       if (book.collectionAmount + parseFloat(collectAmount) > maxPossible) {
          return alert(`Cannot collect more than the maximum book value of ₹${maxPossible}`);
       }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/collections', 
        { 
          program: selectedProgram,
          couponBook: bookId,
          amount: parseFloat(collectAmount),
          markCompleted: true // Simplifying for MVP to mark completed on first collection
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollectBookId(null);
      setCollectAmount('');
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert('Failed to record collection');
    }
  };

  const handleDeleteBookType = async (typeId) => {
    if (!window.confirm('Delete this book type?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/books/types/${typeId}`, {
        params: { programId: selectedProgram },
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book type');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Delete this coupon book?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/books/inventory/${bookId}`, {
        params: { programId: selectedProgram },
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedBookIds.length} selected coupon books?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/books/inventory/bulk-delete',
        { bookIds: selectedBookIds, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedBookIds([]);
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to bulk-delete books');
    }
  };

  const toggleBookSelection = (id) => {
    setSelectedBookIds(prev =>
      prev.includes(id) ? prev.filter(bookId => bookId !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    const availableBooks = books.filter(b => b.status === 'Available');
    if (selectedBookIds.length === availableBooks.length) {
      setSelectedBookIds([]); // deselect all
    } else {
      setSelectedBookIds(availableBooks.map(b => b._id)); // select all
    }
  };

  const handleRevertCollection = async (bookId) => {
    if (!window.confirm('Revert the last collection for this book?')) return;
    try {
      const token = localStorage.getItem('token');
      // Fetch the collections for this program
      const { data: collectionsResponse } = await axios.get(`http://localhost:5001/api/collections/program/${selectedProgram}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const collectionsArray = collectionsResponse.collections || [];

      const latestCollection = collectionsArray.find(c => c.couponBook?._id === bookId || c.couponBook === bookId);
      
      if (!latestCollection) {
         return alert("No recent collection found to revert.");
      }

      await axios.delete(`http://localhost:5001/api/collections/${latestCollection._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchProgramData(selectedProgram);
    } catch (error) {
       alert(error.response?.data?.message || 'Failed to revert collection');
    }
  };

  const handleEditAssignment = (book) => {
    setEditBookId(book._id);
    setEditAssignmentData({
      assignedTo: book.assignedTo ? book.assignedTo.map(u => u._id || u) : [],
      collectionAmount: book.collectionAmount || 0,
      status: book.status
    });
  };

  const handleSaveAssignmentEdit = async (e, bookId) => {
    e.preventDefault();

    const book = books.find(b => b._id === bookId);
    if (book && book.bookType?.amountType === 'Fixed') {
       const maxPossible = book.bookType.fixedAmount * book.bookType.leavesPerBook;
       if (parseFloat(editAssignmentData.collectionAmount) > maxPossible) {
          return alert(`Amount cannot exceed the maximum book value of ₹${maxPossible}`);
       }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/books/inventory/${bookId}/assignment/edit`,
        { ...editAssignmentData, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditBookId(null);
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleUnassignBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to unassign this book? It will return to inventory as "Available".')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/books/inventory/${bookId}/unassign`,
        { programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProgramData(selectedProgram);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unassign book');
    }
  };


  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-gray-100 text-gray-700';
      case 'Assigned': return 'bg-blue-100 text-blue-700';
      case 'Returned': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#fafafa]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/[0.05] sticky top-0 z-50 px-6 h-[4.5rem] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-black/5 rounded-full text-brand-charcoal transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-semibold tracking-tight m-0">Book Inventory</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-end justify-between">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Select Program Context</label>
            <select 
              className="input-field shadow-sm bg-white"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="" disabled>Select a program...</option>
              {programs.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowAddType(!showAddType)} 
              disabled={!selectedProgram}
              className="btn-secondary py-3 px-6 flex items-center justify-center gap-2 flex-1 md:flex-none shadow-sm rounded-xl font-semibold"
            >
              <Plus size={16} strokeWidth={2} /> Book Type
            </button>
            <button 
              onClick={() => setShowAddBooks(!showAddBooks)} 
              disabled={!selectedProgram || bookTypes.length === 0}
              className="btn-primary py-3 px-6 flex items-center justify-center gap-2 flex-1 md:flex-none shadow-sm rounded-xl font-semibold"
            >
              <Plus size={16} strokeWidth={2} /> Generate Books
            </button>
          </div>
        </div>


        {/* Bulk Action Bar */}
        {selectedBookIds.length > 0 && (
          <div className="bg-brand-orange-dark text-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg slide-in-bottom">
            <span className="font-semibold text-sm tracking-wide">{selectedBookIds.length} Books Selected</span>
            <button 
              onClick={handleBulkDelete}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2} /> Delete Selected
            </button>
          </div>
        )}

        {/* Forms inline modals could go here. For MVP keeping them inline expands */}
        {showAddType && (
          <div className="card mb-10 border-brand-charcoal/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <h3 className="text-xl font-semibold tracking-tight mb-4">Manage Book Types</h3>
            
            {bookTypes.length > 0 && (
              <div className="mb-8 border border-black/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#fafafa] border-b border-black/5 text-brand-charcoal/50 uppercase font-semibold text-[10px] tracking-widest">
                    <tr>
                      <th className="px-5 py-3">Type Name</th>
                      <th className="px-5 py-3">Leaves</th>
                      <th className="px-5 py-3">Amount Type</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {bookTypes.map(t => (
                      <tr key={t._id}>
                        <td className="px-5 py-3 font-medium">{t.name}</td>
                        <td className="px-5 py-3">{t.leavesPerBook}</td>
                        <td className="px-5 py-3">{t.amountType} {t.amountType === 'Fixed' && `(₹${t.fixedAmount})`}</td>
                        <td className="px-5 py-3 text-right">
                           <button onClick={() => handleDeleteBookType(t._id)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded text-xs font-medium transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-charcoal/60 border-t border-black/5 pt-6">Add New Type</h4>
            <form onSubmit={handleCreateType} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/50">Name</label>
                <input required type="text" className="input-field" placeholder="e.g. Gift Coupon" value={typeForm.name} onChange={e => setTypeForm({...typeForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/50">Leaves Per Book</label>
                <input required type="number" min="1" className="input-field" value={typeForm.leavesPerBook} onChange={e => setTypeForm({...typeForm, leavesPerBook: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/50">Amount Type</label>
                <select className="input-field" value={typeForm.amountType} onChange={e => setTypeForm({...typeForm, amountType: e.target.value})}>
                  <option value="Fixed">Fixed Amount</option>
                  <option value="Custom">Custom Amount</option>
                </select>
              </div>
              {typeForm.amountType === 'Fixed' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/50">Fixed Amount (₹)</label>
                  <input required type="number" min="1" className="input-field" value={typeForm.fixedAmount} onChange={e => setTypeForm({...typeForm, fixedAmount: e.target.value})} />
                </div>
              )}
              <div className="md:col-span-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddType(false)} className="btn-secondary px-6">Cancel</button>
                <button type="submit" className="btn-primary px-8">Save Type</button>
              </div>
            </form>
          </div>
        )}

        {showAddBooks && (
          <div className="card mb-10 bg-orange-50/50 border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-semibold tracking-tight mb-6 text-brand-orange-dark">Generate Inventory</h3>
            <form onSubmit={handleGenerateBooks} className="grid grid-cols-1 md:grid-cols-3 gap-6 border-l-2 border-brand-orange pl-6 -ml-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-orange/60">Generate From Book Type</label>
                <select required className="input-field bg-white border-black/[0.03]" value={inventoryForm.bookType} onChange={e => setInventoryForm({...inventoryForm, bookType: e.target.value})}>
                  {bookTypes.map(t => <option key={t._id} value={t._id}>{t.name} ({t.amountType})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-orange/60">Start Number (e.g. 101)</label>
                <input required type="number" min="1" className="input-field bg-white border-black/[0.03]" value={inventoryForm.startNumber} onChange={e => setInventoryForm({...inventoryForm, startNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-orange/60">Count to Generate</label>
                <input required type="number" min="1" max="500" className="input-field bg-white border-black/[0.03]" value={inventoryForm.count} onChange={e => setInventoryForm({...inventoryForm, count: e.target.value})} />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddBooks(false)} className="btn-secondary px-6 bg-white">Cancel</button>
                <button type="submit" className="btn-primary px-8">Generate</button>
              </div>
            </form>
          </div>
        )}

        {/* Books List Formatted Table */}
        <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/[0.04] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fafafa] border-b border-black/[0.03] text-brand-charcoal/50 uppercase font-semibold text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-5">
                    <input 
                      type="checkbox" 
                      className="rounded border-black/20 text-brand-orange focus:ring-brand-orange"
                      checked={books.filter(b => b.status === 'Available').length > 0 && selectedBookIds.length === books.filter(b => b.status === 'Available').length}
                      onChange={toggleAllSelection}
                      disabled={books.filter(b => b.status === 'Available').length === 0}
                    />
                  </th>
                  <th className="px-8 py-5">Book No.</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Assignment</th>
                  <th className="px-8 py-5 text-right">Collection</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {loading ? (
                  <tr><td colSpan="7" className="px-8 py-12 text-center text-brand-charcoal/40 font-medium">Loading inventory...</td></tr>
                ) : books.length === 0 ? (
                  <tr><td colSpan="7" className="px-8 py-16 text-center text-brand-charcoal/40 font-medium text-lg tracking-tight">No books generated for this program yet.</td></tr>
                ) : (
                  books.map(book => (
                    <tr key={book._id} className="hover:bg-black/[0.01] transition-colors group">
                      <td className="px-8 py-5">
                        <input 
                          type="checkbox" 
                          className="rounded border-black/20 text-brand-orange focus:ring-brand-orange disabled:opacity-30 disabled:cursor-not-allowed"
                          checked={selectedBookIds.includes(book._id)}
                          onChange={() => toggleBookSelection(book._id)}
                          disabled={book.status !== 'Available'}
                        />
                      </td>
                      <td className="px-8 py-5 font-mono font-medium text-brand-charcoal">#{book.bookNumber}</td>
                      <td className="px-8 py-5">
                        {book.bookType ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-brand-charcoal">{book.bookType.name}</div>
                            {book.bookType.amountType === 'Fixed' && (
                              <div className="text-[10px] text-brand-charcoal/50 uppercase font-semibold mt-0.5 tracking-wider">Fixed: ₹{book.bookType.fixedAmount} × {book.bookType.leavesPerBook} L</div>
                            )}
                            {book.bookType.amountType === 'Custom' && (
                              <div className="text-[10px] text-brand-charcoal/50 uppercase font-semibold mt-0.5 tracking-wider">Custom ({book.bookType.leavesPerBook} L)</div>
                            )}
                          </div>
                        ) : book.typeMismatch ? (
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded text-[10px] uppercase tracking-wider font-bold">Wrong program type</span>
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] uppercase tracking-wider font-bold">Deleted Type</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${getStatusColor(book.status)}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {book.status === 'Available' ? (
                          assignBookId === book._id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <div className="max-h-32 overflow-y-auto border border-black/10 rounded-lg p-2 bg-white flex flex-col gap-1">
                                {users.map(u => (
                                  <label key={u._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1 hover:bg-black/5 rounded">
                                    <input 
                                      type="checkbox" 
                                      className="rounded border-black/20 text-brand-orange focus:ring-brand-orange"
                                      checked={assignUserIds.includes(u._id)}
                                      onChange={(e) => {
                                        if (e.target.checked) setAssignUserIds([...assignUserIds, u._id]);
                                        else setAssignUserIds(assignUserIds.filter(id => id !== u._id));
                                      }}
                                    />
                                    {u.name} {u.role === 'Executive' ? '' : '(Tr)'}
                                  </label>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleAssign(book._id)} disabled={assignUserIds.length === 0} className="text-blue-600 hover:text-blue-800 py-1 px-4 bg-blue-50 rounded-lg flex-1 flex justify-center disabled:opacity-50 transition-colors"><UserCheck size={16} strokeWidth={1.5} /></button>
                                <button onClick={() => setAssignBookId(null)} className="text-brand-charcoal/40 hover:text-brand-charcoal py-1 px-3 rounded-lg hover:bg-black/5 flex justify-center transition-colors">×</button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setAssignBookId(book._id); setAssignUserIds([]); }}
                              className="text-brand-orange text-xs font-semibold hover:underline"
                            >
                              Assign Member(s)
                            </button>
                          )
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold tracking-tight text-brand-charcoal">
                              {book.assignedTo?.length > 1 ? `${book.assignedTo[0]?.name} +${book.assignedTo.length - 1} more` : (book.assignedTo?.[0]?.name || 'Unknown')}
                            </span>
                            <span className="text-[10px] uppercase font-medium tracking-wider text-brand-charcoal/40 mt-0.5">Issued: {new Date(book.issueDate).toLocaleDateString('en-GB')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 font-mono text-emerald-600 font-semibold text-right">
                        {book.collectionAmount > 0 ? `₹${book.collectionAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {editBookId === book._id ? (
                          <form onSubmit={(e) => handleSaveAssignmentEdit(e, book._id)} className="flex flex-col gap-2 items-end min-w-[200px] bg-white p-3 rounded-xl border border-black/10 shadow-lg absolute right-6 z-10">
                            <div className="text-xs font-semibold text-brand-charcoal/50 uppercase w-full text-left mb-1">Edit Assignment</div>
                            
                            <select 
                              className="input-field py-1 px-2 text-xs w-full"
                              value={editAssignmentData.status}
                              onChange={(e) => setEditAssignmentData({...editAssignmentData, status: e.target.value})}
                            >
                              <option value="Assigned">Assigned</option>
                              <option value="Returned">Returned</option>
                              <option value="Completed">Completed</option>
                            </select>
                            
                            <input 
                              type="number" min="0" placeholder="Amount (₹)"
                              className="input-field py-1 px-2 text-xs w-full text-left font-mono"
                              value={editAssignmentData.collectionAmount} 
                              onChange={(e) => setEditAssignmentData({...editAssignmentData, collectionAmount: e.target.value})}
                            />
                            
                            <div className="w-full max-h-24 overflow-y-auto border border-black/10 rounded overflow-hidden text-left bg-[#fafafa]">
                              {users.map(u => (
                                <label key={u._id} className="flex items-center gap-2 text-[10px] font-medium cursor-pointer p-1.5 hover:bg-black/5 border-b border-black-[0.02]">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-black/20 text-brand-orange focus:ring-brand-orange"
                                    checked={editAssignmentData.assignedTo.includes(u._id)}
                                    onChange={(e) => {
                                      const newSelection = e.target.checked 
                                        ? [...editAssignmentData.assignedTo, u._id]
                                        : editAssignmentData.assignedTo.filter(id => id !== u._id);
                                      setEditAssignmentData({...editAssignmentData, assignedTo: newSelection});
                                    }}
                                  />
                                  {u.name}
                                </label>
                              ))}
                            </div>
                            
                            <div className="flex gap-2 w-full mt-1">
                              <button type="button" onClick={() => setEditBookId(null)} className="btn-secondary py-1 px-3 text-[10px] flex-1">Cancel</button>
                              <button type="submit" className="btn-primary py-1 px-3 text-[10px] flex-1">Save</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {book.status === 'Available' && (
                               <button onClick={() => handleDeleteBook(book._id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete unassigned book">
                                 <Trash2 size={16} strokeWidth={1.5} />
                               </button>
                            )}
                            {book.status === 'Assigned' && (
                              collectBookId === book._id ? (
                                <form onSubmit={(e) => handleCollection(e, book._id)} className="flex items-center justify-end gap-2">
                                  <input 
                                    type="number" min="1" required placeholder="Amount"
                                    className="input-field py-1.5 px-3 text-xs w-24 min-h-0 h-auto text-right font-mono"
                                    value={collectAmount} onChange={e => setCollectAmount(e.target.value)}
                                  />
                                  <button type="submit" className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 rounded-lg"><CircleDollarSign size={16} strokeWidth={1.5} /></button>
                                  <button type="button" onClick={() => setCollectBookId(null)} className="text-brand-charcoal/40 hover:text-brand-charcoal p-1.5 ml-1 hover:bg-black/5 rounded-lg">×</button>
                                </form>
                              ) : (
                                <button 
                                  onClick={() => { setCollectBookId(book._id); setCollectAmount(''); }}
                                  className="btn-secondary py-1.5 px-4 text-xs flex items-center gap-1.5 ml-auto rounded-[0.75rem] shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <CircleDollarSign size={14} strokeWidth={1.5} /> Record
                                </button>
                              )
                            )}
                            {(book.status === 'Assigned' || book.status === 'Returned' || book.status === 'Completed') && (
                               <button 
                                 onClick={() => handleEditAssignment(book)}
                                 className="text-blue-600 hover:text-blue-800 py-1.5 px-3 text-xs font-semibold hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  Edit
                               </button>
                            )}
                            {book.status !== 'Available' && book.collectionAmount === 0 && (
                               <button 
                                 onClick={() => handleUnassignBook(book._id)}
                                 className="text-red-500 hover:text-red-700 py-1.5 px-3 text-xs font-semibold hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                 title="Revert to Available"
                               >
                                  Unassign
                               </button>
                            )}
                            {(book.status === 'Returned' || book.status === 'Completed' || book.collectionAmount > 0) && (
                               <button 
                                 onClick={() => handleRevertCollection(book._id)}
                                 className="text-orange-600 hover:text-orange-800 py-1.5 px-3 text-xs font-semibold hover:bg-orange-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  Revert
                               </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookInventory;
