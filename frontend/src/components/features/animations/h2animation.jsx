import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import robotAnimation from '../svg/robot.lottie?url';

export default function AnimeJsHeading({ text = "Hello World" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Target the elements React rendered
    const chars = containerRef.current.querySelectorAll('.anime-char');

    // 2. Apply your exact Anime.js logic
    const animation = animate(chars, {
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
      loop: true
    });

    // 3. Cleanup function to stop animation if the component unmounts
    return () => animation.pause();
  }, []);

  return (
    <div className='flex flex-col shadow-[0_0_30px_rgba(253,230,138,0.6)] border border-amber-200/30 max-w-[80w]'>
      <div>
        <DotLottieReact
          src={robotAnimation}
          loop
          autoplay
        />
      </div>
      <h2 ref={containerRef} style={{ display: 'flex' }} className='text-5xl justify-center m-3.5 p-4 rounded-lg'>
        {/* Split the text the "React Way" */}
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="anime-char"
            // Inline-block or flex is required for transforms (y, rotate) to work on text
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </span>
        ))}
      </h2>
    </div>
  );
}