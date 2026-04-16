
import React, { useState, useEffect } from 'react';
const LeftSection=()=>{

      const [bgIndex, setBgIndex] = useState(0);
      const images = [
        '/login_hero_dunes_1774683905464.png',
        '/login_hero_mountains_1774683937830.png',
        '/login_hero_abstract_1774683956577.png'
      ];
    
      useEffect(() => {
        const timer = setInterval(() => {
          setBgIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
      }, [images.length]);
    return (
         <div className="hidden md:flex md:w-[48%] relative p-4 flex-col justify-between">
          <div 
            className="absolute inset-4 rounded-[1.5rem] bg-cover bg-center transition-all duration-700 ease-in-out" 
            style={{ backgroundImage: `url(${images[bgIndex]})` }}
          ></div>
          <div className="absolute inset-4 rounded-[1.5rem] bg-black/20 mix-blend-multiply"></div>
          
          <div className="relative z-10 flex justify-between items-center px-6 pt-6">
            <div className="flex items-center font-bold text-white text-3xl tracking-[0.2em]">
              <span className="pt-1">QuizoFun</span>
            </div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/90 px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-all border border-white/10" onClick={()=>location.href='/'}>
              Back to website
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 px-8 pb-12 text-center">
            <h1 className="text-white text-[2.5rem] leading-[1.2] font-medium mb-12 drop-shadow-lg">
              Capturing Moments,<br />Creating Memories
            </h1>
            <div className="flex justify-center gap-3">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setBgIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${bgIndex === idx ? 'w-10 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
    )
}
export default LeftSection;