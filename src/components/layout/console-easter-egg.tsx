'use client';

import { useEffect, useRef } from 'react';

export default function ConsoleEasterEgg() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    console.log(
      `%c🚨 Developer Detected!\n\n👋 Hi, I'm Likhith\n\n😏 What are you doing here?\n\nWhile you're here, remember to stay hydrated 💧\n\nHave a great day! 🚀`,
      'color: #475569; font-size: 13px; font-family: monospace; font-weight: 500; line-height: 1.5;'
    );
  }, []);

  return null;
}
