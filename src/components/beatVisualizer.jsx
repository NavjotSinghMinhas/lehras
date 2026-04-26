import React from 'react';

export default function BeatVisualizer({ beats, currentBeat, isPlaying, large = false }) {
    const dotSam    = large ? 'w-7 h-7' : 'w-4 h-4';
    const dotNormal = large ? 'w-6 h-6' : 'w-3 h-3';
    const gap       = large ? 'gap-3'   : 'gap-2';

    return (
        <div className={`flex flex-wrap justify-center ${gap}`}>
            {Array.from({ length: beats }, (_, i) => {
                const isActive = currentBeat === i + 1;
                const isSam = i === 0;
                return (
                    <div
                        key={i}
                        className={[
                            'rounded-full transition-all duration-75',
                            isSam ? dotSam : dotNormal,
                            isActive
                                ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)] scale-110'
                                : isSam
                                    ? 'bg-stone-300 dark:bg-zinc-600'
                                    : 'bg-stone-200 dark:bg-zinc-700'
                        ].join(' ')}
                    />
                );
            })}
        </div>
    );
}
