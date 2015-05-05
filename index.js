#!/usr/bin/env node

var Commander = require('commander');
var Canari = require('./lib/canari');
var Path = require('path');
var Fs = require('fs');


Commander.version(require('./package.json').Version)
    .option('-f, --file <file>', 'Configuration file (required)')
    .parse(process.argv);

if (!Commander.file) {
    console.error('Error: You must supply a configuration file argument with: --file filename.json');
    process.exit(1);
} 

var config = JSON.parse(Fs.readFileSync(Path.resolve(Commander.file)));

new Canari(config).start();
