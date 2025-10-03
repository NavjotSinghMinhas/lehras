import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

const INSTRUMENTS = ["Harmonium","Sitar","Esraj","Tabla","Sarod","Violin","Santoor","Veena"];
const RaagS = [
  "Raag 1","Raag 2","Raag 3","Raag 4","Raag 5",
  "Raag 6","Raag 7","Raag 8","Raag 9","Raag 10",
  "Raag 11","Raag 12","Raag 13","Raag 14","Raag 15"
];

export default function CombinedSelectors({
  taals,
  selectedTaalName,
  onTaalChange,
  selectedInstrument,
  onInstrumentChange,
  selectedRaag,
  onRaagChange
}) {
  return (
    <Card className="border-0 rounded-2xl nm-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 nm-text text-base">
          <Settings className="w-4 h-4 nm-text" />
          Selections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="text-[11px] nm-text/70 mb-1">Instrument</div>
          <Select value={selectedInstrument} onValueChange={onInstrumentChange}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick instrument" />
            </SelectTrigger>
            <SelectContent>
              {INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-[11px] nm-text/70 mb-1">Taal</div>
          <Select value={selectedTaalName} onValueChange={onTaalChange}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick taal" />
            </SelectTrigger>
            <SelectContent>
              {taals.map(t => <SelectItem key={t.name} value={t.name}>{t.name} ({t.beats})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-[11px] nm-text/70 mb-1">Raags</div>
          <Select value={selectedRaag} onValueChange={onRaagChange}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick raag" />
            </SelectTrigger>
            <SelectContent>
              {RaagS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}