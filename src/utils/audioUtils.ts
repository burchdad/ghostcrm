// Audio device utility functions

export interface AudioConstraints {
  deviceId?: string;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
}

/**
 * Start a microphone stream with optional device selection
 */
export async function startMicStream(
  selectedMicId?: string,
  options: Partial<AudioConstraints> = {}
): Promise<MediaStream> {
  const defaultOptions: AudioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    ...options
  };

  const constraints: MediaStreamConstraints = {
    audio: selectedMicId
      ? {
          deviceId: { exact: selectedMicId },
          ...defaultOptions,
        }
      : defaultOptions,
    video: false,
  };

  console.log('🎤 Starting microphone stream with constraints:', constraints);

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Log which device is actually being used
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const settings = audioTracks[0].getSettings();
      console.log('✅ Microphone stream started:', {
        label: audioTracks[0].label,
        deviceId: settings.deviceId,
        settings: settings
      });
    }
    
    return stream;
  } catch (error: any) {
    console.error('❌ Failed to start microphone stream:', error);
    
    // If exact device fails, try with default
    if (selectedMicId && error.name === 'OverconstrainedError') {
      console.log('🔄 Exact device failed, trying default microphone...');
      return startMicStream(undefined, options);
    }
    
    throw error;
  }
}

/**
 * Route audio output to a chosen speaker (when supported)
 */
export async function setAudioOutputDevice(
  audioEl: HTMLAudioElement, 
  speakerDeviceId: string
): Promise<boolean> {
  console.log('🔊 Attempting to set audio output device:', speakerDeviceId);
  
  // setSinkId is not supported on all browsers (notably Safari).
  const anyEl = audioEl as any;
  if (typeof anyEl.setSinkId !== "function") {
    console.warn('⚠️ setSinkId not supported in this browser');
    return false;
  }

  try {
    await anyEl.setSinkId(speakerDeviceId);
    console.log('✅ Audio output device set successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to set audio output device:', error);
    return false;
  }
}

/**
 * Check if setSinkId is supported
 */
export function isAudioOutputSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  const audio = document.createElement('audio');
  return typeof (audio as any).setSinkId === 'function';
}

/**
 * Get audio device capabilities
 */
export async function getAudioCapabilities() {
  const isOutputSupported = isAudioOutputSupported();
  const isInputSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const isEnumerationSupported = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
  
  return {
    supportsAudioInput: isInputSupported,
    supportsAudioOutput: isOutputSupported,
    supportsDeviceEnumeration: isEnumerationSupported,
    isSecureContext: window.isSecureContext,
    userAgent: navigator.userAgent
  };
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('🛑 Stopped audio track:', track.label || track.kind);
    });
  }
}

/**
 * Create audio recorder with specific device
 */
export async function createAudioRecorder(
  deviceId?: string,
  options: {
    mimeType?: string;
    audioBitsPerSecond?: number;
  } = {}
): Promise<{
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
}> {
  const stream = await startMicStream(deviceId);
  
  // Determine best MIME type
  const supportedTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus'
  ];
  
  let mimeType = options.mimeType;
  if (!mimeType) {
    mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }
  
  const recorderOptions: MediaRecorderOptions = {};
  if (mimeType) recorderOptions.mimeType = mimeType;
  if (options.audioBitsPerSecond) recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
  
  const mediaRecorder = new MediaRecorder(stream, recorderOptions);
  
  console.log('🎙️ Created audio recorder:', {
    mimeType: mediaRecorder.mimeType,
    state: mediaRecorder.state,
    stream: {
      active: stream.active,
      tracks: stream.getAudioTracks().length
    }
  });
  
  return { mediaRecorder, stream };
}