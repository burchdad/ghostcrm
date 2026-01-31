'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiPlay, FiPause, FiTrash2, FiMic, FiSettings, FiCheck, FiX } from 'react-icons/fi';

interface Voice {
  id: string;
  name: string;
  type: 'primary' | 'sales' | 'support' | 'spanish' | 'custom';
  isActive: boolean;
  url: string;
  uploadedAt: string;
  metadata: {
    duration: number;
    size: number;
    quality: 'processing' | 'good' | 'excellent' | 'poor';
  };
}

interface VoiceManagerProps {
  tenantId: string;
  onVoiceUpdate?: (voices: Voice[]) => void;
}

export default function VoiceManager({ tenantId, onVoiceUpdate }: VoiceManagerProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [testText, setTestText] = useState("Hello! This is a test of your custom voice for Ghost CRM AI calling system.");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load existing voices
  useEffect(() => {
    fetchVoices();
  }, [tenantId]);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`/api/voice/upload?tenantId=${tenantId}`);
      const data = await response.json();
      setVoices(data.voices || []);
      onVoiceUpdate?.(data.voices || []);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const voiceName = prompt('Enter a name for this voice:');
    if (!voiceName) return;

    const voiceType = prompt('Voice type (primary/sales/support/spanish/custom):', 'primary');
    if (!voiceType) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('tenantId', tenantId);
      formData.append('voiceName', voiceName);
      formData.append('voiceType', voiceType);

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Voice uploaded:', result);
        fetchVoices(); // Refresh the list
        
        // Show success message
        alert(`Voice "${voiceName}" uploaded successfully! Processing audio quality...`);
      } else {
        alert(`Upload failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const playVoice = (voice: Voice) => {
    if (playing === voice.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlaying(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.src = voice.url;
        audioRef.current.play();
        setPlaying(voice.id);
        
        audioRef.current.onended = () => setPlaying(null);
      }
    }
  };

  const testVoiceWithText = async (voice: Voice) => {
    try {
      const response = await fetch('/api/voice/synthesize-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          tenantId,
          voiceType: voice.type
        })
      });

      const result = await response.json();
      
      if (response.ok && result.audioUrl) {
        // Play the generated test audio
        if (audioRef.current) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.play();
        }
        alert('Test generation complete! Listen to the preview.');
      } else {
        alert(`Test failed: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Test error:', error);
      alert('Test failed. Please try again.');
    }
  };

  const toggleVoiceActive = async (voice: Voice) => {
    // TODO: Implement activation/deactivation
    console.log(`Toggle voice ${voice.id} active state`);
  };

  const deleteVoice = async (voice: Voice) => {
    if (!confirm(`Delete voice "${voice.name}"? This cannot be undone.`)) return;
    
    // TODO: Implement voice deletion
    console.log(`Delete voice ${voice.id}`);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Voice Library</h3>
          <p className="text-sm text-gray-600">Upload and manage your custom AI voices</p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FiUpload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Voice'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/mp4"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Audio player */}
      <audio ref={audioRef} className="hidden" />

      {/* Voice Test Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Voice Testing Playground</h4>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test your voices..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={3}
        />
        <p className="text-sm text-gray-600 mt-2">
          Use this text to test how your voices will sound in AI calls
        </p>
      </div>

      {/* Voices List */}
      <div className="space-y-4">
        {voices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiMic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">No custom voices yet</h4>
            <p>Upload your first voice recording to get started with personalized AI calls</p>
          </div>
        ) : (
          voices.map((voice) => (
            <div key={voice.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900 mr-3">{voice.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {voice.type}
                    </span>
                    {voice.isActive && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span>Duration: {formatDuration(voice.metadata.duration)}</span>
                    <span>Size: {formatFileSize(voice.metadata.size)}</span>
                    <span className={getQualityColor(voice.metadata.quality)}>
                      Quality: {voice.metadata.quality}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Play/Pause */}
                  <button
                    onClick={() => playVoice(voice)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Play original recording"
                  >
                    {playing === voice.id ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                  </button>

                  {/* Test with custom text */}
                  <button
                    onClick={() => testVoiceWithText(voice)}
                    className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                    title="Test with custom text"
                  >
                    <FiMic className="w-4 h-4" />
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => toggleVoiceActive(voice)}
                    className={`p-2 transition-colors ${voice.isActive 
                      ? 'text-green-600 hover:text-red-600' 
                      : 'text-gray-400 hover:text-green-600'
                    }`}
                    title={voice.isActive ? 'Deactivate voice' : 'Activate voice'}
                  >
                    {voice.isActive ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteVoice(voice)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete voice"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Usage Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📝 Recording Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Record in a quiet environment with minimal background noise</li>
          <li>• Speak clearly and at a natural pace</li>
          <li>• Record 30-60 seconds of varied speech for best results</li>
          <li>• Include different emotions: friendly, professional, enthusiastic</li>
          <li>• Test your voice with different scripts before going live</li>
        </ul>
      </div>
    </div>
  );
}