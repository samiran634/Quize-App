import {
    Trophy,
    Star,
    Clock,
    Fingerprint,
    Mail,
    MapPin,
    ShieldAlert,
    Terminal,
    Server,
    User,
    Plus
} from 'lucide-react';
import { useLoaderData, useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const loaderData = useLoaderData();
    console.log(loaderData)
    const userData = loaderData.data;
    const navigate = useNavigate();

    const formattedLoginTime = new Date(userData.logintime).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    // Capitalize name
    const displayName = userData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header Section */}
                <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-indigo-400 overflow-hidden">
                                {userData.userImage ? (
                                    <img src={userData.userImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    displayName.charAt(0)
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-1">{displayName}</h1>
                                <div className="flex items-center gap-2 text-slate-300 mb-2">
                                    <Mail size={16} />
                                    <span>{userData.userEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium">
                                    <MapPin size={16} />
                                    <span>{userData.about ?? "Not Updated"}</span>
                                    <button className="text-indigo-400 hover:text-indigo-600"><User size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Rank Badge */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                            <Trophy size={28} className="text-yellow-400 mb-1" />
                            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Global Rank</span>
                            <span className="text-2xl font-bold">#{userData.rank}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="p-8">

                    {/* Tech Stack / Interests Tags */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 pb-8">
                        {
                            userData.tags ? userData.tags.map((tag, index) => (
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Terminal size={14} /> {tag}</span>
                            )) : (
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Terminal size={14} /> No tags</span>
                            )
                        }

                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Plus size={16} /></span>

                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-6">Account Statistics & Details</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Score Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4 hover:border-indigo-300 transition-colors">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Star size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Score</p>
                                <p className="text-2xl font-bold text-slate-900">{userData.score}</p>
                            </div>
                        </div>

                        {/* Last Login Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4 hover:border-indigo-300 transition-colors">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Last Login</p>
                                <p className="text-lg font-bold text-slate-900 mt-1">{formattedLoginTime}</p>
                            </div>
                        </div>

                        {/* User ID Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4 hover:border-indigo-300 transition-colors">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Fingerprint size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Public User ID</p>
                                <p className="text-sm font-mono font-bold text-slate-900 mt-1 truncate" title={userData.userId}>
                                    {userData.userId}
                                </p>
                            </div>
                        </div>

                        {/* Database ID Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4 hover:border-indigo-300 transition-colors">
                            <div className="p-3 bg-slate-200 text-slate-600 rounded-xl">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Auth ID</p>
                                <p className="text-sm font-mono font-bold text-slate-900 mt-1 truncate" title={userData._id}>
                                    {userData._id}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer" onClick={() => navigate('/editprofile/' + userData.userId)}>
                            Edit Profile
                        </button>
                        <button className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors">
                            Change Password
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );

}
export default ProfilePage;