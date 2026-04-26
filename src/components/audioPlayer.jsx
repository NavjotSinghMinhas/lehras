import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { loadSound } from "../lib/sounds";

const NOTES_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const D3_INDEX = NOTES_ORDER.indexOf("D");

const roundDown = (num, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
};

export default function AudioPlayer({
    fileName,
    triggerPlay,
    beats,
    tempos,
    volume,
    tanpuraVolume,
    bpm,
    frequency,
    setCurrentBeat,
}) {
    const playerRef   = useRef(null);
    const shiftRef    = useRef(null);
    const tanpuraRef  = useRef(null);
    const wakeLockRef = useRef(null);

    // Audio logic only — refs avoid pointless re-renders.
    const startRef    = useRef(0);
    const audioBpmRef = useRef(0);

    // ── Helpers ───────────────────────────────────────────────────────────

    const disposePlayer = () => {
        if (playerRef.current) {
            playerRef.current.stop();
            playerRef.current.dispose();
            playerRef.current = null;
        }
        if (shiftRef.current) {
            shiftRef.current.dispose();
            shiftRef.current = null;
        }
    };

    const disposeTanpura = () => {
        if (tanpuraRef.current) {
            tanpuraRef.current.stop();
            tanpuraRef.current.dispose();
            tanpuraRef.current = null;
        }
    };

    const requestWakeLock = async () => {
        try {
            if ("wakeLock" in navigator)
                wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch {
            // not available or denied — ignore
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    };

    const getDetune = (note, octave, cents) =>
        ((octave - 3) * 12 + (NOTES_ORDER.indexOf(note) - D3_INDEX)) * 100 + cents;

    const calculateTimings = (currentBpm, currentBeats, currentTempos) => {
        let startVal = 0;
        let endVal = 0;
        let audioBpmVal = 0;
        const bufferDuration = playerRef.current?.buffer?.duration;

        for (const tempo of currentTempos) {
            const segment = Number(((60 / tempo) * currentBeats).toFixed(2));
            audioBpmVal = tempo;
            startVal = endVal;
            endVal += segment;
            if (currentBpm <= tempo) {
                const clampedEnd = bufferDuration != null && endVal > bufferDuration
                    ? bufferDuration
                    : roundDown(endVal);
                return [roundDown(startVal), clampedEnd, audioBpmVal];
            }
        }

        const clampedEnd = bufferDuration != null && endVal > bufferDuration
            ? bufferDuration
            : roundDown(endVal);
        return [roundDown(startVal), clampedEnd, audioBpmVal];
    };

    // ── Effects ───────────────────────────────────────────────────────────

    // Cleanup on unmount
    useEffect(() => () => {
        disposePlayer();
        disposeTanpura();
        Tone.Transport.cancel();
        releaseWakeLock();
    }, []);

    // Load tanpura once on mount — fixed file, never needs rebuilding
    useEffect(() => {
        const signal = { cancelled: false };
        (async () => {
            const soundPath = await loadSound("tanpura_02.wav");
            if (signal.cancelled || !soundPath) return;
            tanpuraRef.current = new Tone.GrainPlayer({
                url: soundPath,
                loop: true,
            }).toDestination();
            tanpuraRef.current.detune = getDetune(frequency.note, frequency.octave, frequency.cents);
            tanpuraRef.current.volume.value = Tone.gainToDb(tanpuraVolume);
        })();
        return () => {
            signal.cancelled = true;
            disposeTanpura();
        };
    }, []); // intentional: fixed file, load once

    // Rebuild lehra player when audio file changes
    useEffect(() => {
        if (!fileName) return;
        const signal = { cancelled: false };

        (async () => {
            const soundPath = await loadSound(fileName);
            if (signal.cancelled || !soundPath) return;

            disposePlayer();

            const [startVal, , audioBpmVal] = calculateTimings(bpm, beats, tempos);
            startRef.current    = startVal;
            audioBpmRef.current = audioBpmVal;

            playerRef.current = new Tone.GrainPlayer({
                url: soundPath,
                loop: true,
                loopStart: startVal,
                loopEnd: calculateTimings(bpm, beats, tempos)[1],
            }).toDestination();

            await Tone.start();

            shiftRef.current = new Tone.PitchShift(0).toDestination();
            playerRef.current.connect(shiftRef.current);
            playerRef.current.detune = getDetune(frequency.note, frequency.octave, frequency.cents);
            playerRef.current.volume.value = Tone.gainToDb(volume);
            playerRef.current.playbackRate = bpm / audioBpmVal;
        })();

        return () => {
            signal.cancelled = true;
            disposePlayer();
        };
    }, [fileName]); // intentional: only rebuild when the file itself changes

    // Play / stop — both lehra and tanpura together
    useEffect(() => {
        if (triggerPlay) {
            if (playerRef.current)
                playerRef.current.start(undefined, startRef.current * (audioBpmRef.current / bpm));
            if (tanpuraRef.current)
                tanpuraRef.current.start();
            requestWakeLock();
        } else {
            if (playerRef.current) playerRef.current.stop();
            if (tanpuraRef.current) tanpuraRef.current.stop();
            releaseWakeLock();
        }
    }, [triggerPlay]); // intentional: only react to explicit play/stop

    // Lehra volume
    useEffect(() => {
        if (playerRef.current)
            playerRef.current.volume.value = Tone.gainToDb(volume);
    }, [volume]);

    // Tanpura volume
    useEffect(() => {
        if (tanpuraRef.current)
            tanpuraRef.current.volume.value = Tone.gainToDb(tanpuraVolume);
    }, [tanpuraVolume]);

    // BPM — recalculate lehra loop window and playback rate
    useEffect(() => {
        if (!playerRef.current) return;
        try {
            const [startVal, endVal, audioBpmVal] = calculateTimings(bpm, beats, tempos);
            startRef.current    = startVal;
            audioBpmRef.current = audioBpmVal;
            playerRef.current.stop();
            playerRef.current.loopStart    = startVal;
            playerRef.current.loopEnd      = endVal;
            playerRef.current.playbackRate = bpm / audioBpmVal;
            if (triggerPlay)
                playerRef.current.start(undefined, startVal * (audioBpmVal / bpm));
        } catch {
            // player not yet ready
        }
    }, [bpm]); // intentional: loop recalculation only needed on bpm change

    // Pitch — applies to both lehra and tanpura
    useEffect(() => {
        const detune = getDetune(frequency.note, frequency.octave, frequency.cents);
        if (playerRef.current && shiftRef.current)
            playerRef.current.detune = detune;
        if (tanpuraRef.current)
            tanpuraRef.current.detune = detune;
    }, [frequency.note, frequency.octave, frequency.cents]);

    // Beat counter
    useEffect(() => {
        if (triggerPlay) {
            if (!playerRef.current) return;
            setCurrentBeat(0);
            Tone.Transport.cancel();
            Tone.Transport.scheduleRepeat(() => {
                setCurrentBeat(prev => (prev % beats) + 1);
            }, 60 / bpm);
            Tone.Transport.start();
        } else {
            Tone.Transport.cancel();
            setCurrentBeat(0);
        }
    }, [triggerPlay, bpm, beats]); // beats added so modulo stays correct after taal change

    return null;
}
