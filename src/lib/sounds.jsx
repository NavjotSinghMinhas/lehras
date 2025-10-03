export const loadSound = async (name) => {
  const modules = import.meta.glob('../assets/sounds/**/*.wav');
  for (const path in modules) {
    const fileName = path.split('/').pop().replace('.wav', '');
    if (fileName === name) {
      const mod = await modules[path](); // ✅ call the function to import dynamically
      return mod.default;
    }
  }
  return null;
};