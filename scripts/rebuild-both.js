#!/usr/bin/env node
'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const bsql3 = path.join(root, 'node_modules', 'better-sqlite3');
const release = path.join(bsql3, 'build', 'Release', 'better_sqlite3.node');
const libBinding = path.join(bsql3, 'lib', 'binding');
const platform = process.platform;
const arch = process.arch;

function storeAs(abi, label) {
  const dir = path.join(libBinding, `node-v${abi}-${platform}-${arch}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(release, path.join(dir, 'better_sqlite3.node'));
  console.log(`  saved ${label} binary → lib/binding/node-v${abi}-${platform}-${arch}/`);
}

// 1. Build for Node
console.log(`Building for Node (ABI ${process.versions.modules})...`);
execSync('npm run build-release', { cwd: bsql3, stdio: 'inherit' });
storeAs(process.versions.modules, 'Node');

// 2. Build for Electron
console.log('Building for Electron...');
execSync('npm run rebuild:electron', { cwd: root, stdio: 'inherit' });

// Detect Electron ABI by trying to load the Electron-compiled binary from this Node process.
// The load will fail with an error that names both ABIs — we extract the compiled-for ABI.
const probe = spawnSync(process.execPath, [
  '-e',
  `try{process.dlopen({exports:{}},'${release.replace(/\\/g, '\\\\')}');}catch(e){process.stdout.write(e.message)}`,
]);
const msg = probe.stdout.toString();
const match = msg.match(/NODE_MODULE_VERSION (\d+)/);

if (!match) {
  console.error('Could not detect Electron ABI.\nprobe output:', msg || probe.stderr.toString());
  process.exit(1);
}

const electronAbi = match[1];
if (electronAbi === process.versions.modules) {
  console.error('Electron binary has same ABI as Node — rebuild:electron may not have run correctly.');
  process.exit(1);
}

storeAs(electronAbi, 'Electron');

// 3. Remove build/Release so `bindings` falls through to lib/binding/ and auto-selects by ABI
fs.rmSync(release);
console.log('\nDone. Both runtimes will now auto-select the correct binary.');
console.log('Run this script again only after npm install.');
