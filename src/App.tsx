import React, { useState, useEffect } from "react";
import "./App.css";
import { Minus, Music, Pause, Play, Plus, Sun, Moon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

import FrequencySelector from "./components/frequencySelector";
import CombinedSelectors from "./components/combinedSelectors";
import VolumePanel from "./components/volumePanel";
import AudioPlayer from "./components/audioPlayer";
import BeatVisualizer from "./components/beatVisualizer";
import type { JsonData } from "./lib/dataType";
import data from "@/assets/data_min.json";

export default function TablaPractice() {
    const instruments = (data as JsonData).Instruments;

    const [selectedInstrumentIndex, setSelectedInstrumentIndex] = useState<number | null>(null);
    const [selectedTaalIndex, setSelectedTaalIndex] = useState<number | null>(null);
    const [selectedRaagIndex, setSelectedRaagIndex] = useState<number | null>(null);

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

    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const isReady = !!soundName;

    const togglePlay = () => {
        if (!isReady) return;
        setIsPlaying(p => !p);
    };

    const updateSelection = (instrument?: number, taal?: number, raag?: number) => {
        setIsPlaying(false);
        const instIdx = instrument ?? selectedInstrumentIndex;
        const taalIdx = instrument != null ? 0 : taal ?? selectedTaalIndex;
        const raagIdx = instrument != null || taal != null ? 0 : raag;
        if (instIdx === null) return;
        const inst = instruments[instIdx];
        const taalSel = inst.Taals[taalIdx ?? 0];
        const raagSel = taalSel?.Raags[raagIdx ?? 0];
        if (!raagSel) return;
        setSelectedInstrumentIndex(instIdx);
        setSelectedTaalIndex(taalIdx ?? 0);
        setSelectedRaagIndex(raagIdx ?? 0);
        setBeats(taalSel.Beats);
        setTempos(raagSel.Tempos);
        setMinTempo(raagSel.MinTempo);
        setMaxTempo(raagSel.MaxTempo);
        setBpm(prev => Math.max(raagSel.MinTempo, Math.min(raagSel.MaxTempo, prev)));
        setSoundName(raagSel.FileName);
    };

    const handleAutoTempo = () => {
        if (selectedInstrumentIndex == null || selectedTaalIndex == null || selectedRaagIndex == null) return;
        const tempoList = instruments[selectedInstrumentIndex].Taals[selectedTaalIndex].Raags[selectedRaagIndex].Tempos;
        setBpm(tempoList.find(t => t > bpm) ?? tempoList[0]);
    };

    const adjustBpm = (delta: number) =>
        setBpm(prev => Math.max(minTempo, Math.min(maxTempo, prev + delta)));

    const selectedTaalName =
        selectedInstrumentIndex != null && selectedTaalIndex != null
            ? instruments[selectedInstrumentIndex]?.Taals[selectedTaalIndex]?.Name
            : null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
                        <Music className="w-3.5 h-3.5 text-zinc-950" />
                    </div>
                    <span className="font-semibold tracking-tight text-foreground">Lehras</span>
                </div>
                <button
                    onClick={() => setDarkMode(d => !d)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            {/* Main */}
            <main className="max-w-[440px] mx-auto px-4 pt-4 pb-10 space-y-3">

                {/* Selections */}
                <CombinedSelectors
                    data={instruments}
                    selectedInstrumentIndex={selectedInstrumentIndex}
                    setSelectedInstrumentIndex={(idx: number) => updateSelection(idx)}
                    selectedTaalIndex={selectedTaalIndex}
                    setSelectedTaalIndex={(idx: number) => updateSelection(undefined, idx)}
                    selectedRaagIndex={selectedRaagIndex}
                    setSelectedRaagIndex={(idx: number) => updateSelection(undefined, undefined, idx)}
                />

                {/* Practice card */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-5">

                    {/* Beat visualizer */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {selectedTaalName ?? "Taal"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground tabular-nums">
                                {currentBeat > 0 ? `${currentBeat} / ${beats}` : `${beats} beats`}
                            </span>
                        </div>
                        <BeatVisualizer beats={beats} currentBeat={currentBeat} isPlaying={isPlaying} />
                    </div>

                    {/* BPM */}
                    <div className="text-center select-none">
                        <div className="text-6xl font-bold font-mono tracking-tighter text-foreground tabular-nums leading-none">
                            {bpm}
                        </div>
                        <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1.5">
                            beats per minute
                        </div>
                    </div>

                    {/* Tempo slider */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => adjustBpm(-1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <Slider
                            value={[bpm]}
                            onValueChange={v => setBpm(v[0])}
                            min={minTempo}
                            max={maxTempo}
                            step={1}
                            className="flex-1"
                        />
                        <button
                            onClick={() => adjustBpm(1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Auto tempo + Play button */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleAutoTempo}
                            disabled={!isReady}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide uppercase"
                        >
                            Auto
                        </button>
                        <button
                            onClick={togglePlay}
                            disabled={!isReady}
                            className={[
                                'flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                                !isReady
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                    : isPlaying
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20'
                                        : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-sm'
                            ].join(' ')}
                        >
                            {isPlaying ? (
                                <><Pause className="w-4 h-4" />Stop</>
                            ) : (
                                <><Play className="w-4 h-4" />Start Playing</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tuning */}
                <FrequencySelector frequency={frequency} onFrequencyChange={setFrequency} />

                {/* Mixer */}
                <VolumePanel volumes={volumes} onVolumeChange={setVolumes} />

            </main>

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
        </div>
    );
}
