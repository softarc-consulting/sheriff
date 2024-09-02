import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: ['introduction', 'installation', 'module_boundaries', 'dependency-rules', 'cli', 'integration'],
  releaseNotesSidebar: [{type: 'category', label: 'Release Notes', items: ['release-notes/0.17', 'release-notes/0.16']}],
  roadmapSidebar: ['roadmap'],
};

export default sidebars;
