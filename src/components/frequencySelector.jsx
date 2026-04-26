import React from 'react';
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NOTES = [
    { note: 'G', octave: 2 },
    { note: 'G#', octave: 2 },
    { note: 'A', octave: 2 },
    { note: 'A#', octave: 2 },
    { note: 'B', octave: 2 },
    { note: 'C', octave: 3 },
    { note: 'C#', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'D#', octave: 3 },
    { note: 'E', octave: 3 },
    { note: 'F', octave: 3 },
    { note: 'F#', octave: 3 },
];

const NOTES_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function getFrequency(note, octave) {
    const semitoneIndex = NOTES_ORDER.indexOf(note);
    if (semitoneIndex === -1) return 0;
    return Number((16.3516 * Math.pow(2, (semitoneIndex + octave * 12) / 12)).toFixed(1));
}

export default function FrequencySelector({ frequency, onFrequencyChange }) {
    const currentIdx = NOTES.findIndex(n => n.note === frequency.note && n.octave === frequency.octave);
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < NOTES.length - 1;

    const prevNote = () => {
        if (!hasPrev) return;
        const n = NOTES[currentIdx - 1];
        onFrequencyChange({ cents: 0, note: n.note, octave: n.octave });
    };

    const nextNote = () => {
        if (!hasNext) return;
        const n = NOTES[currentIdx + 1];
        onFrequencyChange({ cents: 0, note: n.note, octave: n.octave });
    };

    const currentFreq = (getFrequency(frequency.note, frequency.octave) * Math.pow(2, frequency.cents / 1200)).toFixed(1);
    const centsDisplay = frequency.cents === 0 ? '±0' : frequency.cents > 0 ? `+${frequency.cents}` : `${frequency.cents}`;
    const hasCentsOffset = frequency.cents !== 0;

    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Tuning</p>

            <div className="flex items-center gap-3">
                {/* Note picker */}
                <button
                    onClick={prevNote}
                    disabled={!hasPrev}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center">
                    <div className="text-3xl font-bold font-mono leading-none">
                        {frequency.note}
                        <span className="text-base font-normal text-muted-foreground ml-0.5">{frequency.octave}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{currentFreq} Hz</div>
                </div>

                <button
                    onClick={nextNote}
                    disabled={!hasNext}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Cents */}
                <div className="w-14 text-right shrink-0">
                    <div className={`text-lg font-bold font-mono tabular-nums leading-none ${hasCentsOffset ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {centsDisplay}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">cents</div>
                </div>
            </div>

            {/* Fine tune slider */}
            <div className="flex items-center gap-3 mt-4">
                <span className="text-[10px] text-muted-foreground font-mono w-8 text-right shrink-0">−100</span>
                <Slider
                    value={[frequency.cents]}
                    onValueChange={v => onFrequencyChange({ ...frequency, cents: v[0] })}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                />
                <span className="text-[10px] text-muted-foreground font-mono w-8 shrink-0">+100</span>
            </div>
        </div>
    );
}
