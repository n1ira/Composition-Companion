import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Plus, Minus } from 'lucide-react';

// Full 88-key piano range from A0 to C8
const NOTES = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
const OCTAVES = [8, 7, 6, 5, 4, 3, 2, 1, 0];
const SNAP_OPTIONS = [
  { label: '1/1', value: 4 },
  { label: '1/2', value: 2 },
  { label: '1/4', value: 1 },
  { label: '1/8', value: 0.5 },
  { label: '1/16', value: 0.25 },
  { label: '1/32', value: 0.125 }
];

const AudioContext = window.AudioContext || window.webkitAudioContext;

const PianoRollEditor = () => {
  const [zoom, setZoom] = useState(1);
  const [notes, setNotes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [snapValue, setSnapValue] = useState(0.25); // Default to 1/16th notes
  
  const gridRef = useRef(null);
  const audioContextRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  
  const gridWidth = 1600;
  const noteHeight = 20;
  const measureWidth = 400 * zoom;
  const beatWidth = measureWidth / 4;
  const totalNotes = NOTES.length * OCTAVES.length;
  
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const snapToGrid = (position) => {
    const snapWidth = beatWidth * snapValue;
    return Math.round(position / snapWidth) * snapWidth;
  };

  const handleMouseDown = (e) => {
    if (!gridRef.current) return;
    
    // Prevent context menu on right click
    if (e.button === 2) {
      e.preventDefault();
      return;
    }
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const noteIndex = Math.floor(y / noteHeight);
    const timePosition = snapToGrid(x);
    
    if (e.button === 0) { // Left click
      const newNote = {
        id: Date.now(),
        note: NOTES[noteIndex % NOTES.length],
        octave: OCTAVES[Math.floor(noteIndex / NOTES.length)],
        start: timePosition,
        length: beatWidth * snapValue
      };
      
      setNotes([...notes, newNote]);
      setIsDrawing(true);
      setCurrentNote(newNote);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentNote || !gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newLength = Math.max(beatWidth * snapValue, snapToGrid(x - currentNote.start));
    
    setNotes(notes.map(note => 
      note.id === currentNote.id 
        ? {...note, length: newLength}
        : note
    ));
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    setCurrentNote(null);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find and remove any notes at this position
    setNotes(notes.filter(note => {
      const noteIndex = NOTES.indexOf(note.note) + OCTAVES.indexOf(note.octave) * NOTES.length;
      const noteY = noteIndex * noteHeight;
      return !(
        x >= note.start &&
        x <= note.start + note.length &&
        y >= noteY &&
        y <= noteY + noteHeight
      );
    }));
  };

  const getFrequency = (note, octave) => {
    const noteIndex = NOTES.length - NOTES.indexOf(note) - 1;
    const octaveIndex = OCTAVES.indexOf(octave);
    const totalSemitones = octaveIndex * 12 + noteIndex;
    const a4Index = OCTAVES.indexOf(4) * 12 + (NOTES.length - NOTES.indexOf('A') - 1);
    const semitoneDifference = totalSemitones - a4Index;
    const frequency = 440 * Math.pow(2, semitoneDifference / 12);
    return frequency;
  };

  const playNote = (frequency, time) => {
    // AudioContext should be initialized, but you can keep the check if desired
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);

    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    oscillator.start(time);
    oscillator.stop(time + 0.5);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      clearInterval(playbackIntervalRef.current);
      setIsPlaying(false);
      setPlayheadPosition(0);
    } else {
      // Initialize AudioContext if it's not already
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      setIsPlaying(true);
      let startTime = audioContextRef.current.currentTime;

      playbackIntervalRef.current = setInterval(() => {
        setPlayheadPosition(prev => {
          const newPosition = prev + beatWidth * 0.125;
          if (newPosition >= gridWidth) {
            clearInterval(playbackIntervalRef.current);
            setIsPlaying(false);
            return 0;
          }

          // Play any notes that start at this position
          notes.forEach(note => {
            if (Math.abs(note.start - newPosition) < beatWidth * 0.125) {
              const freq = getFrequency(note.note, note.octave);
              playNote(freq, audioContextRef.current.currentTime);
            }
          });

          return newPosition;
        });
      }, 50);
    }
  };

  return (
    <div className="w-full max-w-6xl bg-gray-900 p-4 rounded-lg">
      <div className="flex gap-4 mb-4 items-center">
        <button 
          className="p-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={togglePlayback}
        >
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        
        <button 
          className="p-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <button 
          className="p-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
        >
          <Plus className="w-4 h-4" />
        </button>

        <select 
          className="bg-gray-700 text-white p-2 rounded"
          value={snapValue}
          onChange={(e) => setSnapValue(parseFloat(e.target.value))}
        >
          {SNAP_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex">
        {/* Piano keys */}
        <div className="w-16 relative">
          {OCTAVES.map((octave, octaveIndex) => (
            NOTES.map((note, noteIndex) => (
              <div
                key={`${note}${octave}`}
                className={`h-5 border-b border-gray-600 flex items-center justify-end pr-2 ${
                  note.includes('#') ? 'bg-gray-800' : 'bg-gray-700'
                }`}
              >
                <span className="text-xs text-gray-300">{note}{octave}</span>
              </div>
            ))
          ))}
        </div>
        
        {/* Grid area */}
        <div 
          className="relative overflow-x-auto border-l border-gray-600"
          style={{ width: `${gridWidth}px` }}
        >
          <div
            ref={gridRef}
            className="relative"
            style={{ 
              height: `${totalNotes * noteHeight}px`,
              backgroundSize: `${beatWidth}px ${noteHeight}px`,
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleRightClick}
          >
            {/* Measure lines */}
            {Array.from({ length: Math.ceil(gridWidth / measureWidth) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-gray-500"
                style={{ left: `${i * measureWidth}px` }}
              />
            ))}
            
            {/* Playhead */}
            {isPlaying && (
              <div 
                className="absolute top-0 bottom-0 w-px bg-red-500"
                style={{ left: `${playheadPosition}px` }}
              />
            )}
            
            {/* Notes */}
            {notes.map(note => {
              const noteIndex = NOTES.indexOf(note.note) + OCTAVES.indexOf(note.octave) * NOTES.length;
              return (
                <div
                  key={note.id}
                  className="absolute bg-blue-500 rounded-sm opacity-75 hover:opacity-100"
                  style={{
                    top: `${noteIndex * noteHeight}px`,
                    left: `${note.start}px`,
                    width: `${note.length}px`,
                    height: `${noteHeight - 1}px`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRollEditor;
