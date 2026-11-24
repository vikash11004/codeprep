# C++ and Java on Render

The Windows compilers under `server/.tools` are local and Git-ignored. They cannot be used on Render's Linux servers.

The deployment build and `npm start` now run compiler setup and a native compile/run check. Setup downloads the C++ JSON header and Gson, verifies Render's system GCC/G++, and installs a checksum-verified Temurin JDK 21 into `server/.tools` when a full system JDK is unavailable. Bundled binary paths are relative so they remain valid if the build directory changes at runtime. No root access or global PATH change is needed.

Keep the Render build command as `npm run build` and start command as `npm start`. Both repository-root and `server/` package scripts support these commands. Do not use `node index.js` as the start command: it skips the installation/check lifecycle.

For local checks:

```sh
npm run setup:compilers
npm run verify:compilers
node --test server/tests/runner.test.js server/tests/runtime-config.test.js
```

The verification compiles and executes C++ and Java through the same judge used by submissions, including their JSON adapters. A failed check stops startup/build instead of silently disabling a language. After deploying, `/api/health` must report `available: true` for both languages; refresh the workspace to reload language availability, then run a solution in each language.

Render provides GCC/G++ in its native runtime. Other Linux images must supply them (for example via their OS package manager); setup fails with an explicit message if they are missing. `CODEPREP_CPP_BIN`, `CODEPREP_JAVA_BIN` and `CODEPREP_JAVAC_BIN` can override binary selection. Remove stale Windows paths from cloud environment variables.
