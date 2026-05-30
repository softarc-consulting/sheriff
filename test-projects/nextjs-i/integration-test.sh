set -e
yarn
yalc add @softarc/sheriff-core @softarc/eslint-plugin-sheriff
cd node_modules/.bin # yalc doesn't create symlink in node_modules/.bin
ln -sf ../@softarc/sheriff-core/src/bin/main.js ./sheriff
cd ../../
