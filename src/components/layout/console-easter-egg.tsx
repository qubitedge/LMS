'use client';

import { useEffect, useRef } from 'react';

export default function ConsoleEasterEgg() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    console.clear();

    console.log(`
██╗  ██╗██╗
██║  ██║██║
███████║██║
██╔══██║██║
██║  ██║██║
╚═╝  ╚═╝╚═╝

██╗███╗   ███╗
██║████╗ ████║
██║██╔████╔██║
██║██║╚██╔╝██║
██║██║ ╚═╝ ██║
╚═╝╚═╝     ╚═╝

██╗     ██╗██╗  ██╗██╗██╗████████╗██╗  ██╗
██║     ██║██║ ██╔╝██║██║╚══██╔══╝██║  ██║
██║     ██║█████╔╝ ██║██║   ██║   ███████║
██║     ██║██╔═██╗ ██║██║   ██║   ██╔══██║
███████╗██║██║  ██╗██║██║   ██║   ██║  ██║
╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝

👋 Hi, I'm Likhith.

If you're reading this,
you're either a developer 🧑💻,
a recruiter 💼,
or someone who pressed F12 by accident 😂


Wanna contact me?

Find me 😉
`);
  }, []);

  return null;
}
