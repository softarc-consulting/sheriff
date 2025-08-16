import { ProjectInfo } from '../../main/init';

export type Entry = {
  projectName: string;
  entryFile: string; // the entry file as it is in the config or CLI
};

export type EntryWithProjectInfo = Entry & {
  projectInfo: ProjectInfo;
};
