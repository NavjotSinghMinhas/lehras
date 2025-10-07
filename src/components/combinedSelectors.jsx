import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import data from "../assets/data_min.json"

export default function CombinedSelectors({
    data,
  selectedInstrumentIndex,
                                            setSelectedInstrumentIndex,
  selectedTaalIndex,
                                            setSelectedTaalIndex,
  selectedRaagIndex,
                                            setSelectedRaagIndex
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
          <Select value={selectedInstrumentIndex ?? ""} onValueChange={setSelectedInstrumentIndex}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick instrument" />
            </SelectTrigger>
            <SelectContent>
              {data.map((i, index) => <SelectItem key={i.Name} value={index}>{i.Name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-[11px] nm-text/70 mb-1">Taal</div>
          <Select value={selectedTaalIndex ?? ""} onValueChange={setSelectedTaalIndex}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick taal" />
            </SelectTrigger>
            <SelectContent>
              {data[selectedInstrumentIndex]?.Taals.map((t, index) => <SelectItem key={t.Name} value={index}>{t.Name} ({t.Beats})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-[11px] nm-text/70 mb-1">Raag</div>
          <Select value={selectedRaagIndex ?? ""} onValueChange={setSelectedRaagIndex}>
            <SelectTrigger className="h-9 rounded-xl nm-card nm-text text-sm border-0">
              <SelectValue placeholder="Pick raag" />
            </SelectTrigger>
            <SelectContent>
              {data[selectedInstrumentIndex]?.Taals[selectedTaalIndex]?.Raags.map((r, index) => <SelectItem key={r.Name} value={index}>{r.Name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}