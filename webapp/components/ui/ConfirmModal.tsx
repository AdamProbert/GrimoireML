'use client';
import { ReactNode } from 'react';
import { Modal, Alert } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  disableCloseWhileLoading?: boolean;
  centered?: boolean;
}

export default function ConfirmModal({
  opened,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
  error = null,
  onConfirm,
  onCancel,
  disableCloseWhileLoading = true,
  centered = true,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (loading && disableCloseWhileLoading) return;
        onCancel();
      }}
      title={title}
      centered={centered}
    >
      <div className="flex flex-col gap-4 text-sm">
        {children}
        {error && (
          <Alert color="red" variant="light" title="Error" className="text-xs">
            {error}
          </Alert>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`btn btn-sm ${
              destructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'
            } disabled:opacity-60`}
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
