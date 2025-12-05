import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface AudioContextType {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array<ArrayBuffer> | null;
  frequencyData: Uint8Array<ArrayBuffer> | null;
  isPlaying: boolean;
  audioSource: 'file' | 'microphone' | null;
  isMicrophoneActive: boolean;
  currentTime: number;
  duration: number;
  initAudio: () => void;
  loadAudioFile: (file: File) => Promise<void>;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => void;
  stopAudio: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  seekAudio: (time: number) => void;
  getAverageFrequency: () => number;
  getBassFrequency: () => number;
  getMidFrequency: () => number;
  getHighFrequency: () => number;
}

const AudioContextState = createContext<AudioContextType | null>(null);

export const useAudioContext = () => {
  const context = useContext(AudioContextState);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<'file' | 'microphone' | null>(null);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(new ArrayBuffer(bufferLength));
      const freqData = new Uint8Array(new ArrayBuffer(bufferLength));
      
      setAudioContext(ctx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
      setFrequencyData(freqData);
      
      return { ctx, analyserNode };
    }
    return { ctx: audioContext, analyserNode: analyser };
  }, [audioContext, analyser]);

  const loadAudioFile = useCallback(async (file: File) => {
    const { ctx, analyserNode } = initAudio() || {};
    if (!ctx || !analyserNode) return;

    // Stop any existing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.crossOrigin = 'anonymous';
    audioElementRef.current = audio;

    await ctx.resume();
    
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    sourceNodeRef.current = source;

    // Track time updates
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.play();
    setIsPlaying(true);
    setAudioSource('file');

    audio.onended = () => {
      setIsPlaying(false);
    };
  }, [initAudio]);

  const startMicrophone = useCallback(async () => {
    const { ctx, analyserNode } = initAudio() || {};
    if (!ctx || !analyserNode) return;

    // Stop any existing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      await ctx.resume();
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserNode);
      sourceNodeRef.current = source;

      setIsPlaying(true);
      setAudioSource('microphone');
      setIsMicrophoneActive(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }, [initAudio]);

  const stopMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setAudioSource(null);
    setIsMicrophoneActive(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setAudioSource(null);
    setIsMicrophoneActive(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekAudio = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const getAverageFrequency = useCallback(() => {
    if (!analyser || !frequencyData) return 0;
    analyser.getByteFrequencyData(frequencyData);
    const sum = frequencyData.reduce((a, b) => a + b, 0);
    return sum / frequencyData.length;
  }, [analyser, frequencyData]);

  const getBassFrequency = useCallback(() => {
    if (!analyser || !frequencyData) return 0;
    analyser.getByteFrequencyData(frequencyData);
    const bassRange = frequencyData.slice(0, 10);
    const sum = bassRange.reduce((a, b) => a + b, 0);
    return sum / bassRange.length;
  }, [analyser, frequencyData]);

  const getMidFrequency = useCallback(() => {
    if (!analyser || !frequencyData) return 0;
    analyser.getByteFrequencyData(frequencyData);
    const midRange = frequencyData.slice(10, 100);
    const sum = midRange.reduce((a, b) => a + b, 0);
    return sum / midRange.length;
  }, [analyser, frequencyData]);

  const getHighFrequency = useCallback(() => {
    if (!analyser || !frequencyData) return 0;
    analyser.getByteFrequencyData(frequencyData);
    const highRange = frequencyData.slice(100, 256);
    const sum = highRange.reduce((a, b) => a + b, 0);
    return sum / highRange.length;
  }, [analyser, frequencyData]);

  return (
    <AudioContextState.Provider value={{
      audioContext,
      analyser,
      dataArray,
      frequencyData,
      isPlaying,
      audioSource,
      isMicrophoneActive,
      currentTime,
      duration,
      initAudio,
      loadAudioFile,
      startMicrophone,
      stopMicrophone,
      stopAudio,
      playAudio,
      pauseAudio,
      seekAudio,
      getAverageFrequency,
      getBassFrequency,
      getMidFrequency,
      getHighFrequency,
    }}>
      {children}
    </AudioContextState.Provider>
  );
};
