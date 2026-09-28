import { spawn } from 'node:child_process';
const children = [spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit'}),spawn(process.execPath,['server/index.js'],{stdio:'inherit'})];
function stop(){for(const child of children)child.kill()}
for(const child of children)child.on('exit',stop);
process.on('SIGINT',stop);
process.on('SIGTERM',stop);
