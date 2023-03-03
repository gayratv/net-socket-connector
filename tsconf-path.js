import tsConfig from './tsconfig.json' assert { type: 'json' };
import tsConfigPaths from 'tsconfig-paths';

const baseUrl = './src'; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// When path registration is no longer needed
cleanup();
