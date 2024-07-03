---
sidebar_position: 3
title: Module Boundaries
---

Every directory with an _index.ts_ is a module. _index.ts_ exports
those files that should be accessible from the outside, i.e. it exposes the public API of the module.

In the screenshot below, you see an _index.ts_, which exposes the _holidays-facade.service.ts_, but encapsulates the
_internal.service.ts_.

<img width="1905" alt="Screenshot 2023-06-24 at 12 24 09" src="../img/module-boundaries-1.png"></img>

Every file outside of that directory (module) now gets a linting error when it imports the _internal.service.ts_.

<img width="1905" alt="Screenshot 2023-06-24 at 12 23 32" src="../img/module-boundaries-1.png"></img>
