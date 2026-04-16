import React from "react";

const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

const QuestionWindow = ({ 
    question, 
    currentIndex, 
    totalQuestions, 
    selectedAnswer, 
    onSelectAnswer, 
    onNext, 
    onPrev 
}) => {
    if (!question) return null;

    const getOptionStyle = (option) => {
        if (!selectedAnswer) {
            return "bg-white/10 border-white/20 hover:bg-amber-500 hover:text-white hover:scale-[1.02] cursor-pointer text-white";
        }
        
        if (option === question.correct_answer) {
            return "bg-green-500 text-white border-green-400 font-bold scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)]";
        }
        
        if (option === selectedAnswer) {
            return "bg-red-500 text-white border-red-400 scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.3)]";
        }
        
        return "bg-white/5 border-white/10 text-white/50 cursor-not-allowed";
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 backdrop-blur-sm z-20 absolute inset-0 text-white">
            <div className="bg-slate-900/90 p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-amber-500/30 flex flex-col h-150 justify-between">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-amber-400 font-semibold text-lg bg-amber-500/10 px-3 py-1 rounded-lg">
                            Question {currentIndex} of {totalQuestions}
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 text-sm px-3 py-1 rounded-lg border border-amber-500/30">
                            {decodeHTML(question.category)} - <span className="capitalize">{question.difficulty}</span>
                        </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-8 text-white leading-relaxed min-h-20">
                        {decodeHTML(question.question)}
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                disabled={!!selectedAnswer}
                                onClick={() => onSelectAnswer(option)}
                                className={`text-left w-full px-6 py-4 rounded-xl border transition-all duration-300 ${getOptionStyle(option)}`}
                            >
                                <div className="flex justify-between items-center text-lg">
                                    <span>{decodeHTML(option)}</span>
                                    {selectedAnswer && option === question.correct_answer && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {selectedAnswer && option === selectedAnswer && option !== question.correct_answer && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    <button
                        onClick={onPrev}
                        disabled={currentIndex === 1}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </button>
                    
                    <button
                        onClick={onNext}
                        disabled={!selectedAnswer}
                        className="px-8 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                    >
                        {currentIndex === totalQuestions ? 'Finish Game' : 'Next Question'}
                        {currentIndex !== totalQuestions && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionWindow;