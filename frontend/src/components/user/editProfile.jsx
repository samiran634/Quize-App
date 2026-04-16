import { useState } from 'react';
import {
    User,
    Mail,
    Building,
    Terminal,
    Save,
    X,
    ShieldCheck,
    Camera
} from 'lucide-react';

const UpdateProfileForm = () => {
    // Initializing state with the user's current data
    const [formData, setFormData] = useState({
        userImage: "",
        name: "name",
        email: "email",
        about: "about",
    });
    const [loading, setLoading] = useState(false);
    const [updated, setUpdated] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === "userImage") {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({
                    ...formData,
                    userImage: base64String
                });
            };

            reader.readAsDataURL(file);
        }
        else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/updateprofile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setUpdated(true);
            }
            console.log(data);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-slate-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <ShieldCheck size={28} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
                            <p className="text-slate-400 text-sm mt-1">Update your personal details and public profile.</p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8">

                    {/* Avatar Edit Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                        <label htmlFor="userUpload" className="relative group cursor-pointer block">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-md overflow-hidden">
                                {formData.userImage ? (
                                    <img src={formData.userImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    formData.name.charAt(0)
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                            <input type="file" id="userUpload" name="userImage" accept="image/*" className="hidden" onChange={handleChange} />
                        </label>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Profile Picture</h3>
                            <p className="text-xs text-slate-500 mt-1 mb-3">JPG, GIF or PNG. Max size of 16MB.</p>
                            <label htmlFor="userUpload" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
                                Upload new picture
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Email is linked to your authentication ID and cannot be changed here.</p>
                        </div>

                        {/* About*/}
                        <div className="space-y-2">
                            <label htmlFor="about" className="text-sm font-semibold text-slate-700">About</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Building size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    id="about"
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Where do you study or work?"
                                />
                            </div>
                        </div>


                    </div>

                    {/* Headline / Bio - Full Width */}
                    <div className="space-y-2 mb-8 border-b border-slate-100 pb-8">
                        <label htmlFor="headline" className="text-sm font-semibold text-slate-700">Profile Headline</label>
                        <input
                            type="text"
                            id="headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="A short description of what you do"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
                            onClick={() => setFormData({
                                userImage: "",
                                name: "name",
                                email: "email",
                                about: "about",
                            })}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                    {updated && <p className="text-green-500 text-sm mt-4">Profile updated successfully!</p>}

                </form>
            </div>
        </div>
    );
};

export default UpdateProfileForm;