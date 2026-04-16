import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PublicProfilePage = () => {
  const { userEmail } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicProfile();
  }, [userEmail]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/publicprofile/${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-500 text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/ranktable')}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all"
          >
            Back to Rankings
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-2xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center overflow-hidden">
                {userData.userImage ? (
                  <img src={userData.userImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-white font-bold">
                    {userData.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mt-4">{userData.name}</h1>
              <p className="text-slate-400 text-lg">{userData.userEmail}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <div className="text-amber-500 text-4xl font-bold">{userData.score || 0}</div>
                <div className="text-slate-400 mt-2">Score</div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <div className="text-amber-500 text-4xl font-bold">#{userData.rank || 'N/A'}</div>
                <div className="text-slate-400 mt-2">Rank</div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <div className="text-amber-500 text-4xl font-bold">
                  {userData.logintime ? new Date(userData.logintime).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-slate-400 mt-2">Member Since</div>
              </div>
            </div>

            {userData.about && (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-500 mb-3">About</h2>
                <p className="text-slate-300">{userData.about}</p>
              </div>
            )}

            {userData.tags && userData.tags.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-500 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {userData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => navigate('/ranktable')}
                className="px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all"
              >
                Back to Rankings
              </button>
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
