export interface Raag {
    Name: string;
    FileName: string;
    TuningCoeff: number;
    MaxTempo: number;
    MinTempo: number;
    Tempos: number[];
}

export interface Taal {
    Name: string;
    Beats: number;
    Raags: Raag[];
}

export interface Instrument {
    Name: string;
    Taals: Taal[];
}

export interface JsonData {
    Instruments: Instrument[];
}