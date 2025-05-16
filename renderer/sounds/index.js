const fs   = require('fs');
const path = require('path');

const scan = dir =>
  fs
    .readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith('.mp3'))
    .map(f => ({ dir, file: f }));

// scan root + both sub-folders
const all = [
  ...scan(__dirname),
  ...scan(path.join(__dirname, 'hsk3')),
  ...scan(path.join(__dirname, 'hsk4')),
];

const sounds = all.reduce((o, { dir, file }) => {
  const key = path.basename(file, '.mp3');
  o[key] = path.relative(__dirname, path.join(dir, file));
  return o;
}, {});

module.exports = sounds;
