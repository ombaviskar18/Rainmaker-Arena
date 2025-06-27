'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export function ConfettiEffect({ show, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        color: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            top: -20,
          }}
          initial={{ y: -20, opacity: 1, scale: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            scale: [0, 1, 1, 0],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 3,
            ease: 'easeOut',
            times: [0, 0.1, 0.9, 1],
          }}
        />
      ))}
    </div>
  );
} 