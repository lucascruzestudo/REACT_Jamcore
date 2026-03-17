import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';

// Global peak cache so we only decode each audio URL once
const peakCache = new Map<string, Float32Array>();
const pendingCache = new Map<string, Promise<Float32Array>>();

async function extractPeaks(url: string, bars: number): Promise<Float32Array> {
  const cacheKey = `${url}:${bars}`;
  if (peakCache.has(cacheKey)) return peakCache.get(cacheKey)!;

  if (!pendingCache.has(cacheKey)) {
    const promise = (async () => {
      const resp = await fetch(url, { mode: 'cors' });
      const arrayBuffer = await resp.arrayBuffer();
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      const channelData = decoded.getChannelData(0);
      const blockSize = Math.floor(channelData.length / bars);
      const peaks = new Float32Array(bars);
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        peaks[i] = sum / blockSize;
      }
      // Normalize
      const max = Math.max(...peaks);
      if (max > 0) peaks.forEach((_, idx) => (peaks[idx] /= max));
      peakCache.set(cacheKey, peaks);
      return peaks;
    })();
    pendingCache.set(cacheKey, promise);
  }

  return pendingCache.get(cacheKey)!;
}

interface WaveformVisualizerProps {
  audioUrl: string;
  currentTime: number;
  duration: number;
  isActive: boolean;
  onSeek: (time: number) => void;
  playedColor?: string;
  unplayedColor?: string;
  height?: number;
}

const BAR_COUNT_DESKTOP = 180;
const BAR_COUNT_MOBILE = 60;
const BAR_GAP_DESKTOP = 1;
const BAR_GAP_MOBILE = 2;

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioUrl,
  currentTime,
  duration,
  isActive,
  onSeek,
  playedColor = '#E93434',
  unplayedColor = '#CCCCCC',
  height = 56,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const BAR_COUNT = isMobile ? BAR_COUNT_MOBILE : BAR_COUNT_DESKTOP;
  const BAR_GAP = isMobile ? BAR_GAP_MOBILE : BAR_GAP_DESKTOP;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Load + analyze audio
  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${audioUrl}:${BAR_COUNT}`;
    if (peakCache.has(cacheKey)) {
      setPeaks(peakCache.get(cacheKey)!);
      return;
    }
    setLoading(true);
    setError(false);
    extractPeaks(audioUrl, BAR_COUNT)
      .then((p) => {
        if (!cancelled) {
          setPeaks(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError(true);
        }
      });
    return () => { cancelled = true; };
  }, [audioUrl, BAR_COUNT]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const progress = isActive && duration > 0 ? currentTime / duration : 0;
    const barWidth = (w - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
    const playedBars = Math.floor(progress * BAR_COUNT);

    if (!peaks || error) {
      // Flat placeholder bars
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barWidth + BAR_GAP);
        const barH = h * 0.3;
        const y = (h - barH) / 2;
        ctx.fillStyle = i < playedBars ? playedColor : unplayedColor;
        const bw = Math.max(barWidth, 0.5);
        ctx.beginPath();
        ctx.roundRect(x, y, bw, barH, Math.min(1.5, bw / 2));
        ctx.fill();
      }
      return;
    }

    for (let i = 0; i < BAR_COUNT; i++) {
      const amplitude = peaks[i];
      const barH = Math.max(amplitude * h * 0.9, 2);
      const x = i * (barWidth + BAR_GAP);
      const y = (h - barH) / 2;
      const bw = Math.max(barWidth, 0.5);
      ctx.fillStyle = i < playedBars ? playedColor : unplayedColor;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, barH, Math.min(1.5, bw / 2));
      ctx.fill();
    }
  }, [peaks, currentTime, duration, isActive, playedColor, unplayedColor, error, height, BAR_COUNT, BAR_GAP]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas || !duration) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      onSeek(Math.max(0, Math.min(1, ratio)) * duration);
    },
    [duration, onSeek]
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={16} sx={{ color: '#999' }} />
        </Box>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleSeek}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </Box>
  );
};

export default WaveformVisualizer;
