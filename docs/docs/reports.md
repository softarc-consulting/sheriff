---
sidebar_position: 7
title: Creating violation reports
displayed_sidebar: tutorialSidebar
---

`Sheriff` can generate violation reports in various formats, which can be useful for integrating with CI/CD pipelines or for manual review. The reports can be generated in JSON, JUnit format.

The reports are generated when `sheriff verify` is executed and `reporters` are configured in the `sheriff.config.ts` file.

## Defining the reporters
To define the report format, you can use the `reporters` property in your `sheriff.config.ts` file. This property accepts an array of report formats which should be used: `reporters: ['json']`

## Custom directory where reports are written to
By default reports are written to `./sheriff/reports` relative to the project root. The directory can be customized by setting the `reportsDirectory`- property in the `sheriff.config.ts`.
