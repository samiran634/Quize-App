import React, { useState } from 'react';

const GamePopup = ({ isOpen, onClose, onStartGame }) => {
    const [category, setCategory] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [difficulty, setDifficulty] = useState('medium');

    if (!isOpen) return null;

    const handleStart = (e) => {
        e.preventDefault();
        onStartGame({ category, numQuestions, difficulty });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-[fadeIn_0.3s_ease-out]">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-bold text-center text-amber-600 mb-6 border-b-2 border-amber-200 pb-2">
                    Let's Play!
                </h2>

                <form onSubmit={handleStart} className="space-y-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category
                        </label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            <option value="9">General Knowledge</option>
                            <option value="10">Entertainment:Books</option>
                            <option value="11">Entertainment:Films</option>
                            <option value="12">Entertainment:Musics</option>
                            <option value="13">Entertainment:Musicals and Theaters</option>
                            <option value="14">Entertainment:Television</option>
                            <option value="15">Entertainment:VideoGames</option>
                            <option value="16">Entertainment:BroadGames</option>
                            <option value="17">Science&Nature</option>
                            <option value="18">Science:Computers</option>
                            <option value="19">Science: Mathamatics</option>
                            <option value="20">Mythology</option>
                            <option value="21">Sports</option>
                            <option value="22">Geography</option>
                            <option value="23">History</option>
                            <option value="24">Polity</option>
                            <option value="25">Art</option>
                            <option value="26">Celibrities</option>
                            <option value="27">Animals</option>
                            <option value="28">Vehicles</option>
                            <option value="29">Entertainment:Comics</option>
                            <option value="30">Science:Gadget</option>
                            <option value="31">Entertainment:JapaneseAnime&Manga</option>
                            <option value="32">Entertainment:Cartoon&Animation</option>
                        </select>
                    </div>

                    {/* Number of Questions */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Questions
                        </label>
                        <input 
                            type="number" 
                            min="1" 
                            max="50"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Difficulty Level
                        </label>
                        <select 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                            required
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 mt-8">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Game
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GamePopup;
