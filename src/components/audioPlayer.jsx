import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { loadSound } from "./../lib/sounds";

export default function AudioPlayer({
  fileName,
  triggerPlay,
  beats,
  tempos,
  volume,
  bpm,
  cents,
  setCurrentBeat
}) {
  const playerRef = useRef(null);
  const shiftRef = useRef(null);

  // Compute loop timings only when bpm/tempos/beats change
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [audioBpm, setAudioBpm] = useState(0);
  
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
        console.log("Found time for bpm:", bpm, "          start:", endVal, "end", endVal + segment);
        return [Number(endVal.toFixed(2)), Number((endVal + segment).toFixed(2)), audioBpmVal];
      }
      startVal = endVal;
      endVal += segment;
    }
    console.log("Found time for bpm:", bpm, "          start:", startVal, "end", endVal);
    return [Number(startVal.toFixed(2)), 
      endVal > playerRef.current?.buffer.duration ?? Number(endVal.toFixed(2)) 
          ? playerRef.current.buffer.duration 
          : Number(endVal.toFixed(2)), audioBpmVal];
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
    
    await Tone.start();

    playerRef.current = new Tone.GrainPlayer({
      url: soundPath,
      loop: true,
      loopStart: startVal,
      loopEnd: endVal,
    }).toDestination();

    shiftRef.current = new Tone.PitchShift(cents ?? 0 / 100).toDestination();
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
    } else {
        console.log("Player stopped");
      playerRef.current.stop();
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
      console.log("player started after bpm change       ", startVal * (audioBpmVal / bpm));
    }
    console.log("bpm change handled");
  }, [bpm]);

  // Handle pitch shift changes
  useEffect(() => {
    if (shiftRef.current) {
      shiftRef.current.pitch = cents / 100;
    }
  }, [cents]);

  // Handle beat changes
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (triggerPlay) {
      console.log("Starting beats timer:        new bpm: ", bpm, "file:", fileName);
      Tone.Transport.cancel();
      Tone.Transport.scheduleRepeat(() => {
        setCurrentBeat(prev => (prev % beats) + 1);
      }, 60 / bpm);

      setCurrentBeat(0);
      Tone.Transport.start();
    } 
    else {
      console.log("Stopping beats timer:        new bpm: ", bpm, "file:", fileName);
      Tone.Transport.cancel();
    }
  }, [triggerPlay, bpm]);

  return null;
}