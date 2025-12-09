import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Slider} from "@/components/ui/slider";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Minus, Plus, SkipBack, SkipForward, SlidersHorizontal} from "lucide-react";

const NOTES = [
    {note: 'G', octave: 2},
    {note: 'G#', octave: 2},
    {note: 'A', octave: 2},
    {note: 'A#', octave: 2},
    {note: 'B', octave: 2},
    {note: 'C', octave: 3},
    {note: 'C#', octave: 3},
    {note: 'D', octave: 3},
    {note: 'D#', octave: 3},
    {note: 'E', octave: 3},
    {note: 'F', octave: 3},
    {note: 'F#', octave: 3},
];

function getFrequency(note, octave) {
    const NOTES_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    octave ??= NOTES.find(n => n.note === note).octave;
    const semitoneIndex = NOTES_ORDER.indexOf(note);
    if (semitoneIndex === -1) throw new Error("Invalid note: " + note);

    const totalSemitones = semitoneIndex + octave * 12;
    return Number((16.3516 * Math.pow(2, totalSemitones / 12)).toFixed(2));
}

export default function FrequencySelector({frequency, onFrequencyChange}) {
    const adjustCents = (delta) => onFrequencyChange({
        ...frequency,
        cents: Math.max(-100, Math.min(100, frequency.cents + delta))
    });
    const nextNote = () => {
        frequency.cents = 0; // Reset cents when changing note
        onFrequencyChange({
            ...frequency,
            note: NOTES[NOTES.findIndex(n => n.note === frequency.note) + 1]?.note ?? frequency.note,
            octave: NOTES[NOTES.findIndex(n => n.note === frequency.note) + 1]?.octave ?? frequency.octave,
        });
    }
    const prevNote = () => {
        frequency.cents = 0; // Reset cents when changing note
        onFrequencyChange({
            ...frequency,
            note: NOTES[NOTES.findIndex(n => n.note === frequency.note) - 1]?.note ?? frequency.note,
            octave: NOTES[NOTES.findIndex(n => n.note === frequency.note) - 1]?.octave ?? frequency.octave,
        });
    }
    const currentFreq = Number(getFrequency(frequency.note) * Math.pow(2, frequency.cents / 1200)).toFixed(2);

    return (
        <Card className="border-0 rounded-2xl nm-card">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 nm-text text-base">
                    <SlidersHorizontal className="w-4 h-4 nm-text"/>
                    Tuning
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Central note display with prev/next (octave +/- removed) */}
                <div className="flex items-center justify-center gap-3">
                    <button onClick={prevNote}
                            className="h-9 w-9 rounded-full nm-button inline-flex items-center justify-center p-0"
                            style={{padding: 0}} aria-label="Prev note">
                        <SkipBack className="h-5 w-5"/>
                    </button>
                    <div className="relative w-24 h-24 rounded-full nm-card flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold nm-text leading-tight">{frequency.note}</div>
                            <div className="text-[11px] nm-text/70">{currentFreq} Hz</div>
                            <div className="text-[10px] nm-text/60">{frequency.cents > 0 ? '+' : ''}{frequency.cents}c
                            </div>
                        </div>
                    </div>
                    <button onClick={nextNote}
                            className="h-9 w-9 rounded-full nm-button inline-flex items-center justify-center p-0"
                            style={{padding: 0}} aria-label="Next note">
                        <SkipForward className="h-5 w-5"/>
                    </button>
                </div>

                {/* Fine tuning slider with +/- buttons only */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium nm-text/80 uppercase">Tuner</span>
                        <Badge variant="outline" className="border-black/10 nm-text bg-white/20">
                            {frequency.cents > 0 ? '+' : ''}{frequency.cents}c
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => adjustCents(-1)}
                                className="h-8 w-8 rounded-full nm-button">
                            <Minus className="w-3.5 h-3.5"/>
                        </Button>
                        <div className="flex-1">
                            <Slider value={[frequency.cents]}
                                    onValueChange={(v) => onFrequencyChange({...frequency, cents: v[0]})} min={-100}
                                    max={100} step={1}/>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => adjustCents(1)}
                                className="h-8 w-8 rounded-full nm-button">
                            <Plus className="w-3.5 h-3.5"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}