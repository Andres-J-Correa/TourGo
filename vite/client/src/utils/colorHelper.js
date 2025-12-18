export const getColorForId = (id, colors) => {
  // Simple hash function to convert ID to a number
  const hash = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Map hash to an index in the colors array
  return colors[hash % colors.length];
};
