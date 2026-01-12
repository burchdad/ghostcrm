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
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({
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
      
      console.log('📱 Detected audio devices:', {
        mics: audioInputs.length,
        speakers: audioOutputs.length,
        devices: { audioInputs, audioOutputs }
      });
    } catch (e: any) {
      console.error('❌ Failed to enumerate devices:', e);
      setError(e?.message ?? "Failed to enumerate devices");
    }
  }, []);

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

      // Ask for mic access once, so labels populate.
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      console.log('✅ Microphone permission granted');
      setHasPermission(true);

      // Immediately stop tracks; we only needed permission + labels.
      stream.getTracks().forEach((t) => t.stop());

      await refreshDevices();
    } catch (e: any) {
      console.error('❌ Microphone permission error:', e);
      let errorMessage = "Microphone permission error";
      
      if (e?.name === "NotAllowedError") {
        errorMessage = "Microphone permission denied. Please allow microphone access and try again.";
      } else if (e?.name === "NotFoundError") {
        errorMessage = "No microphone device found. Please connect a microphone.";
      } else if (e?.name === "NotReadableError") {
        errorMessage = "Microphone is already in use by another application.";
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
    // Refresh when devices change (plug/unplug USB headset, etc.)
    const handler = () => {
      console.log('🔄 Device change detected, refreshing...');
      refreshDevices();
    };
    
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handler);
    }
    
    refreshDevices();
    
    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handler);
      }
    };
  }, [refreshDevices]);

  return { 
    hasPermission, 
    mics, 
    speakers, 
    error, 
    requestMicPermission, 
    refreshDevices,
    getPreferredMic,
    getPreferredSpeaker
  };
}