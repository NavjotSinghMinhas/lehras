import { useEffect, useRef, useMemo } from "react";
import * as Tone from "tone";
import { loadSound } from "./../lib/sounds";

export default function AudioPlayer({
  fileName,
  triggerPlay,
  beats,
  tempos,
  volume = 1,
  bpm = 75,
  cents = 0,
  setCurrentBeat
}) {
  const playerRef = useRef(null);
  const shiftRef = useRef(null);

  // Compute loop timings only when bpm/tempos/beats change
  const [start, end, audioBpm] = useMemo(() => {
    let start = 0;
    let end = 0;
    let audioBpm = 0;

    for (let i = 0; i < tempos.length; i++) {
      const segment = (60 / tempos[i]) * beats;
      audioBpm = tempos[i];
      if (bpm <= tempos[i]) {
        return [end, end + segment, audioBpm];
      }
      start = end;
      end += segment;
    }
    return [start, end, audioBpm];
  }, [bpm, fileName]);

  // Helper to dispose safely
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

  // Initialize new player when fileName changes
  useEffect(() => {
    if (!fileName) return;

    let isMounted = true;

    const init = async () => {
      const soundPath = await loadSound(fileName);
      if (!soundPath || !isMounted) return;

      disposePlayer();
      await Tone.start();

      if (!isMounted) return;

      playerRef.current = new Tone.GrainPlayer({
        url: soundPath,
        loop: true,
        //grainSize: 0.2,
        //overlap: 0.1,
        loopStart: start,
        loopEnd: end,
      }).toDestination();

      shiftRef.current = new Tone.PitchShift(cents / 100).toDestination();
      playerRef.current.connect(shiftRef.current);

      playerRef.current.volume.value = Tone.gainToDb(volume);
      playerRef.current.playbackRate = bpm / audioBpm;
    };

    init();

    return () => {
      isMounted = false;
      disposePlayer();
    };
  }, [fileName]); // only rebuild when file changes

  // Handle play/stop
  useEffect(() => {
    if (!playerRef.current) return;
    if (triggerPlay) {
      playerRef.current.start(undefined, start);
    } else {
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

    playerRef.current.stop();
    playerRef.current.loopStart = start;
    playerRef.current.loopEnd = end;
    playerRef.current.playbackRate = bpm / audioBpm;

    if (triggerPlay) {
      playerRef.current.start(undefined, start* (audioBpm / bpm));
    }
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
      Tone.Transport.cancel();
      Tone.Transport.scheduleRepeat(() => {
        setCurrentBeat(prev => (prev % beats) + 1);
      }, 60 / bpm);

      setCurrentBeat(0);
      Tone.Transport.start();
    } 
    else {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
    
  }, [triggerPlay, bpm, fileName]);

  return null;
}