'use client';
import React, { useEffect, useRef, useState } from 'react';

interface ExamplePromptsProps {
  examples?: string[];
  onChooseAndSubmit: (prompt: string) => void;
  className?: string;
}

export default function ExamplePrompts({
  examples = [
    'All green creatures with flying',
    'Artifacts that cost exactly two mana and have a tap ability',
    'Vampires from the Innistrad set',
    'Blue instants that draw cards and cost three mana or less',
    'Cards with a cat in the artwork',
  ],
  onChooseAndSubmit,
  className = '',
}: ExamplePromptsProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // auto-rotate every 5s
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % examples.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, examples.length]);

  const choose = (i: number) => {
    const p = examples[i];
    onChooseAndSubmit(p);
    setIndex(i);
  };

  return (
    <div
      className={`w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-2 text-sm text-gray-500">Example prompts</div>

      <div className="relative">
        {/* Slide area */}
        <div className="min-h-[56px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700">
          <button
            className="text-left w-full text-sm sm:text-base leading-snug text-slate-800 dark:text-slate-100"
            onClick={() => choose(index)}
            aria-label={`Use example: ${examples[index]}`}
          >
            {examples[index]}
          </button>
        </div>

        {/* Dots / items */}
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {examples.map((ex, i) => (
            <button
              key={ex}
              onClick={() => choose(i)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm border transition-colors duration-150 whitespace-nowrap
                ${
                  i === index
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
