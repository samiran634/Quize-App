const root = document.getElementById('root');
let games = [];
let ws = null;
let currentGameId = null;
let currentQuestion = null;
let questionTimer = null;
let timeRemaining = 20;
let selectedGameForJoin = null;

// Modal elements
const modal = document.getElementById('createGameModal');
const createGameBtn = document.getElementById('createGameBtn');
const closeModal = document.getElementsByClassName('close')[0];
const createGameForm = document.getElementById('createGameForm');

// Join by ID modal elements
const joinByIdModal = document.getElementById('joinByIdModal');
const joinByIdBtn = document.getElementById('joinByIdBtn');
const closeJoinByIdModal = document.getElementById('closeJoinByIdModal');
const joinByIdForm = document.getElementById('joinByIdForm');

// Join game modal elements
const joinGameModal = document.getElementById('joinGameModal');
const closeJoinModal = document.getElementById('closeJoinModal');
const confirmJoinBtn = document.getElementById('confirmJoinBtn');
const cancelJoinBtn = document.getElementById('cancelJoinBtn');
const joinGameDetails = document.getElementById('joinGameDetails');

// Track last focused element before modal opens
let lastFocusedElement = null;

// Trap focus within modal
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
        
        // Close modal on Escape key
        if (e.key === 'Escape') {
            closeModalAndRestoreFocus(modal);
        }
    });
}

function closeModalAndRestoreFocus(modalElement) {
    modalElement.style.display = 'none';
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

function openModal(modalElement) {
    lastFocusedElement = document.activeElement;
    modalElement.style.display = 'block';
    
    // Focus first focusable element
    const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
    
    trapFocus(modalElement);
}

// Random game name generator
const gameNameAdjectives = ['Epic', 'Legendary', 'Mighty', 'Swift', 'Brave', 'Cosmic', 'Thunder', 'Shadow', 'Golden', 'Crystal', 'Dragon', 'Phoenix', 'Storm', 'Mystic', 'Royal'];
const gameNameNouns = ['Warriors', 'Champions', 'Masters', 'Legends', 'Heroes', 'Knights', 'Wizards', 'Titans', 'Guardians', 'Seekers', 'Raiders', 'Hunters', 'Fighters', 'Challengers', 'Conquerors'];

function generateGameName(gameId) {
    // Use gameId as seed for consistent names
    const seed = parseInt(gameId.slice(-4));
    const adjIndex = seed % gameNameAdjectives.length;
    const nounIndex = Math.floor(seed / 100) % gameNameNouns.length;
    return `${gameNameAdjectives[adjIndex]} ${gameNameNouns[nounIndex]}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Game ID copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy Game ID');
    });
}

// Fetch running games
async function fetchRunningGame(){
    try {
        const res = await fetch('/loby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch games');
        }
        
        games = await res.json();
        buildLayout();
    } catch (error) {
        console.error('Error fetching games:', error);
        root.innerHTML = '<p style="padding: 20px; color: red;">Error loading games. Please refresh the page.</p>';
    }
}

// Create new game request
async function newGameRequest(gameData){
    try {
        const res = await fetch('/createGame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        });
        
        if (!res.ok) {
            throw new Error('Failed to create game');
        }
        
        const result = await res.json();
        console.log('Game created:', result);
        
        // Refresh the game list
        await fetchRunningGame();
        
        // Close the modal
        modal.style.display = 'none';
        
        alert('Game created successfully! You can now join it.');
    } catch (error) {
        console.error('Error creating game:', error);
        alert('Failed to create game. Please try again.');
    }
}

// Join a game via WebSocket
async function joinGame(gameId){
    try {
        // First, call the HTTP endpoint to validate
        const res = await fetch('/joinGame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameId })
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to join game');
        }
        
        const result = await res.json();
        console.log('Joining game:', result);
        
        // Connect to WebSocket
        connectToGame(gameId);
        
    } catch (error) {
        console.error('Error joining game:', error);
        alert(error.message || 'Failed to join game. Please try again.');
    }
}

// Connect to game via WebSocket
function connectToGame(gameId) {
    currentGameId = gameId;
    
    // Since the cookie is httpOnly, we can't access it from JavaScript
    // Instead, we'll pass the gameId and let the server validate the cookie
    // The browser will automatically send the httpOnly cookie with the WebSocket upgrade request
    
    // Determine WebSocket protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?gameId=${gameId}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Connected to game room');
        showGameRoom();
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleGameMessage(data);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('Connection error. Please try again.');
    };
    
    ws.onclose = (event) => {
        console.log('Disconnected from game room', event.code, event.reason);
        if (currentGameId) {
            const reason = event.reason || 'Connection closed';
            alert(`Disconnected from game: ${reason}. Returning to lobby.`);
            returnToLobby();
        }
    };
}

// Handle incoming WebSocket messages
function handleGameMessage(data) {
    console.log('Received:', data);
    
    switch (data.type) {
        case 'game_state':
            updateGameState(data);
            break;
            
        case 'player_joined':
            showNotification(`${data.username} joined the game`);
            updatePlayerCount(data.playerCount);
            break;
            
        case 'player_left':
            showNotification(`${data.username} left the game`);
            updatePlayerCount(data.playerCount);
            break;
            
        case 'question':
            displayQuestion(data.question, data.timeLimit);
            break;
            
        case 'score_update':
            updateScores(data.scores);
            break;
            
        case 'leaderboard':
            showLeaderboard(data.leaderboard, data.questionIndex, data.correctAnswer);
            break;
            
        case 'game_over':
            showFinalResults(data.leaderboard, data.rated);
            break;
    }
}

// Show game room UI
function showGameRoom() {
    root.innerHTML = `
        <div class="game-room">
            <div class="game-header">
                <h2>Game Room #${currentGameId}</h2>
                <button id="leaveGameBtn" class="leave-btn">Leave Game</button>
            </div>
            
            <div class="game-info">
                <div id="playerCount" class="info-box">Players: 0</div>
                <div id="gameStatus" class="info-box">Waiting for players...</div>
            </div>
            
            <div id="playersList" class="players-list"></div>
            
            <button id="startGameBtn" class="start-game-btn">Start Game</button>
            
            <div id="gameContent" class="game-content"></div>
        </div>
    `;
    
    document.getElementById('leaveGameBtn').onclick = leaveGame;
    document.getElementById('startGameBtn').onclick = startGame;
}

// Update game state
function updateGameState(data) {
    updatePlayerCount(data.playerCount || data.players.length);
    
    const playersList = document.getElementById('playersList');
    if (playersList) {
        playersList.innerHTML = '<h3>Players:</h3>' + 
            data.players.map(p => `
                <div class="player-item">
                    <span>${p.username}</span>
                    <span class="player-score">${p.score} pts</span>
                </div>
            `).join('');
    }
    
    if (data.started) {
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) startBtn.style.display = 'none';
        document.getElementById('gameStatus').textContent = 'Game in progress...';
    }
}

// Update player count
function updatePlayerCount(count) {
    const playerCount = document.getElementById('playerCount');
    if (playerCount) {
        playerCount.textContent = `Players: ${count}`;
    }
}

// Start game
function startGame() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'start_game' }));
        document.getElementById('startGameBtn').style.display = 'none';
        document.getElementById('gameStatus').textContent = 'Game starting...';
    }
}

// Display question
function displayQuestion(question, timeLimit) {
    currentQuestion = question;
    timeRemaining = timeLimit;
    
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
        <div class="question-container">
            <div class="timer" role="timer" aria-live="polite" aria-atomic="true">Time: <span id="timeDisplay">${timeLimit}</span>s</div>
            <h3>Question ${question.index + 1}</h3>
            <p class="question-text" role="heading" aria-level="4">${question.question}</p>
            <div class="options" role="group" aria-label="Answer options">
                ${question.options.map((opt, idx) => `
                    <button class="option-btn" data-answer="${opt}" aria-label="Option ${idx + 1}: ${opt}">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add click handlers to options
    document.querySelectorAll('.option-btn').forEach(btn => {
        console.log(btn.dataset.answer);
        btn.onclick = () => submitAnswer(btn.dataset.answer);
    });
    
    // Start countdown timer
    startQuestionTimer();
}

// Start question timer
function startQuestionTimer() {
    if (questionTimer) clearInterval(questionTimer);
    
    questionTimer = setInterval(() => {
        timeRemaining--;
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = timeRemaining;
        }
        
        if (timeRemaining <= 0) {
            clearInterval(questionTimer);
        }
    }, 1000);
}

// Submit answer
function submitAnswer(answer) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    const timeSpent = 20 - timeRemaining;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Send answer to server (server will validate)
    ws.send(JSON.stringify({
        type: 'answer',
        questionIndex: currentQuestion.index,
        answer: answer,
        timeSpent: timeSpent
    }));
    
    clearInterval(questionTimer);
    
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML += '<p class="answer-submitted">Answer submitted! Waiting for other players...</p>';
}

// Update scores with ranking
function updateScores(scores) {
    const playersList = document.getElementById('playersList');
    if (playersList) {
        playersList.innerHTML = '<h3>Live Leaderboard:</h3>' + 
            scores.map((p, idx) => `
                <div class="player-item ${idx < 3 ? 'top-player rank-' + (idx + 1) : ''}">
                    <span class="player-rank">#${idx + 1}</span>
                    <span class="player-name">${p.username}</span>
                    <span class="player-score">${p.score} pts</span>
                </div>
            `).join('');
    }
}

// Show leaderboard
function showLeaderboard(leaderboard, questionIndex, correctAnswer) {
    const gameContent = document.getElementById('gameContent');
    
    // Show correct answer if provided
    const correctAnswerHTML = correctAnswer 
        ? `<div class="correct-answer-display">✓ Correct Answer: <strong>${correctAnswer}</strong></div>`
        : '';
    
    gameContent.innerHTML = `
        <div class="leaderboard">
            ${correctAnswerHTML}
            <h3>Leaderboard - After Question ${questionIndex + 1}</h3>
            <div class="leaderboard-list">
                ${leaderboard.map((player, idx) => `
                    <div class="leaderboard-item rank-${idx + 1}">
                        <span class="rank">#${idx + 1}</span>
                        <span class="player-name">${player.username}</span>
                        <span class="score">${player.score} pts</span>
                    </div>
                `).join('')}
            </div>
            <p class="next-question-msg">Next question in 5 seconds...</p>
        </div>
    `;
}

// Show final results
function showFinalResults(leaderboard, isRated) {
    const gameContent = document.getElementById('gameContent');
    
    const ratedMessage = isRated 
        ? '<p class="rated-msg">🏆 This was a rated match! Your score has been added to your profile.</p>'
        : '<p class="casual-msg">This was a casual match. Scores were not saved.</p>';
    
    gameContent.innerHTML = `
        <div class="final-results">
            <h2>🏆 Game Over! 🏆</h2>
            ${ratedMessage}
            <div class="final-leaderboard">
                ${leaderboard.map((player, idx) => `
                    <div class="final-item rank-${idx + 1}">
                        <span class="final-rank">#${idx + 1}</span>
                        <span class="final-name">${player.username}</span>
                        <span class="final-score">${player.score} pts</span>
                        ${idx === 0 ? '<span class="winner-badge">👑 Winner!</span>' : ''}
                    </div>
                `).join('')}
            </div>
            <button id="returnLobbyBtn" class="return-lobby-btn">Return to Lobby</button>
        </div>
    `;
    
    document.getElementById('returnLobbyBtn').onclick = returnToLobby;
    
    // Auto-disconnect after 10 seconds
    setTimeout(() => {
        if (ws) ws.close();
    }, 10000);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Leave game
function leaveGame() {
    if (confirm('Are you sure you want to leave the game?')) {
        if (ws) ws.close();
        returnToLobby();
    }
}

// Return to lobby
function returnToLobby() {
    if (ws) {
        ws.close();
        ws = null;
    }
    currentGameId = null;
    currentQuestion = null;
    if (questionTimer) clearInterval(questionTimer);
    
    fetchRunningGame();
}

// Build the game cards layout
function buildLayout(){
    root.innerHTML = '';

    if (games.length === 0) {
        root.innerHTML = '<p style="padding: 20px; color: #666;">No active games. Create one to get started!</p>';
        return;
    }

    // Loop through the games array
    games.forEach(game => {
        const gameName = generateGameName(game.gameid);
        
        // Create the Container (Card)
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Add visual classes based on game state
        if (game.locked) {
            card.classList.add('locked');
            card.style.borderColor = 'red';
        } else if (game.isFull) {
            card.classList.add('full');
            card.style.borderColor = 'orange';
        }

        // Create Child: Game Name (instead of ID)
        const title = document.createElement('h3');
        title.innerText = gameName;
        title.style.marginBottom = '5px';
        
        // Create Game ID with copy button
        const gameIdRow = document.createElement('div');
        gameIdRow.className = 'game-id-row';
        gameIdRow.innerHTML = `
            <span class="game-id-label">ID: ${game.gameid}</span>
            <button class="copy-id-btn" title="Copy Game ID">📋</button>
        `;
        gameIdRow.querySelector('.copy-id-btn').onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(game.gameid);
        };
        
        // Create Child: Details (Difficulty & Rated)
        const details = document.createElement('p');
        const isRated = game.rated ? "Rated Match" : "Casual";
        details.innerText = `${game.difficulty.toUpperCase()} | ${isRated}`;

        // Create Child: Stats (Crowd & Questions)
        const stats = document.createElement('div');
        stats.className = 'stats-row';
        const crowdDisplay = game.maxCrowd === -1 
            ? `👥 ${game.currentCrowd} Players (Unlimited)` 
            : `👥 ${game.currentCrowd}/${game.maxCrowd} Players`;
        stats.innerText = `${crowdDisplay} | ❓ ${game.questionAmount} Qs`;

        // Create Child: Join Button
        const joinBtn = document.createElement('button');
        joinBtn.setAttribute('aria-label', `Join ${gameName}`);
        
        if (game.locked) {
            joinBtn.innerText = "Locked 🔒";
            joinBtn.disabled = true;
            joinBtn.title = "This game is locked by the creator";
            joinBtn.setAttribute('aria-disabled', 'true');
        } else if (game.isFull) {
            joinBtn.innerText = "Full 🚫";
            joinBtn.disabled = true;
            joinBtn.title = "This game has reached maximum capacity";
            joinBtn.setAttribute('aria-disabled', 'true');
        } else {
            joinBtn.innerText = "Join Game";
            joinBtn.disabled = false;
            joinBtn.title = "Click to join this game";
            joinBtn.setAttribute('aria-disabled', 'false');
        }
        
        // Add click event for the button
        joinBtn.onclick = () => {
            showJoinConfirmation(game, gameName);
        };
        
        // Make card keyboard accessible
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `${gameName}, ${game.difficulty} difficulty, ${crowdDisplay}, ${game.questionAmount} questions`);
        
        // Allow Enter key to focus join button
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !game.locked && !game.isFull) {
                joinBtn.click();
            }
        });

        // Append everything to the Card
        card.appendChild(title);
        card.appendChild(gameIdRow);
        card.appendChild(details);
        card.appendChild(stats);
        card.appendChild(joinBtn);

        // Append Card to the Root
        root.appendChild(card);
    });
}

// Show join confirmation modal
function showJoinConfirmation(game, gameName) {
    selectedGameForJoin = game;
    
    const crowdDisplay = game.maxCrowd === -1 
        ? `${game.currentCrowd} Players (Unlimited)` 
        : `${game.currentCrowd}/${game.maxCrowd} Players`;
    
    joinGameDetails.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Game Name:</span>
            <span class="detail-value">${gameName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Game ID:</span>
            <span class="detail-value">${game.gameid} <button class="copy-id-btn-inline" onclick="copyToClipboard('${game.gameid}')" aria-label="Copy game ID">📋 Copy</button></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Difficulty:</span>
            <span class="detail-value">${game.difficulty.toUpperCase()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Questions:</span>
            <span class="detail-value">${game.questionAmount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Players:</span>
            <span class="detail-value">${crowdDisplay}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${game.rated ? '🏆 Rated Match' : '🎮 Casual Match'}</span>
        </div>
        <p style="margin-top: 15px; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
            You will join as your authenticated user. Ready to play?
        </p>
    `;
    
    openModal(joinGameModal);
}

// Modal event listeners
createGameBtn.onclick = function() {
    openModal(modal);
}

closeModal.onclick = function() {
    closeModalAndRestoreFocus(modal);
}

// Join by ID modal
joinByIdBtn.onclick = function() {
    openModal(joinByIdModal);
}

closeJoinByIdModal.onclick = function() {
    closeModalAndRestoreFocus(joinByIdModal);
}

joinByIdForm.onsubmit = async function(e) {
    e.preventDefault();
    const gameId = document.getElementById('gameIdInput').value.trim();
    
    if (!gameId) {
        alert('Please enter a valid Game ID');
        return;
    }
    
    closeModalAndRestoreFocus(joinByIdModal);
    
    // Find the game in the list or try to join directly
    const game = games.find(g => g.gameid === gameId);
    if (game) {
        const gameName = generateGameName(game.gameid);
        showJoinConfirmation(game, gameName);
    } else {
        // Try to join directly even if not in list
        if (confirm(`Game ID: ${gameId}\n\nThis game is not in the lobby list. Try to join anyway?`)) {
            await joinGame(gameId);
        }
    }
}

closeJoinModal.onclick = function() {
    closeModalAndRestoreFocus(joinGameModal);
    selectedGameForJoin = null;
}

cancelJoinBtn.onclick = function() {
    closeModalAndRestoreFocus(joinGameModal);
    selectedGameForJoin = null;
}

confirmJoinBtn.onclick = function() {
    if (selectedGameForJoin) {
        closeModalAndRestoreFocus(joinGameModal);
        joinGame(selectedGameForJoin.gameid);
        selectedGameForJoin = null;
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModalAndRestoreFocus(modal);
    }
    if (event.target == joinGameModal) {
        closeModalAndRestoreFocus(joinGameModal);
        selectedGameForJoin = null;
    }
    if (event.target == joinByIdModal) {
        closeModalAndRestoreFocus(joinByIdModal);
    }
}

// Unlimited button handler
const unlimitedBtn = document.getElementById('unlimitedBtn');
const maxCrowdInput = document.getElementById('maxCrowd');
const crowdHint = document.getElementById('crowdHint');
let isUnlimited = false;

unlimitedBtn.onclick = function() {
    isUnlimited = !isUnlimited;
    if (isUnlimited) {
        maxCrowdInput.value = '';
        maxCrowdInput.disabled = true;
        unlimitedBtn.classList.add('active');
        unlimitedBtn.textContent = '✓ Unlimited';
        unlimitedBtn.setAttribute('aria-pressed', 'true');
        crowdHint.textContent = 'Unlimited players can join this game';
    } else {
        maxCrowdInput.disabled = false;
        maxCrowdInput.value = '10';
        unlimitedBtn.classList.remove('active');
        unlimitedBtn.textContent = 'Unlimited';
        unlimitedBtn.setAttribute('aria-pressed', 'false');
        crowdHint.textContent = 'Set maximum number of players or click Unlimited';
    }
}

// Form submission
createGameForm.onsubmit = function(e) {
    e.preventDefault();
    
    const formData = new FormData(createGameForm);
    const gameData = {
        questionAmount: parseInt(formData.get('questionAmount')),
        difficulty: formData.get('difficulty'),
        rated: formData.get('rated') === 'on',
        maxCrowd: isUnlimited ? -1 : parseInt(formData.get('maxCrowd'))
    };
    
    newGameRequest(gameData);
}

// Add keyboard navigation for game cards
document.addEventListener('keydown', function(e) {
    // Allow Enter or Space to activate buttons
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('option-btn') || 
            e.target.classList.contains('game-card') ||
            e.target.tagName === 'BUTTON') {
            e.preventDefault();
            e.target.click();
        }
    }
});

// Initial fetch
fetchRunningGame();