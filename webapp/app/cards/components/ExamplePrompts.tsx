'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Transition, Text } from '@mantine/core';

interface ExamplePromptsProps {
  examples?: string[];
  onChooseAndSubmit: (prompt: string) => void;
  className?: string;
}

// Pick a next index from examples. Returns current when length <= 1.
function selectExampleIndex(examples: string[], current: number) {
  // Always move forward (down) one step. If length <= 1 return current.
  if (!examples || examples.length <= 1) return current;
  return (current + 1) % examples.length;
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
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const transitionDuration = 220;

  // Auto-rotate sequentially with a fade-out / fade-in transition
  const goNext = () => {
    if (!examples || examples.length <= 1) return;
    setVisible(false);
    window.setTimeout(() => {
      setIndex((current) => selectExampleIndex(examples, current));
      // small timeout to allow DOM update before fading in
      window.setTimeout(() => setVisible(true), 10);
    }, transitionDuration);
  };

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (!paused && examples.length > 0) {
      intervalRef.current = window.setInterval(() => {
        goNext();
      }, 3000);
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
    <div className={`w-full ${className}`}>
      <div className="example-prompts">
        <div className="flex items-center justify-center">
          <Transition
            mounted={visible}
            transition="fade"
            duration={transitionDuration}
            timingFunction="ease"
          >
            {(styles) => (
              <div style={styles} className="w-full max-w-xl px-2">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="subtle"
                    onClick={() => choose(index)}
                    aria-label={`Try prompt: ${examples[index]}`}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      background: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      transition: 'transform 150ms ease',
                      transform: 'translateY(0)',
                    }}
                  >
                    <Text size="sm">{examples[index]}</Text>
                  </Button>
                </div>
              </div>
            )}
          </Transition>
        </div>
      </div>
    </div>
  );
}
