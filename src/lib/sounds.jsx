const SOUND_MODULES = import.meta.glob([
    '../assets/sounds/**/*.aac',
    '../assets/sounds/**/*.m4a',
    '../assets/sounds/**/*.ogg',
    '../assets/sounds/**/*.wav',
]);

export const loadSound = async (name) => {
    for (const path in SOUND_MODULES) {
        if (path.split('/').pop() === name) {
            const mod = await SOUND_MODULES[path]();
            return mod.default;
        }
    }
    return null;
};
