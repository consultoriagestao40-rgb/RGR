'use client';

import { useEffect } from 'react';

/**
 * Hook global que fecha modais ou drawers ao pressionar a tecla ESC.
 * @param isOpen Se o modal está aberto atualmente
 * @param onClose Callback para fechar o modal
 */
export function useEscKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}
