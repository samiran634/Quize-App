import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

const RankTable = () => {
  const initialData = useLoaderData();
  const navigate = useNavigate();

  const [players, setPlayers] = useState(initialData?.players || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [totalPlayers, setTotalPlayers] = useState(initialData?.totalPlayers || 0);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData && currentPage === 1 && players.length > 0) {
      setLoading(false);
      return;
    }
    fetchPlayers(currentPage);
  }, [currentPage]);

  const fetchPlayers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/players?page=${page}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      setPlayers(data.players);
      setTotalPages(data.totalPages);
      setTotalPlayers(data.totalPlayers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-4 py-2 mx-1 rounded-lg font-semibold transition-all ${currentPage === i
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  // Removed full-screen loading to display skeleton layout instead

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-500 text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-amber-500 mb-2">Player Rankings</h1>
          <p className="text-slate-400 text-lg">Total Players: {totalPlayers}</p>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-amber-500 font-bold text-lg">Rank</th>
                  <th className="px-6 py-4 text-left text-amber-500 font-bold text-lg">Player Name</th>
                  <th className="px-6 py-4 text-left text-amber-500 font-bold text-lg">Email</th>
                  <th className="px-6 py-4 text-right text-amber-500 font-bold text-lg">Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(10)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b border-slate-800">
                      <td className="px-6 py-4"><div className="h-6 w-8 bg-slate-700/50 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-48 bg-slate-700/50 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-56 bg-slate-700/50 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4 text-right flex justify-end"><div className="h-6 w-16 bg-slate-700/50 rounded animate-pulse ml-auto mt-1 mb-1"></div></td>
                    </tr>
                  ))
                ) : (
                  players.map((player, index) => (
                    <tr
                      key={player.userId}
                      onClick={() => navigate(`/publicprofile/${encodeURIComponent(player.userEmail)}`)}
                      className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${index < 3 && currentPage === 1 ? 'bg-slate-800/30' : ''
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`text-xl font-bold ${player.rank === 1 && currentPage === 1
                                ? 'text-yellow-400'
                                : player.rank === 2 && currentPage === 1
                                  ? 'text-gray-400'
                                  : player.rank === 3 && currentPage === 1
                                    ? 'text-amber-700'
                                    : 'text-slate-300'
                              }`}
                          >
                            {player.rank === 1 && currentPage === 1 ? '🥇' : ''}
                            {player.rank === 2 && currentPage === 1 ? '🥈' : ''}
                            {player.rank === 3 && currentPage === 1 ? '🥉' : ''}
                            {player.rank > 3 || currentPage > 1 ? `#${player.rank}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center overflow-hidden">
                            {player.userImage ? (
                               <img src={player.userImage} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                               player.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="truncate">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{player.userEmail}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-400 font-bold text-lg">{player.score}</span>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentPage === 1
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
          >
            Previous
          </button>

          <div className="flex items-center">{renderPageNumbers()}</div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentPage === totalPages
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
          >
            Next
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => (navigate("/home"))}
            className="px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankTable;