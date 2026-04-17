import { useState, useEffect } from "react";
import GamePopup from "../gameWindow/inputWindow";
import QuestionWindow from "../gameWindow/questionWindow";
import NavBar from "../../features/navbar";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AnimeJsHeading from "../../features/animations/h2animation";
import AnimeJsParagraph from "../../features/animations/panimation";
const Home = () => {
    const loaderData = useLoaderData();
    const navigate = useNavigate();
    const { userId, logout } = useAuth();
    console.log(userId);
    console.log(loaderData.user);


    const [isGamePopupOpen, setIsGamePopupOpen] = useState(false);
    const [isQuestionWindowOpen, setIsQuestionWindowOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isGameOver, setIsGameOver] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Standard Navbar items for Home Page
    const navItems = [
        { name: "Home", onClick: () => { navigate('/home'); } },
        { name: "Duel Arena", onClick: () => { navigate('/duel'); } },
        { name: "Rankings", onClick: () => { navigate('/ranktable'); } },
        { name: "Profile", onClick: () => { navigate(`/profile/${userId}`); } },
        {
            name: "Logout", onClick: async () => {
                setIsLoggingOut(true);
                try {
                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, { credentials: 'include' });
                    logout();
                    navigate('/');
                } catch (e) {
                    console.error(e);
                    logout();
                    navigate('/');
                }
            }
        }
    ];

    const handleStartGame = async (gameConfig) => {
        try {
            const URL = `https://opentdb.com/api.php?amount=${gameConfig.numQuestions}&category=${gameConfig.category}&difficulty=${gameConfig.difficulty}`;
            const response = await fetch(URL);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Pre-shuffle options so they don't change on navigation
                const processedQuestions = data.results.map(q => {
                    const options = [...q.incorrect_answers, q.correct_answer]
                        .sort(() => Math.random() - 0.5);
                    return { ...q, options };
                });

                setQuestions(processedQuestions);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setIsQuestionWindowOpen(true);
                setIsGameOver(false);
                setIsGamePopupOpen(false);
            } else {
                alert("Could not fetch questions. Please try different settings.");
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("Error fetching questions.");
        }
    };

    const handleUpdatedScore = async () => {
        const URl = `${import.meta.env.VITE_BACKEND_URL}/api/updateScale`; // Assuming this was intended
        // Logic omitted as in original
    };

    const handleSelectOption = (option) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleUpdatedScore();
            setIsGameOver(true);
            setIsQuestionWindowOpen(false);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const resetGame = () => {
        setIsQuestionWindowOpen(false);
        setIsGameOver(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
    };

    // Calculate score for display in GameOver
    const score = questions.reduce((acc, q, idx) => {
        if (userAnswers[idx] === q.correct_answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    return (
        <div className="min-h-screen bg-[#11111a] text-white font-sans overflow-hidden flex flex-col relative">

            {/* Ambient Animated Background Orbs */}
            <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[#785ef0] rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-[pulse_6s_ease-in-out_infinite] pointer-events-none"></div>
            <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] bg-[#ff4b82] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-[pulse_8s_ease-in-out_infinite] pointer-events-none"></div>

            {/* Navbar positioned like the landing page */}
            <div className="w-full relative z-30">
                <NavBar navItems={navItems} />
            </div>

            {/* Main Content Area */}
            {!isQuestionWindowOpen && !isGameOver && (
                <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 pt-16 pb-24">

                    <div className="text-center mb-16 animate-fadeInUp gap-2" style={{ animationDelay: '0.1s' }}>

                        <AnimeJsHeading text="Ready to Play?" />

                        <AnimeJsParagraph text="Choose your path. Practice your skills solo against the system, or jump into the arena to battle players worldwide." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">

                        {/* Play Solo Card */}
                        <div
                            onClick={() => setIsGamePopupOpen(true)}
                            className="group relative cursor-pointer animate-fadeInUp" style={{ animationDelay: '0.2s' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#785ef0] to-[#5a3bde] rounded-3xl blur-md opacity-20 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative h-full bg-[#1b1a23]/80 backdrop-blur-xl border border-white/10 group-hover:border-[#785ef0]/50 rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 transform group-hover:-translate-y-2">
                                <div className="w-20 h-20 mx-auto bg-[#21202a] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-4xl text-white">🕹️</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-white">Play Solo</h2>
                                <p className="text-[#8c8c97] mb-8 leading-relaxed">
                                    Sharpen your knowledge across various categories. Perfect for practice and climbing the personal ranks.
                                </p>
                                <span className="inline-block bg-white/5 group-hover:bg-[#785ef0] text-white font-medium px-6 py-3 rounded-xl transition-colors duration-300">
                                    Start Solo Match
                                </span>
                            </div>
                        </div>

                        {/* Play Multiplayer Card */}
                        <div
                            onClick={() => navigate('/duel')}
                            className="group relative cursor-pointer animate-fadeInUp" style={{ animationDelay: '0.3s' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ff4b82] to-[#ff1a5f] rounded-3xl blur-md opacity-20 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative h-full bg-[#1b1a23]/80 backdrop-blur-xl border border-white/10 group-hover:border-[#ff4b82]/50 rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 transform group-hover:-translate-y-2">
                                <div className="w-20 h-20 mx-auto bg-[#21202a] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-4xl text-white">⚔️</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-white">Multiplayer Duel</h2>
                                <p className="text-[#8c8c97] mb-8 leading-relaxed">
                                    Enter the duel arena. Challenge friends or random opponents in real-time intense trivia battles.
                                </p>
                                <span className="inline-block bg-white/5 group-hover:bg-[#ff4b82] text-white font-medium px-6 py-3 rounded-xl transition-colors duration-300">
                                    Browse Arenas
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <GamePopup
                isOpen={isGamePopupOpen}
                onClose={() => setIsGamePopupOpen(false)}
                onStartGame={handleStartGame}
            />

            {isQuestionWindowOpen && !isGameOver && questions.length > 0 && (
                <div className="relative z-50">
                    <QuestionWindow
                        question={questions[currentQuestionIndex]}
                        currentIndex={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        selectedAnswer={userAnswers[currentQuestionIndex]}
                        onSelectAnswer={handleSelectOption}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                </div>
            )}

            {isGameOver && (
                <div className="flex flex-col items-center justify-center h-full text-white bg-[#11111a]/95 backdrop-blur-md z-50 absolute inset-0 animate-fadeInUp">
                    <div className="text-6xl mb-6 animate-bounce">🎯</div>
                    <h2 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">Round Complete!</h2>
                    <div className="bg-[#1b1a23] border border-white/10 rounded-2xl p-8 mb-8 text-center shadow-2xl min-w-[300px]">
                        <p className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-sm">Final Score</p>
                        <p className="text-5xl font-bold font-mono text-white">
                            <span className="text-green-500">{score}</span> <span className="text-gray-600">/</span> {questions.length}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={resetGame}
                            className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
                        >
                            Return to Selection
                        </button>
                        <button
                            onClick={() => setIsGamePopupOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Global Keyframes for Home Page Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default Home;