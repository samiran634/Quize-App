import React, { useEffect, useRef, useState } from "react";
import NavBar from "../features/navbar";
import HeroSection from "../features/herosection";
import GamePopup from "./gameWindow/inputWindow";
import QuestionWindow from "./gameWindow/questionWindow";

import { useNavigate } from "react-router-dom";


const HomePage = () => {
    //testing
    const navigate = useNavigate();




    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isQuestionWindowOpen, setIsQuestionWindowOpen] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);



    const navItems = [
        {
            name: isQuestionWindowOpen || isGameOver ? "End Game" : "Lets Play",
            onClick: () => {
                if (isQuestionWindowOpen || isGameOver) {
                    setIsQuestionWindowOpen(false);
                    setIsGameOver(false);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setUserAnswers({});
                } else {
                    setIsPopupOpen(true);
                }
            }
        }, {
            name: "Let's Login",
            onClick: () => { navigate('/login') }
        }, {
            name: "Ranktable",
            onClick: () => { navigate('/ranktable') }
        }
    ]

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
                setIsPopupOpen(false);
            } else {
                alert("Could not fetch questions. Please try different settings.");
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("Error fetching questions.");
        }
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

    // Calculate score
    const score = questions.reduce((acc, q, idx) => {
        if (userAnswers[idx] === q.correct_answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    return (
        <div className="relative h-screen w-full bg-slate-950">
            <div className="absolute top-4 left-0 right-0 z-30">
                <NavBar {...{ navItems: navItems }} />
            </div>

            {!isQuestionWindowOpen && !isGameOver && (
                <div className="flex h-full w-full items-center justify-center pt-16 overflow-hidden px-4">
                    <div className="relative w-full max-w-6xl flex justify-center h-auto items-center">
                        <HeroSection />
                    </div>
                </div>
            )}

            <GamePopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onStartGame={handleStartGame}
            />

            {isQuestionWindowOpen && !isGameOver && questions.length > 0 && (
                <QuestionWindow
                    question={questions[currentQuestionIndex]}
                    currentIndex={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    selectedAnswer={userAnswers[currentQuestionIndex]}
                    onSelectAnswer={handleSelectOption}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}

            {isGameOver && (
                <div className="flex flex-col items-center justify-center h-full text-white bg-slate-900/90 text-2xl z-20 absolute inset-0">
                    <h2 className="text-5xl font-bold mb-6 text-amber-500">Game Over!</h2>
                    <p className="mb-8 text-3xl font-semibold">Your Score: <span className="text-green-400">{score}</span> / {questions.length}</p>
                    <button
                        onClick={resetGame}
                        className="px-8 py-4 bg-amber-500 rounded-xl text-white font-bold hover:bg-amber-600 shadow-lg transition-transform hover:scale-105"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage;