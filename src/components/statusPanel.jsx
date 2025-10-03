import React from 'react';
import { Button } from "@/components/ui/button";

export default function StatusPanel({ bpm, onTap, currentBeat }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-xl nm-card text-center p-2">
        <div className="text-2xl font-extrabold nm-text leading-none">{bpm}</div>
        <div className="text-[10px] uppercase tracking-wide nm-text/70">BPM</div>
      </div>
      <Button
        onClick={onTap}
        className="rounded-xl nm-button nm-text font-semibold hover:opacity-90 h-auto py-2"
        aria-label="Auto adjust tempo"
      >
        Auto Change
      </Button>
      <div className="rounded-xl nm-card text-center p-2">
        <div className="text-2xl font-extrabold nm-text leading-none">{currentBeat}</div>
        <div className="text-[10px] uppercase tracking-wide nm-text/70">Matra</div>
      </div>
    </div>
  );
}