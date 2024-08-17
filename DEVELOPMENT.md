Sheriff consists of three processes:

1. File Graph: `traverseFilesystem` gets and entry file and returns a graph of all the files that are required to run
   the entry file. The final type of the graph is `UnassignedFileInfo`, meaning graph without modules.
2. Modules: Based on `FileInfo`, `createModules` detects the existing modules and their dependencies. The final type of
   the modules is `ModuleInfo`.
3. Merging FileGraph and Modules: `FileInfo` is the final type of the graph that contains all the information about the
   files and modules. It is done by

The entry point is always the `init` function.
