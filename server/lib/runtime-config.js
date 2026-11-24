import { isAbsolute, resolve } from 'node:path';

// Bare executable names use PATH; bundled relative paths follow the deployment.
export function resolveRuntimePaths(config, serverRoot) {
  return Object.fromEntries(Object.entries(config).filter(([, value]) => typeof value === 'string' && value).map(([key, value]) => [key,
    !isAbsolute(value) && /[\\/]/.test(value) ? resolve(serverRoot, value) : value,
  ]));
}
