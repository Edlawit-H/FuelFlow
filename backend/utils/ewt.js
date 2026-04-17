/**
 * Calculate Estimated Wait Time
 * @param {number} position - User's current position in queue (1 = next to be served)
 * @param {number} serveTimeMinutes - Average time to serve one customer in minutes
 * @returns {number} Estimated wait time in minutes
 */
export const calculateEWT = (position, serveTimeMinutes) => {
  return (position - 1) * serveTimeMinutes;
};
