import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardNavBar from '../DashboardNavBar';
import { overviewService } from '../../../services/overviewService';

function timeAgo(dateStr) {
    if (!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function PendingElements() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [analysingIds, setAnalysingIds] = useState(new Set());

    useEffect(() => {
        overviewService.getPendingElements()
            .then(data => setItems(Array.isArray(data) ? data : []))
            .catch(e => toast.error(e.message || 'Failed to load pending elements.'))
            .finally(() => setLoading(false));
    }, []);

    async function handleApprove(id) {
        try {
            await overviewService.approveElement(id);
            setItems(prev => prev.filter(el => el.id !== id));
            toast.success('Element approved.');
        } catch (e) {
            toast.error(e.message || 'Failed to approve.');
        }
    }

    async function handleAnalyse(id, force = false) {
        setAnalysingIds(prev => new Set(prev).add(id));
        try {
            await overviewService.triggerAnalysis(id, force);
            setItems(prev => prev.map(el => el.id === id ? { ...el, aiResult: null, aiConfidence: null, aiSummary: null, aiClassification: null, analysedAt: null } : el));
            toast.info('AI analysis triggered — result will appear shortly.');
        } catch (e) {
            toast.error(e.message || 'Failed to trigger analysis.');
        } finally {
            setAnalysingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    }

    async function confirmReject() {
        const id = rejectTarget;
        setRejectTarget(null);
        try {
            await overviewService.rejectElement(id);
            setItems(prev => prev.filter(el => el.id !== id));
            toast.success('Submission rejected.');
        } catch (e) {
            toast.error(e.message || 'Failed to reject.');
        }
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000} />
            <DashboardNavBar title="Pending Submissions" />

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading…</p>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <i className="fa-solid fa-check-circle text-4xl mb-3 text-green-400"></i>
                        <p className="text-lg font-medium">No pending submissions</p>
                        <p className="text-sm">All submissions have been reviewed.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Photo</th>
                                    <th className="px-4 py-3 text-left">Element Name</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Submitted By</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">AI Review</th>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map(el => (
                                    <tr key={el.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {el.imageUrl ? (
                                                <img
                                                    src={el.imageUrl}
                                                    alt="submission"
                                                    className="w-14 h-14 object-cover rounded-md border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <i className="fa-solid fa-image"></i>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{el.elementName}</td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">{el.elementType}</td>
                                        <td className="px-4 py-3 text-gray-600">{el.submittedBy ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(el.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {el.aiResult ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            el.aiResult === 'AutoApprove' ? 'bg-green-100 text-green-700' :
                                                            el.aiResult === 'NeedsReview' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {el.aiResult === 'AutoApprove' ? 'Likely valid' :
                                                             el.aiResult === 'NeedsReview' ? 'Needs review' : 'Suspicious'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{Math.round((el.aiConfidence ?? 0) * 100)}%</span>
                                                    </div>
                                                    {el.aiClassification && (
                                                        <span className="text-xs text-indigo-600 font-medium capitalize">
                                                            <i className="fa-solid fa-tag mr-1 text-[10px]" />
                                                            {el.aiClassification.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                    {el.analysedAt && (
                                                        <span className="text-xs text-gray-400">
                                                            <i className="fa-solid fa-clock mr-1 text-[10px]" />
                                                            {timeAgo(el.analysedAt)}
                                                        </span>
                                                    )}
                                                    {el.aiSummary && (
                                                        <span className="text-xs text-gray-500 italic max-w-[180px]">{el.aiSummary}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Analysing…</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {el.latitude.toFixed(5)}, {el.longitude.toFixed(5)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(el.id)}
                                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectTarget(el.id)}
                                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                                {el.imageUrl && (
                                                    <button
                                                        onClick={() => handleAnalyse(el.id, !!el.aiResult)}
                                                        disabled={analysingIds.has(el.id)}
                                                        className={`px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                                                            el.aiResult ? 'bg-gray-400 hover:bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
                                                        }`}
                                                    >
                                                        {analysingIds.has(el.id) ? (
                                                            <><i className="fa-solid fa-spinner fa-spin"></i> Checking…</>
                                                        ) : el.aiResult ? (
                                                            <><i className="fa-solid fa-robot"></i> Re-check</>
                                                        ) : (
                                                            <><i className="fa-solid fa-robot"></i> Check with AI</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {rejectTarget !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-xl shadow-xl p-6 w-80 flex flex-col gap-4">
                    <h3 className="text-base font-semibold text-gray-800">Reject submission?</h3>
                    <p className="text-sm text-gray-500">This will reject the submission. The record is kept for AI training data.</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setRejectTarget(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReject}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        )}
    );
}
