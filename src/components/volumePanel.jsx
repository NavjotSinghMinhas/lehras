import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Volume1, Volume2, VolumeX } from "lucide-react";

const TRACKS = [
    { key: 'lehra', label: 'Lehra' },
    { key: 'tanpura', label: 'Tanpura' },
    { key: 'metronome', label: 'Metronome' },
];

function VolumeIcon({ value }) {
    if (value === 0) return <VolumeX className="w-3.5 h-3.5" />;
    if (value < 0.5) return <Volume1 className="w-3.5 h-3.5" />;
    return <Volume2 className="w-3.5 h-3.5" />;
}

export default function VolumePanel({ volumes, onVolumeChange }) {
    const change = (key, val) => onVolumeChange({ ...volumes, [key]: val });

    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Mixer</p>
            <div className="space-y-4">
                {TRACKS.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-foreground shrink-0">{label}</span>
                        <Slider
                            value={[volumes[key]]}
                            onValueChange={v => change(key, v[0])}
                            max={1}
                            step={0.05}
                            className="flex-1"
                        />
                        <div className="w-5 shrink-0 flex items-center justify-center text-muted-foreground">
                            <VolumeIcon value={volumes[key]} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
