'use client';
import React from 'react';
import { Text } from '@mantine/core';

interface SearchFeedbackProps {
  error: string | null;
  warnings: string[];
}

/**
 * Displays parse warnings and errors for the search experience.
 */
export const SearchFeedback: React.FC<SearchFeedbackProps> = ({ error, warnings }) => {
  if (!error && warnings.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {error && (
        <Text c="red" size="sm" role="alert">
          {error}
        </Text>
      )}
      {warnings.length > 0 && (
        <Text size="xs" c="orange">
          Warnings: {warnings.join(', ')}
        </Text>
      )}
    </div>
  );
};

export default SearchFeedback;
