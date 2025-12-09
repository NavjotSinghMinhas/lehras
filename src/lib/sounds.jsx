export const loadSound = async (name) => {
    const modules = import.meta.glob(['../assets/sounds/**/*.aac', '../assets/sounds/**/*.wav']);
    for (const path in modules) {
        const fileName = path.split('/').pop();
        if (fileName === name) {
            const mod = await modules[path]();
            return mod.default;
        }
    }
    return null;
};