  export const renderGameRoom = ({ players, leaveGame, hasStarted, isGameOver, currentQuestion, startGame, timer, submitAnswer, selectedAnswer, leaderboard }) => (
    <div className="min-h-screen bg-[#1b1a23] text-white font-sans flex flex-col md:flex-row overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-[#785ef0] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Left Sidebar: Leaderboard & Players */}
      <div className="w-full md:w-[350px] bg-[#21202a]/80 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col z-10 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Players</h2>
          <span className="bg-[#785ef0]/20 text-[#a492f2] text-xs font-bold px-3 py-1 rounded-full">{players.length} Online</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {players.sort((a,b)=> b.score - a.score).map((p, i) => (
            <div key={p.userId || i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center font-bold text-sm shadow-inner">
                  {p.username ? p.username.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="font-medium truncate max-w-[120px]">{p.username}</span>
              </div>
              <div className="font-mono text-[#a492f2] font-bold">{p.score} <span className="text-[10px] text-gray-500">pts</span></div>
            </div>
          ))}
        </div>

        <button onClick={leaveGame} className="mt-6 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl border border-red-500/20 transition-colors">
          Leave Match
        </button>
      </div>

      {/* Main Arena */}
      <div className="flex-1 p-6 sm:p-12 flex flex-col relative z-10">
        {!hasStarted && !isGameOver && !currentQuestion && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <span className="text-5xl animate-bounce">⏳</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Waiting to start...</h2>
            <p className="text-gray-400 mb-8 max-w-md">Players are joining the room. Once the host starts the game, the first question will appear.</p>
            <button onClick={startGame} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white font-bold text-lg rounded-full px-10 py-4 transition-all transform hover:scale-105">
              Start Game Now
            </button>
          </div>
        )}

        {currentQuestion && !leaderboard && !isGameOver && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">Question {currentQuestion.index + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Time remaining:</span>
                <span className={`font-mono text-xl font-bold ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>00:{timer < 10 ? `0${timer}` : timer}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-12 mb-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                <div className="h-full bg-gradient-to-r from-[#785ef0] to-[#ff4b82] transition-all duration-1000 ease-linear" style={{ width: `${(timer / 20) * 100}%` }}></div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => submitAnswer(opt)}
                  disabled={selectedAnswer !== null}
                  className={`p-6 rounded-2xl text-left font-medium text-lg transition-all duration-200 border border-white/10 hover:-translate-y-1 ${
                    selectedAnswer === opt 
                      ? 'bg-[#785ef0] border-transparent shadow-[0_0_15px_rgba(120,94,240,0.5)]' 
                      : selectedAnswer !== null 
                        ? 'bg-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-[#21202a] hover:bg-white/10 hover:border-white/30 cursor-pointer'
                  }`}
                  dangerouslySetInnerHTML={{ __html: opt }}
                ></button>
              ))}
            </div>
          </div>
        )}

        {leaderboard && !isGameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <h2 className="text-3xl font-bold mb-4">Round Results</h2>
            {currentQuestion?.correctAnswer && (
              <p className="text-xl mb-10 text-gray-300">
                Correct answer was: <span className="font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg ml-2" dangerouslySetInnerHTML={{__html: currentQuestion.correctAnswer}}></span>
              </p>
            )}
            <div className="w-16 h-16 border-4 border-[#785ef0] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-400 animate-pulse">Next question loading...</p>
          </div>
        )}

        {isGameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg">Game Over!</h2>
            <p className="text-gray-400 text-lg mb-10">Thanks for playing. Check the final scoreboard.</p>
            
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 w-full max-w-lg mb-8 backdrop-blur-md">
              {leaderboard?.slice(0,3).map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-4 mb-3 rounded-xl ${i===0?'bg-yellow-500/20 border-yellow-500/50 border scale-105':'bg-white/5'} transition-all`}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                    <span className="text-xl font-bold text-white">{p.username}</span>
                  </div>
                  <span className="text-2xl font-black text-[#a492f2]">{p.score}</span>
                </div>
              ))}
            </div>

            <button onClick={leaveGame} className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl px-8 py-3 transition-colors border border-white/20">
              Return to Lobby
            </button>
          </div>
        )}
      </div>
      
      {/* Required CSS for custom scrollbar/animations inline or in App.css, we'll just rely on standard tailwind if possible, but custom scrollbar is okay. */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
