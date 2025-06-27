'use client';

import { useCallback } from 'react';

export function useSoundEffects() {
  const playSound = useCallback((type: 'correct' | 'incorrect' | 'hint' | 'start' | 'finish') => {
    // Note: For a full implementation, you would load and play audio files here
    // For now, we'll use browser's built-in audio feedback or visual feedback
    
    if (typeof window !== 'undefined') {
      switch (type) {
        case 'correct':
          // Success sound - you could load a success.mp3 file
          console.log('🎉 Correct answer sound');
          break;
        case 'incorrect':
          // Error sound - you could load an error.mp3 file
          console.log('❌ Incorrect answer sound');
          break;
        case 'hint':
          // Hint sound - you could load a hint.mp3 file
          console.log('💡 Hint sound');
          break;
        case 'start':
          // Game start sound
          console.log('🚀 Game start sound');
          break;
        case 'finish':
          // Game finish sound
          console.log('🏁 Game finish sound');
          break;
      }
    }
  }, []);

  // For visual feedback instead of audio (accessibility-friendly)
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(50);
          break;
        case 'medium':
          navigator.vibrate(100);
          break;
        case 'heavy':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    }
  }, []);

  return {
    playSound,
    triggerHapticFeedback,
  };
} 