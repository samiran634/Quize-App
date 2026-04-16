 export const renderCreateGame = ({ error, handleCreateGame, createData, setCreateData, setView, loading }) => (
    <div className="min-h-screen bg-[#252431] flex justify-center items-center p-4 sm:p-8 font-sans">
      <div className="max-w-xl w-full bg-[#1b1a23] rounded-[2rem] shadow-2xl p-8 sm:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-[#785ef0] rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Host a Game</h2>
        <p className="text-[#8c8c97] mb-8 relative z-10">Configure your trivia match and challenge the world.</p>
        
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleCreateGame} className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Questions</label>
              <select className="w-full bg-[#21202a] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-[#785ef0] transition-colors appearance-none"
                      value={createData.questionAmount} onChange={e => setCreateData({...createData, questionAmount: parseInt(e.target.value)})}>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select className="w-full bg-[#21202a] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-[#785ef0] transition-colors appearance-none"
                      value={createData.difficulty} onChange={e => setCreateData({...createData, difficulty: e.target.value})}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Players</label>
            <input type="number" min="-1" placeholder="-1 for unlimited"
                   className="w-full bg-[#21202a] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-[#785ef0] transition-colors placeholder-[#53525e]"
                   value={createData.maxCrowd} onChange={e => setCreateData({...createData, maxCrowd: parseInt(e.target.value)})}/>
            <p className="text-xs text-gray-500 mt-1">Leave as -1 for unbounded crowds.</p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#21202a] rounded-xl border border-white/5">
            <input type="checkbox" id="rated" className="w-5 h-5 rounded accent-[#785ef0] bg-gray-700 border-gray-600"
                   checked={createData.rated} onChange={e => setCreateData({...createData, rated: e.target.checked})}/>
            <label htmlFor="rated" className="text-white font-medium cursor-pointer">Rated Match</label>
            <span className="text-xs text-gray-400 ml-auto">Affects global ranking</span>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setView('lobby')} className="flex-1 bg-transparent hover:bg-white/5 text-gray-300 font-medium rounded-xl py-3 border border-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#785ef0] to-[#654ae0] hover:shadow-[0_0_20px_rgba(120,94,240,0.4)] text-white font-medium rounded-xl py-3 transition-all">
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
