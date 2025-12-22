#!/usr/bin/env node
import { preview } from 'vite';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('Starting server with configuration:');
console.log(`   Environment: ${NODE_ENV}`);
console.log(`   Host: ${HOST}`);
console.log(`   Port: ${PORT}`);

const server = await preview({
  configFile: './vite.config.js',
  preview: {
    host: HOST,
    port: PORT,
    strictPort: true,
    open: false
  }
});

server.printUrls();
console.log(`✅ Server ready and listening on http://${HOST}:${PORT}`);
