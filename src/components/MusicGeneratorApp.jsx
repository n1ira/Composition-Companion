// src/components/MusicGeneratorApp.jsx

import React, { useState } from 'react';
import PianoRollEditor from './PianoRollEditor';
import { ChevronDown, ChevronUp, PlayCircle, Save, Upload, Keyboard } from 'lucide-react';

const MusicGeneratorApp = () => {
  const [isPianoRollExpanded, setIsPianoRollExpanded] = useState(true);
  const [ideasToGenerate, setIdeasToGenerate] = useState(1);
  const [notesToGenerate, setNotesToGenerate] = useState(10);
  const [useBeginnerMode, setUseBeginnerMode] = useState(false);
  const [onlySaveAINotes, setOnlySaveAINotes] = useState(false);

  const handleConnectMIDIDevice = () => {
    // Placeholder for MIDI device connection logic
    alert('MIDI device connection functionality will be implemented here.');
  };

  const handleGenerateNotes = () => {
    // Placeholder for note generation logic
    alert('Note generation functionality will be implemented here.');
  };

  const handleSaveMIDI = () => {
    // Placeholder for saving MIDI file logic
    alert('Save MIDI functionality will be implemented here.');
  };

  const handleUploadMIDI = () => {
    // Placeholder for uploading MIDI file logic
    alert('Upload MIDI functionality will be implemented here.');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold">Composition Companion</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition"
          onClick={handleConnectMIDIDevice}
        >
          <Keyboard className="w-5 h-5 mr-2" />
          Connect MIDI Device
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto hidden md:block">
          {/* Options Section */}
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm">Number of ideas to generate (1-3):</span>
              <input
                type="number"
                min="1"
                max="3"
                value={ideasToGenerate}
                onChange={(e) => setIdeasToGenerate(Number(e.target.value))}
                className="mt-1 w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm">Total notes to generate (10-100):</span>
              <input
                type="number"
                min="10"
                max="100"
                value={notesToGenerate}
                onChange={(e) => setNotesToGenerate(Number(e.target.value))}
                className="mt-1 w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={useBeginnerMode}
                onChange={(e) => setUseBeginnerMode(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 rounded focus:outline-none"
              />
              <span className="ml-2 text-sm">Use Beginner Mode</span>
            </label>
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md transition"
              onClick={handleGenerateNotes}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Generate Notes
            </button>
          </div>

          {/* MIDI File Management Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">MIDI File Management</h2>
            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md transition"
                onClick={handleUploadMIDI}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload MIDI File
              </button>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={onlySaveAINotes}
                  onChange={(e) => setOnlySaveAINotes(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 rounded focus:outline-none"
                />
                <span className="ml-2 text-sm">Only Save AI Notes</span>
              </label>
              <button
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md transition"
                onClick={handleSaveMIDI}
              >
                <Save className="w-5 h-5 mr-2" />
                Save MIDI File
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow bg-gray-900 p-4 overflow-auto">
          {/* Piano Roll Editor Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Piano Roll Editor</h2>
              <button
                className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                onClick={() => setIsPianoRollExpanded(!isPianoRollExpanded)}
              >
                {isPianoRollExpanded ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-1" />
                    Expand
                  </>
                )}
              </button>
            </div>
            {isPianoRollExpanded && (
              <div className="flex-grow overflow-auto">
                <PianoRollEditor />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-gray-800 text-center text-sm">
        © {new Date().getFullYear()} Composition Companion. All rights reserved.
      </footer>
    </div>
  );
};

export default MusicGeneratorApp;
