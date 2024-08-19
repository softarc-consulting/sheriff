#!/usr/bin/env node

import * as fs from "fs";

const file = process.argv[2];

const tmpDir = process.env['TMP_DIR']
const lastSegment = tmpDir.split('/').pop()

let content = fs.readFileSync(file, {
  encoding: "utf-8"
});
const regExp = new RegExp(`"[^"]+/${lastSegment}/[^/]+`, 'g')
const cleanedContent = content.replace(regExp, '".')
const formattedContent = JSON.stringify(JSON.parse(cleanedContent), null, 2);
fs.writeFileSync(file, formattedContent, { encoding: "utf-8" });
