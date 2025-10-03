import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

export default function VolumePanel({ master, onMasterChange, volumes, onVolumeChange }) {
  const change = (key, val) => onVolumeChange({ ...volumes, [key]: val });

  return (
    <Card className="border-0 rounded-2xl nm-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 nm-text text-base">
          <Volume2 className="w-4 h-4 nm-text" />
          Mixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-[11px] nm-text/70 mb-1">Master</div>
          <Slider value={[master]} onValueChange={(v) => onMasterChange(v[0])} max={1} step={0.05} />
        </div>
        <div>
          <div className="text-[11px] nm-text/70 mb-1">Lehra</div>
          <Slider value={[volumes.lehra]} onValueChange={(v) => change('lehra', v[0])} max={1} step={0.05} />
        </div>
        <div>
          <div className="text-[11px] nm-text/70 mb-1">Tanpura</div>
          <Slider value={[volumes.tanpura]} onValueChange={(v) => change('tanpura', v[0])} max={1} step={0.05} />
        </div>
        <div>
          <div className="text-[11px] nm-text/70 mb-1">Metronome</div>
          <Slider value={[volumes.metronome]} onValueChange={(v) => change('metronome', v[0])} max={1} step={0.05} />
        </div>
      </CardContent>
    </Card>
  );
}