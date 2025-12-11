import { useRef, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';

interface WaveformProps {
    progress: number;
    duration: number;
    onSeek: (time: number) => void;
}

export default function Waveform({ progress, duration, onSeek }: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { waveformData } = useAppSelector((state) => state.player);

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    // Draw waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / (waveformData.length || 1);
        const progressX = (progressPercent / 100) * width;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (waveformData.length === 0) {
            // Fallback: simple progress bar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, height / 2 - 2, width, 4);

            ctx.fillStyle = 'rgb(14, 165, 233)'; // primary-500
            ctx.fillRect(0, height / 2 - 2, progressX, 4);
            return;
        }

        // Draw waveform bars
        waveformData.forEach((amplitude, i) => {
            const x = i * barWidth;
            const barHeight = Math.max(amplitude * height * 0.8, 2);
            const y = (height - barHeight) / 2;

            // Color based on progress
            if (x < progressX) {
                ctx.fillStyle = 'rgb(14, 165, 233)'; // primary-500
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            }

            ctx.beginPath();
            ctx.roundRect(x, y, Math.max(barWidth - 1, 1), barHeight, 1);
            ctx.fill();
        });
    }, [waveformData, progressPercent]);

    // Handle click to seek
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current || duration === 0) return;

            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            const time = percent * duration;

            onSeek(Math.max(0, Math.min(time, duration)));
        },
        [duration, onSeek]
    );

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className="flex-1 h-8 cursor-pointer relative"
        >
            <canvas
                ref={canvasRef}
                width={600}
                height={32}
                className="w-full h-full"
            />
        </div>
    );
}
