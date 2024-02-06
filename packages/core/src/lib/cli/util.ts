export type Cli = {
  endProcessOk: () => void;
  endProcessError: () => void;
  log: (message: string) => void;
  logError: (message: string) => void;
};
