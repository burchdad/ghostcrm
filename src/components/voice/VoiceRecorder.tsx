'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare, FiPlay, FiPause, FiUpload, FiCheck, FiX } from 'react-icons/fi';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  onCancel, 
  maxDuration = 60 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      return stream;
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access is required to record your voice. Please allow microphone access and try again.');
      return null;
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (err) {
      console.error('Audio analyser setup failed:', err);
    }
  };

  const startRecording = async () => {
    setError(null);
    const stream = await requestMicrophoneAccess();
    
    if (!stream) return;
    
    streamRef.current = stream;
    audioChunksRef.current = [];
    
    setupAudioAnalyser(stream);
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        recordedBlobRef.current = audioBlob;
        setHasRecording(true);
        setIsRecording(false);
        setAudioLevel(0);
        
        // Create audio URL for playback
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Recording failed:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUpload = () => {
    if (recordedBlobRef.current) {
      onRecordingComplete(recordedBlobRef.current);
    }
  };

  const handleCancel = () => {
    cleanup();
    setIsRecording(false);
    setHasRecording(false);
    setDuration(0);
    setAudioLevel(0);
    setError(null);
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = () => {
    if (audioLevel < 30) return '#10b981'; // green
    if (audioLevel < 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div style={styles.container}>
      <div style={styles.recorder}>
        {error && (
          <div style={styles.error}>
            <FiX style={styles.errorIcon} />
            <p>{error}</p>
          </div>
        )}
        
        {!isRecording && !hasRecording && !error && (
          <div style={styles.startScreen}>
            <div style={styles.micIcon}>
              <FiMic />
            </div>
            <h3>Record Your Voice</h3>
            <p>Click the button below to start recording. Speak clearly for 30-60 seconds.</p>
            <button 
              onClick={startRecording}
              style={styles.startButton}
            >
              <FiMic style={styles.buttonIcon} />
              Start Recording
            </button>
          </div>
        )}
        
        {(isRecording || isPaused) && (
          <div style={styles.recordingScreen}>
            <div style={styles.recordingIndicator}>
              <div 
                style={{
                  ...styles.recordingDot,
                  backgroundColor: isPaused ? '#f59e0b' : '#ef4444',
                  animation: isPaused ? 'none' : 'pulse 1s infinite'
                }}
              ></div>
              <span>{isPaused ? 'PAUSED' : 'RECORDING'}</span>
            </div>
            
            <div style={styles.duration}>
              {formatTime(duration)} / {formatTime(maxDuration)}
            </div>
            
            {/* Audio Level Visualizer */}
            <div style={styles.visualizer}>
              <div style={styles.visualizerLabel}>Audio Level</div>
              <div style={styles.audioLevelContainer}>
                <div 
                  style={{
                    ...styles.audioLevel,
                    width: `${audioLevel}%`,
                    backgroundColor: getAudioLevelColor()
                  }}
                ></div>
              </div>
              <div style={styles.audioLevelText}>{Math.round(audioLevel)}%</div>
            </div>
            
            <div style={styles.recordingControls}>
              {!isPaused ? (
                <button onClick={pauseRecording} style={styles.controlButton}>
                  <FiPause />
                </button>
              ) : (
                <button onClick={resumeRecording} style={styles.controlButton}>
                  <FiPlay />
                </button>
              )}
              
              <button 
                onClick={stopRecording} 
                style={{ ...styles.controlButton, backgroundColor: '#ef4444' }}
              >
                <FiSquare />
              </button>
            </div>
          </div>
        )}
        
        {hasRecording && !isRecording && (
          <div style={styles.playbackScreen}>
            <div style={styles.recordingComplete}>
              <FiCheck style={styles.successIcon} />
              <h3>Recording Complete</h3>
              <p>Duration: {formatTime(duration)}</p>
            </div>
            
            <audio 
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div style={styles.playbackControls}>
              {!isPlaying ? (
                <button onClick={playRecording} style={styles.playButton}>
                  <FiPlay style={styles.buttonIcon} />
                  Play Recording
                </button>
              ) : (
                <button onClick={pausePlayback} style={styles.playButton}>
                  <FiPause style={styles.buttonIcon} />
                  Pause
                </button>
              )}
            </div>
            
            <div style={styles.finalActions}>
              <button onClick={handleCancel} style={styles.cancelButton}>
                <FiX style={styles.buttonIcon} />
                Re-record
              </button>
              <button onClick={handleUpload} style={styles.uploadButton}>
                <FiUpload style={styles.buttonIcon} />
                Use This Recording
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  recorder: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center' as const,
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  errorIcon: {
    marginRight: '8px',
    fontSize: '20px'
  },
  startScreen: {
    textAlign: 'center' as const
  },
  micIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '40px',
    color: 'white'
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '24px auto 0',
    transition: 'background-color 0.2s'
  },
  buttonIcon: {
    marginRight: '8px',
    fontSize: '18px'
  },
  recordingScreen: {
    textAlign: 'center' as const
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '600'
  },
  recordingDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px'
  },
  duration: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  },
  visualizer: {
    marginBottom: '32px'
  },
  visualizerLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  audioLevelContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  audioLevel: {
    height: '100%',
    transition: 'width 0.1s ease-out',
    borderRadius: '4px'
  },
  audioLevelText: {
    fontSize: '12px',
    color: '#6b7280'
  },
  recordingControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px'
  },
  controlButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#6b7280',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  playbackScreen: {
    textAlign: 'center' as const
  },
  recordingComplete: {
    marginBottom: '24px'
  },
  successIcon: {
    fontSize: '60px',
    color: '#10b981',
    marginBottom: '16px'
  },
  playbackControls: {
    marginBottom: '24px'
  },
  playButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '0 auto'
  },
  finalActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};