import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardNavBar from '../DashboardNavBar';
import Map from '../overview/Map';
import ManageElement from '../overview/ManageElement';
import ElementDetails from '../overview/ElementDetails';
import Loading from '../../Loading/Loading';
import { overviewService } from '../../../services/overviewService';

function isAllowedImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

function ImageCell({ imageUrl }) {
  return isAllowedImageUrl(imageUrl) ? (
    <img src={imageUrl} alt="element" className="w-12 h-12 object-cover rounded-md border border-gray-200" />
  ) : (
    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
      <i className="fa-solid fa-image" />
    </div>
  );
}

function EmptyState({ icon = 'fa-inbox', iconColor = 'text-gray-300', message = 'No elements found', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
      <i className={`fa-solid ${icon} text-4xl mb-3 ${iconColor}`} />
      <p className="text-base font-medium">{message}</p>
      {sub && <p className="text-sm">{sub}</p>}
    </div>
  );
}

export default function ElementManagement() {
  const [allElements, setAllElements] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
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

  const [mapFlyTo, setMapFlyTo] = useState(null);
  const [viewPin, setViewPin] = useState(null);

  // ── Derived sets ──────────────────────────────────────────────────────────
  const pendingIds = useMemo(() => new Set(pendingItems.map(p => p.id)), [pendingItems]);

  const approvedElements = useMemo(
    () => allElements.filter(e => !pendingIds.has(e.id)),
    [allElements, pendingIds]
  );

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, pending, cps, types] = await Promise.all([
        overviewService.getAllElements(),
        overviewService.getPendingElements(),
        overviewService.getCheckpoints(),
        overviewService.getElementTypes(),
      ]);
      setAllElements(overviewData?.element ?? []);
      setPendingItems(Array.isArray(pending) ? pending : []);
      setCheckpoints(Array.isArray(cps) ? cps : []);
      setElementTypes(Array.isArray(types) ? types : []);
    } catch {
      toast.error('Failed to load elements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Panel exclusivity ─────────────────────────────────────────────────────
  useEffect(() => {
    if (showAddPanel) { setEditingElement(null); setCoordsPick(null); setViewPin(null); }
  }, [showAddPanel]);

  useEffect(() => {
    if (editingElement) { setShowAddPanel(false); setCoordsPick(null); setViewPin(null); }
  }, [editingElement]);

  // Reset bulk selection when changing tabs
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab]);

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  // ── Filtering ─────────────────────────────────────────────────────────────
  const applyFilters = useCallback((items) => {
    let result = items;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(el => (el.elementName || '').toLowerCase().includes(s));
    }
    if (typeFilter) {
      result = result.filter(el => getTypeName(el) === typeFilter);
    }
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

  // ── Map handlers ──────────────────────────────────────────────────────────
  const handleCoordsPick = (c) => {
    if (showAddPanel) setCoordsPick(c);
  };

  const handleCheckpointClick = (cp) => {
    if (cp.type === 'element') {
      const el = allElements.find(e => e.id === cp.referenceId);
      if (el && !pendingIds.has(el.id)) setEditingElement(el);
    }
  };

  const handleCloseAll = () => {
    setShowAddPanel(false);
    setEditingElement(null);
    setCoordsPick(null);
    setViewPin(null);
  };

  const handleViewOnMap = (lat, lng) => {
    setShowAddPanel(false);
    setEditingElement(null);
    setViewPin({ lat, lng });
    setMapFlyTo({ lat, lng });
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await overviewService.approveElement(id);
      toast.success('Element approved.');
      if (editingElement?.id === id) setEditingElement(null);
      await fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to approve.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this submission?')) return;
    try {
      await overviewService.rejectElement(id);
      toast.success('Submission rejected.');
      await fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to reject.');
    }
  };

  const handleDeleteApproved = async (el) => {
    if (!window.confirm(`Delete "${el.elementName}"?`)) return;
    try {
      await overviewService.deleteElement(el.id);
      toast.success('Element deleted.');
      if (editingElement?.id === el.id) setEditingElement(null);
      await fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to delete.');
    }
  };

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve ${selectedIds.size} element(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => overviewService.approveElement(id)));
      toast.success(`${selectedIds.size} element(s) approved.`);
      setSelectedIds(new Set());
      await fetchData();
    } catch {
      toast.error('Some approvals failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (!window.confirm(`Reject ${selectedIds.size} element(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => overviewService.rejectElement(id)));
      toast.success(`${selectedIds.size} element(s) rejected.`);
      setSelectedIds(new Set());
      await fetchData();
    } catch {
      toast.error('Some rejections failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPending.length && filteredPending.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPending.map(p => p.id)));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const mapPickActive = showAddPanel;
  const pickedCoordsForMap = showAddPanel ? coordsPick : viewPin;

  const counts = {
    all: allElements.length,
    pending: pendingItems.length,
    approved: approvedElements.length,
  };

  return (
    <div className="flex flex-col h-full relative">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading && <Loading />}

      <DashboardNavBar title="Element Management" />

      <div className="p-4 md:p-5 flex flex-col gap-5 pb-10">

        {/* ── Map + side panel ── */}
        <div className="w-full flex flex-col lg:flex-row items-stretch gap-3">
          <div className="w-full h-[300px] sm:h-[375px] lg:flex-1">
            <Map
              showExtent={showAddPanel}
              setShowExtent={(v) => { if (v) setShowAddPanel(true); }}
              checkpoints={checkpoints}
              onCheckpointClick={handleCheckpointClick}
              closeModal={handleCloseAll}
              onCoordsPick={mapPickActive ? handleCoordsPick : null}
              pickedCoords={pickedCoordsForMap}
              flyTo={mapFlyTo}
            />
          </div>

          {(showAddPanel || editingElement) && (
            <div className="w-full lg:w-[340px] shrink-0">
              {showAddPanel && (
                <ManageElement
                  coordsPick={coordsPick}
                  onCoordsConsumed={() => {}}
                  onSaved={async () => { setShowAddPanel(false); setCoordsPick(null); await fetchData(); }}
                  onCancel={() => { setShowAddPanel(false); setCoordsPick(null); }}
                />
              )}
              {editingElement && (
                <ElementDetails
                  element={editingElement}
                  onElementSaved={async () => { await fetchData(); setEditingElement(null); }}
                  onElementDeleted={async () => { await fetchData(); setEditingElement(null); }}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-seedling text-green-600 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Elements</p>
              <p className="text-lg font-bold text-gray-800">{counts.all}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-clock text-amber-500 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-amber-500">{counts.pending}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-check text-blue-500 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-lg font-bold text-blue-500">{counts.approved}</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: counts.pending > 0 ? `Pending (${counts.pending})` : 'Pending' },
              { key: 'approved', label: 'Approved' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? 'bg-secondary-green text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">All types</option>
            {elementTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>

          <div className="flex-1" />

          <button
            onClick={() => setShowAddPanel(true)}
            className="bg-secondary-green text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition shrink-0"
          >
            <i className="fa-solid fa-plus" />
            Add Element
          </button>
        </div>

        {/* ── Bulk bar ── */}
        {activeTab === 'pending' && selectedIds.size > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-3 flex-wrap">
            <p className="text-sm text-amber-700 font-medium">{selectedIds.size} selected</p>
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-md disabled:opacity-50"
            >
              Approve selected
            </button>
            <button
              onClick={handleBulkReject}
              disabled={bulkLoading}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md disabled:opacity-50"
            >
              Reject selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">

            {/* All tab */}
            {activeTab === 'all' && (
              filteredAll.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Photo</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Green</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAll.map(el => {
                        const coords = getLatLng(el);
                        return (
                          <tr key={el.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3"><ImageCell imageUrl={el.imageUrl} /></td>
                            <td className="px-4 py-3 font-medium text-gray-800">{el.elementName}</td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{getTypeName(el)}</td>
                            <td className="px-4 py-3">
                              {el.isGreen
                                ? <span className="text-green-600 font-medium">Yes</span>
                                : <span className="text-gray-400">No</span>}
                            </td>
                            <td className="px-4 py-3">
                              {el.isPending ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                  <i className="fa-solid fa-clock text-[10px]" /> Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  <i className="fa-solid fa-check text-[10px]" /> Approved
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 flex-wrap">
                                {el.isPending ? (
                                  <>
                                    <button onClick={() => handleApprove(el.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors">Approve</button>
                                    <button onClick={() => handleReject(el.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors">Reject</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => setEditingElement(el)} className="px-3 py-1.5 bg-secondary-green text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity">Edit</button>
                                    <button onClick={() => handleDeleteApproved(el)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors">Delete</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Pending tab */}
            {activeTab === 'pending' && (
              filteredPending.length === 0 ? (
                <EmptyState icon="fa-check-circle" iconColor="text-green-400" message="No pending submissions" sub="All submissions have been reviewed." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredPending.length && filteredPending.length > 0}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Photo</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Submitted By</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPending.map(el => (
                        <tr key={el.id} className={`hover:bg-gray-50 ${selectedIds.has(el.id) ? 'bg-amber-50' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(el.id)}
                              onChange={() => toggleSelect(el.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3"><ImageCell imageUrl={el.imageUrl} /></td>
                          <td className="px-4 py-3 font-medium text-gray-800">{el.elementName}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{el.elementType}</td>
                          <td className="px-4 py-3 text-gray-600">{el.submittedBy ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(el.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            <div>{el.latitude.toFixed(5)}, {el.longitude.toFixed(5)}</div>
                            <button
                              onClick={() => handleViewOnMap(el.latitude, el.longitude)}
                              className="text-indigo-500 hover:underline text-xs mt-0.5 flex items-center gap-1"
                            >
                              <i className="fa-solid fa-map-pin text-[10px]" /> View on map
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(el.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors">Approve</button>
                              <button onClick={() => handleReject(el.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Approved tab */}
            {activeTab === 'approved' && (
              filteredApproved.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Photo</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Green</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApproved.map(el => {
                        const coords = getLatLng(el);
                        const isEditing = editingElement?.id === el.id;
                        return (
                          <tr key={el.id} className={`hover:bg-gray-50 ${isEditing ? 'ring-1 ring-inset ring-green-400 bg-green-50' : ''}`}>
                            <td className="px-4 py-3"><ImageCell imageUrl={el.imageUrl} /></td>
                            <td className="px-4 py-3 font-medium text-gray-800">{el.elementName}</td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{getTypeName(el)}</td>
                            <td className="px-4 py-3">
                              {el.isGreen
                                ? <span className="text-green-600 font-medium">Yes</span>
                                : <span className="text-gray-400">No</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => setEditingElement(el)} className="px-3 py-1.5 bg-secondary-green text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity">Edit</button>
                                <button onClick={() => handleDeleteApproved(el)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
