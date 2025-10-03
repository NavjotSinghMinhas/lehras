import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function BeatCounter({ currentBeat, selectedTaal, isPlaying }) {
  const renderBeats = () => {
    const beats = [];
    let beatIndex = 1;
    
    selectedTaal.structure.forEach((groupSize, groupIndex) => {
      const groupBeats = [];
      for (let i = 0; i < groupSize; i++) {
        const isActive = beatIndex === currentBeat;
        const isFirstBeat = beatIndex === 1;
        
        groupBeats.push(
          <motion.div
            key={beatIndex}
            animate={isActive && isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.1 }}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-200
              ${isActive ? 
                'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 
                'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${isFirstBeat ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
            `}
          >
            {beatIndex}
          </motion.div>
        );
        beatIndex++;
      }
      
      beats.push(
        <div key={`group-${groupIndex}`} className="flex gap-2 p-2 bg-gray-50 rounded-lg sm:rounded-xl">
          {groupBeats}
        </div>
      );
    });
    
    return beats;
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800 text-lg sm:text-xl">
          <Clock className="w-5 h-5 text-indigo-600" />
          Beat Counter - {selectedTaal.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Beat Display */}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl font-bold text-indigo-800 mb-1">{currentBeat}</div>
          <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
            Beat {currentBeat} of {selectedTaal.beats}
          </div>
          <Badge variant="outline" className={`mt-2 ${isPlaying ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            {isPlaying ? 'Playing' : 'Stopped'}
          </Badge>
        </div>

        {/* Beat Visualization */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 text-center">Beat Pattern</div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {renderBeats()}
          </div>
        </div>

        {/* Taal Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4">
          <div className="text-sm text-gray-600 mb-2">Bols (Syllables):</div>
          <div className="flex flex-wrap gap-2">
            {selectedTaal.bols.map((bol, index) => (
              <Badge key={index} variant="outline" className="bg-white/70 border-indigo-200 text-indigo-700">
                {bol}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}