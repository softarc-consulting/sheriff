#!/usr/bin/env node

import * as fs from "fs";

const file = process.argv[2];

let content = fs.readFileSync(file, {
  encoding: "utf-8"
});
const cleanedContent = content.replace(/"[^"]+\/test-projects\/[^\/]+/g, '".')
const formattedContent = JSON.stringify(JSON.parse(cleanedContent), null, 2);
fs.writeFileSync(file, formattedContent, { encoding: "utf-8" });
