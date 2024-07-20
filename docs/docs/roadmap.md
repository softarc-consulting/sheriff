---
title: Roadmap
displayed_sidebar: roadmapSidebar
---

# Roadmap

## Towards v1

In order to reach version 1, we plan to add following features

- ESLint flat config
- Barrel-less modules: It should be possible to define encapsulation without an _index.ts_. This is because barrel files cause a problem for any code-splitting/tree-shaking process. We plan to provide following alternatives to the barrel file:
  - _internal_ folder
  - folder/files with `_` prefix
  - decorators @private/@public
- optional cache: For large applications we require a cache together with a background process that watches the filesystem and updates the cache. In v1, the cache will be disabled by default. In later versions, it will become enabled.
- Angular schematic: For Angular application, there will be a migration available that allows to update Sheriff via `ng update`, and install it via `ng add @softarc/ng-sheriff`.

## Future plans

- ESLint for _sheriff.config.ts_: Sheriff should be able to verify if the configuration with tagging and module definition is valid, in that sense if the defined directories actually exist.
- Config API: Explore ways on how to improve the configuration file. Could be done via providing a fluent API, that provides better type-safety and DX.
- UI: Visualization of the dependencies with live-tracking of the dependency rules' impact.
- Excluding third-party libraries: Exclude third-party libraries to be used in modules.
- Nx Interop: Allow Sheriff to consume Nx dependency rules.
- Quality metrics: Extend Sheriff by adding various quality metrics which run next to the dependency rules. 
- Tutorial/Playground in the Docs: Provide a tutorial with WebContainers
- API Documentation
