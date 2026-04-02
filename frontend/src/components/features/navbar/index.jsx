import { useNavigate } from "react-router-dom";

const NavBar = ({ navItems }) => {
    const navigate = useNavigate();

    // Dynamic grid columns based on the number of items
    const gridColsVal = Math.max(1, navItems?.length || 1);

    return (
        <div className="fixed top-4 right-4 z-50 animate-fadeInDown md:top-6 md:left-0 md:right-0 md:w-[90%] md:max-w-5xl md:mx-auto md:px-4">
            <div className="bg-[#1b1a23]/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent pointer-events-none"></div>

                <div className="flex flex-col md:flex-row w-full divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {navItems && navItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => item.onClick()}
                            className="relative group py-4 px-6 md:px-2 md:flex-1 text-center transition-all duration-300 overflow-hidden outline-none"
                        >
                            {/* Hover effect background */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Animated bottom border on hover */}
                            <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-[#785ef0] to-[#ff4b82] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                            <span className="relative z-10 text-sm md:text-base font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors duration-300">
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInDown { animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
};

export default NavBar;
