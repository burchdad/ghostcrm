import { useState, useRef, useCallback, useEffect } from 'react';

interface RealtimeVoiceState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
  error: string | null;
}

interface UseRealtimeVoiceOptions {
  onTranscriptChange?: (transcript: string) => void;
  onResponse?: (response: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: string) => void;
}

export const useRealtimeVoice = (options: UseRealtimeVoiceOptions = {}) => {
  const {
    onTranscriptChange,
    onResponse,
    onError,
    onConnectionChange
  } = options;

  const [voiceState, setVoiceState] = useState<RealtimeVoiceState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'RTCPeerConnection' in window,
    transcript: '',
    connectionStatus: 'disconnected',
    error: null
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize audio element for playback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioElementRef.current = new Audio();
      audioElementRef.current.autoplay = true;
      audioElementRef.current.onplay = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };
      audioElementRef.current.onended = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };
    }
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Connect to realtime session
  const connect = useCallback(async () => {
    if (!voiceState.isSupported) {
      const error = 'WebRTC not supported in this browser';
      onError?.(error);
      setVoiceState(prev => ({ ...prev, error, connectionStatus: 'failed' }));
      return false;
    }

    try {
      setVoiceState(prev => ({ 
        ...prev, 
        connectionStatus: 'connecting', 
        error: null 
      }));
      
      console.log('🌐 [REALTIME] Connecting to OpenAI realtime...');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      console.log('🎤 [REALTIME] Microphone access granted');

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      peerConnectionRef.current = pc;

      // Add audio track
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events', { ordered: true });
      dataChannelRef.current = dc;

      // Data channel event handlers
      dc.onopen = () => {
        console.log('📡 [REALTIME] Data channel opened');
        setVoiceState(prev => ({ 
          ...prev, 
          isConnected: true, 
          connectionStatus: 'connected' 
        }));
        onConnectionChange?.('connected');
      };

      dc.onclose = () => {
        console.log('📡 [REALTIME] Data channel closed');
        setVoiceState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        }));
        onConnectionChange?.('disconnected');
      };

      dc.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 [REALTIME] Received:', message.type);
          
          switch (message.type) {
            case 'conversation.item.input_audio_transcription.completed':
              if (message.transcript) {
                setVoiceState(prev => ({ ...prev, transcript: message.transcript }));
                onTranscriptChange?.(message.transcript);
              }
              break;
              
            case 'response.audio_transcript.delta':
              if (message.delta) {
                onResponse?.(message.delta);
              }
              break;
              
            case 'response.audio.delta':
              // Handle audio chunks for playback
              if (message.delta && audioElementRef.current) {
                // Convert base64 audio to blob and play
                const audioBlob = new Blob(
                  [Uint8Array.from(atob(message.delta), c => c.charCodeAt(0))], 
                  { type: 'audio/pcm' }
                );
                const audioUrl = URL.createObjectURL(audioBlob);
                audioElementRef.current.src = audioUrl;
              }
              break;
              
            case 'error':
              console.error('❌ [REALTIME] Server error:', message.error);
              onError?.(message.error.message || 'Realtime API error');
              break;
          }
        } catch (err) {
          console.error('❌ [REALTIME] Failed to parse message:', err);
        }
      };

      // Handle incoming audio streams
      pc.ontrack = (event) => {
        console.log('🔊 [REALTIME] Received remote audio track');
        if (audioElementRef.current && event.streams[0]) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to server
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: { sdp: offer.sdp },
          sessionConfig: {
            // Additional session configuration if needed
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create realtime session');
      }

      const { answer, sessionId } = await response.json();
      sessionIdRef.current = sessionId;

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      console.log('✅ [REALTIME] Connected successfully!');
      
      return true;

    } catch (error: any) {
      console.error('❌ [REALTIME] Connection failed:', error);
      const errorMessage = error.message || 'Failed to connect to realtime voice';
      
      setVoiceState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        connectionStatus: 'failed' 
      }));
      
      onError?.(errorMessage);
      return false;
    }
  }, [voiceState.isSupported, onError, onConnectionChange, onTranscriptChange, onResponse]);

  // Disconnect from session
  const disconnect = useCallback(() => {
    console.log('🔌 [REALTIME] Disconnecting...');

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }

    sessionIdRef.current = null;

    setVoiceState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isListening: false,
      isSpeaking: false,
      connectionStatus: 'disconnected',
      transcript: '',
      error: null
    }));

    onConnectionChange?.('disconnected');
  }, []); // Remove onConnectionChange dependency to prevent infinite re-renders

  // Start listening (push-to-talk or voice activation)
  const startListening = useCallback(() => {
    if (!voiceState.isConnected || !dataChannelRef.current) {
      console.warn('⚠️ [REALTIME] Not connected, cannot start listening');
      return;
    }

    console.log('🎤 [REALTIME] Starting to listen...');
    
    // Send start listening event
    dataChannelRef.current.send(JSON.stringify({
      type: 'input_audio_buffer.start'
    }));

    setVoiceState(prev => ({ ...prev, isListening: true }));
  }, [voiceState.isConnected]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!dataChannelRef.current) return;

    console.log('🔇 [REALTIME] Stopping listening...');
    
    // Send stop listening event
    dataChannelRef.current.send(JSON.stringify({
      type: 'input_audio_buffer.commit'
    }));

    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Send text message (fallback)
  const sendMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || !text.trim()) return;

    console.log('💬 [REALTIME] Sending text:', text);
    
    dataChannelRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    // Trigger response
    dataChannelRef.current.send(JSON.stringify({
      type: 'response.create'
    }));
  }, []);

  // Interrupt current response (barge-in)
  const interrupt = useCallback(() => {
    if (!dataChannelRef.current) return;

    console.log('⏹️ [REALTIME] Interrupting response...');
    
    dataChannelRef.current.send(JSON.stringify({
      type: 'response.cancel'
    }));

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    setVoiceState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Call disconnect directly to avoid circular dependency
      console.log('🔌 [REALTIME] Disconnecting on cleanup...');

      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      }

      sessionIdRef.current = null;
    };
  }, []); // No dependencies to prevent infinite re-renders

  return {
    // State
    isConnected: voiceState.isConnected,
    isListening: voiceState.isListening,
    isSpeaking: voiceState.isSpeaking,
    isSupported: voiceState.isSupported,
    transcript: voiceState.transcript,
    connectionStatus: voiceState.connectionStatus,
    error: voiceState.error,
    
    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    sendMessage,
    interrupt,
    
    // Session info
    sessionId: sessionIdRef.current
  };
};