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
      onError?.('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop any current speech
    if (synthesisRef.current && synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }

    // Check if we're on HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      onError?.('Microphone access requires a secure connection (HTTPS). Please use HTTPS or localhost for voice input.');
      return;
    }

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError?.('Microphone access is not available in this browser. Please use a modern browser like Chrome or Firefox.');
      return;
    }

    // Request microphone permission first with more specific error handling
    try {
      console.log('🎤 Requesting microphone permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('✅ Microphone permission granted');
      
      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped microphone track');
      });
      
    } catch (error: any) {
      console.error('❌ Microphone permission error:', error);
      
      let errorMessage = 'Microphone access denied. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please click "Allow" when your browser asks for microphone permission, or check your browser\'s site permissions.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please check your headset/microphone connection.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is already in use by another application.';
      } else if (error.name === 'ConstraintNotSatisfiedError') {
        errorMessage += 'Microphone constraints could not be satisfied.';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown microphone error'}`;
      }
      
      onError?.(errorMessage);
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current && !voiceState.isListening) {
      try {
        console.log('🗣️ Starting speech recognition...');
        recognitionRef.current.start();
        console.log('✅ Speech recognition started');
      } catch (error: any) {
        console.error('❌ Failed to start recognition:', error);
        onError?.(`Speech recognition failed: ${error.message}`);
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