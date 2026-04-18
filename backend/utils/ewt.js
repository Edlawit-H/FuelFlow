export const calculateEWT = (position, serveTimeMinutes) => {
  return (position - 1) * serveTimeMinutes;
};
