import { build } from 'esbuild';
import pckg from '../package.json' assert { type: 'json' };

// console.log('package.json dependencies');
// console.log(pckg.dependencies, '\n');

const peerDep = pckg.peerDependencies ? Object.keys(pckg.peerDependencies) : [];
const dep = pckg.dependencies ? Object.keys(pckg.dependencies) : [];

const sharedConfig = {
  external: dep.concat(peerDep),
};
console.log(sharedConfig);

build({
  entryPoints: ['./src/net-socket/index.ts'],
  // outdir: 'esbuild',
  outfile: './dist/index.mjs',
  format: 'esm',
  target: ['esnext'],

  external: dep.concat(peerDep).concat(['fsevents', 'node:net']),
  // ts входит в стандартный loader
  loader: { '.js': 'jsx', '.png': 'base64', '.ts': 'ts' },
  bundle: true,
  allowOverwrite: true,
  platform: 'node',
  treeShaking: false,
  // splitting: true,
  // plugins: [nodeExternalsPlugin()],
  // minify: true,

  // minification
  minify: false,
  minifyIdentifiers: false,
  minifySyntax: false,
  minifyWhitespace: false,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
