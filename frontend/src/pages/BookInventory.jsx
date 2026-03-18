import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { 
  ArrowLeft, 
  UserCheck, 
  Plus, 
  CircleDollarSign, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Receipt, 
  Users2, 
  X,
  Edit3,
  Calendar,
  Settings,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusColor = (status) => {
  switch(status) {
    case 'Available': return 'bg-gray-100 text-gray-700';
    case 'In Progress':
    case 'ASSIGNED': return 'bg-blue-100/10 text-blue-400 border border-blue-500/20';
    case 'Partial': return 'bg-yellow-100/10 text-yellow-400 border border-yellow-500/20';
    case 'Returned': return 'bg-orange-100 text-orange-700';
    case 'Completed': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const BookRow = React.memo(({ book, users, isSelected, onToggleSelect, onDelete, onAssign, onCollect, onEditSave, onUnassign, onRevert }) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignUserIds, setAssignUserIds] = useState([]);
  
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ assignedTo: [], collectionAmount: 0, status: 'In Progress' });

  const startAssign = () => { setIsAssigning(true); setAssignUserIds([]); };
  const startCollect = () => { setIsCollecting(true); setCollectAmount(''); };
  const startEdit = () => {
    setIsEditing(true);
    setEditData({
      assignedTo: book.assignedTo ? book.assignedTo.map(u => u._id || u) : [],
      collectionAmount: book.collectionAmount || 0,
      status: book.status
    });
  };

  const handleAssignSubmit = () => {
    onAssign(book._id, assignUserIds);
    setIsAssigning(false);
  };
  
  const handleCollectSubmit = (e) => {
    e.preventDefault();
    onCollect(book._id, collectAmount);
    setIsCollecting(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEditSave(book._id, editData);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-brand-border/20 transition-colors group relative">
      <td className="px-2 md:px-8 py-5">
        <input 
          type="checkbox" 
          className="rounded border-brand-border text-brand-orange focus:ring-brand-orange disabled:opacity-30 disabled:cursor-not-allowed"
          checked={isSelected}
          onChange={() => onToggleSelect(book._id)}
          disabled={book.status !== 'Available'}
        />
      </td>
      <td className="px-2 md:px-4 py-5 font-mono font-medium text-white">#{book.bookNumber}</td>
      <td className="px-2 md:px-4 py-5">
        {book.bookType ? (
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-white text-xs">{book.bookType.name}</div>
            {book.bookType.amountType === 'Fixed' && (
              <div className="text-[9px] text-white/40 uppercase font-bold tracking-tight">₹{book.bookType.fixedAmount} × {book.bookType.leavesPerBook} L</div>
            )}
            {book.bookType.amountType === 'Custom' && (
              <div className="text-[9px] text-white/40 uppercase font-bold tracking-tight">Custom ({book.bookType.leavesPerBook} L)</div>
            )}
          </div>
        ) : book.typeMismatch ? (
          <div className="flex flex-col gap-1">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] uppercase font-bold">Wrong program type</span>
          </div>
        ) : (
          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[9px] uppercase font-bold">Deleted Type</span>
        )}
      </td>
      <td className="px-2 md:px-4 py-5">
        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${getStatusColor(book.status)}`}>
          {book.status}
        </span>
      </td>
      <td className="px-2 md:px-4 py-5">
        {book.status === 'Available' ? (
          isAssigning ? (
            <div className="flex flex-col gap-1 min-w-[150px]">
              <div className="max-h-24 overflow-y-auto border border-brand-border/30 rounded-lg p-1.5 bg-brand-card-bg flex flex-col gap-0.5">
                {users.map(u => (
                  <label key={u._id} className="flex items-center gap-2 text-[10px] font-medium cursor-pointer p-1 hover:bg-white/5 rounded">
                    <input 
                      type="checkbox" 
                      className="rounded border-brand-border/40 text-brand-orange focus:ring-brand-orange"
                      checked={assignUserIds.includes(u._id)}
                      onChange={(e) => {
                        if (e.target.checked) setAssignUserIds([...assignUserIds, u._id]);
                        else setAssignUserIds(assignUserIds.filter(id => id !== u._id));
                      }}
                    />
                    {u.name}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleAssignSubmit} disabled={assignUserIds.length === 0} className="text-emerald-400 hover:text-emerald-200 py-1 px-3 bg-emerald-500/10 rounded flex-1 text-[10px] font-bold disabled:opacity-30">Assign</button>
                <button onClick={() => setIsAssigning(false)} className="text-white/30 hover:text-white px-2 py-1 text-xs">×</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={startAssign}
              className="text-brand-orange text-[11px] font-bold hover:text-brand-orange-light transition-colors"
            >
              Assign Member(s)
            </button>
          )
        ) : (
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">
              {book.assignedTo?.length > 1 ? `${book.assignedTo[0]?.name} +${book.assignedTo.length - 1}` : (book.assignedTo?.[0]?.name || 'Unknown')}
            </span>
            <span className="text-[9px] font-bold text-white/30 uppercase mt-0.5 tracking-tight">Issued: {new Date(book.issueDate).toLocaleDateString('en-GB')}</span>
          </div>
        )}
      </td>
      <td className="px-2 md:px-4 py-5 font-mono text-emerald-400 font-bold text-right text-xs">
        {book.collectionAmount > 0 ? `₹${book.collectionAmount.toLocaleString('en-IN')}` : '-'}
      </td>
      <td className="px-2 md:px-4 py-5 text-right relative min-w-[124px]">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 items-end min-w-[200px] bg-brand-card-bg p-3 rounded-xl border border-brand-border shadow-lg absolute right-2 md:right-6 z-10">
            <div className="text-xs font-semibold text-white/50 uppercase w-full text-left mb-1">Edit Assignment</div>
            <select 
              className="input-field py-1 px-2 text-xs w-full"
              value={editData.status}
              onChange={(e) => setEditData({...editData, status: e.target.value})}
            >
              <option value="In Progress">In Progress</option>
              <option value="Returned">Returned</option>
              <option value="Completed">Completed</option>
            </select>
            <input 
              type="number" min="0" placeholder="Amount (₹)"
              className="input-field py-1 px-2 text-xs w-full text-left font-mono"
              value={editData.collectionAmount} 
              onChange={(e) => setEditData({...editData, collectionAmount: e.target.value})}
            />
            <div className="w-full max-h-24 overflow-y-auto border border-brand-border/30 rounded overflow-hidden text-left bg-brand-card-bg/60">
              {users.map(u => (
                <label key={u._id} className="flex items-center gap-2 text-[10px] font-medium cursor-pointer p-1.5 hover:bg-white/10 border-b border-brand-border/20">
                  <input 
                    type="checkbox" 
                    className="rounded border-brand-border/40 text-brand-orange focus:ring-brand-orange"
                    checked={editData.assignedTo.includes(u._id)}
                    onChange={(e) => {
                      const newSelection = e.target.checked 
                        ? [...editData.assignedTo, u._id]
                        : editData.assignedTo.filter(id => id !== u._id);
                      setEditData({...editData, assignedTo: newSelection});
                    }}
                  />
                  {u.name}
                </label>
              ))}
            </div>
            <div className="flex gap-2 w-full mt-1">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary py-1 px-3 text-[10px] flex-1">Cancel</button>
              <button type="submit" className="btn-primary py-1 px-3 text-[10px] flex-1">Save</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
             {book.status === 'Available' && (
               <button onClick={() => onDelete(book._id)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-opacity" title="Delete unassigned book">
                 <Trash2 size={18} strokeWidth={1.5} />
               </button>
            )}
            {(book.status === 'In Progress' || book.status === 'Partial' || book.status === 'ASSIGNED' || book.status === 'Returned' || book.status === 'Completed') && (
              isCollecting ? (
                <form onSubmit={handleCollectSubmit} className="flex items-center justify-end gap-2 fixed bottom-6 right-6 md:absolute md:bottom-auto md:right-6 bg-brand-card-bg z-[60] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl border border-brand-border">
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] uppercase font-bold text-white/40 mr-1">Amount</span>
                    <input 
                      type="number" min="1" required placeholder="0" autoFocus
                      className="input-field py-2 px-3 text-sm w-28 text-right font-mono"
                      value={collectAmount} onChange={e => setCollectAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="submit" className="text-white p-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg"><CircleDollarSign size={20} strokeWidth={1.5} /></button>
                    <button type="button" onClick={() => setIsCollecting(false)} className="text-white/40 hover:text-white p-1 ml-1 hover:bg-white/10 rounded-lg text-xs">Cancel</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={startCollect}
                  className="btn-primary py-2 px-3 md:px-4 text-xs flex items-center gap-2 rounded-[0.75rem] shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  <CircleDollarSign size={16} strokeWidth={2} /> 
                  <span className="sm:inline font-bold">
                    {book.collectionAmount > 0 ? 'Update Amount' : 'Add Amount'}
                  </span>
                </button>
              )
            )}
            {(book.status === 'In Progress' || book.status === 'Partial' || book.status === 'ASSIGNED' || book.status === 'Returned' || book.status === 'Completed') && !isEditing && (
               <button 
                 onClick={startEdit}
                 className="text-white/70 hover:text-white py-2 px-3 text-[11px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
               >
                  Edit Book
               </button>
            )}
            {book.status !== 'Available' && book.collectionAmount === 0 && !isEditing && (
               <button 
                 onClick={() => onUnassign(book._id)}
                 className="text-red-400 hover:text-red-300 py-2 px-3 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                 title="Revert to Available"
               >
                  Unassign
               </button>
            )}
            {(book.status === 'Returned' || book.status === 'Completed' || book.collectionAmount > 0) && !isEditing && (
               <button 
                 onClick={() => onRevert(book._id)}
                 className="text-orange-400 hover:text-orange-300 py-2 px-3 text-xs font-bold hover:bg-orange-500/10 rounded-xl transition-all active:scale-95"
               >
                  Revert
               </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});

const MobileBookCard = React.memo(({ book, users, isSelected, onToggleSelect, onDelete, onAssign, onCollect, onEditSave, onUnassign, onRevert }) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignUserIds, setAssignUserIds] = useState([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ assignedTo: [], collectionAmount: 0, status: 'In Progress' });

  const startAssign = () => { setIsAssigning(true); setAssignUserIds([]); };
  const startCollect = () => { setIsCollecting(true); setCollectAmount(''); };
  const startEdit = () => {
    setIsEditing(true);
    setEditData({
      assignedTo: book.assignedTo ? book.assignedTo.map(u => u._id || u) : [],
      collectionAmount: book.collectionAmount || 0,
      status: book.status
    });
  };

  return (
    <div className="p-4 space-y-3">
      {/* Top row: checkbox + book number + status + collection */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {book.status === 'Available' && (
            <input
              type="checkbox"
              className="rounded border-brand-border text-brand-orange focus:ring-brand-orange mt-1"
              checked={isSelected}
              onChange={() => onToggleSelect(book._id)}
            />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-white text-sm">#{book.bookNumber}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] uppercase font-bold border ${getStatusColor(book.status)}`}>
                {book.status}
              </span>
            </div>
            {/* Type Info */}
            {book.bookType ? (
              <div className="mt-1">
                <span className="text-xs text-white/70 font-medium">{book.bookType.name}</span>
                {book.bookType.amountType === 'Fixed' && (
                  <span className="text-[9px] text-white/40 ml-1.5">₹{book.bookType.fixedAmount}×{book.bookType.leavesPerBook}L</span>
                )}
                {book.bookType.amountType === 'Custom' && (
                  <span className="text-[9px] text-white/40 ml-1.5">Custom ({book.bookType.leavesPerBook}L)</span>
                )}
              </div>
            ) : book.typeMismatch ? (
              <span className="text-[9px] text-amber-500 font-bold">Wrong program type</span>
            ) : (
              <span className="text-[9px] text-red-500 font-bold">Deleted Type</span>
            )}
          </div>
        </div>
        {/* Collection amount */}
        <div className="text-right shrink-0">
          <span className="font-mono text-emerald-400 font-bold text-sm">
            {book.collectionAmount > 0 ? `₹${book.collectionAmount.toLocaleString('en-IN')}` : '-'}
          </span>
        </div>
      </div>

      {/* Assignment Info */}
      {book.status !== 'Available' && book.assignedTo?.length > 0 && (
        <div className="text-xs text-white/60 bg-brand-dark-bg/40 px-3 py-2 rounded-lg border border-brand-border/20">
          <span className="font-semibold text-white/80">
            {book.assignedTo.length > 1 ? `${book.assignedTo[0]?.name} +${book.assignedTo.length - 1}` : (book.assignedTo[0]?.name || 'Unknown')}
          </span>
          <span className="text-[9px] text-white/30 uppercase ml-2">Issued: {new Date(book.issueDate).toLocaleDateString('en-GB')}</span>
        </div>
      )}

      {/* Assign inline (for Available books) */}
      {book.status === 'Available' && isAssigning && (
        <div className="bg-brand-dark-bg/40 p-3 rounded-xl border border-brand-border/20 space-y-2">
          <div className="max-h-32 overflow-y-auto space-y-1">
            {users.map(u => (
              <label key={u._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 hover:bg-white/5 rounded">
                <input
                  type="checkbox"
                  className="rounded border-brand-border/40 text-brand-orange focus:ring-brand-orange"
                  checked={assignUserIds.includes(u._id)}
                  onChange={(e) => {
                    if (e.target.checked) setAssignUserIds([...assignUserIds, u._id]);
                    else setAssignUserIds(assignUserIds.filter(id => id !== u._id));
                  }}
                />
                {u.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onAssign(book._id, assignUserIds); setIsAssigning(false); }} disabled={assignUserIds.length === 0} className="btn-primary py-2 px-4 text-xs flex-1 disabled:opacity-40">Assign</button>
            <button onClick={() => setIsAssigning(false)} className="btn-secondary py-2 px-4 text-xs flex-1">Cancel</button>
          </div>
        </div>
      )}

      {/* Collect inline */}
      {isCollecting && (
        <form onSubmit={(e) => { e.preventDefault(); onCollect(book._id, collectAmount); setIsCollecting(false); }} className="bg-brand-dark-bg/40 p-3 rounded-xl border border-brand-border/20 space-y-2">
          <input
            type="number" min="1" required placeholder="Enter amount" autoFocus
            className="input-field text-sm font-mono w-full"
            value={collectAmount} onChange={e => setCollectAmount(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary py-2 px-4 text-xs flex-1 bg-emerald-600 hover:bg-emerald-500">Record</button>
            <button type="button" onClick={() => setIsCollecting(false)} className="btn-secondary py-2 px-4 text-xs flex-1">Cancel</button>
          </div>
        </form>
      )}

      {/* Edit inline */}
      {isEditing && (
        <form onSubmit={(e) => { e.preventDefault(); onEditSave(book._id, editData); setIsEditing(false); }} className="bg-brand-dark-bg/40 p-3 rounded-xl border border-brand-border/20 space-y-2">
          <select
            className="input-field py-2 text-xs w-full"
            value={editData.status}
            onChange={(e) => setEditData({...editData, status: e.target.value})}
          >
            <option value="In Progress">In Progress</option>
            <option value="Returned">Returned</option>
            <option value="Completed">Completed</option>
          </select>
          <input
            type="number" min="0" placeholder="Amount (₹)"
            className="input-field py-2 text-xs w-full font-mono"
            value={editData.collectionAmount}
            onChange={(e) => setEditData({...editData, collectionAmount: e.target.value})}
          />
          <div className="max-h-24 overflow-y-auto border border-brand-border/30 rounded-lg bg-brand-card-bg/50">
            {users.map(u => (
              <label key={u._id} className="flex items-center gap-2 text-[10px] font-medium cursor-pointer p-2 hover:bg-white/10 border-b border-brand-border/10">
                <input
                  type="checkbox"
                  className="rounded border-brand-border/40 text-brand-orange focus:ring-brand-orange"
                  checked={editData.assignedTo.includes(u._id)}
                  onChange={(e) => {
                    const newSelection = e.target.checked
                      ? [...editData.assignedTo, u._id]
                      : editData.assignedTo.filter(id => id !== u._id);
                    setEditData({...editData, assignedTo: newSelection});
                  }}
                />
                {u.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-4 text-xs flex-1">Cancel</button>
            <button type="submit" className="btn-primary py-2 px-4 text-xs flex-1">Save</button>
          </div>
        </form>
      )}

      {/* Action Buttons */}
      {!isAssigning && !isCollecting && !isEditing && (
        <div className="flex flex-wrap gap-2">
          {book.status === 'Available' && !isAssigning && (
            <button onClick={startAssign} className="text-brand-orange text-xs font-bold px-3 py-2 bg-brand-orange/10 rounded-lg border border-brand-orange/20 active:scale-95 transition-transform">
              Assign
            </button>
          )}
          {book.status === 'Available' && (
            <button onClick={() => onDelete(book._id)} className="text-red-500 text-xs font-bold px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20 active:scale-95 transition-transform">
              Delete
            </button>
          )}
          {(book.status === 'In Progress' || book.status === 'Partial' || book.status === 'ASSIGNED' || book.status === 'Returned' || book.status === 'Completed') && !isCollecting && (
            <button
              onClick={startCollect}
              className="text-xs font-bold px-3 py-2 bg-emerald-600 text-white rounded-lg active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <CircleDollarSign size={14} />
              {book.collectionAmount > 0 ? 'Update' : 'Add'} Amt
            </button>
          )}
          {(book.status === 'In Progress' || book.status === 'Partial' || book.status === 'ASSIGNED' || book.status === 'Returned' || book.status === 'Completed') && !isEditing && (
            <button onClick={startEdit} className="text-xs font-bold px-3 py-2 bg-white/5 text-white/70 rounded-lg border border-white/10 active:scale-95 transition-transform">
              Edit
            </button>
          )}
          {book.status !== 'Available' && book.collectionAmount === 0 && !isEditing && (
            <button onClick={() => onUnassign(book._id)} className="text-xs font-bold px-3 py-2 text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 active:scale-95 transition-transform">
              Unassign
            </button>
          )}
          {(book.status === 'Returned' || book.status === 'Completed' || book.collectionAmount > 0) && !isEditing && (
            <button onClick={() => onRevert(book._id)} className="text-xs font-bold px-3 py-2 text-orange-400 bg-orange-500/10 rounded-lg border border-orange-500/20 active:scale-95 transition-transform">
              Revert
            </button>
          )}
        </div>
      )}
    </div>
  );
});

const BookInventory = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [books, setBooks] = useState([]);
  const [bookTypes, setBookTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [showAddType, setShowAddType] = useState(false);
  const [showAddBooks, setShowAddBooks] = useState(false);

  // Bulk operation state
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  const [inventoryForm, setInventoryForm] = useState({ bookType: '', startNumber: 1, count: 10 });

  const [typeForm, setTypeForm] = useState({ name: '', leavesPerBook: 50, amountType: 'Fixed', fixedAmount: 500 });

  // Finance Modal State
  const [showFinances, setShowFinances] = useState(false);
  const [financeType, setFinanceType] = useState('Expenses'); // 'Expenses' or 'Sponsors'
  const [financeForm, setFinanceForm] = useState({ description: '', name: '', amount: '', date: new Date().toISOString().split('T')[0], category: '' });
  const [isSavingFinance, setIsSavingFinance] = useState(false);

  const navigate = useNavigate();

  const handleSyncTotals = async () => {
    if (!selectedProgram) return;
    const loadingToast = toast.loading('Syncing program totals...');
    try {
      const token = localStorage.getItem('token');
      await api.get(`/programs/${selectedProgram}/recalculate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Totals synchronized successfully', { id: loadingToast });
      fetchInitialData();
    } catch (error) {
      toast.error('Failed to sync totals', { id: loadingToast });
    }
  };

  const currentProgram = programs.find(p => p._id === selectedProgram);

  const handleSaveFinance = async (e) => {
    e.preventDefault();
    setIsSavingFinance(true);
    try {
      const token = localStorage.getItem('token');
      // Normalize sponsorship endpoint: 'Expenses' -> 'expenses', 'Sponsors' -> 'sponsors'
      const normFinanceType = String(financeType).toLowerCase();
      const endpoint = normFinanceType === 'expenses' ? 'expenses' : 'sponsors';
      const payload = financeType === 'Expenses' 
        ? { description: financeForm.description, amount: Number(financeForm.amount), date: financeForm.date, category: financeForm.category }
        : { name: financeForm.name, amount: Number(financeForm.amount), date: financeForm.date, description: financeForm.description };
      
      await api.post(`/programs/${selectedProgram}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`${financeType.slice(0, -1)} added successfully`);
      setFinanceForm({ description: '', name: '', amount: '', date: new Date().toISOString().split('T')[0], category: '' });
      fetchInitialData();
    } catch (error) {
      toast.error('Failed to save finance record');
    } finally {
      setIsSavingFinance(false);
    }
  };

  const handleDeleteFinance = async (recordId) => {
    // Basic guard instead of window.confirm
    if (!recordId) return;
    try {
      const token = localStorage.getItem('token');
      const normFinanceType = String(financeType).toLowerCase();
      const endpoint = normFinanceType === 'expenses' ? 'expenses' : 'sponsors';
      await api.delete(`/programs/${selectedProgram}/${endpoint}/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted');
      fetchInitialData();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      setCurrentPage(1);
      fetchProgramData(selectedProgram, 1);
    } else {
      setBooks([]);
      setBookTypes([]);
      setInventoryForm(prev => ({ ...prev, bookType: '' }));
      setTotalCount(0);
      setTotalPages(1);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramData(selectedProgram, currentPage);
    }
  }, [currentPage]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [programsRes, usersRes] = await Promise.all([
        api.get('/programs', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPrograms(programsRes.data);
      setUsers(usersRes.data);
      if (programsRes.data.length > 0 && !selectedProgram) {
        setSelectedProgram(programsRes.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProgramData = async (programId, page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [typesRes, booksRes] = await Promise.all([
        api.get(`/books/types/${programId}`, { headers }),
        api.get(`/books/inventory/${programId}?page=${page}&limit=50`, { headers })
      ]);
      setBookTypes(typesRes.data);
      setBooks(booksRes.data.books);
      setTotalPages(booksRes.data.totalPages);
      setTotalCount(booksRes.data.totalCount);
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
      await api.post('/books/types', 
        { ...typeForm, program: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddType(false);
      toast.success('Book type created successfully');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch {
      toast.error('Failed to create book type');
    }
  };

  const handleGenerateBooks = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/books/inventory', 
        { 
          program: selectedProgram,
          bookType: inventoryForm.bookType,
          startNumber: parseInt(inventoryForm.startNumber),
          count: parseInt(inventoryForm.count)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddBooks(false);
      toast.success(`${inventoryForm.count} books added successfully`);
      fetchProgramData(selectedProgram, currentPage, true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate books');
    }
  };

  const handleAssign = useCallback(async (bookId, assignUserIds) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/books/${bookId}/assign`,
        { assignedTo: assignUserIds, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Book assigned successfully');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch {
      toast.error('Failed to assign book');
    }
  }, [selectedProgram, currentPage]);

  const handleCollection = useCallback(async (bookId, collectAmount) => {
    const book = books.find(b => b._id === bookId);
    if (book && book.bookType?.amountType === 'Fixed') {
       const maxPossible = Number(book.bookType.fixedAmount) * Number(book.bookType.leavesPerBook);
       const currentTotal = Number(book.collectionAmount || 0);
       const newCollection = Number(collectAmount);
       
       // Use Math.round to avoid floating point precision issues (e.g., 999.99999... > 1000)
       if (Math.round(currentTotal + newCollection) > Math.round(maxPossible)) {
          return toast.error(`Cannot collect more than the maximum book value of ₹${maxPossible}`);
       }
    }
    try {
      const token = localStorage.getItem('token');
      await api.post('/collections', 
        { 
          program: selectedProgram,
          couponBook: bookId,
          amount: parseFloat(collectAmount),
          markCompleted: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Collection recorded successfully');
      fetchProgramData(selectedProgram, currentPage, true);
      fetchInitialData(); // Refresh program stats
    } catch {
      toast.error('Failed to record collection');
    }
  }, [selectedProgram, currentPage, books]);

  const handleDeleteBookType = async (typeId) => {
    if (!window.confirm('Delete this book type?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/books/types/${typeId}`, {
        params: { programId: selectedProgram },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book type removed');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book type');
    }
  };

  const handleDeleteBook = useCallback(async (bookId) => {
    if (!window.confirm('Delete this coupon book?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/books/inventory/${bookId}`, {
        params: { programId: selectedProgram },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book removed');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  }, [selectedProgram, currentPage]);

  const handleBulkDelete = async () => {
    if (selectedBookIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedBookIds.length} selected coupon books?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.post('/books/inventory/bulk-delete',
        { bookIds: selectedBookIds, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedBookIds([]);
      toast.success('Books deleted successfully');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bulk-delete books');
    }
  };

  const toggleBookSelection = useCallback((id) => {
    setSelectedBookIds(prev =>
      prev.includes(id) ? prev.filter(bookId => bookId !== id) : [...prev, id]
    );
  }, []);

  const toggleAllSelection = () => {
    const availableBooks = books.filter(b => b.status === 'Available');
    if (selectedBookIds.length === availableBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(availableBooks.map(b => b._id));
    }
  };

  const handleRevertCollection = useCallback(async (bookId) => {
    if (!window.confirm('Revert the last collection for this book?')) return;
    try {
      const token = localStorage.getItem('token');
      const { data: collectionsResponse } = await api.get(`/collections/program/${selectedProgram}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const collectionsArray = collectionsResponse.collections || [];
      const latestCollection = collectionsArray.find(c => c.couponBook?._id === bookId || c.couponBook === bookId);
      
      if (!latestCollection) {
         return toast.error("No recent collection found to revert.");
      }
      await api.delete(`/collections/${latestCollection._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Collection record reverted');
      fetchProgramData(selectedProgram, currentPage, true);
      fetchInitialData(); // Refresh program stats
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to revert collection');
    }
  }, [selectedProgram, currentPage]);

  const handleSaveAssignmentEdit = useCallback(async (bookId, editAssignmentData) => {
    const book = books.find(b => b._id === bookId);
    if (book && book.bookType?.amountType === 'Fixed') {
       const maxPossible = Number(book.bookType.fixedAmount) * Number(book.bookType.leavesPerBook);
       const newAmount = Number(editAssignmentData.collectionAmount);
       if (Math.round(newAmount) > Math.round(maxPossible)) {
          return toast.error(`Amount cannot exceed the maximum book value of ₹${maxPossible}`);
       }
    }
    try {
      const token = localStorage.getItem('token');
      await api.put(`/books/inventory/${bookId}/assignment/edit`,
        { ...editAssignmentData, programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Assignment updated successfully');
      fetchProgramData(selectedProgram, currentPage, true);
      fetchInitialData(); // Refresh program stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    }
  }, [selectedProgram, currentPage, books]);

  const handleUnassignBook = useCallback(async (bookId) => {
    if (!window.confirm('Are you sure you want to unassign this book? It will return to inventory as "Available".')) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(`/books/inventory/${bookId}/unassign`, 
        { programId: selectedProgram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Book unassigned');
      fetchProgramData(selectedProgram, currentPage, true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unassign book');
    }
  }, [selectedProgram, currentPage]);

  return (
    <div className="min-h-screen pb-24 bg-brand-grey">
      <header className="bg-brand-card-bg/80 backdrop-blur-xl border-b border-brand-border/50 sticky top-0 z-50 px-4 sm:px-6 h-14 sm:h-[4.5rem] flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-brand-border/50 rounded-full text-white transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight m-0 text-white">Book Inventory</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-12">
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-12">
          <div className="w-full md:w-1/3">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Select Program Context</label>
            <select 
              className="input-field shadow-sm bg-brand-card-bg/50"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="" disabled>Select a program...</option>
              {programs.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 sm:gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowAddType(!showAddType)} 
              disabled={!selectedProgram}
              className="btn-secondary py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 flex-1 md:flex-none shadow-sm rounded-xl font-semibold text-sm"
            >
              <Plus size={16} strokeWidth={2} /> <span className="hidden sm:inline">Book</span> Type
            </button>
            <button 
              onClick={() => setShowAddBooks(!showAddBooks)} 
              disabled={!selectedProgram || bookTypes.length === 0}
              className="btn-primary py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 flex-1 md:flex-none shadow-sm rounded-xl font-semibold text-sm"
            >
              <Plus size={16} strokeWidth={2} /> Generate
            </button>
          </div>
        </div>

        {selectedProgram && currentProgram && (
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-12">
            <div className="card bg-brand-card-bg border-brand-border/30 p-3 sm:p-6 flex flex-col justify-between group shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 text-emerald-400 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 border border-emerald-500/20">
                  <CircleDollarSign size={16} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8px] sm:text-[10px] text-white/50 font-semibold uppercase tracking-widest">Collections</p>
                  <button 
                    onClick={handleSyncTotals}
                    className="p-0.5 sm:p-1 px-1 sm:px-2 text-[7px] sm:text-[9px] uppercase font-bold text-white/40 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-md sm:rounded-lg border border-white/10 hover:border-emerald-500/20 transition-all flex items-center gap-1"
                    title="Recalculate Totals"
                  >
                    <RotateCcw size={8} /> Sync
                  </button>
                </div>
                <h3 className="text-lg sm:text-3xl font-semibold text-emerald-400 tracking-tight">₹{currentProgram.totalMoneyCollected?.toLocaleString('en-IN') || 0}</h3>
              </div>
              <p className="text-[8px] sm:text-[10px] text-white/30 uppercase mt-2 sm:mt-4 font-bold tracking-tighter hidden sm:block">Coupon Book Income</p>
            </div>
            
            <button 
              onClick={() => { setFinanceType('Expenses'); setShowFinances(true); }}
              className="card bg-brand-card-bg border-brand-border/30 p-3 sm:p-6 flex flex-col justify-between text-left group hover:border-red-500/30 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/10 text-red-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                  <Receipt size={16} />
                </div>
                <p className="text-[8px] sm:text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-1">Expenses</p>
                <h3 className="text-lg sm:text-3xl font-semibold text-red-400 tracking-tight">₹{currentProgram.totalExpenses?.toLocaleString('en-IN') || 0}</h3>
              </div>
              <p className="text-[8px] sm:text-[10px] text-white/30 uppercase mt-2 sm:mt-4 group-hover:text-white/50 transition-colors items-center gap-2 hidden sm:flex">Manage Expenses <ArrowLeft size={10} className="rotate-180" /></p>
            </button>

            <button 
              onClick={() => { setFinanceType('Sponsors'); setShowFinances(true); }}
              className="card bg-brand-card-bg border-brand-border/30 p-3 sm:p-6 flex flex-col justify-between text-left group hover:border-blue-500/30 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 text-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Users2 size={16} />
                </div>
                <p className="text-[8px] sm:text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-1">Sponsors</p>
                <h3 className="text-lg sm:text-3xl font-semibold text-blue-400 tracking-tight">₹{currentProgram.totalSponsorship?.toLocaleString('en-IN') || 0}</h3>
              </div>
              <p className="text-[8px] sm:text-[10px] text-white/30 uppercase mt-2 sm:mt-4 group-hover:text-white/50 transition-colors items-center gap-2 hidden sm:flex">Manage Sponsors <ArrowLeft size={10} className="rotate-180" /></p>
            </button>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedBookIds.length > 0 && (
          <div className="bg-brand-orange-dark text-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between shadow-lg slide-in-bottom">
            <span className="font-semibold text-xs sm:text-sm tracking-wide">{selectedBookIds.length} Selected</span>
            <button 
              onClick={handleBulkDelete}
              className="bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} strokeWidth={2} /> Delete
            </button>
          </div>
        )}

        {showAddType && (
          <div className="card mb-6 sm:mb-10 border-brand-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] slide-in-bottom">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-4 text-white">Manage Book Types</h3>
            {bookTypes.length > 0 && (
              <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-0 sm:border sm:border-brand-border/30 sm:rounded-xl sm:overflow-hidden">
                {/* Mobile: Card layout */}
                <div className="sm:hidden space-y-2">
                  {bookTypes.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-3 bg-brand-dark-bg/50 rounded-xl border border-brand-border/20">
                      <div>
                        <p className="font-medium text-white text-sm">{t.name}</p>
                        <p className="text-[10px] text-white/50">{t.leavesPerBook} leaves • {t.amountType} {t.amountType === 'Fixed' && `(₹${t.fixedAmount})`}</p>
                      </div>
                      <button onClick={() => handleDeleteBookType(t._id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Desktop: Table layout */}
                <table className="w-full text-left text-sm whitespace-nowrap hidden sm:table">
                  <thead className="bg-brand-dark-bg border-b border-brand-border/30 text-white/60 uppercase font-semibold text-[10px] tracking-widest">
                    <tr>
                      <th className="px-5 py-3">Type Name</th>
                      <th className="px-5 py-3">Leaves</th>
                      <th className="px-5 py-3">Amount Type</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {bookTypes.map(t => (
                      <tr key={t._id}>
                        <td className="px-5 py-3 font-medium text-white">{t.name}</td>
                        <td className="px-5 py-3 text-white/70">{t.leavesPerBook}</td>
                        <td className="px-5 py-3 text-white/70">{t.amountType} {t.amountType === 'Fixed' && `(₹${t.fixedAmount})`}</td>
                        <td className="px-5 py-3 text-right">
                           <button onClick={() => handleDeleteBookType(t._id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/20 rounded text-xs font-medium transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/60 border-t border-brand-border/30 pt-4 sm:pt-6">Add New Type</h4>
            <form onSubmit={handleCreateType} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Name</label>
                <input required type="text" className="input-field" placeholder="e.g. Gift Coupon" value={typeForm.name} onChange={e => setTypeForm({...typeForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Leaves</label>
                <input required type="number" min="1" className="input-field" value={typeForm.leavesPerBook} onChange={e => setTypeForm({...typeForm, leavesPerBook: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Amount Type</label>
                <select className="input-field" value={typeForm.amountType} onChange={e => setTypeForm({...typeForm, amountType: e.target.value})}>
                  <option value="Fixed">Fixed</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              {typeForm.amountType === 'Fixed' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Fixed (₹)</label>
                  <input required type="number" min="1" className="input-field" value={typeForm.fixedAmount} onChange={e => setTypeForm({...typeForm, fixedAmount: e.target.value})} />
                </div>
              )}
              <div className="col-span-2 sm:col-span-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
                <button type="button" onClick={() => setShowAddType(false)} className="btn-secondary px-6">Cancel</button>
                <button type="submit" className="btn-primary px-8">Save Type</button>
              </div>
            </form>
          </div>
        )}

        {showAddBooks && (
          <div className="card mb-6 sm:mb-10 border border-brand-orange/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] slide-in-bottom">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-4 sm:mb-6 text-white">Generate Inventory</h3>
            <form onSubmit={handleGenerateBooks} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 border-l-2 border-brand-orange/40 pl-4 sm:pl-6 -ml-3 sm:-ml-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Book Type</label>
                <select required className="input-field bg-brand-card-bg/50 border-brand-border/30" value={inventoryForm.bookType} onChange={e => setInventoryForm({...inventoryForm, bookType: e.target.value})}>
                  {bookTypes.map(t => <option key={t._id} value={t._id}>{t.name} ({t.amountType})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Start Number</label>
                <input required type="number" min="1" className="input-field bg-brand-card-bg/50 border-brand-border/30" value={inventoryForm.startNumber} onChange={e => setInventoryForm({...inventoryForm, startNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Count</label>
                <input required type="number" min="1" max="500" className="input-field bg-brand-card-bg/50 border-brand-border/30" value={inventoryForm.count} onChange={e => setInventoryForm({...inventoryForm, count: e.target.value})} />
              </div>
              <div className="sm:col-span-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
                <button type="button" onClick={() => setShowAddBooks(false)} className="btn-secondary px-6">Cancel</button>
                <button type="submit" className="btn-primary px-8">Generate</button>
              </div>
            </form>
          </div>
        )}

        {/* Books List — Desktop: Table | Mobile: Cards */}
        <div className="bg-brand-card-bg rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.3)] border border-brand-border/50 overflow-hidden flex flex-col">
          {/* Desktop Table (hidden on mobile) */}
          <div className="overflow-x-auto flex-1 hidden md:block">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-brand-dark-bg border-b border-brand-border text-white/70 uppercase font-semibold text-[10px] tracking-widest">
                <tr>
                  <th className="px-2 md:px-8 py-5">
                    <input 
                      type="checkbox" 
                      className="rounded border-brand-border text-brand-orange focus:ring-brand-orange"
                      checked={books.filter(b => b.status === 'Available').length > 0 && selectedBookIds.length === books.filter(b => b.status === 'Available').length}
                      onChange={toggleAllSelection}
                      disabled={books.filter(b => b.status === 'Available').length === 0}
                    />
                  </th>
                  <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px]">Book No.</th>
                  <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px]">Type</th>
                  <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px]">Assignment</th>
                  <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Collection</th>
                   <th className="px-2 md:px-4 py-5 font-bold uppercase tracking-widest text-[10px] text-right min-w-[124px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30">
                {loading ? (
                  <tr><td colSpan="7" className="px-8 py-12 text-center text-white/50 font-medium">Loading inventory...</td></tr>
                ) : books.length === 0 ? (
                  <tr><td colSpan="7" className="px-8 py-16 text-center text-white/50 font-medium text-lg tracking-tight">No books found.</td></tr>
                ) : (
                  books.map(book => (
                    <BookRow 
                      key={book._id} 
                      book={book} 
                      users={users} 
                      isSelected={selectedBookIds.includes(book._id)}
                      onToggleSelect={toggleBookSelection}
                      onDelete={handleDeleteBook}
                      onAssign={handleAssign}
                      onCollect={handleCollection}
                      onEditSave={handleSaveAssignmentEdit}
                      onUnassign={handleUnassignBook}
                      onRevert={handleRevertCollection}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (visible only on mobile, hidden on md+) */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-4 text-center text-white/50 font-medium py-12">Loading inventory...</div>
            ) : books.length === 0 ? (
              <div className="p-4 text-center text-white/50 font-medium py-12 text-base">No books found.</div>
            ) : (
              <div className="divide-y divide-brand-border/20">
                {books.map(book => (
                  <MobileBookCard
                    key={book._id}
                    book={book}
                    users={users}
                    isSelected={selectedBookIds.includes(book._id)}
                    onToggleSelect={toggleBookSelection}
                    onDelete={handleDeleteBook}
                    onAssign={handleAssign}
                    onCollect={handleCollection}
                    onEditSave={handleSaveAssignmentEdit}
                    onUnassign={handleUnassignBook}
                    onRevert={handleRevertCollection}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-brand-border/30 bg-brand-card-bg flex items-center justify-between text-xs sm:text-sm">
              <div className="text-white/60 hidden sm:block">
                Showing {((currentPage - 1) * 50) + 1}–{Math.min(currentPage * 50, totalCount)} of {totalCount}
              </div>
              <div className="text-white/60 sm:hidden">
                {currentPage}/{totalPages}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-brand-border/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-3 py-1.5 font-semibold text-white/70">
                  {currentPage}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-brand-border/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Finance Management Modal */}
      {showFinances && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-brand-grey/80 backdrop-blur-sm" onClick={() => setShowFinances(false)}></div>
          <div className="card w-full sm:max-w-2xl bg-brand-card-bg border-brand-border/50 shadow-[0_20px_60px_rgb(0,0,0,0.5)] relative z-10 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] rounded-t-[1.5rem] sm:rounded-[1.5rem] rounded-b-none sm:rounded-b-[1.5rem] slide-in-bottom">
            <div className="p-4 sm:p-6 border-b border-brand-border/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Manage {financeType}</h3>
                <p className="text-[10px] sm:text-xs text-white/50">{financeType === 'Expenses' ? 'Track expenditures' : 'Record contributors'}</p>
              </div>
              <button onClick={() => setShowFinances(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Form to add new */}
              <form onSubmit={handleSaveFinance} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 bg-brand-dark-bg/50 p-3 sm:p-4 rounded-xl border border-brand-border/20">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                    {financeType === 'Expenses' ? 'Description' : 'Sponsor Name'}
                  </label>
                  <input 
                    required 
                    type="text" 
                    className="input-field py-2 text-sm" 
                    placeholder={financeType === 'Expenses' ? "e.g. Venue Rent" : "e.g. Acme Corp"} 
                    value={financeType === 'Expenses' ? financeForm.description : financeForm.name} 
                    onChange={e => setFinanceForm(f => ({ ...f, [financeType === 'Expenses' ? 'description' : 'name']: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Amount (₹)</label>
                  <input required type="number" className="input-field py-2 text-sm" value={financeForm.amount} onChange={e => setFinanceForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Date</label>
                  <input required type="date" className="input-field py-2 text-sm" value={financeForm.date} onChange={e => setFinanceForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                {financeType === 'Expenses' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Category</label>
                    <input type="text" className="input-field py-2 text-sm" placeholder="e.g. Logistics" value={financeForm.category} onChange={e => setFinanceForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Notes</label>
                    <input type="text" className="input-field py-2 text-sm" placeholder="Optional notes" value={financeForm.description} onChange={e => setFinanceForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                )}
                <div className="sm:col-span-2 flex justify-end pt-2">
                  <button type="submit" disabled={isSavingFinance} className="btn-primary py-2 px-6 text-sm font-semibold rounded-lg shadow-lg">
                    {isSavingFinance ? 'Saving...' : `Add ${financeType.slice(0, -1)}`}
                  </button>
                </div>
              </form>

              {/* List of existing */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1 mb-2">Recent Record History</h4>
                {financeType === 'Expenses' ? (
                  currentProgram.expenses?.length > 0 ? (
                    currentProgram.expenses.slice().reverse().map((e) => (
                      <div key={e._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-red-500/20 transition-colors">
                        <div>
                          <p className="font-semibold text-white tracking-tight">{e.description}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{e.category || 'General'} • {new Date(e.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-red-400">₹{e.amount.toLocaleString('en-IN')}</span>
                          <button onClick={() => handleDeleteFinance(e._id)} className="p-2 text-red-500/50 sm:text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-center py-8 text-white/20 text-sm italic">No expenses recorded yet.</p>
                ) : (
                  currentProgram.sponsors?.length > 0 ? (
                    currentProgram.sponsors.slice().reverse().map(s => (
                      <div key={s._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/20 transition-colors">
                        <div>
                          <p className="font-semibold text-white tracking-tight">{s.name}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-blue-400">₹{s.amount.toLocaleString('en-IN')}</span>
                          <button onClick={() => handleDeleteFinance(s._id)} className="p-2 text-red-500/50 sm:text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-center py-8 text-white/20 text-sm italic">No sponsorships recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookInventory;
