import { useEffect, useState, useCallback } from "react";

type MediaDeviceKind = "audioinput" | "audiooutput";

type DeviceInfo = {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
};

export function useAudioDevices() {
  const [hasPermission, setHasPermission] = useState(false);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      // Always get fresh device list
      let devices = await navigator.mediaDevices.enumerateDevices();
      
      console.log('🔍 Raw devices found:', devices.length, devices.map(d => ({ 
        kind: d.kind, 
        label: d.label || '[empty]', 
        deviceId: d.deviceId ? d.deviceId.slice(0, 20) + '...' : '[no id]',
        groupId: d.groupId || '[no group]'
      })));
      
      // Log ALL devices by type
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('📊 Device breakdown:', {
        totalDevices: devices.length,
        audioInputs: audioInputDevices.length,
        audioOutputs: audioOutputDevices.length,
        videoInputs: videoDevices.length,
        allAudioInputs: audioInputDevices.map(d => ({ label: d.label || '[no label]', id: d.deviceId.slice(0, 15) + '...' })),
        allAudioOutputs: audioOutputDevices.map(d => ({ label: d.label || '[no label]', id: d.deviceId.slice(0, 15) + '...' }))
      });
      
      // Check if we have any audio input devices at all
      if (audioInputDevices.length === 0) {
        console.log('❌ No audio input devices detected');
        console.log('🔧 Browser capabilities:', {
          mediaDevicesSupported: !!navigator.mediaDevices,
          enumerateDevicesSupported: !!navigator.mediaDevices?.enumerateDevices,
          getUserMediaSupported: !!navigator.mediaDevices?.getUserMedia,
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname
        });
        
        setMics([]);
        setSpeakers([]);
        setError('No microphone devices detected. Please ensure your headset is connected and try refreshing.');
        return;
      }
      
      // Check if we have detailed labels (permission granted)
      const hasDetailedLabels = audioInputDevices.some(device => device.label && device.label.trim() !== '' && !device.label.includes('Default'));
      
      if (!hasDetailedLabels && !hasPermission) {
        console.log('📱 Generic device labels detected - permission needed for detailed names');
        // Still show the devices but with generic names
        const audioInputs = audioInputDevices.map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Default Microphone`,
          kind: 'audioinput' as const,
          groupId: device.groupId,
        }));
        
        setMics(audioInputs);
        setSpeakers([]);
        setError(null); // Clear any previous errors
        return;
      }
      
      // We have detailed labels - process normally
      const audioInputs = audioInputDevices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label || "Microphone",
        kind: "audioinput" as const,
        groupId: d.groupId,
      }));

      const audioOutputs = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || "Speaker",
          kind: "audiooutput" as const,
          groupId: d.groupId,
        }));

      setMics(audioInputs);
      setSpeakers(audioOutputs);
      setError(null); // Clear any previous errors
      
      console.log('📱 Detected audio devices:', {
        mics: audioInputs.length,
        speakers: audioOutputs.length,
        micDetails: audioInputs.map(m => ({ label: m.label, id: m.deviceId.slice(0, 10) + '...' })),
        speakerDetails: audioOutputs.map(s => ({ label: s.label, id: s.deviceId.slice(0, 10) + '...' }))
      });
    } catch (e: any) {
      console.error('❌ Failed to enumerate devices:', e);
      setError(e?.message ?? "Failed to enumerate devices");
    }
  }, [hasPermission]);

  const requestMicPermission = useCallback(async () => {
    setError(null);
    try {
      console.log('🎤 Requesting microphone permission...');
      
      // Check for HTTPS/secure context first
      const isSecureContext = window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        throw new Error('Microphone access requires HTTPS or localhost');
      }

      // First check if any audio input devices exist
      const preDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputCount = preDevices.filter(d => d.kind === 'audioinput').length;
      
      if (audioInputCount === 0) {
        throw new Error('No audio input devices detected. Please connect a microphone or headset and refresh the page.');
      }

      // Ask for mic access once, so labels populate.
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      console.log('✅ Microphone permission granted, stream active:', stream.active);
      console.log('🎵 Audio tracks:', stream.getAudioTracks().map(track => ({ 
        label: track.label, 
        enabled: track.enabled, 
        readyState: track.readyState 
      })));
      
      setHasPermission(true);

      // Immediately stop tracks; we only needed permission + labels.
      stream.getTracks().forEach((t) => t.stop());

      // Wait a moment for browser to update device info, then refresh
      setTimeout(async () => {
        console.log('🔄 Refreshing devices after permission grant...');
        await refreshDevices();
      }, 500);
    } catch (e: any) {
      console.error('❌ Microphone permission error:', e);
      let errorMessage = "Microphone permission error";
      
      if (e?.name === "NotAllowedError") {
        errorMessage = "Microphone permission denied. Please allow microphone access and try again.";
      } else if (e?.name === "NotFoundError") {
        errorMessage = "No microphone device found. Please ensure your headset is connected and set as the default recording device in Windows Sound settings.";
      } else if (e?.name === "NotReadableError") {
        errorMessage = "Microphone is already in use by another application. Please close other apps using your microphone.";
      } else if (e?.name === "OverconstrainedError") {
        errorMessage = "Microphone constraints could not be satisfied.";
      } else if (e?.name === "SecurityError") {
        errorMessage = "Microphone access blocked by security policy.";
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    }
  }, [refreshDevices]);

  // Auto-detect headset devices
  const getPreferredMic = useCallback(() => {
    const headsetKeywords = ['headset', 'head', 'usb', 'gaming', 'wireless', 'bluetooth'];
    return mics.find(mic => 
      headsetKeywords.some(keyword => 
        mic.label.toLowerCase().includes(keyword)
      )
    ) || mics[0];
  }, [mics]);

  const getPreferredSpeaker = useCallback(() => {
    const headsetKeywords = ['headset', 'head', 'usb', 'gaming', 'wireless', 'bluetooth'];
    return speakers.find(speaker => 
      headsetKeywords.some(keyword => 
        speaker.label.toLowerCase().includes(keyword)
      )
    ) || speakers[0];
  }, [speakers]);

  useEffect(() => {
    // Initial device scan - try to get basic info even without permission
    const initialScan = async () => {
      try {
        console.log('🔍 Performing initial device scan...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputCount = devices.filter(d => d.kind === 'audioinput').length;
        
        console.log('📊 Initial scan results:', {
          totalDevices: devices.length,
          audioInputs: audioInputCount,
          audioOutputs: devices.filter(d => d.kind === 'audiooutput').length,
          deviceSample: devices.slice(0, 3).map(d => ({ kind: d.kind, label: d.label || '[no label]' }))
        });
        
        if (audioInputCount === 0) {
          setError('No microphone devices detected on this computer. Please connect a headset or microphone.');
        } else {
          // Clear any previous errors and perform full refresh
          setError(null);
          await refreshDevices();
        }
      } catch (e) {
        console.error('❌ Initial scan failed:', e);
        setError('Unable to scan for audio devices. Please check browser permissions.');
      }
    };

    // Refresh when devices change (plug/unplug USB headset, etc.)
    const handler = () => {
      console.log('🔄 Device change detected, refreshing...');
      refreshDevices();
    };
    
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handler);
    }
    
    // Run initial scan
    initialScan();
    
    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handler);
      }
    };
  }, [refreshDevices]);

  // Force refresh with comprehensive scan
  const forceRefreshDevices = useCallback(async () => {
    setError(null);
    console.log('🔄 Force refreshing devices...');
    
    try {
      // First check if MediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Your browser does not support audio device enumeration');
      }

      console.log('🧪 Testing direct microphone access...');
      
      // Try to access microphone directly to test if it exists
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
        
        console.log('✅ Direct microphone access successful!');
        console.log('🎵 Audio tracks found:', testStream.getAudioTracks().map(track => ({
          label: track.label || '[no label]',
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        })));
        
        // Stop the test stream
        testStream.getTracks().forEach(track => track.stop());
        
        // Now refresh devices after successful access
        setHasPermission(true);
        setTimeout(async () => {
          await refreshDevices();
        }, 1000); // Longer delay to allow device labels to populate
        
        return;
        
      } catch (accessError: any) {
        console.log('❌ Direct microphone access failed:', accessError);
        
        if (accessError.name === 'NotFoundError') {
          throw new Error('No microphone hardware detected. Please check:\n• Headset is properly connected\n• Device is recognized in Windows Sound Settings\n• Try a different USB port');
        } else if (accessError.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied. Please allow microphone access when prompted.');
        } else {
          throw new Error(`Microphone access error: ${accessError.message}`);
        }
      }

    } catch (e: any) {
      console.error('❌ Force refresh failed:', e);
      setError(e.message || 'Failed to scan for devices');
    }
  }, [hasPermission, refreshDevices]);

  return { 
    hasPermission, 
    mics, 
    speakers, 
    error, 
    requestMicPermission, 
    refreshDevices,
    forceRefreshDevices,
    getPreferredMic,
    getPreferredSpeaker
  };
}