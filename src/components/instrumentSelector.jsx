
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Guitar } from "lucide-react";

const INSTRUMENTS = [
  { name: "Harmonium", category: "Keyboard", description: "Traditional Indian pump organ" },
  { name: "Sitar", category: "String", description: "Classical plucked string instrument" },
  { name: "Esraj", category: "String", description: "Bowed string instrument" },
  { name: "Tabla", category: "Percussion", description: "Twin hand drums" },
  { name: "Sarod", category: "String", description: "Fretless plucked string instrument" },
  { name: "Violin", category: "String", description: "Classical bowed instrument" },
  { name: "Santoor", category: "String", description: "Hammered dulcimer" },
  { name: "Veena", category: "String", description: "Ancient plucked string instrument" }
];

const CATEGORIES = ["All", "String", "Keyboard", "Percussion"];

export default function InstrumentSelector() {
  const [selectedInstrument, setSelectedInstrument] = useState("Harmonium");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredInstruments = selectedCategory === "All" 
    ? INSTRUMENTS 
    : INSTRUMENTS.filter(inst => inst.category === selectedCategory);

  const selectedInstrumentData = INSTRUMENTS.find(inst => inst.name === selectedInstrument);

  const categoryColors = {
    "String": "bg-blue-50 border-blue-200 text-blue-700",
    "Keyboard": "bg-green-50 border-green-200 text-green-700", 
    "Percussion": "bg-red-50 border-red-200 text-red-700"
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800 text-lg sm:text-xl">
          <Guitar className="w-5 h-5 text-green-600" />
          Instrument Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl h-11 sm:h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category} className="text-base sm:text-lg py-2">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Instrument Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Instrument</label>
          <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
            <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl h-11 sm:h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredInstruments.map((instrument) => (
                <SelectItem key={instrument.name} value={instrument.name} className="text-base sm:text-lg py-2">
                  {instrument.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Instrument Info */}
        {selectedInstrumentData && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{selectedInstrumentData.name}</h3>
              <Badge 
                variant="outline" 
                className={categoryColors[selectedInstrumentData.category]}
              >
                {selectedInstrumentData.category}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{selectedInstrumentData.description}</p>
          </div>
        )}

        {/* Quick Select Buttons */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Select</div>
          <div className="grid grid-cols-2 gap-2">
            {INSTRUMENTS.slice(0, 4).map((instrument) => (
              <button
                key={instrument.name}
                onClick={() => setSelectedInstrument(instrument.name)}
                className={`
                  p-2 rounded-lg text-sm font-medium transition-all duration-200 border-2
                  ${selectedInstrument === instrument.name 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }
                `}
              >
                {instrument.name}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
