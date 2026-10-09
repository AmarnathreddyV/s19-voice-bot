import React, { useState, useEffect } from 'react';
import { AudioFrequencyBar } from './AudioFrequencyBar';
import ixxPodPng from '../assets/images/ixx_character_transparent.png';

interface IxxPodCharacterProps {
  state: 'IXX IS LISTENING' | 'IXX IS SPEAKING' | 'IXX IS THINKING' | 'IXX IS READY' | 'IXX IS CONNECTING' | 'OFFLINE';
  speechLevel: number;
  isHovered: boolean;
  facingDirection: 'left' | 'right';
  onClick: () => void;
}

export const IxxPodCharacter: React.FC<IxxPodCharacterProps> = ({
  state,
  speechLevel,
  isHovered,
  facingDirection,
  onClick,
}) => {
  const isSpeaking = state === 'IXX IS SPEAKING';
  const isListening = state === 'IXX IS LISTENING';
  const isThinking = state === 'IXX IS THINKING';

  // Smooth realistic 3D hovering physics
  const [floatOffset, setFloatOffset] = useState(0);
  const [bankingTilt, setBankingTilt] = useState(0);

  useEffect(() => {
    let frameId: number;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Gentle floating hover wave
      const floatY = Math.sin(elapsed * 2.1) * 8;
      // Subtle dynamic pitch tilt
      const tilt = Math.cos(elapsed * 1.5) * 2.2;
      setFloatOffset(floatY);
      setBankingTilt(tilt);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="IXX - S.19 3D Roaming Consultant (Tap to talk)"
      className="relative cursor-pointer select-none group focus:outline-none flex flex-col items-center"
      style={{
        transform: `translateY(${floatOffset}px) rotate(${bankingTilt}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Subtle Atmospheric Energy Aura — no white shadows */}
      <div
        className={`absolute inset-4 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? 'bg-[#E27D60]/25 scale-110 animate-pulse'
            : isListening
            ? 'bg-emerald-500/20 scale-105'
            : isThinking
            ? 'bg-amber-500/20 scale-100'
            : isHovered
            ? 'bg-[#E27D60]/15 scale-105'
            : 'bg-transparent opacity-0'
        }`}
      />

      {/* Floating 3D Contact Shadow on the virtual ground */}
      <div
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 h-4 rounded-full blur-sm transition-all duration-300 pointer-events-none ${
          isSpeaking
            ? 'w-48 bg-[#171715]/25 scale-105'
            : isListening
            ? 'w-44 bg-[#171715]/20 scale-100'
            : 'w-40 bg-[#171715]/15 scale-95'
        }`}
        style={{
          transform: `translateX(-50%) scale(${1 - Math.abs(floatOffset) / 35})`,
          opacity: 0.35 - floatOffset * 0.01,
        }}
      />

      {/* Aerodynamic Hover Thruster Vapor Mist under exhaust nozzles — as in reference pic */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-9 pointer-events-none rounded-full blur-md opacity-75 z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.75) 0%, rgba(240,240,240,0.35) 45%, transparent 75%)',
        }}
      />

      {/* Floating Status & Name Pill Badge — exactly as in reference pic */}
      <div className="mb-0.5 pointer-events-none z-30">
        <div className="px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md border border-white/20 bg-[#171715]/95 text-[#FAF8F4] backdrop-blur-sm transition-all duration-300">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isSpeaking
                ? 'bg-[#E27D60] animate-pulse'
                : isListening
                ? 'bg-emerald-400 animate-pulse'
                : isThinking
                ? 'bg-amber-400 animate-bounce'
                : 'bg-white/70'
            }`}
          />
          <span className="font-semibold text-white/95">IXX</span>
        </div>
      </div>

      {/* Main 3D Vehicle Pod Body (Accurate silhouette and interior orientation matching reference pic) */}
      <div className="relative w-64 sm:w-76 aspect-[797/856] flex items-center justify-center">
        <img
          src={ixxPodPng}
          alt="IXX 3D Flying Capsule Pod"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_14px_24px_rgba(23,23,21,0.22)]"
          draggable={false}
        />

        {/* Small Audio Frequency Sound Bar directly ON the vehicle beltline */}
        <div
          className="absolute top-[67.8%] left-[26%] w-[16%] h-[2.8%] min-h-[8px] max-h-[11px] z-20 flex items-center justify-center overflow-hidden rounded-full pointer-events-none bg-[#111111]/80 backdrop-blur-[0.5px] border border-white/30 shadow-[0_0_6px_rgba(226,125,96,0.35)]"
          style={{
            transform: 'rotate(-1.5deg)',
          }}
        >
          <AudioFrequencyBar
            state={state}
            speechLevel={speechLevel}
            barCount={11}
          />
        </div>
      </div>
    </div>
  );
};
