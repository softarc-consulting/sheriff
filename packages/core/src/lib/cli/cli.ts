export const cli = {
  endProcessOk: () => process.exit(0),
  endProcessError: () => process.exit(1),
  log: (message: string) => console.log(message),
  logError: (message: string) => console.error(message),
  bold: (text: string) => `\u001b[1m${text}\u001b[0m`,
};
