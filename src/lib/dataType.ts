export interface Raag {
    Name: string;
    FileName: string;
    Tempos: number[];
}

export interface Taal {
    Name: string;
    Beats: number;
    MaxTempo: number;
    MinTempo: number;
    Raags: Raag[];
}

export interface Instrument {
    Name: string;
    Taals: Taal[];
    TuningCoeff: number;
}

export interface JsonData {
    Instruments: Instrument[];
}