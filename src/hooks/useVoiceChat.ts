import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
}

interface UseVoiceChatOptions {
  onTranscriptChange?: (transcript: string) => void;
  onSpeechEnd?: (finalTranscript: string) => void;
  onError?: (error: any) => void;
  language?: string;
  continuous?: boolean;
}

export const useVoiceChat = (options: UseVoiceChatOptions = {}) => {
  const {
    onTranscriptChange,
    onSpeechEnd,
    onError,
    language = 'en-US',
    continuous = true
  } = options;

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    transcript: '',
    confidence: 0
  });

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      return null;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      
      setVoiceState(prev => ({
        ...prev,
        transcript: currentTranscript,
        confidence: event.results[event.results.length - 1][0].confidence || 0
      }));

      onTranscriptChange?.(currentTranscript);

      if (finalTranscript) {
        onSpeechEnd?.(finalTranscript);
        setVoiceState(prev => ({ ...prev, transcript: '' }));
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      setVoiceState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onend = () => {
      setVoiceState(prev => ({ ...prev, isListening: false }));
    };

    return recognition;
  }, [continuous, language, onTranscriptChange, onSpeechEnd, onError]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!voiceState.isSupported) {
      onError?.('Speech recognition not supported');
      return;
    }

    // Stop any current speech
    if (synthesisRef.current && synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }

    // Request microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Microphone permission granted for speech recognition');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      onError?.('Microphone permission is required for voice input. Please allow microphone access and try again.');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current && !voiceState.isListening) {
      try {
        recognitionRef.current.start();
        console.log('Speech recognition started');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        onError?.(error);
      }
    }
  }, [voiceState.isSupported, voiceState.isListening, initializeRecognition, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  // Speak text
  const speak = useCallback((text: string, options: { voice?: SpeechSynthesisVoice; rate?: number; pitch?: number } = {}) => {
    if (!synthesisRef.current) {
      onError?.('Speech synthesis not supported');
      return;
    }

    // Stop current speech
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }

    // Stop listening while speaking
    if (voiceState.isListening) {
      stopListening();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = options.voice || null;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;

    utterance.onstart = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      onError?.(event.error);
    };

    currentUtteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  }, [voiceState.isListening, stopListening, onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current && synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    return synthesisRef.current?.getVoices() || [];
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current && synthesisRef.current.speaking) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  return {
    ...voiceState,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    getVoices
  };
};