import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getGameState } from '../services/api';
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
  const [username, setUsername] = useState(null);
  const [gameConfig, setGameConfigState] = useState(null);

  useEffect(() => {
    getUser().then(u => { if (u) setUsername(u.username); });
  }, []);

  useEffect(() => {
    if (!partyId) return;
    async function poll() {
      const res = await getGameState(partyId);
      if (res.success && res.data) {
        setPartyStatus(res.data.status);
        setMembersState(res.data.members.map(m => m.username));
        if (username) {
          const myRole = res.data.members.find(m => m.username === username)?.role;
          if (myRole) setRoleState(myRole);
        }
        setVisited(new Set(res.data.visitedCheckpointIds || []));
        const { groupSize, boundaryId, zoneCount, checkpointsPerZone } = res.data;
        setGameConfigState({ groupSize, boundaryId, zoneCount, checkpointsPerZone });
      }
    }
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [partyId, username]);

  const setParty = useCallback((id, code, name, initial = []) => {
    setPartyId(id); setPartyCode(code); setPartyName(name); setMembersState(initial);
  }, []);

  const setMembers    = useCallback(m  => setMembersState(m), []);
  const setRole       = useCallback(r  => setRoleState(r), []);
  const setGameConfig = useCallback(c  => setGameConfigState(c), []);
  const markVisited   = useCallback(id => setVisited(prev => new Set([...prev, id])), []);
  const resetGame     = useCallback(() => {
    setPartyId(null); setPartyCode(null); setPartyName(null); setPartyStatus('Lobby');
    setMembersState([]); setRoleState(null); setVisited(new Set()); setGameConfigState(null);
  }, []);

  return (
    <GameContext.Provider value={{
      partyId, partyCode, partyName, partyStatus, members, role, visitedCheckpointIds,
      gameConfig, setParty, setMembers, setRole, setGameConfig, markVisited, resetGame,
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
