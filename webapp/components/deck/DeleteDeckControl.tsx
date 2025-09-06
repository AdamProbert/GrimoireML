'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '../ui/ConfirmModal';
import { deleteDeck } from '../../lib/deckStore';

interface DeleteDeckControlProps {
  deckId: number;
  deckName: string;
  buttonClassName?: string;
  redirectTo?: string;
  onDeleted?: () => void;
}

export default function DeleteDeckControl({
  deckId,
  deckName,
  buttonClassName = 'btn btn-outline btn-sm border-red-500 text-red-500 hover:bg-red-500/10',
  redirectTo = '/my-decks',
  onDeleted,
}: DeleteDeckControlProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteDeck(deckId);
      if (onDeleted) onDeleted();
      router.push(redirectTo);
    } catch (e: any) {
      setError(e.message || 'Failed to delete deck');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        Delete
      </button>
      <ConfirmModal
        opened={open}
        title="Delete Deck?"
        confirmLabel="Delete"
        destructive
        loading={loading}
        error={error}
        onConfirm={handleDelete}
        onCancel={() => {
          if (loading) return;
          setOpen(false);
        }}
      >
        <p>
          Permanently delete deck <strong>{deckName}</strong>? This action cannot be
          undone.
        </p>
      </ConfirmModal>
    </>
  );
}
