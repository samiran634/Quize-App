 export const renderLobby = ({ fetchGames, setView, navigate, error, games, loading, attemptJoinGame }) => (
    <div className="min-h-screen bg-[#252431] flex flex-col items-center p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative gradient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#785ef0] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff4b82] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Duel <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a492f2] to-[#ff4b82]">Lobby</span></h1>
            <p className="text-[#8c8c97] text-lg">Challenge others in real-time trivia battles.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => fetchGames()} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium rounded-xl px-5 py-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <button onClick={() => setView('create')} className="bg-gradient-to-br from-[#785ef0] to-[#654ae0] hover:shadow-[0_0_20px_rgba(120,94,240,0.5)] text-white font-medium rounded-xl px-6 py-3 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Create Game
            </button>
            <button onClick={() => navigate('/home')} className="bg-transparent hover:bg-white/5 text-[#8c8c97] hover:text-white font-medium rounded-xl px-5 py-3 transition-all">Back</button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-8 backdrop-blur-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && games.length === 0 ? (
            <div className="col-span-full text-center py-20 text-[#8c8c97]">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="col-span-full border border-dashed border-white/20 rounded-2xl p-16 text-center backdrop-blur-sm bg-white/5">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-medium text-white mb-2">No Active Games</h3>
              <p className="text-[#8c8c97]">Be the first to create a game and challenge others!</p>
            </div>
          ) : (
            games.map((g, i) => (
              <div key={i} className="group bg-[#1b1a23]/80 backdrop-blur-lg border border-white/10 hover:border-[#785ef0]/50 rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(120,94,240,0.15)] hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#785ef0]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#21202a] px-3 py-1.5 rounded-lg border border-white/5 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{g.difficulty}</span>
                  </div>
                  {g.rated && <span className="bg-[#ff4b82]/20 text-[#ff4b82] text-xs font-bold px-2.5 py-1 rounded-md">RATED</span>}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Trivia Battle #{g.gameid.substring(0, 4)}</h3>
                <div className="text-[#8c8c97] text-sm mb-6 space-y-2">
                  <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> {g.questionAmount} Questions</p>
                  <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> {g.currentCrowd} / {g.maxCrowd === -1 ? '∞' : g.maxCrowd} Players</p>
                </div>
                <button 
                  onClick={() => attemptJoinGame(g.gameid)} 
                  disabled={g.isFull || g.locked || loading}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${(g.isFull || g.locked) ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-white/5 border border-white/10 hover:bg-[#785ef0] hover:border-transparent text-white'}`}
                >
                  {g.locked ? 'Locked' : g.isFull ? 'Full' : 'Join Game'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );