import React, { useEffect, useRef } from 'react';
import { animate, stagger, onScroll } from 'animejs';
import QuestionMark3D from '../svg/questionSvg';
export default function AnimeJsParagraph({ text = "Hello World" }) {
  const containerRef = useRef(null);
  const rightContainerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !rightContainerRef.current) return;

    // 1. Target the elements React rendered
    const words = containerRef.current.querySelectorAll('.anime-char');
    const questions = rightContainerRef.current.querySelectorAll('.question');

    // 2. Apply your exact Anime.js logic
    const animation = animate(words, {
      y: [
        { to: '-2.75rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
      ],
      rotate: {
        from: '-1turn',
        delay: 0
      },
      delay: stagger(50),
      ease: 'inOutCirc',
      loopDelay: 1000,
      loop: false
    });


    const animetion2 = animate(questions, {
      x: [-300, 20], // Come from the left (-300) with a slight right displacement (20)
      rotate: ['-1turn', 0], // Rotate 1 full turn
      scale: [0.3, 1.3], // Start small and increase in scale
      ease: 'outElastic(1, 0.6)', // Bouncy landing effect
      duration: 2000,
      delay: stagger(200, { start: 300 })
    });

    // 3. Cleanup function to stop animation if the component unmounts
    return () => {
      if (animation && typeof animation.pause === 'function') animation.pause();
      if (animetion2 && typeof animetion2.pause === 'function') animetion2.pause();
    };
  }, []);

  return (
    <div className='flex flex-row justify-between items-center gap-8 w-full mx-auto mt-20 mb-20 max-w-[70vw]'>
      <div className='flex flex-row border-2 border-amber-100 shadow-amber-200 rounded-3xl shrink-0 bg-amber-950 m-2.5 p-3.5' ref={rightContainerRef} >
        <QuestionMark3D data-x="80" className="question" />
        <QuestionMark3D data-x="170" className="question" />
        <QuestionMark3D data-x="270" className="question" />
      </div>
      <p ref={containerRef} className='flex flex-wrap text-2xl sm:text-5xl md:text-4xl text-right justify-end font-serif'>
        {/* Split the text the "React Way" */}
        {text.split(' ').map((word, index) => (
          <span
            key={index}
            className="anime-char"
            // Inline-block or flex is required for transforms (y, rotate) to work on text
            style={{ display: 'inline-block', whiteSpace: 'pre', marginRight: '0.4rem' }}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}