import React from 'react';

export const normalQuestionPath = "M 74 50 A 26 26 0 1 1 126 50 C 126 75, 90 80, 90 110 L 90 125 A 10 10 0 0 0 110 125 L 110 110 C 110 70, 140 65, 140 50 A 40 40 0 0 0 60 50 A 7 7 0 0 0 74 50 Z";
export const flippedQuestionPath = "M 126 50 A 26 26 0 1 0 74 50 C 74 75, 110 80, 110 110 L 110 125 A 10 10 0 0 1 90 125 L 90 110 C 90 70, 60 65, 60 50 A 40 40 0 0 1 140 50 A 7 7 0 0 1 126 50 Z";

const QuestionMark3D = ({ size = 120 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#AAA" floodOpacity="1" />
        </filter>
      </defs>

      {/* Hidden path for morphing target */}
      <path className="flipped-question-path" d={flippedQuestionPath} style={{ display: 'none' }} />

      {/* Hollow Question Mark Body */}
      <path
        className="question-mark-path"
        d={normalQuestionPath}
        fill="none"
        stroke="url(#grad1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#shadow)"
      />

      {/* Hollow Dot */}
      <circle
        cx="100"
        cy="150"
        r="7.5"
        fill="none"
        stroke="url(#grad1)"
        strokeWidth="6"
        filter="url(#shadow)"
      />

      {/* Embedded animated car rect */}
      <rect
        className="car motion-path-car"
        width="6"
        height="10"
        x="-3"
        y="-5"
        fill="#fefce8"
        rx="2"
      />
    </svg>
  );
};

export default QuestionMark3D;