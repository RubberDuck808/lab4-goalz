import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getGameState } from '../services/api';
import { completeGame as completeGameApi, completeSoloGame } from '../services/api/partyApi';
import { getUser } from '../services/session';
import { buildPartyConnection } from '../services/signalr';

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
  const [quizScore, setQuizScoreState] = useState(0);
  // postQuizZoneId: null = not in quiz flow; 0 = all zones done; N = advance to zone N
  const [postQuizZoneId, setPostQuizZoneId] = useState(null);
  const [username, setUsername] = useState(null);
  const [gameConfig, setGameConfigState] = useState(null);

  // Update ref inline during render so it's always current by the time any
  // event handler or effect reads it — avoids the one-render-cycle lag of useEffect.
  const usernameRef = useRef(null);
  usernameRef.current = username;

  useEffect(() => {
    getUser().then(u => { if (u) setUsername(u.username); });
  }, []);

  // Cache the last received member list so the deferred role useEffect below
  // can look up the role without an extra network call.
  const lastServerMembersRef = useRef([]);

  // Applies a GameStateResponse from either a hub push or the fallback poll.
  const applyServerState = useCallback((data) => {
    if (!data) return;
    const { members: serverMembers, status, visitedCheckpointIds: visited,
            groupSize, boundaryId, zoneCount, checkpointsPerZone, allowedRoles } = data;

    lastServerMembersRef.current = serverMembers ?? [];

    setPartyStatus(status);
    setMembersState(serverMembers.map(m => m.username));

    const currentUsername = usernameRef.current;
    if (currentUsername) {
      const myRole = serverMembers.find(m => m.username === currentUsername)?.role;
      if (myRole) setRoleState(myRole);
    }

    setVisited(new Set(visited || []));
    setGameConfigState({ groupSize, boundaryId, zoneCount, checkpointsPerZone,
                         allowedRoles: allowedRoles ?? [] });
  }, []);

  // When username loads after a SignalR push (race condition), apply role from
  // the cached member list immediately — no extra API call needed.
  useEffect(() => {
    if (!username || role) return;
    const myRole = lastServerMembersRef.current.find(m => m.username === username)?.role;
    if (myRole) setRoleState(myRole);
  }, [username, role]);

  // Expose a stable poll trigger so pages can force an immediate refresh
  // (e.g. right after the host calls startGame as a belt-and-braces flush).
  const pollRef = useRef(null);
  const triggerPoll = useCallback(() => { pollRef.current?.(); }, []);

  useEffect(() => {
    if (!partyId) return;

    let connection = null;
    let fallbackTimer = null;
    let appStateSub = null;
    let cancelled = false;

    // 30-second fallback poll — keeps state consistent if the hub connection drops
    // and hasn't reconnected yet. Much cheaper than the old 3-second interval.
    async function fallbackPoll() {
      if (cancelled) return;
      const res = await getGameState(partyId);
      if (!cancelled && res.success && res.data) applyServerState(res.data);
    }

    pollRef.current = fallbackPoll;

    function scheduleFallback() {
      clearTimeout(fallbackTimer);
      fallbackTimer = setTimeout(function tick() {
        if (cancelled) return;
        fallbackPoll().finally(() => {
          if (!cancelled) fallbackTimer = setTimeout(tick, 30000);
        });
      }, 30000);
    }

    async function start() {
      // Initial fetch so state is populated immediately on join.
      await fallbackPoll();
      if (cancelled) return;

      connection = buildPartyConnection();

      connection.on('MemberJoined',      (state) => { if (!cancelled) applyServerState(state); });
      connection.on('GameStarted',       (state) => { if (!cancelled) applyServerState(state); });
      connection.on('CheckpointVisited', (state) => { if (!cancelled) applyServerState(state); });
      // GameCompleted carries only { username } — full state not needed; the completing
      // player's own completeGame() call handles local teardown via resetGame().

      connection.onreconnected(() => {
        if (!cancelled) {
          connection.invoke('JoinPartyRoom', partyId).catch(() => {});
          fallbackPoll();
        }
      });

      try {
        await connection.start();
        if (cancelled) { connection.stop(); return; }
        await connection.invoke('JoinPartyRoom', partyId);
      } catch {
        // Hub unreachable — fallback poll carries the load.
      }

      // Start the fallback interval after the hub is up.
      scheduleFallback();

      appStateSub = AppState.addEventListener('change', state => {
        if (state === 'active' && !cancelled) fallbackPoll();
      });
    }

    start();

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      pollRef.current = null;
      appStateSub?.remove();
      if (connection) {
        connection.invoke('LeavePartyRoom', partyId).catch(() => {});
        connection.stop();
      }
    };
  }, [partyId, applyServerState]);

  const setParty = useCallback((id, code, name, initial = []) => {
    setPartyId(id); setPartyCode(code); setPartyName(name); setMembersState(initial);
  }, []);

  const setMembers    = useCallback(m  => setMembersState(m), []);
  const setRole       = useCallback(r  => setRoleState(r), []);
  const setGameConfig = useCallback(c  => setGameConfigState(c), []);
  const markVisited     = useCallback(id => setVisited(prev => new Set([...prev, id])), []);
  const addPendingVisit  = useCallback(id => setPendingVisits(prev => prev.includes(id) ? prev : [...prev, id]), []);
  const addQuizScore     = useCallback(pts => setQuizScoreState(prev => prev + pts), []);
  const clearPostQuizZone = useCallback(() => setPostQuizZoneId(null), []);

  const resetGame = useCallback(() => {
    setPartyId(null); setPartyCode(null); setPartyName(null); setPartyStatus('Lobby');
    setMembersState([]); setRoleState(null); setVisited(new Set()); setGameConfigState(null);
    setPendingVisits([]); setQuizScoreState(0); setPostQuizZoneId(null);
  }, []);

  const completeGame = useCallback(async (capturedPartyId, capturedVisits, capturedQuizScore) => {
    if (capturedPartyId) {
      await completeGameApi(capturedPartyId, capturedVisits, capturedQuizScore).catch(() => {});
    } else if (!capturedPartyId) {
      await completeSoloGame(capturedVisits.length, capturedQuizScore).catch(() => {});
    }
    resetGame();
  }, [resetGame]);

  return (
    <GameContext.Provider value={{
      partyId, partyCode, partyName, partyStatus, members, role, visitedCheckpointIds,
      pendingVisits, quizScore, postQuizZoneId, gameConfig,
      setParty, setMembers, setRole, setGameConfig, setPostQuizZoneId,
      markVisited, addPendingVisit, addQuizScore, clearPostQuizZone,
      resetGame, completeGame, triggerPoll,
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
