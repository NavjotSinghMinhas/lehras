import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Select</p>

            <div className="grid grid-cols-2 gap-2">
                <Select
                    value={selectedInstrumentIndex != null ? String(selectedInstrumentIndex) : ""}
                    onValueChange={v => setSelectedInstrumentIndex(Number(v))}
                >
                    <SelectTrigger className="w-full h-10 rounded-xl text-sm bg-muted border-0 focus-visible:ring-1">
                        <SelectValue placeholder="Instrument" />
                    </SelectTrigger>
                    <SelectContent>
                        {data.map((i, index) => (
                            <SelectItem key={index} value={String(index)}>{i.Name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedTaalIndex != null ? String(selectedTaalIndex) : ""}
                    onValueChange={v => setSelectedTaalIndex(Number(v))}
                    disabled={selectedInstrumentIndex == null}
                >
                    <SelectTrigger className="w-full h-10 rounded-xl text-sm bg-muted border-0 focus-visible:ring-1 disabled:opacity-40">
                        <SelectValue placeholder="Taal" />
                    </SelectTrigger>
                    <SelectContent>
                        {(data[selectedInstrumentIndex]?.Taals
                            .map((t, index) => ({ t, index }))
                            .sort((a, b) => a.t.Beats - b.t.Beats) ?? []
                        ).map(({ t, index }) => (
                            <SelectItem key={index} value={String(index)}>
                                {t.Name} <span className="text-muted-foreground">·{t.Beats}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Select
                value={selectedRaagIndex != null ? String(selectedRaagIndex) : ""}
                onValueChange={v => setSelectedRaagIndex(Number(v))}
                disabled={selectedTaalIndex == null}
            >
                <SelectTrigger className="w-full h-10 rounded-xl text-sm bg-muted border-0 focus-visible:ring-1 disabled:opacity-40">
                    <SelectValue placeholder="Raag" />
                </SelectTrigger>
                <SelectContent>
                    {(data[selectedInstrumentIndex]?.Taals[selectedTaalIndex]?.Raags
                        .map((r, index) => ({ r, index }))
                        .sort((a, b) => a.r.Name.localeCompare(b.r.Name)) ?? []
                    ).map(({ r, index }) => (
                        <SelectItem key={index} value={String(index)}>{r.Name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
