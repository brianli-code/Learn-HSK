const fs   = require('fs');
const path = require('path');

// read all .mp3 files in this folder
const files = fs
  .readdirSync(__dirname)
  .filter(f => f.toLowerCase().endsWith('.mp3'));

// build an object keyed by the basename (without extension)
const sounds = files.reduce((obj, file) => {
  const key = path.basename(file, '.mp3');
  obj[key] = file;
  return obj;
}, {});

module.exports = sounds;
