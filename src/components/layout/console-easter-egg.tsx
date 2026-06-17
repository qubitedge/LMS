'use client';

import { useEffect, useRef } from 'react';

export default function ConsoleEasterEgg() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    console.log(
      `%c🚨 Developer Detected!\n👋 Hi, I'm Likhith\n😏 What are you doing here?\nWhile you're here, remember to stay hydrated 💧\nHave a great day! 🚀`,
      'color: #ffffff; font-size: 13px; font-family: monospace; font-weight: 500; line-height: 1.2;'
    );
  }, []);

  return null;
}
