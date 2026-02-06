'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onComplete?: () => void;
    autoPlay?: boolean;
}

export function VideoPlayer({ src, poster, onComplete, autoPlay = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            setDuration(dur);
            setProgress((current / dur) * 100);

            if (current >= dur && onComplete) {
                onComplete();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div className="relative group bg-black rounded-lg overflow-hidden aspect-video shadow-xl">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                onEnded={() => {
                    setIsPlaying(false);
                    if (onComplete) onComplete();
                }}
            />

            {/* Overlay Controls */}
            <div className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}>
                <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-110 transition-all"
                >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-primary">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            if (videoRef.current) {
                                videoRef.current.currentTime = pos * videoRef.current.duration;
                            }
                        }}>
                        <div
                            className="h-full bg-primary transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white hover:text-primary">
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <button onClick={toggleFullscreen} className="text-white hover:text-primary">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
