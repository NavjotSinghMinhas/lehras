import React, { useState, useEffect, useRef, useMemo } from 'react';
import "./App.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Plus, Minus, Music, Radio } from "lucide-react";

import FrequencySelector from "./components/frequencySelector";
import StatusPanel from "./components/statusPanel";
import CombinedSelectors from "./components/combinedSelectors";
import VolumePanel from "./components/volumePanel";
import AudioPlayer from "./components/audioPlayer"

const TAALS = [
  { name: "Teen Taal", beats: 16, structure: [4, 4, 4, 4] },
  { name: "Roopak", beats: 7, structure: [3, 2, 2] },
  { name: "Ektaal", beats: 12, structure: [2, 2, 2, 2, 2, 2] },
  { name: "Jhaptaal", beats: 10, structure: [2, 3, 2, 3] },
  { name: "Dadra", beats: 6, structure: [3, 3] }
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function rgbToHex({ r, g, b }) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function mix(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const b2 = Math.round(a.b + (b.b - a.b) * t);
  return rgbToHex({ r, g, b: b2 });
}

export default function TablaPractice() {
  // core state
  const [currentBeat, setCurrentBeat] = useState(0);
  const [selectedTaal, setSelectedTaal] = useState(TAALS[0]);
  const [frequency, setFrequency] = useState({ note: "C#", octave: 4, cents: 0 });
  const [volumes, setVolumes] = useState({ lehra: 0.7, tanpura: 0.55, metronome: 0 });
  const [master, setMaster] = useState(0.8);
  const [selectedInstrument, setSelectedInstrument] = useState("Harmonium");
  const [selectedPerformer, setSelectedPerformer] = useState("Performer 1");
  
  // theme state
  const [darkMode, setDarkMode] = useState(false);
  const [darkIntensity, setDarkIntensity] = useState(60); // 0-100, only used when darkMode=true

  // sound state
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(75);
  const [soundName, setSoundName] = useState("");

  const togglePlay = () => setIsPlaying(!isPlaying);
  const adjustBpm = (delta) => setBpm(prev => Math.max(40, Math.min(300, prev + delta)));

  // Tap tempo (Auto Change)
  const tapRef = useRef([]);
  const handleTapTempo = () => {
    const now = Date.now();
    tapRef.current = [...tapRef.current.filter(t => now - t < 3000), now];
    if (tapRef.current.length >= 2) {
      const intervals = tapRef.current.slice(1).map((t, i) => t - tapRef.current[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calc = Math.round(60000 / avg);
      setBpm(Math.max(40, Math.min(300, calc)));
    }
  };

  // Theme variables computed from intensity
  const themeVars = useMemo(() => {
    if (!darkMode) {
      return {
        '--bg': '#f3f4f6',
        '--surface': '#f5f5f5',
        '--text': '#1f2937',
        '--shadow-out': '6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9)',
      };
    }
    const t = Math.min(1, Math.max(0, darkIntensity / 100));
    const bg = mix('#0f1216', '#0b0d11', t);
    const surface = mix('#171a1f', '#1c2027', t);
    const text = mix('#e5e7eb', '#ffffff', t * 0.3);
    const shadowOut = `6px 6px 12px rgba(0,0,0,${0.55 + 0.25 * t}), -6px -6px 12px rgba(255,255,255,${0.04 + 0.04 * t})`;
    return {
      '--bg': bg,
      '--surface': surface,
      '--text': text,
      '--shadow-out': shadowOut,
    };
  }, [darkMode, darkIntensity]);

  return (
        <div
      className="min-h-screen flex flex-col"
      data-theme={darkMode ? 'dark' : 'light'}
      style={themeVars}
    >
      {/* Theme-aware helpers */}
      <style>{`
        .nm-bg { background: var(--bg); }
        .nm-surface { background: var(--surface); }
        .nm-text { color: var(--text); }
        .nm-card { background: var(--surface); box-shadow: var(--shadow-out); }
        .nm-button { background: var(--surface); box-shadow: var(--shadow-out); color: var(--text); border: 0; }
      `}</style>

      {/* Header: left title, right theme controls */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between nm-bg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl nm-card flex items-center justify-center">
            <Music className="w-4 h-4 nm-text" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold nm-text tracking-tight">Tabla Practice</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs nm-text">Dark</span>
            <Slider
              value={[darkIntensity]}
              onValueChange={(v) => setDarkIntensity(v[0])}
              min={20}
              max={100}
              step={1}
              className="w-24"
              disabled={!darkMode}
            />
            
            
            
            
            
            <input 
        placeholder="Enter sound name" 
        value={soundName} 
        onChange={(e) => setSoundName(e.target.value)} 
      />

            <AudioPlayer 
                fileName={soundName} 
                triggerPlay={isPlaying} 
                volume={volumes.lehra} 
                bpm={bpm} 
                beats={10} 
                tempos={[40, 50, 60, 75, 90, 120]} 
                setCurrentBeat={setCurrentBeat}/>






          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs nm-text">Light</span>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            <span className="text-xs nm-text">Dark</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 pb-2 nm-bg">
      {/* Content - Tuning */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FrequencySelector frequency={frequency} onFrequencyChange={setFrequency} />
          </div>
          
          <div>
            <Card className="border-0 rounded-2xl nm-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 nm-text text-base">
                  <Radio className="w-4 h-4 nm-text" />
                  Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* BPM slider with +/- at ends */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustBpm(-1)}
                    className="h-9 w-9 rounded-full nm-button"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <Slider value={[bpm]} onValueChange={(v) => setBpm(v[0])} min={40} max={300} step={1} />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustBpm(1)}
                    className="h-9 w-9 rounded-full nm-button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <StatusPanel bpm={bpm} onTap={handleTapTempo} currentBeat={currentBeat} />

                <div className="flex gap-2">
                  <Button
                    onClick={togglePlay}
                    className={`flex-1 h-10 text-sm font-semibold rounded-xl ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: Selections (left half) and Mixer (right half) */}
          <div>
            <CombinedSelectors
              taals={TAALS}
              selectedTaalName={selectedTaal.name}
              onTaalChange={(name) => {
                const t = TAALS.find(tt => tt.name === name) || TAALS[0];
                setSelectedTaal(t);
                setCurrentBeat(1);
              }}
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
              selectedPerformer={selectedPerformer}
              onPerformerChange={setSelectedPerformer}
            />
          </div>

          <div>
            <VolumePanel
              master={master}
              onMasterChange={setMaster}
              volumes={volumes}
              onVolumeChange={setVolumes}
            />
          </div>
        </div>
      </div>

      {/* Bottom ad placeholder */}
      <div className="h-14 w-full nm-surface border-t border-black/10 flex items-center justify-center text-xs nm-text">
        Ad space
      </div>
    </div>
  );
}