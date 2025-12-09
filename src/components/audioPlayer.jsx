import {useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {loadSound} from "./../lib/sounds";

export default function AudioPlayer({
                                        fileName,
                                        triggerPlay,
                                        beats,
                                        tempos,
                                        volume,
                                        bpm,
                                        frequency,
                                        setCurrentBeat
                                    }) {
    const NOTES_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const playerRef = useRef(null);
    const shiftRef = useRef(null);
    const wakeLockRef = useRef(null);

    // Compute loop timings only when bpm/tempos/beats change
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [audioBpm, setAudioBpm] = useState(0);

    const roundDown = (num, decimals = 2) => {
        const factor = Math.pow(10, decimals);
        return (Math.floor(num * factor) / factor).toFixed(decimals);
    };

    const calculateStartEndTimings = () => {
        if (!fileName) return [0, 0, 0];

        console.log("Calculating start, end timings for bpm:", bpm, "audio:", fileName);
        let startVal = 0;
        let endVal = 0;
        let audioBpmVal = 0;

        for (let i = 0; i < tempos.length; i++) {
            const segment = Number(((60 / tempos[i]) * beats).toFixed(2));
            audioBpmVal = tempos[i];
            if (bpm <= tempos[i]) {
                startVal = endVal;
                endVal += segment;
                console.log("Found time for bpm:", bpm, "          start:", startVal, "end", endVal);
                return [roundDown(startVal),
                    endVal > playerRef.current?.buffer.duration ?? endVal
                        ? playerRef.current.buffer.duration
                        : roundDown(endVal), audioBpmVal];
            }
            startVal = endVal;
            endVal += segment;
        }
        console.log("Found time for bpm:", bpm, "          start:", startVal, "end", endVal);
        return [roundDown(startVal),
            endVal > playerRef.current?.buffer.duration ?? endVal
                ? playerRef.current.buffer.duration
                : roundDown(endVal), audioBpmVal];
    }

    // Helper to dispose safely
    const disposePlayer = () => {
        if (playerRef.current) {
            playerRef.current.stop();
            playerRef.current.dispose();
            playerRef.current = null;
            console.log("Player disposed");
        }
        if (shiftRef.current) {
            shiftRef.current.dispose();
            shiftRef.current = null;
            console.log("Shift disposed");
        }
    };

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock acquired');
            }
        } catch (err) {
            console.error('Wake Lock error:', err);
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
            console.log('Wake Lock released');
        }
    };

    async function enterFullscreen() {
        try {
            const elem = document.documentElement; // or specific element

            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { // Safari
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { // IE11
                await elem.msRequestFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    const initPlayer = async () => {
        const soundPath = await loadSound(fileName);
        if (!soundPath) return;

        disposePlayer();
        console.log("player init called for", fileName);
        // Calculate timings
        let [startVal, endVal, audioBpmVal] = calculateStartEndTimings();
        setStart(startVal);
        setEnd(endVal);
        setAudioBpm(audioBpmVal);

        playerRef.current = new Tone.GrainPlayer({
            url: soundPath,
            loop: true,
            loopStart: startVal,
            loopEnd: endVal,
        }).toDestination();

        await Tone.start();

        shiftRef.current = new Tone.PitchShift(0).toDestination();
        playerRef.current.detune = frequency.cents;
        playerRef.current.connect(shiftRef.current);

        playerRef.current.volume.value = Tone.gainToDb(volume);
        playerRef.current.playbackRate = bpm / audioBpmVal;
        console.log("player initialized");
    };


    /************* Effects *************/

    // Initialize new player when fileName changes
    useEffect(() => {
        if (!fileName) return;

        let isMounted = true;

        const init = async () => {
            if (!isMounted) return;
            await initPlayer();
        };

        init();
    }, [fileName]); // only rebuild when file changes

    // Handle play/stop
    useEffect(() => {
        if (!playerRef.current) {
            return;
        }

        if (triggerPlay) {
            console.log("Player played with tempos:", tempos, " at start", start, "and end", end, "            Play? ", triggerPlay);
            playerRef.current.start(undefined, start * (audioBpm / bpm));

            requestWakeLock();
        } else {
            console.log("Player stopped");
            playerRef.current.stop();

            releaseWakeLock();
        }
    }, [triggerPlay]);

    // Handle volume change
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.volume.value = Tone.gainToDb(volume);
        }
    }, [volume]);

    // Handle bpm changes (update loop + playback rate)
    useEffect(() => {
        if (!playerRef.current) return;

        try {
            // Recalculate timings
            let [startVal, endVal, audioBpmVal] = calculateStartEndTimings();
            setStart(startVal);
            setEnd(endVal);
            setAudioBpm(audioBpmVal);

            console.log("bpm change entered bpm:", bpm, "file:", fileName, "start:", startVal, "end:", endVal, "audioBpm:", audioBpmVal);

            playerRef.current.stop();
            playerRef.current.playbackRate = bpm / audioBpmVal;
            playerRef.current.loopStart = startVal;
            playerRef.current.loopEnd = endVal;
            console.log("playback rate set to ", bpm / audioBpmVal);

            if (triggerPlay) {
                playerRef.current.start(undefined, startVal * (audioBpmVal / bpm));
                console.log("player started after bpm change       ", startVal * (audioBpmVal / bpm), " pitch", shiftRef.current.pitch);
            }
            console.log("bpm change handled");
        } catch (error) {
            console.error("Error handling bpm change:", error);
        }
    }, [bpm]);

    const getCentsFromNote = (note) => {
        const newIndex = NOTES_ORDER.indexOf(frequency.note);
        const previousIndex = NOTES_ORDER.indexOf('D'); // Assuming initial note is D

        // Assuming initial octave is 3
        return ((frequency.octave - 3) * 12 + (newIndex - previousIndex)) * 100;
    }

    // Handle note shift changes
    useEffect(() => {
        if (shiftRef.current) {
            playerRef.current.detune = getCentsFromNote(frequency.note);
            console.log("Note shift changed to ", playerRef.current.detune);
        }
    }, [frequency.note]);

    // Handle pitch shift changes
    useEffect(() => {
        if (shiftRef.current) {
            playerRef.current.detune = getCentsFromNote(frequency.note) + frequency.cents;
            console.log("Pitch shift changed to ", frequency.cents);
        }
    }, [frequency.cents]);

    // Handle beat changes
    useEffect(() => {
        if (!playerRef.current) return;

        if (triggerPlay) {
            console.log("Starting beats timer:        new bpm: ", bpm, "file:", fileName);
            setCurrentBeat(0);
            Tone.Transport.cancel();
            Tone.Transport.scheduleRepeat(() => {
                setCurrentBeat(prev => (prev % beats) + 1);
            }, 60 / bpm);
            Tone.Transport.start();
        } else {
            console.log("Stopping beats timer:        new bpm: ", bpm, "file:", fileName);
            Tone.Transport.cancel();
        }
    }, [triggerPlay, bpm]);

    return null;
}