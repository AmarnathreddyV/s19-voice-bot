import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  X,
} from 'lucide-react';
import { SKIN_PHASES } from '../data/phases';
import { SkinPhaseId } from '../types';
import { S19ProductDetails, matchProductFromText } from '../data/productCatalog';
import { ProductRecommendationPopup } from './ProductRecommendationPopup';
import { IxxPodCharacter } from './IxxPodCharacter';

interface RoamingIxxConsultantProps {
  currentPhaseId?: SkinPhaseId | null;
  onNavigateToFinder?: () => void;
  onSelectPhase?: (phaseId: string) => void;
}

type AssistantState =
  | 'IXX IS CONNECTING'
  | 'IXX IS LISTENING'
  | 'IXX IS THINKING'
  | 'IXX IS SPEAKING'
  | 'IXX IS READY'
  | 'OFFLINE';

// Instant zero-delay skincare intelligence engine
function getInstantSkincareAnswer(query: string, phaseId?: SkinPhaseId | null): string | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // Oily skin / excess sebum / shine / pores / grease
  if (
    q.includes('oil') ||
    q.includes('sebum') ||
    q.includes('shine') ||
    q.includes('pore') ||
    q.includes('greas')
  ) {
    return "For oily skin and midday shine, S.19 recommends Sebum Control Capsule Cream with encapsulated salicylic acid and tranexamic acid to balance excess oil for ₹1,250!";
  }

  // Dry skin / dehydration / tightness / flaking / parched
  if (
    q.includes('dry') ||
    q.includes('dehydrat') ||
    q.includes('tight') ||
    q.includes('flake') ||
    q.includes('parched') ||
    q.includes('thirsty')
  ) {
    return "For dryness and skin tightness, S.19 recommends Hydrating Capsule Cream with 5% 13D Hyaluronic Acid and Pentavitin for ₹1,300!";
  }

  // Dark spots / uneven tone / pigmentation / marks / scars / tan
  if (
    q.includes('dark spot') ||
    q.includes('pigment') ||
    q.includes('uneven') ||
    q.includes('tone') ||
    q.includes('mark') ||
    q.includes('blemish') ||
    q.includes('tan')
  ) {
    return "For uneven skin tone and dark spots, S.19 recommends TXA + NIA Capsule Cream with 4% tranexamic acid, 2% niacinamide, and rose PDRN for ₹1,300!";
  }

  // Sensitive / irritation / burning / damaged barrier / redness
  if (
    q.includes('sensitiv') ||
    q.includes('irritat') ||
    q.includes('burn') ||
    q.includes('barrier') ||
    q.includes('red') ||
    q.includes('damage')
  ) {
    return "When your skin barrier is sensitive or irritated, S.19 pauses all active treatments and recommends PDRN Collagen Capsule Cream with salmon PDRN for ₹1,650.";
  }

  // Prices / cost / how much
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('how much') ||
    q.includes('rate')
  ) {
    return "S.19 capsule creams are ₹1,250 for Sebum Control, ₹1,300 for Hydrating and TXA + NIA, and ₹1,650 for PDRN Collagen (65g each)!";
  }

  // Product lineup
  if (
    q.includes('product') ||
    q.includes('creams') ||
    q.includes('what do you have') ||
    q.includes('catalogue') ||
    q.includes('range')
  ) {
    return "S.19 offers four capsule creams: Hydrating for ₹1,300, TXA + NIA for ₹1,300, PDRN Collagen for ₹1,650, and Sebum Control for ₹1,250!";
  }

  // Identity / role
  if (
    q.includes('who are you') ||
    q.includes('what is ixx') ||
    q.includes('your name')
  ) {
    return "I'm IXX, your S.19 skincare consultant! What's bothering your skin today?";
  }

  // How to use / routine
  if (
    q.includes('how to use') ||
    q.includes('apply') ||
    q.includes('routine') ||
    q.includes('when')
  ) {
    return "Apply morning and evening after gentle cleansing. Warm a pearl-sized amount between your fingertips and gently press into your face and neck!";
  }

  // Current phase check if active
  if (phaseId && SKIN_PHASES[phaseId] && (q.includes('my phase') || q.includes('this phase') || q.includes('my skin'))) {
    const p = SKIN_PHASES[phaseId];
    return `You're currently in the ${p.title} phase! S.19 recommends ${p.recommendedProduct} to care for it.`;
  }

  return null;
}

export const RoamingIxxConsultant: React.FC<RoamingIxxConsultantProps> = ({
  currentPhaseId,
  onNavigateToFinder,
  onSelectPhase,
}) => {
  // Screen roaming position: starts placed comfortably over hero section as shown in reference pic
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth > 900;
      return {
        x: isDesktop ? Math.max(30, Math.min(window.innerWidth * 0.22, window.innerWidth - 340)) : 20,
        y: isDesktop ? Math.max(70, Math.min(130, window.innerHeight * 0.16)) : 90,
      };
    }
    return { x: 260, y: 120 };
  });

  const [facingDirection] = useState<'left' | 'right'>('left');
  const [isRoamingEnabled, setIsRoamingEnabled] = useState(false); // Clean and stable by default as shown in picture
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Toggle to remove or restore IXX
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Live Speech & Voice states
  const [assistantState, setAssistantState] = useState<AssistantState>('IXX IS LISTENING');
  const [isMicActive, setIsMicActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speechLevel, setSpeechLevel] = useState<number>(0);

  // Subtitle banner — starts hidden so IXX looks exactly clean as in reference pic
  const [activeSpeechSubtitle, setActiveSpeechSubtitle] = useState<string>('');
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
  const subtitleDismissTimerRef = useRef<any>(null);

  // Pop-up product recommendation when IXX recommends a cream
  const [recommendedProduct, setRecommendedProduct] = useState<S19ProductDetails | null>(null);

  // Audio & speech references
  const isMutedRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isMicActiveRef = useRef<boolean>(true);
  const speechAnimationIntervalRef = useRef<any>(null);

  // Speech Recognition & Instant Endpointing
  const silenceDetectionTimerRef = useRef<any>(null);
  const speechRecognizerRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const lastProcessedTranscriptRef = useRef<string>('');

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  // Display subtitle with auto-dismiss after speaking finishes
  const setSpokenSubtitle = useCallback((text: string) => {
    setActiveSpeechSubtitle(text);
    setShowSubtitle(true);
    if (subtitleDismissTimerRef.current) {
      clearTimeout(subtitleDismissTimerRef.current);
    }
    subtitleDismissTimerRef.current = setTimeout(() => {
      if (!isSpeakingRef.current) {
        setShowSubtitle(false);
      }
    }, 6000);
  }, []);

  // Inspect recommended cream in speech
  const inspectRecommendationInText = useCallback((text: string) => {
    const matched = matchProductFromText(text);
    if (matched) {
      setRecommendedProduct(matched);
    }
  }, []);

  // Stop any ongoing audio/speech
  const stopAudioPlayback = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechAnimationIntervalRef.current) {
      clearInterval(speechAnimationIntervalRef.current);
      speechAnimationIntervalRef.current = null;
    }
    isSpeakingRef.current = false;
    setSpeechLevel(0);
  }, []);

  // ZERO-DELAY SPEECH SYNTHESIS
  // Uses browser native SpeechSynthesis for immediate vocal response within 20ms
  const speakInstantly = useCallback(
    (textToSpeak: string) => {
      if (isMutedRef.current || !textToSpeak.trim()) {
        setAssistantState('IXX IS LISTENING');
        return;
      }

      stopAudioPlayback();

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        // Find warm, natural female English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('samantha') ||
                v.name.toLowerCase().includes('google uk english female') ||
                v.name.toLowerCase().includes('google us english') ||
                v.name.toLowerCase().includes('natural') ||
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('victoria') ||
                v.name.toLowerCase().includes('karen') ||
                v.name.toLowerCase().includes('moira'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.rate = 1.05; // natural snappy conversational pacing
        utterance.pitch = 1.07; // warm, sweet, upbeat feminine tone

        utterance.onstart = () => {
          isSpeakingRef.current = true;
          setAssistantState('IXX IS SPEAKING');

          // Dynamic speech level oscillation for realistic beltline audio bar
          if (speechAnimationIntervalRef.current) clearInterval(speechAnimationIntervalRef.current);
          speechAnimationIntervalRef.current = setInterval(() => {
            const simulatedLevel = 0.35 + Math.random() * 0.6;
            setSpeechLevel(simulatedLevel);
          }, 85);
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
          setSpeechLevel(0);
          if (speechAnimationIntervalRef.current) {
            clearInterval(speechAnimationIntervalRef.current);
            speechAnimationIntervalRef.current = null;
          }
          setAssistantState('IXX IS LISTENING');
          // Auto fade subtitle after 4s
          if (subtitleDismissTimerRef.current) clearTimeout(subtitleDismissTimerRef.current);
          subtitleDismissTimerRef.current = setTimeout(() => {
            setShowSubtitle(false);
          }, 4500);
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
          setSpeechLevel(0);
          if (speechAnimationIntervalRef.current) clearInterval(speechAnimationIntervalRef.current);
          setAssistantState('IXX IS LISTENING');
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback without speech synthesis
        isSpeakingRef.current = false;
        setAssistantState('IXX IS LISTENING');
      }
    },
    [stopAudioPlayback]
  );

  // FAST ANSWER PROCESSOR — ZERO DELAY
  const handleUserQuestion = useCallback(
    async (spokenQuestion: string) => {
      const trimmed = spokenQuestion.trim();
      if (!trimmed || trimmed === lastProcessedTranscriptRef.current) return;
      lastProcessedTranscriptRef.current = trimmed;

      setAssistantState('IXX IS THINKING');
      setShowSubtitle(true);
      setActiveSpeechSubtitle(`"${trimmed}"`);

      // Check user question for direct product mention to pop out immediately
      inspectRecommendationInText(trimmed);

      // 1. FAST-PATH: Instant Skincare Intelligence (0ms network delay!)
      const instantAnswer = getInstantSkincareAnswer(trimmed, currentPhaseId);
      if (instantAnswer) {
        setSpokenSubtitle(instantAnswer);
        inspectRecommendationInText(instantAnswer);
        speakInstantly(instantAnswer);
        return;
      }

      // 2. STREAMING / FAST AI RESPONSE
      try {
        // Fast streaming fetch for real-time text delivery
        const response = await fetch('/api/voice-consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: trimmed,
            phase: currentPhaseId,
            withTts: false, // Don't delay text with heavy server audio generation
          }),
        });

        const data = await response.json();
        const reply =
          data.reply ||
          "I'm right here with you! Tell me what's bothering your skin and I'll find your exact formula.";

        setSpokenSubtitle(reply);
        inspectRecommendationInText(reply);
        speakInstantly(reply);
      } catch (err) {
        console.warn('Voice consult quick fallback:', err);
        const fallback =
          "Hi! Let's get your skin balanced. What's your main concern right now?";
        setSpokenSubtitle(fallback);
        speakInstantly(fallback);
      }
    },
    [currentPhaseId, inspectRecommendationInText, setSpokenSubtitle, speakInstantly]
  );

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 280, dragStartRef.current.startY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Screen Roaming Animation Loop (when enabled)
  useEffect(() => {
    if (!isRoamingEnabled || isDragging || isHovered || isSpeakingRef.current) return;

    const roamingInterval = setInterval(() => {
      const margin = 50;
      const maxX = Math.max(50, window.innerWidth - 350);
      const maxY = Math.max(50, window.innerHeight - 280);

      const nextX = margin + Math.random() * (maxX - margin);
      const nextY = margin + Math.random() * (maxY - margin);

      setPosition({ x: nextX, y: nextY });
    }, 9000);

    return () => clearInterval(roamingInterval);
  }, [isRoamingEnabled, isDragging, isHovered]);

  // Start microphone with FAST endpointing (answers right after question is asked)
  const startMicrophone = useCallback(async () => {
    try {
      setAssistantState('IXX IS LISTENING');
      setIsMicActive(true);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (speechRecognizerRef.current) {
            try {
              speechRecognizerRef.current.stop();
            } catch {
              // ignore
            }
          }

          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = 'en-IN';

          recognizer.onresult = (event: any) => {
            let interim = '';
            let hasFinalChunk = false;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                accumulatedSpeechRef.current += ' ' + transcript;
                hasFinalChunk = true;
              } else {
                interim += transcript;
              }
            }

            const currentSpoken = (accumulatedSpeechRef.current + ' ' + interim).trim();

            if (currentSpoken) {
              if (isSpeakingRef.current) {
                stopAudioPlayback();
              }

              setAssistantState('IXX IS LISTENING');

              if (silenceDetectionTimerRef.current) {
                clearTimeout(silenceDetectionTimerRef.current);
              }

              // FAST ENDPOINTING: If sentence is marked final or ends in question/concern, answer IMMEDIATELY!
              const endsWithQuestion =
                currentSpoken.endsWith('?') ||
                currentSpoken.includes('?') ||
                /\b(what|how|why|which|recommend|cream|price|cost|oily|dry|tone|barrier|face|skin)\b/i.test(
                  currentSpoken
                );

              // 180ms when final chunk with question, 250ms when final, 450ms for interim pause
              const delayMs = hasFinalChunk && endsWithQuestion ? 180 : hasFinalChunk ? 260 : 480;

              silenceDetectionTimerRef.current = setTimeout(() => {
                const finalSpeech = (accumulatedSpeechRef.current + ' ' + interim).trim();
                accumulatedSpeechRef.current = '';

                if (finalSpeech && finalSpeech.length > 2) {
                  handleUserQuestion(finalSpeech);
                }
              }, delayMs);
            }
          };

          recognizer.onerror = (e: any) => {
            if (e.error !== 'no-speech') {
              console.warn('Speech recognition notice:', e.error);
            }
          };

          recognizer.onend = () => {
            if (isMicActiveRef.current) {
              try {
                recognizer.start();
              } catch {
                // ignore
              }
            }
          };

          recognizer.start();
          speechRecognizerRef.current = recognizer;
        } catch (e) {
          console.warn('Speech recognition start note:', e);
        }
      }

      setIsMicActive(true);
      setAssistantState('IXX IS LISTENING');
    } catch {
      setIsMicActive(false);
      setAssistantState('IXX IS READY');
    }
  }, [handleUserQuestion, stopAudioPlayback]);

  const stopMicrophone = useCallback(() => {
    isMicActiveRef.current = false;
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognizerRef.current = null;
    }
    if (silenceDetectionTimerRef.current) {
      clearTimeout(silenceDetectionTimerRef.current);
      silenceDetectionTimerRef.current = null;
    }
    setIsMicActive(false);
    setAssistantState('IXX IS READY');
    setSpeechLevel(0);
  }, []);

  const toggleMic = () => {
    if (isMicActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopAudioPlayback();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Remove IXX and cease all mic & audio operations
  const handleRemoveIxx = useCallback(() => {
    stopMicrophone();
    stopAudioPlayback();
    setIsVisible(false);
  }, [stopMicrophone, stopAudioPlayback]);

  // Pre-load speech voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startMicrophone();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopMicrophone();
      stopAudioPlayback();
    };
  }, [startMicrophone, stopMicrophone, stopAudioPlayback]);

  return (
    <>
      {/* 3D Character Pod Roaming Layer — Identical styling and orientation to user picture */}
      {isVisible && (
        <div
          className="fixed z-50 pointer-events-auto transition-[left,top] duration-700 ease-out select-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Floating Speech Caption — only appears when IXX is speaking or answering */}
          {showSubtitle && activeSpeechSubtitle && (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 sm:w-72 bg-[#171715]/95 backdrop-blur-md text-[#FAF8F4] px-3.5 py-2.5 rounded-xl shadow-2xl border border-white/20 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 z-40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E27D60] animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#E27D60]">
                    IXX &bull; S.19
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubtitle(false)}
                  className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Close subtitle"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-[#FAF8F4] leading-snug font-medium">
                {activeSpeechSubtitle}
              </p>
              {/* Minimal speech bubble pointer */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#171715]/95 border-r border-b border-white/20 rotate-45" />
            </div>
          )}

          {/* 3D Capsule Pod Character with exact badge & interior orientation */}
          <div className="relative flex flex-col items-center">
            {/* Small cross mark to remove IXX */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveIxx();
              }}
              className="absolute -top-1.5 right-1 z-40 w-5 h-5 rounded-full bg-[#171715]/95 hover:bg-[#171715] text-white/70 hover:text-white flex items-center justify-center border border-white/20 shadow-md cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
              title="Remove IXX"
              aria-label="Remove IXX"
            >
              <X className="w-3 h-3" />
            </button>

            <IxxPodCharacter
              state={assistantState}
              speechLevel={speechLevel}
              isHovered={isHovered}
              facingDirection={facingDirection}
              onClick={() => {
                if (!isMicActive) {
                  startMicrophone();
                } else if (accumulatedSpeechRef.current.trim()) {
                  handleUserQuestion(accumulatedSpeechRef.current.trim());
                }
              }}
            />

            {/* Minimal Floating Action Pill directly resting on pod bottom edge — exactly matching reference pic */}
            <div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-3.5 bg-[#1c1c1a]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 shadow-xl text-white z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={toggleMic}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isMicActive
                    ? 'text-white/80 hover:text-white'
                    : 'text-white/50 hover:text-white'
                }`}
                title={isMicActive ? 'Mic Active (Tap to mute)' : 'Mic Muted (Tap to unmute)'}
                aria-label="Toggle Microphone"
              >
                {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-white/70" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isMuted
                    ? 'text-[#E27D60]'
                    : 'text-white/80 hover:text-white'
                }`}
                title={isMuted ? 'Sound Muted (Tap to unmute)' : 'Sound On (Tap to mute)'}
                aria-label="Toggle Speaker"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#E27D60]" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsRoamingEnabled((prev) => !prev)}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isRoamingEnabled
                    ? 'text-[#E27D60]'
                    : 'text-[#F3BA4F] hover:text-amber-300'
                }`}
                title={isRoamingEnabled ? 'Anchor IXX in place' : 'Allow IXX to roam across screen'}
                aria-label="Toggle Screen Roaming"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Button when IXX has been removed */}
      {!isVisible && (
        <button
          type="button"
          onClick={() => {
            setIsVisible(true);
            startMicrophone();
          }}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171715]/90 hover:bg-[#171715] text-[#FAF8F4] text-xs font-medium border border-white/20 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 animate-in fade-in"
          title="Restore IXX consultant"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Talk with IXX</span>
        </button>
      )}

      {/* Recommended Cream Pop-out (when IXX recommends a product, pops out with featured picture) */}
      {recommendedProduct && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[92vw] animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300 shadow-2xl">
          <ProductRecommendationPopup
            product={recommendedProduct}
            onClose={() => setRecommendedProduct(null)}
            onSelectPhase={onSelectPhase}
          />
        </div>
      )}
    </>
  );
};
