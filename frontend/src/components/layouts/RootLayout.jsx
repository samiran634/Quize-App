import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import { animate, svg } from 'animejs';
import QuestionMark3D from '../features/svg/questionSvg';

const RootLayout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    const [showLoader, setShowLoader] = useState(false);
    const animationsRef = useRef({ car: null, path: null, morph: null });

    useEffect(() => {
        if (isLoading) {
            // Show loader immediately
            setShowLoader(true);

            // Start animations after a brief delay for DOM to render
            const timer = setTimeout(() => {
                try {
                    // Animate the car along the question mark path
                    animationsRef.current.car = animate('.car', {
                        ease: 'inOutElastic(1,0.3)',
                        duration: 1000,
                        alternate: true,
                        loop: true,
                        ...svg.createMotionPath('.question-mark-path')
                    });

                    // Animate the path drawing
                    animationsRef.current.path = animate(svg.createDrawable('.question-mark-path'), {
                        draw: '0 1',
                        ease: 'inOutElastic(1,0.3)',
                        duration: 1000,
                        alternate: true,
                        loop: true,
                    });
                    // Animate the path morphing
                    animationsRef.current.morph = animate('.question-mark-path', {
                        d: svg.morphTo('.flipped-question-path'),
                        ease: 'inOutCirc',
                        duration: 500,
                        direction: 'alternate',
                        alternate: true,
                        loop: true
                    });
                } catch (error) {
                    // Silent fail - loader is still visible
                    console.log(error);
                }
            }, 5);

            return () => {
                clearTimeout(timer);
                setShowLoader(false);

                // Clean up all animations
                try {
                    if (animationsRef.current.car?.pause) animationsRef.current.car.pause();
                    if (animationsRef.current.path?.pause) animationsRef.current.path.pause();
                    if (animationsRef.current.morph?.pause) animationsRef.current.morph.pause();
                } catch (error) {
                    // Silent cleanup
                    console.log(error)
                }
            };
        }
    }, [isLoading]);

    return (
        <>
            {/* Progressive Status Bar */}
            <div
                className={`fixed top-0 left-0 h-1 bg-amber-500 z-[10000] duration-300 ease-out`}
                style={{
                    width: isLoading ? '85%' : '100%',
                    opacity: isLoading ? 1 : 0,
                    transition: isLoading ? 'width 1s ease-out, opacity 0.2s' : 'width 0.3s, opacity 0.3s ease-in 0.3s'
                }}
            />

            {showLoader ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(2, 6, 23, 0.95)',
                        zIndex: 9999
                    }}
                >
                    <div className="flex flex-col items-center gap-6" style={{ textAlign: 'center' }}>
                        <div
                            className="question-mark-wrapper"
                            style={{
                                transform: 'scale(1.5)',
                                display: 'inline-block',
                                minWidth: '180px',
                                minHeight: '180px'
                            }}
                        >
                            <QuestionMark3D size={120} />
                        </div>
                        <p
                            className="text-amber-500 text-xl font-semibold animate-pulse"
                            style={{
                                color: '#f59e0b',
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginTop: '1rem'
                            }}
                        >
                            Loading...
                        </p>
                    </div>
                </div>
            ) : <Outlet />}

        </>
    );
};

export default RootLayout;
