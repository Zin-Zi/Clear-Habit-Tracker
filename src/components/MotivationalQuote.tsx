import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const QUOTES = [
  'Discipline beats motivation.',
  'Small steps every day.',
  'You are stronger than urges.',
  'Progress, not perfection.',
  'One more day. Always.',
  'Focus. Breathe. Continue.',
  'Winners never quit.',
  'Your future self is watching.',
];

const ROTATE_MS = 8000;

/* Floating motivational quote above the bottom bar. Rotates with a soft
   fade + rise; pointer-transparent so it never blocks taps. */
export const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[104px] z-10 flex justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex max-w-[300px] items-center gap-2 rounded-full bg-white/10 px-4 py-2 shadow-xl backdrop-blur-md"
        >
          <Quote className="h-3 w-3 shrink-0 text-zinc-100" strokeWidth={2.5} />
          <span className="truncate text-xs font-semibold tracking-wide text-zinc-100 drop-shadow-sm">
            {QUOTES[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
