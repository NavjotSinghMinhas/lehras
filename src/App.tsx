import React, { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Plus, Minus, Music, Radio } from "lucide-react";

import FrequencySelector from "./components/frequencySelector";
import StatusPanel from "./components/statusPanel";
import CombinedSelectors from "./components/combinedSelectors";
import VolumePanel from "./components/volumePanel";
import AudioPlayer from "./components/audioPlayer";
import type { JsonData } from "./lib/dataType";
import data from "@/assets/data_min.json";

/* ---------- Utility functions ---------- */
const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mix = (c1: string, c2: string, t: number) => {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const b2 = Math.round(a.b + (b.b - a.b) * t);
  return rgbToHex({ r, g, b: b2 });
};

/* ---------- Component ---------- */
export default function TablaPractice() {
  const instruments = (data as JsonData).Instruments;

  // Selection state
  const [selectedInstrumentIndex, setSelectedInstrumentIndex] = useState<number | null>(null);
  const [selectedTaalIndex, setSelectedTaalIndex] = useState<number | null>(null);
  const [selectedRaagIndex, setSelectedRaagIndex] = useState<number | null>(null);

  // Sound state
  const [frequency, setFrequency] = useState({ note: "D", octave: 3, cents: 0 });
  const [volumes, setVolumes] = useState({ lehra: 0.7, tanpura: 0.55, metronome: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(75);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beats, setBeats] = useState(6);
  const [minTempo, setMinTempo] = useState(40);
  const [maxTempo, setMaxTempo] = useState(120);
  const [tempos, setTempos] = useState<number[]>([]);
  const [soundName, setSoundName] = useState("");

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [darkIntensity, setDarkIntensity] = useState(60);

  const togglePlay = () => {
    if(!soundName) {
        alert("Please select an instrument, taal, and raag first.");
        return;
    }
    
    setIsPlaying((p) => !p)
  };

  // Selection handlers
  const updateSelection = (instrument?: number, taal?: number, raag?: number) => {
    setIsPlaying(false);

    const instIdx = instrument ?? selectedInstrumentIndex;
    const taalIdx = instrument != null ? 0 : taal ?? selectedTaalIndex;
    const raagIdx = instrument != null || taal != null ? 0 : raag;

    if (instIdx === null) return;

    const inst = instruments[instIdx];
    const taalSel = inst.Taals[taalIdx ?? 0];
    const raagSel = taalSel?.Raags[raagIdx ?? 0] ?? 0;

    setSelectedInstrumentIndex(instIdx);
    setSelectedTaalIndex(taalIdx ?? 0);
    setSelectedRaagIndex(raagIdx ?? 0);
    setBeats(taalSel.Beats);
    setTempos(raagSel.Tempos);
    setMinTempo(taalSel.MinTempo);
    setMaxTempo(taalSel.MaxTempo);

    if (bpm < taalSel.MinTempo) setBpm(taalSel.MinTempo);
    else if (bpm > taalSel.MaxTempo) setBpm(taalSel.MaxTempo);
    
    setSoundName(raagSel.FileName.replace(".wav", ""));
  };

  // Tap tempo
  const tapRef = useRef<number[]>([]);
  const handleTapTempo = () => {
    if(selectedInstrumentIndex == null && selectedTaalIndex == null && selectedRaagIndex == null) return;

    const tempos = instruments[selectedInstrumentIndex]
        .Taals[selectedTaalIndex]
        .Raags[selectedRaagIndex]
        .Tempos;

    setBpm(tempos.find(t => t > bpm) ?? tempos[0]);
  };

  const adjustBpm = (delta: number) => setBpm((prev) => Math.max(minTempo, Math.min(maxTempo, prev + delta)));

  // Theme variables
  const themeVars = useMemo(() => {
    if (!darkMode) {
      return {
        "--bg": "#ffffff",
        "--surface": "#f5f5f5",
        "--text": "#1f2937",
        "--shadow-out": "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9)",
        justifyContent: "center"
      } as React.CSSProperties;
    }
    const t = Math.min(1, Math.max(0, darkIntensity / 100));
    return {
      "--bg": mix("#0f1216", "#0b0d11", t),
      "--surface": mix("#171a1f", "#1c2027", t),
      "--text": mix("#e5e7eb", "#ffffff", t * 0.3),
      "--shadow-out": `6px 6px 12px rgba(0,0,0,${0.55 + 0.25 * t}), -6px -6px 12px rgba(255,255,255,${0.04 + 0.04 * t})`,
      "justify-content": "center"
    } as React.CSSProperties;
  }, [darkMode, darkIntensity]);

  return (
      <div className="min-h-screen flex flex-col" data-theme={darkMode ? "dark" : "light"} style={themeVars}>
        <style>{`
        .nm-bg { background: var(--bg); }
        .nm-surface { background: var(--surface); }
        .nm-text { color: var(--text); }
        .nm-card { background: var(--surface); box-shadow: var(--shadow-out); }
        .nm-button { background: var(--surface); box-shadow: var(--shadow-out); color: var(--text); border: 0; }
      `}</style>

        {/* Header */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between nm-bg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl nm-card flex items-center justify-center">
              <Music className="w-4 h-4 nm-text" />
            </div>
            <span className="text-base sm:text-lg font-bold nm-text tracking-tight">Lehras</span>
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs nm-text">Light</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <span className="text-xs nm-text">Dark</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-3 pb-2 nm-bg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FrequencySelector frequency={frequency} onFrequencyChange={setFrequency} />

            <Card className="border-0 rounded-2xl nm-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 nm-text text-base">
                  <Radio className="w-4 h-4 nm-text" />
                  Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button onClick={() => adjustBpm(-1)} className="h-9 w-9 rounded-full nm-button" size="icon">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Slider value={[bpm]} onValueChange={(v) => setBpm(v[0])} min={minTempo} max={maxTempo} step={1} />
                  <Button onClick={() => adjustBpm(1)} className="h-9 w-9 rounded-full nm-button" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <StatusPanel bpm={bpm} onTap={handleTapTempo} currentBeat={currentBeat} />

                <Button
                    onClick={togglePlay}
                    className={`flex-1 h-10 text-sm font-semibold rounded-xl ${
                        isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
                    } text-white`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Start"}
                </Button>
              </CardContent>
            </Card>

            <CombinedSelectors
                data={instruments}
                selectedInstrumentIndex={selectedInstrumentIndex}
                setSelectedInstrumentIndex={(idx) => updateSelection(idx)}
                selectedTaalIndex={selectedTaalIndex}
                setSelectedTaalIndex={(idx) => updateSelection(undefined, idx)}
                selectedRaagIndex={selectedRaagIndex}
                setSelectedRaagIndex={(idx) => updateSelection(undefined, undefined, idx)}
            />

            <VolumePanel volumes={volumes} onVolumeChange={setVolumes} />
          </div>
        </div>

        <AudioPlayer
            triggerPlay={isPlaying}
            volume={volumes.lehra}
            beats={beats}
            tempos={tempos}
            fileName={soundName}
            bpm={bpm}
            frequency={frequency}
            setCurrentBeat={setCurrentBeat}
        />

        {/* Footer */}
        {/*<div style={{position: "fixed", left: 0, right: 0, bottom: 0}} className="h-14 w-full nm-surface border-t border-black/10 flex items-center justify-center text-xs nm-text">*/}
        {/*  Ad space*/}
        {/*</div>*/}
      </div>
  );
}