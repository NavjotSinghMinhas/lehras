import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Plus, Minus } from "lucide-react";

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function FrequencySelector({ frequency, onFrequencyChange }) {
  const calculateFrequency = (note, octave, cents) => {
    const noteIndex = NOTES.indexOf(note);
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);
    const baseFreq = 440 * Math.pow(2, semitonesFromA4 / 12);
    const centAdjustment = Math.pow(2, cents / 1200);
    return Math.round(baseFreq * centAdjustment * 100) / 100;
  };
  const adjustCents = (delta) => onFrequencyChange({ ...frequency, cents: Math.max(-50, Math.min(50, frequency.cents + delta)) });
  const nextNote = () => onFrequencyChange({ ...frequency, note: NOTES[(NOTES.indexOf(frequency.note) + 1) % NOTES.length] });
  const prevNote = () => onFrequencyChange({ ...frequency, note: NOTES[(NOTES.indexOf(frequency.note) - 1 + NOTES.length) % NOTES.length] });
  const currentFreq = calculateFrequency(frequency.note, frequency.octave, frequency.cents);

  return (
    <Card className="border-0 rounded-2xl nm-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 nm-text text-base">
          <SlidersHorizontal className="w-4 h-4 nm-text" />
          Tuning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Central note display with prev/next (octave +/- removed) */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={prevNote} className="h-9 w-9 rounded-full nm-button" aria-label="Prev note" />
          <div className="relative w-24 h-24 rounded-full nm-card flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold nm-text leading-tight">{frequency.note}</div>
              <div className="text-[11px] nm-text/70">{currentFreq} Hz</div>
              <div className="text-[10px] nm-text/60">{frequency.cents > 0 ? '+' : ''}{frequency.cents}c</div>
            </div>
          </div>
          <button onClick={nextNote} className="h-9 w-9 rounded-full nm-button" aria-label="Next note" />
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
            <Button variant="outline" size="icon" onClick={() => adjustCents(-5)} className="h-8 w-8 rounded-full nm-button">
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <div className="flex-1">
              <Slider value={[frequency.cents]} onValueChange={(v) => onFrequencyChange({ ...frequency, cents: v[0] })} min={-50} max={50} step={1} />
            </div>
            <Button variant="outline" size="icon" onClick={() => adjustCents(5)} className="h-8 w-8 rounded-full nm-button">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}