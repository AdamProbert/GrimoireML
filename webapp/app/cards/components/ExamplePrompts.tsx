'use client';
import React, { useEffect, useRef, useState } from 'react';

interface ExamplePromptsProps {
  examples?: string[];
  onChooseAndSubmit: (prompt: string) => void;
  className?: string;
}

// Pick a next index from examples. Returns current when length <= 1.
function selectExampleIndex(examples: string[], current: number) {
  if (!examples || examples.length <= 1) return current;
  let next = Math.floor(Math.random() * examples.length);
  let attempts = 0;
  while (next === current && attempts < 5) {
    next = Math.floor(Math.random() * examples.length);
    attempts += 1;
  }
  return next;
}

export default function ExamplePrompts({
  examples = [
    'All green creatures with flying',
    'Artifacts that cost exactly two mana and have a tap ability',
    'Vampires from the Innistrad set',
    'Blue instants that draw cards and cost three mana or less',
    'Cards with a cat in the artwork',
    'Legendary creatures that cost four mana or less',
    'Enchantments that grant lifelink to creatures',
    'Black sorceries that make an opponent discard two or more cards',
    'Red spells that deal exactly three damage to any target',
    'Nonbasic lands that enter the battlefield tapped',
  ],
  onChooseAndSubmit,
  className = '',
}: ExamplePromptsProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // auto-rotate every 3s
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (!paused && examples.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setIndex((current) => selectExampleIndex(examples, current));
      }, 3000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, examples.length]);

  const choose = (i: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    const p = examples[i];
    onChooseAndSubmit(p);
    setIndex(i);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative example-prompts">
        {/* Carousel wrapper - shows one item at a time, minimal surface */}
        <div className="overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {examples.map((ex, i) => (
              <div
                key={ex}
                className="flex-shrink-0 w-full p-2 flex items-center justify-center"
                aria-hidden={i !== index}
              >
                <button
                  onClick={(e) => choose(i, e)}
                  aria-label={`Use example: ${ex}`}
                  className={`text-center w-full text-sm sm:text-base leading-snug prompt-item relative overflow-hidden text-white transition-transform duration-150 ease-out transform hover:scale-105 hover:bg-white/6 rounded`}
                >
                  <span className="prompt-inner">{ex}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
