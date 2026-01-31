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
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      console.log('🔍 Starting device refresh...');
      
      // CRITICAL: Never enumerate before getting permission
      // This is the bug - we need permission FIRST to get proper device labels
      if (!hasPermission) {
        console.log('⚠️ No permission yet, requesting...');
        await requestMicPermission();
        return; // requestMicPermission will trigger another refresh
      }

      // Now enumerate with proper permission
      let devices = await navigator.mediaDevices.enumerateDevices();
      
      console.log('📱 Raw device enumeration results:');
      devices.forEach((device, index) => {
        console.log(`  Device ${index}:`, {
          kind: device.kind,
          deviceId: device.deviceId || '[no ID]',
          label: device.label || '[no label]',
          groupId: device.groupId || '[no group]'
        });
      });
      
      // Filter audio inputs - ACCEPT ALL, don't be picky about labels or IDs
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('📊 Device breakdown:', {
        totalDevices: devices.length,
        audioInputs: audioInputDevices.length,
        audioOutputs: devices.filter(d => d.kind === 'audiooutput').length,
        videoInputs: devices.filter(d => d.kind === 'videoinput').length
      });
      
      // IMPORTANT: Accept ALL audioinput devices, even with empty labels or "default" IDs
      const audioInputs = audioInputDevices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label || "Microphone", // Don't reject empty labels
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
      
      console.log('✅ Device refresh complete:', {
        mics: audioInputs.length,
        speakers: audioOutputs.length,
        micDetails: audioInputs.map(m => ({ label: m.label, id: m.deviceId.slice(0, 10) + '...' }))
      });
    } catch (e: any) {
      console.error('❌ Failed to enumerate devices:', e);
      setError(e?.message ?? "Failed to enumerate devices");
    }
  }, [hasPermission, requestMicPermission]);

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
    // Initial scan - use permission-first approach
    const initialScan = async () => {
      try {
        console.log('🔍 Performing initial device scan...');
        
        // Check basic browser support first
        if (!navigator.mediaDevices) {
          console.error('❌ navigator.mediaDevices not supported');
          setError('Your browser does not support media device access. Please use Chrome, Firefox, or Edge.');
          return;
        }
        
        if (!navigator.mediaDevices.enumerateDevices) {
          console.error('❌ enumerateDevices not supported');
          setError('Your browser does not support device enumeration. Please update your browser.');
          return;
        }
        
        console.log('✅ Browser supports media devices API');
        console.log('🔧 Environment check:', {
          hasNavigatorMediaDevices: !!navigator.mediaDevices,
          hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname
        });
        
        // Don't enumerate without permission - this was the bug!
        // Just trigger the permission flow which will then refresh devices
        console.log('🎯 Starting permission-first detection flow...');
        
        // Clear any previous errors
        setError(null);
        
        // The permission request will trigger device refresh automatically
        
      } catch (e) {
        console.error('❌ Initial scan failed:', e);
        setError('Unable to initialize audio device system. Please check browser compatibility.');
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

  // ChatGPT's recommended permission-first detection (the correct way)
  const forceRefreshDevices = useCallback(async () => {
    setError(null);
    console.log('🔄 Force refresh using permission-first pattern...');
    
    try {
      let stream: MediaStream | null = null;

      try {
        // Step 1: Force permission first (this populates labels + unlocks device list)
        console.log('🔑 Requesting microphone permission first...');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted!');
        
        // Log stream details
        const audioTracks = stream.getAudioTracks();
        console.log('🎵 Audio tracks from permission grant:', audioTracks.map(track => ({
          label: track.label,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        })));
        
      } catch (err: any) {
        console.error('❌ Permission grant failed:', err);
        
        if (err.name === "NotAllowedError") {
          throw new Error("Microphone permission denied. Please allow microphone access when prompted.");
        } else if (err.name === "NotFoundError") {
          throw new Error("No microphone found. Check that your headset is connected and set as default in Windows Sound Settings.");
        } else {
          throw new Error(`Microphone access error: ${err.message}`);
        }
      } finally {
        // Stop the stream - we only needed permission
        stream?.getTracks().forEach(t => t.stop());
      }

      // Step 2: NOW enumerate devices (with proper labels thanks to permission)
      console.log('📱 Enumerating devices after permission grant...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(d => d.kind === "audioinput");

      console.log('📋 All devices found after permission:');
      devices.forEach((device, index) => {
        console.log(`  Device ${index}:`, {
          kind: device.kind,
          deviceId: device.deviceId,
          label: device.label || '[no label]',
          groupId: device.groupId
        });
      });

      // Step 3: NEVER filter out devices just because label is empty or deviceId is "default"
      if (mics.length === 0) {
        throw new Error("No audioinput devices found after permission grant.");
      }

      console.log('🎤 Microphones found:', mics.map(m => ({
        deviceId: m.deviceId,
        label: m.label || "Microphone",
        groupId: m.groupId
      })));

      // Set permission and trigger refresh
      setHasPermission(true);
      
      // Small delay to ensure permission state is set, then refresh
      setTimeout(async () => {
        console.log('🔄 Refreshing devices with new permission...');
        await refreshDevices();
      }, 100);
      
    } catch (e: any) {
      console.error('❌ Force refresh failed:', e);
      setError(e.message || 'Failed to detect microphones');
    }
  }, [refreshDevices]);

  // Simple microphone test - bypass all enumeration
  const testBasicMicrophone = useCallback(async () => {
    console.log('🧪 Testing basic microphone access...');
    setError(null);
    
    try {
      // Very simple getUserMedia call
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('🎉 SUCCESS! Microphone access granted');
      console.log('🎵 Stream details:', {
        active: stream.active,
        id: stream.id,
        tracks: stream.getTracks().length
      });
      
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track, index) => {
        console.log(`🎤 Audio Track ${index}:`, {
          label: track.label,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        });
      });
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      
      // If we got here, microphone works! Now try to refresh devices
      setHasPermission(true);
      setTimeout(async () => {
        console.log('🔄 Refreshing devices after successful test...');
        await refreshDevices();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Basic microphone test failed:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please click "Allow" when prompted.');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please check that your headset is connected and set as default in Windows Sound Settings.');
      } else {
        setError(`Microphone test failed: ${error.message}`);
      }
    }
  }, [refreshDevices]);

  return { 
    hasPermission, 
    mics, 
    speakers, 
    error, 
    requestMicPermission, 
    refreshDevices,
    forceRefreshDevices,
    testBasicMicrophone,
    getPreferredMic,
    getPreferredSpeaker
  };
}