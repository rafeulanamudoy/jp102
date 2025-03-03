export const convertToISO = (date: string, time: string) => {
  const fullDateTime = new Date(`${date} ${time}`);
  return fullDateTime.toISOString();
};
