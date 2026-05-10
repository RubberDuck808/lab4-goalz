import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getGameState } from '../services/api';
import { completeGame as completeGameApi } from '../services/api/partyApi';
import { getUser } from '../services/session';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [partyId, setPartyId]     = useState(null);
  const [partyCode, setPartyCode] = useState(null);
  const [partyName, setPartyName] = useState(null);
  const [partyStatus, setPartyStatus] = useState('Lobby');
  const [members, setMembersState]   = useState([]);
  const [role, setRoleState]         = useState(null);
  const [visitedCheckpointIds, setVisited] = useState(new Set());
  const [pendingVisits, setPendingVisits] = useState([]);
  const [username, setUsername] = useState(null);
  const [gameConfig, setGameConfigState] = useState(null);

  // Keep a ref so the poll closure always sees the latest username without
  // needing to restart the interval every time username changes.
  const usernameRef = useRef(username);
  useEffect(() => { usernameRef.current = username; }, [username]);

  useEffect(() => {
    getUser().then(u => { if (u) setUsername(u.username); });
  }, []);

  // Expose a stable poll trigger so pages can request an immediate refresh
  // (e.g. right after the host calls startGame).
  const pollRef = useRef(null);
  const triggerPoll = useCallback(() => { pollRef.current?.(); }, []);

  useEffect(() => {
    if (!partyId) return;

    async function poll() {
      const res = await getGameState(partyId);
      if (!res.success || !res.data) return;

      const { members: serverMembers, status, visitedCheckpointIds: visited,
              groupSize, boundaryId, zoneCount, checkpointsPerZone, allowedRoles } = res.data;

      setPartyStatus(status);
      setMembersState(serverMembers.map(m => m.username));

      // Use the ref so we always have the latest username even if the effect
      // closure captured an earlier (possibly null) snapshot.
      const currentUsername = usernameRef.current;
      if (currentUsername) {
        const myRole = serverMembers.find(m => m.username === currentUsername)?.role;
        if (myRole) setRoleState(myRole);
      }

      setVisited(new Set(visited || []));
      setGameConfigState({ groupSize, boundaryId, zoneCount, checkpointsPerZone,
                           allowedRoles: allowedRoles ?? [] });
    }

    pollRef.current = poll;
    poll();
    const t = setInterval(() => {
      if (AppState.currentState === 'active') poll();
    }, 3000);
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') poll();
    });
    return () => { clearInterval(t); pollRef.current = null; appStateSub.remove(); };
  }, [partyId]);

  const setParty = useCallback((id, code, name, initial = []) => {
    setPartyId(id); setPartyCode(code); setPartyName(name); setMembersState(initial);
  }, []);

  const setMembers    = useCallback(m  => setMembersState(m), []);
  const setRole       = useCallback(r  => setRoleState(r), []);
  const setGameConfig = useCallback(c  => setGameConfigState(c), []);
  const markVisited     = useCallback(id => setVisited(prev => new Set([...prev, id])), []);
  const addPendingVisit = useCallback(id => setPendingVisits(prev => prev.includes(id) ? prev : [...prev, id]), []);

  const resetGame = useCallback(() => {
    setPartyId(null); setPartyCode(null); setPartyName(null); setPartyStatus('Lobby');
    setMembersState([]); setRoleState(null); setVisited(new Set()); setGameConfigState(null);
    setPendingVisits([]);
  }, []);

  const completeGame = useCallback(async (capturedPartyId, capturedVisits) => {
    if (capturedPartyId && capturedVisits.length > 0) {
      await completeGameApi(capturedPartyId, capturedVisits).catch(() => {});
    }
    resetGame();
  }, [resetGame]);

  return (
    <GameContext.Provider value={{
      partyId, partyCode, partyName, partyStatus, members, role, visitedCheckpointIds,
      pendingVisits, gameConfig, setParty, setMembers, setRole, setGameConfig,
      markVisited, addPendingVisit, resetGame, completeGame, triggerPoll,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used inside GameProvider');
  return ctx;
}
