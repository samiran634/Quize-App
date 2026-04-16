import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderLobby } from './lobby';
import { renderCreateGame } from './game';
import { renderGameRoom } from './gameRoom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const wsBaseUrl = backendUrl.replace(/^http/, 'ws');

export default function Duel() {
  const navigate = useNavigate();
  const [view, setView] = useState('lobby'); // 'lobby', 'create', 'game'
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Create Game State ---
  const [createData, setCreateData] = useState({
    questionAmount: 10,
    difficulty: 'easy',
    maxCrowd: -1,
    rated: false,
    category: ''
  });

  // --- Game Room State ---
  const [ws, setWs] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timer, setTimer] = useState(20);
  const [myUserId, setMyUserId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (view === 'lobby') {
      fetchGames();
    }
  }, [view]);

  // Fetch loby (open games)
  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/loby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data);
        setError(null);
      } else {
        if (res.status === 401) {
          setError('Please log in to access the duel lobby.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to fetch open games.');
        }
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/createGame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchGames();
        setView('lobby');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create game');
      }
    } catch (err) {
      setError('Error creating game.');
    }
    setLoading(false);
  };

  const attemptJoinGame = async (gameId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/joinGame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        connectWebSocket(data.wsUrl);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join game');
      }
    } catch (err) {
      setError('Network error while joining');
    }
    setLoading(false);
  };

  const connectWebSocket = (wsSuffix) => {
    const fullUrl = `${wsBaseUrl}${wsSuffix}`;
    const socket = new WebSocket(fullUrl);

    socket.onopen = () => {
      console.log('Connected to WS');
      setView('game');
      setWs(socket);
      setIsGameOver(false);
      setLeaderboard(null);
      setCurrentQuestion(null);
      setHasStarted(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WS Message:', data);
      
      switch (data.type) {
        case 'game_state':
          setPlayers(data.players || []);
          setGameState(data.gameData);
          setHasStarted(data.started || false);
          // if not present in earlier responses, decode token or just find ourselves if needed
          // to highlight "You", we can just look up by token later or rely on username.
          break;
        case 'player_joined':
          setPlayers(prev => {
            if (prev.find(p => p.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, username: data.username, score: 0 }];
          });
          break;
        case 'player_left':
          setPlayers(prev => prev.filter(p => p.userId !== data.userId));
          break;
        case 'question':
          setCurrentQuestion(data.question);
          setLeaderboard(null); // Hide leaderboard when new question shows
          setSelectedAnswer(null); // Reset selection
          setTimer(data.timeLimit || 20);
          setHasStarted(true);
          startTimeRef.current = Date.now();
          startTimerCountdown(data.timeLimit || 20);
          break;
        case 'score_update':
          setPlayers(data.scores || []);
          break;
        case 'leaderboard':
          setLeaderboard(data.leaderboard);
          setPlayers(data.leaderboard);
          setCurrentQuestion(prev => prev ? { ...prev, correctAnswer: data.correctAnswer } : null);
          break;
        case 'game_over':
          setIsGameOver(true);
          setLeaderboard(data.leaderboard);
          setPlayers(data.leaderboard);
          setCurrentQuestion(null);
          break;
        default:
          break;
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WS');
      setWs(null);
      // Optional: go back to lobby if unexpectedly closed
    };
  };

  const startTimerCountdown = (initialTime) => {
    setTimer(initialTime);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Cleanup interval when question changes or unmounts handled inherently by resetting on new question
  };

  const startGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'start_game' }));
    }
  };

  const submitAnswer = (answerObj) => {
    if (ws && ws.readyState === WebSocket.OPEN && currentQuestion && !selectedAnswer) {
      setSelectedAnswer(answerObj);
      const timeSpent = Date.now() - startTimeRef.current;
      ws.send(JSON.stringify({
        type: 'answer',
        questionIndex: currentQuestion.index,
        answer: answerObj,
        timeSpent
      }));
    }
  };

  const leaveGame = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setView('lobby');
    fetchGames();
  };

  // --- UI Components ---

 

 

  const propsLobby = { fetchGames, setView, navigate, error, games, loading, attemptJoinGame };
  const propsCreate = { error, handleCreateGame, createData, setCreateData, setView, loading };
  const propsGameRoom = { players, leaveGame, hasStarted, isGameOver, currentQuestion, startGame, timer, submitAnswer, selectedAnswer, leaderboard };

  return view === 'lobby' ? renderLobby(propsLobby) : view === 'create' ? renderCreateGame(propsCreate) : renderGameRoom(propsGameRoom);
}
