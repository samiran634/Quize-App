# Setup Instructions

## Quick Start

### 1. Install Redis

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

**Mac:**
```bash
brew install redis
brew services start redis
```

### 2. Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Start the Application
```bash
# In backend directory
npm run dev
```

### 5. Access the Lobby
Navigate to: `http://localhost:4000/loby`

## New Features Added

### Create Game Button
- Click the green "+ Create New Game" button in the lobby header
- Fill in the game settings:
  - Number of Questions (5-50)
  - Difficulty (Easy/Medium/Hard)
  - Rated Match (checkbox)
- Click "Create Game" to add it to the lobby

### Join Game
- Click "Join Game" on any available game card
- Locked games cannot be joined

## Testing the Setup

1. Open the lobby page
2. Click "Create New Game"
3. Create a game with your preferred settings
4. The game should appear in the lobby
5. Try creating multiple games
6. Test joining a game

## Troubleshooting

### Redis Connection Error
- Make sure Redis server is running: `redis-cli ping`
- Check REDIS_URL in backend/.env matches your Redis setup

### Games Not Appearing
- Check browser console for errors
- Check backend logs for Redis errors
- Verify you're logged in (lobby requires authentication)

### Cannot Create Game
- Ensure you're authenticated
- Check network tab for API errors
- Verify backend is running on port 4000
