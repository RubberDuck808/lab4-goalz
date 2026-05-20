import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import ManageElement from '../overview/ManageElement';
import ElementDetails from '../overview/ElementDetails';
import Loading from '../../Loading/Loading';
import { overviewService } from '../../../services/overviewService';

function ImageCell({ imageUrl }) {
  return imageUrl ? (
    <img src={imageUrl} alt="element" className="w-10 h-10 object-cover rounded-xl border border-border" />
  ) : (
    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary">
      <i className="fa-solid fa-image text-xs" />
    </div>
  );
}

function EmptyState({ icon = 'fa-inbox', iconColor = 'text-gray-300', message = 'No elements found', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center h-36 text-gray-400">
      <i className={`fa-solid ${icon} text-3xl mb-2 ${iconColor}`} />
      <p className="text-sm font-medium">{message}</p>
      {sub && <p className="text-xs">{sub}</p>}
    </div>
  );
}

export default function ElementsPanel({
  onCheckpointsChanged,
  pickedCoords,
  onCoordsConsumed,
  onEnableCoordPick,
  onDisableCoordPick,
  onFlyTo,
  setClickHandler,
  onPendingCountChanged,
}) {
  const [allElements, setAllElements] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [elementTypes, setElementTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [coordsPick, setCoordsPick] = useState(null);
  const [editingElement, setEditingElement] = useState(null);

  const pendingIds = useMemo(() => new Set(pendingItems.map(p => p.id)), [pendingItems]);
  const approvedElements = useMemo(() => allElements.filter(e => !pendingIds.has(e.id)), [allElements, pendingIds]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, pending, types] = await Promise.all([
        overviewService.getAllElements(),
        overviewService.getPendingElements(),
        overviewService.getElementTypes(),
      ]);
      setAllElements(overviewData?.element ?? []);
      setPendingItems(Array.isArray(pending) ? pending : []);
      setElementTypes(Array.isArray(types) ? types : []);
    } catch {
      toast.error('Failed to load elements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab]);

  // Sync coord pick mode
  useEffect(() => {
    if (showAddPanel) onEnableCoordPick();
    else if (!editingElement) onDisableCoordPick();
  }, [showAddPanel, editingElement]);

  // Sync panel exclusivity
  useEffect(() => { if (showAddPanel) { setEditingElement(null); setCoordsPick(null); } }, [showAddPanel]);
  useEffect(() => { if (editingElement) { setShowAddPanel(false); setCoordsPick(null); } }, [editingElement]);

  // Consume picked coords from MapDashboard
  useEffect(() => {
    if (!pickedCoords) return;
    if (showAddPanel) {
      setCoordsPick(pickedCoords);
      onCoordsConsumed();
    }
  }, [pickedCoords]);

  // Register map click handler (always fresh via ref)
  const clickRef = useRef();
  clickRef.current = (cp) => {
    if (cp.type === 'element') {
      const el = allElements.find(e => e.id === cp.referenceId);
      if (el && !pendingIds.has(el.id)) setEditingElement(el);
    }
  };
  useEffect(() => {
    setClickHandler((cp) => clickRef.current(cp));
    return () => setClickHandler(null);
  }, [setClickHandler]);

  const getTypeName = (el) => {
    if (!el) return '—';
    const t = el.elementType;
    if (!t) return '—';
    if (typeof t === 'object') return t.name ?? '—';
    return String(t);
  };

  const getLatLng = (el) => {
    if (el.latitude != null) return { lat: el.latitude, lng: el.longitude };
    const coords = el.geom?.coordinates;
    if (coords) return { lat: coords[1], lng: coords[0] };
    return null;
  };

  const applyFilters = useCallback((items) => {
    let result = items;
    if (search.trim()) result = result.filter(el => (el.elementName || '').toLowerCase().includes(search.toLowerCase()));
    if (typeFilter) result = result.filter(el => getTypeName(el) === typeFilter);
    return result;
  }, [search, typeFilter]);

  const filteredPending = useMemo(() => applyFilters(pendingItems), [applyFilters, pendingItems]);
  const filteredApproved = useMemo(() => applyFilters(approvedElements), [applyFilters, approvedElements]);
  const filteredAll = useMemo(() => {
    const enriched = allElements.map(el => ({
      ...el,
      isPending: pendingIds.has(el.id),
      pendingData: pendingItems.find(p => p.id === el.id),
    }));
    return applyFilters(enriched);
  }, [applyFilters, allElements, pendingIds, pendingItems]);

  const handleApprove = async (id) => {
    try {
      await overviewService.approveElement(id);
      toast.success('Element approved.');
      if (editingElement?.id === id) setEditingElement(null);
      await fetchData(); onCheckpointsChanged(); onPendingCountChanged?.();
    } catch (e) { toast.error(e.message || 'Failed to approve.'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this submission?')) return;
    try {
      await overviewService.rejectElement(id);
      toast.success('Submission rejected.');
      await fetchData(); onCheckpointsChanged(); onPendingCountChanged?.();
    } catch (e) { toast.error(e.message || 'Failed to reject.'); }
  };

  const handleDeleteApproved = async (el) => {
    if (!window.confirm(`Delete "${el.elementName}"?`)) return;
    try {
      await overviewService.deleteElement(el.id);
      toast.success('Element deleted.');
      if (editingElement?.id === el.id) setEditingElement(null);
      await fetchData(); onCheckpointsChanged();
    } catch (e) { toast.error(e.message || 'Failed to delete.'); }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve ${selectedIds.size} element(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => overviewService.approveElement(id)));
      toast.success(`${selectedIds.size} element(s) approved.`);
      setSelectedIds(new Set()); await fetchData(); onCheckpointsChanged(); onPendingCountChanged?.();
    } catch { toast.error('Some approvals failed.'); }
    finally { setBulkLoading(false); }
  };

  const handleBulkReject = async () => {
    if (!window.confirm(`Reject ${selectedIds.size} element(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => overviewService.rejectElement(id)));
      toast.success(`${selectedIds.size} element(s) rejected.`);
      setSelectedIds(new Set()); await fetchData(); onCheckpointsChanged(); onPendingCountChanged?.();
    } catch { toast.error('Some rejections failed.'); }
    finally { setBulkLoading(false); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPending.length && filteredPending.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredPending.map(p => p.id)));
  };

  const counts = { all: allElements.length, pending: pendingItems.length, approved: approvedElements.length };

  // Show add panel
  if (showAddPanel) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border bg-white shrink-0">
          <button onClick={() => { setShowAddPanel(false); setCoordsPick(null); }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary font-medium">
            <i className="fa-solid fa-arrow-left text-xs" /> Back to Elements
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ManageElement
            coordsPick={coordsPick}
            onCoordsConsumed={() => setCoordsPick(null)}
            onSaved={async () => { setShowAddPanel(false); setCoordsPick(null); await fetchData(); onCheckpointsChanged(); }}
            onCancel={() => { setShowAddPanel(false); setCoordsPick(null); }}
          />
        </div>
      </div>
    );
  }

  // Show edit panel
  if (editingElement) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border bg-white shrink-0">
          <button onClick={() => setEditingElement(null)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary font-medium">
            <i className="fa-solid fa-arrow-left text-xs" /> Back to Elements
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ElementDetails
            element={editingElement}
            onElementSaved={async () => { await fetchData(); onCheckpointsChanged(); setEditingElement(null); }}
            onElementDeleted={async () => { await fetchData(); onCheckpointsChanged(); setEditingElement(null); }}
            pickedCoords={pickedCoords}
            onCoordsConsumed={onCoordsConsumed}
            onEnableCoordPick={onEnableCoordPick}
            onDisableCoordPick={onDisableCoordPick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isLoading && <Loading />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-surface rounded-xl border border-border p-2 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-xl bg-game-blue-soft flex items-center justify-center mb-1.5 shrink-0">
            <i className="fa-solid fa-seedling text-game-blue text-xs" />
          </div>
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-0.5 leading-none">Total</p>
          <p className="text-sm font-extrabold text-text-primary leading-none">{counts.all}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-2 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-xl bg-game-amber-soft flex items-center justify-center mb-1.5 shrink-0">
            <i className="fa-solid fa-clock text-[#CC8B00] text-xs" />
          </div>
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-0.5 leading-none">Pending</p>
          <p className="text-sm font-extrabold text-[#CC8B00] leading-none">{counts.pending}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-2 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-xl bg-[#d1fae5] flex items-center justify-center mb-1.5 shrink-0">
            <i className="fa-solid fa-circle-check text-game-green text-xs" />
          </div>
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-0.5 leading-none">Approved</p>
          <p className="text-sm font-extrabold text-game-green leading-none">{counts.approved}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <div className="flex bg-surface border border-border p-1 rounded-xl text-xs gap-1 shadow-inner shrink-0">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: counts.pending > 0 ? `Pending (${counts.pending})` : 'Pending' },
            { key: 'approved', label: 'Approved' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1 font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === key
                  ? 'bg-game-blue-soft text-game-blue border border-game-blue/20 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[100px] px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-game-blue/30"
        />
        <button onClick={() => setShowAddPanel(true)}
          className="bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:opacity-90 transition shrink-0">
          <i className="fa-solid fa-plus" /> Add
        </button>
      </div>

      {/* Type filter */}
      {elementTypes.length > 0 && (
        <div className="px-4 pb-3">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/30 text-text-primary">
            <option value="">All types</option>
            {elementTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
      )}

      {/* Bulk bar */}
      {activeTab === 'pending' && selectedIds.size > 0 && (
        <div className="mx-4 mb-3 bg-game-amber-soft border border-game-amber/30 rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap text-xs">
          <p className="text-[#CC8B00] font-medium">{selectedIds.size} selected</p>
          <button onClick={handleBulkApprove} disabled={bulkLoading} className="bg-game-green border-b-[3px] border-game-green-border text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">Approve all</button>
          <button onClick={handleBulkReject} disabled={bulkLoading} className="bg-game-red border-b-[3px] border-game-red-dark text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">Reject all</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-text-secondary hover:text-text-primary">Clear</button>
        </div>
      )}

      {/* List */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 pb-8">

          {/* All tab */}
          {activeTab === 'all' && (
            filteredAll.length === 0 ? <EmptyState /> :
            filteredAll.map(el => {
              const coords = getLatLng(el);
              return (
                <div
                  key={el.id}
                  onClick={() => { if (coords) onFlyTo?.(coords); }}
                  className="bg-white rounded-xl border border-border p-4 flex gap-3 items-start cursor-pointer hover:shadow-md hover:border-game-blue/40 transition-all"
                >
                  <ImageCell imageUrl={el.imageUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{el.elementName}</p>
                    <p className="text-xs text-text-secondary capitalize">{getTypeName(el)}</p>
                    {coords && <p className="text-xs text-text-secondary mt-0.5">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {el.isPending ? (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(el.id); }} className="px-3 py-1.5 bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-semibold rounded-lg">Approve</button>
                          <button onClick={(e) => { e.stopPropagation(); handleReject(el.id); }} className="px-3 py-1.5 bg-game-red border-b-[3px] border-game-red-dark text-white text-xs font-semibold rounded-lg">Reject</button>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-game-amber-soft text-[#CC8B00]">Pending</span>
                        </>
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setEditingElement(el); }} className="px-3 py-1.5 bg-game-blue border-b-[3px] border-game-blue-border text-white text-xs font-semibold rounded-lg">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteApproved(el); }} className="px-3 py-1.5 bg-game-red border-b-[3px] border-game-red-dark text-white text-xs font-semibold rounded-lg">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pending tab */}
          {activeTab === 'pending' && (
            filteredPending.length === 0
              ? <EmptyState icon="fa-check-circle" iconColor="text-game-green" message="No pending submissions" sub="All submissions have been reviewed." />
              : <>
                  <label className="flex items-center gap-2 text-xs text-text-secondary px-1 cursor-pointer">
                    <input type="checkbox" checked={selectedIds.size === filteredPending.length && filteredPending.length > 0} onChange={toggleSelectAll} />
                    Select all
                  </label>
                  {filteredPending.map(el => (
                    <div
                      key={el.id}
                      onClick={() => { if (el.latitude != null) onFlyTo?.({ lat: el.latitude, lng: el.longitude }); }}
                      className={`bg-white rounded-xl border p-4 flex gap-3 items-start cursor-pointer hover:shadow-md hover:border-game-blue/40 transition-all ${selectedIds.has(el.id) ? 'border-game-amber bg-game-amber-soft/40' : 'border-border'}`}
                    >
                      <input type="checkbox" checked={selectedIds.has(el.id)} onChange={() => toggleSelect(el.id)} onClick={(e) => e.stopPropagation()} className="mt-1 cursor-pointer" />
                      <ImageCell imageUrl={el.imageUrl} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-text-primary truncate">{el.elementName}</p>
                        <p className="text-xs text-text-secondary capitalize">{el.elementType}</p>
                        <p className="text-xs text-text-secondary">{el.submittedBy ?? '—'} · {new Date(el.createdAt).toLocaleDateString()}</p>
                        <button onClick={(e) => { e.stopPropagation(); onFlyTo({ lat: el.latitude, lng: el.longitude }); }}
                          className="text-game-blue hover:underline text-xs mt-1 flex items-center gap-1">
                          <i className="fa-solid fa-map-pin text-[10px]" /> View on map
                        </button>
                        <div className="flex gap-2 mt-3">
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(el.id); }} className="px-3 py-1.5 bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-semibold rounded-lg">Approve</button>
                          <button onClick={(e) => { e.stopPropagation(); handleReject(el.id); }} className="px-3 py-1.5 bg-game-red border-b-[3px] border-game-red-dark text-white text-xs font-semibold rounded-lg">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
          )}

          {/* Approved tab */}
          {activeTab === 'approved' && (
            filteredApproved.length === 0 ? <EmptyState /> :
            filteredApproved.map(el => {
              const coords = getLatLng(el);
              const isEditing = editingElement?.id === el.id;
              return (
                <div
                  key={el.id}
                  onClick={() => { if (coords) onFlyTo?.(coords); }}
                  className={`bg-white rounded-xl border p-4 flex gap-3 items-start cursor-pointer hover:shadow-md hover:border-game-blue/40 transition-all ${isEditing ? 'border-game-blue bg-game-blue-soft/30' : 'border-border'}`}
                >
                  <ImageCell imageUrl={el.imageUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{el.elementName}</p>
                    <p className="text-xs text-text-secondary capitalize">{getTypeName(el)}</p>
                    {coords && <p className="text-xs text-text-secondary mt-0.5">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
                    <div className="flex gap-2 mt-3">
                      <button onClick={(e) => { e.stopPropagation(); setEditingElement(el); }} className="px-3 py-1.5 bg-game-blue border-b-[3px] border-game-blue-border text-white text-xs font-semibold rounded-lg">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteApproved(el); }} className="px-3 py-1.5 bg-game-red border-b-[3px] border-game-red-dark text-white text-xs font-semibold rounded-lg">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
