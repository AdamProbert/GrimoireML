'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import quilIcon from '../../../assets/quill_icon_without_hexagon.png';
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

function formatPrompt(p: string) {
  if (!p) return p;
  return p.endsWith('…') ? p : `${p}…`;
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
        <div className="flex items-center justify-start">
          {/* Left: static icon column (persists while right side fades) */}
          <div
            style={{
              flex: '0 0 64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                position: 'relative',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image src={quilIcon} alt="try" width={48} height={48} />
            </div>
          </div>

          {/* Right: fading area containing the button */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Transition
              mounted={visible}
              transition="fade"
              duration={transitionDuration}
              timingFunction="ease"
            >
              {(styles) => (
                <div style={styles} className="w-full prompt-fade-wrapper">
                  <Button
                    className="prompt-button"
                    variant="subtle"
                    onClick={() => choose(index)}
                    aria-label={`Try prompt: ${formatPrompt(examples[index])}`}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      padding: '0.6rem 0.6rem',
                      borderRadius: 8,
                      transition: 'transform 150ms ease',
                      transform: 'translateY(0)',
                      display: 'flex',
                      overflow: 'visible',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Text size="sm" className="prompt-text">
                        {formatPrompt(examples[index])}
                      </Text>
                    </div>
                  </Button>
                </div>
              )}
            </Transition>
          </div>
        </div>
      </div>
    </div>
  );
}
