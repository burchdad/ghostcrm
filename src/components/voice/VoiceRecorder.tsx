'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare, FiPlay, FiPause, FiUpload, FiCheck, FiX, FiSettings } from 'react-icons/fi';
import { useAudioDevices } from '../../hooks/useAudioDevices';
import { startMicStream, setAudioOutputDevice, stopMediaStream } from '../../utils/audioUtils';

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
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Use the comprehensive device management hook
  const { 
    hasPermission, 
    mics, 
    speakers, 
    error: deviceError, 
    requestMicPermission, 
    refreshDevices,
    forceRefreshDevices,
    testBasicMicrophone,
    getPreferredMic,
    getPreferredSpeaker
  } = useAudioDevices();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const el = audioRef.current;

    if (!recordedBlobRef.current) {
      setAudioUrl(null);
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
      if (el) el.src = "";
      return;
    }

    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);

    const url = URL.createObjectURL(recordedBlobRef.current);
    lastUrlRef.current = url;
    setAudioUrl(url);
    console.log('🔗 Audio URL created:', url);

    if (el) {
      el.src = url;
      el.load();
    }

    return () => {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
      console.log('🗑️ Audio URL revoked:', url);
    };
  }, [hasRecording]); // Trigger when hasRecording changes (new recording available)

  // Keep UI state in sync with actual playback
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => {
      console.log('▶️ Audio element play event');
      setIsPlaying(true);
    };
    const onPause = () => {
      console.log('⏸️ Audio element pause event');
      setIsPlaying(false);
    };
    const onEnded = () => {
      console.log('✅ Audio element ended event');
      setIsPlaying(false);
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    // Auto-select preferred devices when they become available
    if (mics.length > 0 && !selectedMicId) {
      const preferred = getPreferredMic();
      if (preferred) {
        setSelectedMicId(preferred.deviceId);
        console.log('🎧 Auto-selected microphone:', preferred.label);
      }
    }
    
    if (speakers.length > 0 && !selectedSpeakerId) {
      const preferred = getPreferredSpeaker();
      if (preferred) {
        setSelectedSpeakerId(preferred.deviceId);
        console.log('🔊 Auto-selected speaker:', preferred.label);
      }
    }
  }, [mics, speakers, selectedMicId, selectedSpeakerId, getPreferredMic, getPreferredSpeaker]);

  useEffect(() => {
    // Update error state from device hook
    if (deviceError) {
      setError(deviceError);
    }
  }, [deviceError]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      // Ensure we have permission first
      if (!hasPermission) {
        await requestMicPermission();
      }
      
      // Use the selected microphone or undefined for default
      const deviceId = selectedMicId || undefined;
      const stream = await startMicStream(deviceId);
      
      return stream;
    } catch (err) {
      console.error('Microphone access failed:', err);
      setError('Failed to access microphone. Please check your device connections and permissions.');
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
      // ChatGPT's bulletproof MIME type detection
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const mimeType = preferredTypes.find(t => MediaRecorder.isTypeSupported(t)) || "";
      
      console.log('🎵 Selected MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || "audio/webm" 
        });
        recordedBlobRef.current = audioBlob;
        setHasRecording(true);
        setIsRecording(false);
        setAudioLevel(0);
        
        console.log('🎵 Audio Recording Complete:', {
          recorderMimeType: mediaRecorder.mimeType,
          blobType: audioBlob.type,
          blobSize: audioBlob.size
        });
        
        // Note: audioUrl will be created by useEffect when hasRecording changes
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

  // ChatGPT's unified playback function - works for both UI and debug buttons
  const playAudio = async (source: 'ui' | 'debug' = 'ui') => {
    if (!recordedBlobRef.current) {
      console.error('❌ No recording blob available');
      return;
    }

    console.log(`🔊 ${source} playback started:`, {
      blobSize: recordedBlobRef.current.size,
      blobType: recordedBlobRef.current.type,
      audioRef: !!audioRef.current
    });

    const url = URL.createObjectURL(recordedBlobRef.current);
    console.log('🔗 Blob URL:', url);

    try {
      // Try UI audio element first if available and requested
      if (source === 'ui' && audioRef.current) {
        const audioEl = audioRef.current;
        
        // ChatGPT's bulletproof setup
        audioEl.src = url;
        audioEl.currentTime = 0;
        audioEl.muted = false;
        audioEl.volume = 1;
        audioEl.load();
        
        console.log('🔊 UI Audio Element State:', {
          src: audioEl.src,
          readyState: audioEl.readyState,
          muted: audioEl.muted,
          volume: audioEl.volume,
          paused: audioEl.paused
        });
        
        // Non-blocking setSinkId with validation
        try {
          const isValidSpeaker = speakers.some(s => s.deviceId === selectedSpeakerId);
          
          if (selectedSpeakerId && isValidSpeaker && (audioEl as any).setSinkId) {
            await (audioEl as any).setSinkId(selectedSpeakerId);
            console.log('✅ setSinkId OK:', selectedSpeakerId);
          } else {
            console.log('ℹ️ Skipping setSinkId (invalid or default):', selectedSpeakerId);
          }
        } catch (e) {
          console.warn('⚠️ setSinkId failed, using default output:', e);
        }
        
        await audioEl.play();
        setIsPlaying(true);
        console.log('✅ UI audio playback started successfully');
        return;
      }
      
      // Fallback: Direct Audio object (like debug button)
      console.log('🔄 Using direct Audio fallback...');
      const directAudio = new Audio(url);
      directAudio.onplay = () => {
        console.log('✅ Direct audio started');
        setIsPlaying(true);
      };
      directAudio.onerror = (e) => console.error('❌ Direct audio error', e);
      directAudio.onended = () => {
        console.log('✅ Direct audio ended');
        setIsPlaying(false);
      };
      
      await directAudio.play();
      console.log('✅ Direct audio play successful');
      
    } catch (error) {
      console.error('❌ Playback failed:', error);
      setError(`Playback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Ultimate fallback if UI method fails
      if (source === 'ui') {
        console.log('🔄 Retrying with direct Audio method...');
        try {
          const fallbackAudio = new Audio(url);
          await fallbackAudio.play();
          console.log('✅ Fallback direct audio successful');
        } catch (fallbackError) {
          console.error('❌ All playback methods failed:', fallbackError);
        }
      }
    }
  };

  const playRecording = async () => {
    console.log('🟢 Play Recording button clicked - starting playback...');
    const el = audioRef.current;
    if (!el) {
      console.error('❌ No audio element available');
      return;
    }

    try {
      el.muted = false;
      el.volume = 1;
      el.currentTime = 0;

      await el.play();
      console.log('🎵 Play Recording completed successfully');
    } catch (error) {
      console.error('❌ Play Recording failed:', error);
      setError(`Play Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const debugPlayback = async () => {
    console.log('🧪 Debug Playback button clicked - starting direct audio...');
    try {
      await playAudio('debug');
      console.log('🎵 Debug Playback completed successfully');
    } catch (error) {
      console.error('❌ Debug Playback failed:', error);
    }
  };

  const pausePlayback = () => {
    console.log('⏸️ Pause button clicked');
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    // Note: setIsPlaying will be handled by audio element event listener
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

  const handleDeviceChange = (deviceId: string, type: 'mic' | 'speaker') => {
    if (type === 'mic') {
      setSelectedMicId(deviceId);
      console.log('🎤 Selected microphone:', deviceId);
    } else {
      setSelectedSpeakerId(deviceId);
      console.log('🔊 Selected speaker:', deviceId);
      
      // Apply speaker change to audio element if available
      if (audioRef.current && deviceId) {
        setAudioOutputDevice(audioRef.current, deviceId);
      }
    }
    setShowDeviceSelector(false);
  };

  const refreshDevicesHandler = async () => {
    console.log('🔄 User requested device refresh');
    await forceRefreshDevices();
  };

  const getSelectedDeviceLabel = (type: 'mic' | 'speaker') => {
    if (type === 'mic') {
      const selected = mics.find(d => d.deviceId === selectedMicId);
      return selected ? selected.label : 'Default Microphone';
    } else {
      const selected = speakers.find(d => d.deviceId === selectedSpeakerId);
      return selected ? selected.label : 'Default Speaker';
    }
  };

  const hasHeadsetConnected = () => {
    const headsetKeywords = ['headset', 'head', 'usb', 'gaming', 'wireless', 'bluetooth'];
    return mics.some(mic => 
      headsetKeywords.some(keyword => 
        mic.label.toLowerCase().includes(keyword)
      )
    ) || speakers.some(speaker => 
      headsetKeywords.some(keyword => 
        speaker.label.toLowerCase().includes(keyword)
      )
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.recorder}>
        {error && (
          <div style={styles.error}>
            <FiX style={styles.errorIcon} />
            <div>
              <p>{error}</p>
              {(error.includes('No microphone') || error.includes('device not found') || error.includes('No audio input devices')) && (
                <div style={styles.errorActions}>
                  <button onClick={refreshDevicesHandler} style={styles.errorRetryButton}>
                    🔄 Force Scan Devices
                  </button>
                  <button onClick={testBasicMicrophone} style={{...styles.errorRetryButton, backgroundColor: '#10b981'}}>
                    🧪 Test Direct Access
                  </button>
                  <div style={styles.errorHint}>
                    <strong>Your headset works with Spotify, so let's troubleshoot:</strong>
                    <br/>• Click "🧪 Test Direct Access" to bypass device enumeration
                    <br/>• Check Windows Sound Settings → Recording → Set headset as default
                    <br/>• Try using Chrome/Edge browser (better device support)
                    <br/>• Look at browser console (F12) for detailed device logs
                    <br/>• Refresh page after connecting headset
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!isRecording && !hasRecording && !error && (
          <div style={styles.startScreen}>
            <div style={styles.micIcon}>
              <FiMic />
            </div>
            <h3>Record Your Voice</h3>
            <p>Click the button below to start recording. Speak clearly for 30-60 seconds.</p>
            
            {/* Device Selector */}
            <div style={styles.deviceSection}>
              <div style={styles.deviceSectionHeader}>
                <h4 style={styles.deviceSectionTitle}>
                  <FiSettings style={styles.settingsIcon} />
                  Audio Devices
                </h4>
                {!hasPermission && (
                  <button onClick={requestMicPermission} style={styles.permissionButton}>
                    Enable Devices
                  </button>
                )}
              </div>
              
              {/* Microphone Selection */}
              <div style={styles.deviceInfo}>
                <label style={styles.deviceLabel}>Microphone:</label>
                <div style={styles.deviceSelector}>
                  <button 
                    onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                    style={styles.deviceButton}
                    disabled={!hasPermission}
                  >
                    {getSelectedDeviceLabel('mic')}
                    <span style={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  {showDeviceSelector && hasPermission && (
                    <div style={styles.deviceDropdown}>
                      {mics.length === 0 ? (
                        <div style={styles.noDevices}>
                          <p>No microphones detected</p>
                          <button onClick={refreshDevicesHandler} style={styles.refreshButton}>
                            Refresh Devices
                          </button>
                        </div>
                      ) : (
                        mics.map(device => (
                          <button
                            key={device.deviceId}
                            onClick={() => handleDeviceChange(device.deviceId, 'mic')}
                            style={{
                              ...styles.deviceOption,
                              backgroundColor: device.deviceId === selectedMicId ? '#e3f2fd' : 'transparent'
                            }}
                          >
                            {device.label}
                            {device.label.toLowerCase().includes('headset') && (
                              <span style={styles.deviceType}>🎧</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Speaker Selection */}
              {speakers.length > 0 && (
                <div style={styles.deviceInfo}>
                  <label style={styles.deviceLabel}>Speaker:</label>
                  <div style={styles.deviceSelector}>
                    <select 
                      value={selectedSpeakerId} 
                      onChange={(e) => handleDeviceChange(e.target.value, 'speaker')}
                      style={styles.deviceSelect}
                    >
                      <option value="">Default Speaker</option>
                      {speakers.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                          {device.label.toLowerCase().includes('headset') ? ' 🎧' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Device Status */}
              <div style={styles.deviceStatus}>
                {hasPermission ? (
                  <div style={styles.statusItem}>
                    <span style={styles.statusIndicator}>✅</span>
                    {hasHeadsetConnected() 
                      ? `Headset detected (${mics.length} mics, ${speakers.length} speakers)`
                      : `${mics.length} microphones, ${speakers.length} speakers available`
                    }
                  </div>
                ) : (
                  <div style={styles.statusItem}>
                    <span style={styles.statusIndicator}>🔒</span>
                    Click "Enable Devices" to detect your headset
                  </div>
                )}
                
                {/* Troubleshooting for headset detection */}
                {hasPermission && !hasHeadsetConnected() && (
                  <div style={styles.troubleshootingHint}>
                    <span style={styles.statusIndicator}>💡</span>
                    <div>
                      <div style={styles.hintText}>Headset not detected? Try:</div>
                      <div style={styles.hintSteps}>
                        • Unplug and reconnect your headset<br/>
                        • Refresh devices after connecting<br/>
                        • Check if headset is set as default recording device
                      </div>
                    </div>
                  </div>
                )}
                
                <button onClick={refreshDevicesHandler} style={styles.refreshSmallButton}>
                  🔄 Refresh
                </button>
              </div>
            </div>
            
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
              onEnded={() => {
                console.log('🔊 Audio playback ended');
                setIsPlaying(false);
              }}
              onPause={() => {
                console.log('⏸️ Audio paused');
                setIsPlaying(false);
              }}
              onPlay={() => {
                console.log('▶️ Audio play started');
                setIsPlaying(true);
              }}
              onCanPlay={() => {
                console.log('✅ Audio can play');
              }}
              onError={(e) => {
                console.error('❌ Audio element error:', e);
                setError('Audio playback error occurred.');
              }}
              onLoadedData={() => {
                console.log('📁 Audio loaded successfully');
              }}
              onLoadStart={() => {
                console.log('📥 Audio load started');
              }}
              preload="metadata"
            />
            
            <div style={styles.playbackControls}>
              {!isPlaying ? (
                <button type="button" onClick={playRecording} style={styles.playButton}>
                  <FiPlay style={styles.buttonIcon} />
                  Play Recording
                </button>
              ) : (
                <button type="button" onClick={pausePlayback} style={styles.playButton}>
                  <FiPause style={styles.buttonIcon} />
                  Pause
                </button>
              )}
              
              <button type="button" onClick={debugPlayback} style={{ ...styles.playButton, backgroundColor: '#10b981', fontSize: '14px', padding: '8px 16px' }}>
                🧪 Debug Playback
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (recordedBlobRef.current && audioRef.current) {
                    // Force reload audio element as fallback
                    const audioUrl = URL.createObjectURL(recordedBlobRef.current);
                    audioRef.current.src = audioUrl;
                    audioRef.current.load();
                    console.log('Reloaded audio element');
                  }
                }}
                style={{ ...styles.playButton, backgroundColor: '#6b7280', fontSize: '14px', padding: '8px 16px' }}
              >
                Reload Audio
              </button>
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
  },
  deviceSection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  deviceSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  deviceSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  settingsIcon: {
    marginRight: '8px',
    fontSize: '18px'
  },
  permissionButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  deviceInfo: {
    marginBottom: '12px'
  },
  deviceLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  deviceSelector: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '100%'
  },
  deviceButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  deviceSelect: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  deviceStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center'
  },
  statusIndicator: {
    marginRight: '8px',
    fontSize: '14px'
  },
  refreshSmallButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  dropdownArrow: {
    fontSize: '12px',
    color: '#6b7280'
  },
  deviceDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto' as const
  },
  deviceOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background-color 0.2s'
  },
  deviceType: {
    fontSize: '16px',
    marginLeft: '8px'
  },
  deviceActions: {
    borderTop: '1px solid #e5e7eb',
    padding: '8px'
  },
  refreshButton: {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#374151'
  },
  noDevices: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#6b7280'
  },
  deviceHint: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '8px 0 0 0'
  },
  troubleshootingHint: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px',
    backgroundColor: '#fef3c7',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#92400e',
    marginTop: '8px'
  },
  hintText: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  hintSteps: {
    lineHeight: '1.4'
  },
  errorActions: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderTop: '1px solid #e5e7eb'
  },
  errorRetryButton: {
    display: 'block',
    margin: '0 auto 12px auto',
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  errorHint: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.5',
    textAlign: 'left' as const
  },
};