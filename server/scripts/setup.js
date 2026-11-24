import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const tools = join(root, '.tools');
await mkdir(tools, { recursive: true }); await mkdir(join(root, 'vendor'), { recursive: true });
async function download(url, file, checksum) {
  if (!existsSync(file)) {
    console.log(`Downloading ${file.split(/[\\/]/).at(-1)}…`);
    const r = await fetch(url, { signal: AbortSignal.timeout(180000) }); if (!r.ok) throw new Error(`Download failed: ${r.status} ${url}`);
    await pipeline(r.body, createWriteStream(`${file}.part`));
    const { rename } = await import('node:fs/promises'); await rename(`${file}.part`, file);
  }
  if (checksum) { const h = createHash('sha256'); for await (const c of createReadStream(file)) h.update(c); if (h.digest('hex') !== checksum.replace('sha256:', '')) throw new Error(`Checksum mismatch: ${file}`); }
}
await Promise.all([
  download('https://raw.githubusercontent.com/nlohmann/json/v3.12.0/single_include/nlohmann/json.hpp', join(root, 'vendor/json.hpp')),
  download('https://repo.maven.apache.org/maven2/com/google/code/gson/gson/2.13.2/gson-2.13.2.jar', join(root, 'vendor/gson.jar')),
]);
if (process.argv.includes('--compilers')) {
  const config = {};
  if (process.platform === 'win32') {
    if (!existsSync(join(tools, 'mingw64/bin/g++.exe'))) {
      const release = await (await fetch('https://api.github.com/repos/brechtsanders/winlibs_mingw/releases/latest')).json();
      const asset = release.assets.find(a => /x86_64.*posix.*seh.*ucrt.*zip$/.test(a.name) && !a.name.includes('llvm'));
      if (!asset) throw new Error('No supported WinLibs release found. Install g++ manually.');
      await download(asset.browser_download_url, join(tools, 'gcc.zip'), asset.digest);
      execFileSync('tar', ['-xf', join(tools, 'gcc.zip'), '-C', tools], { windowsHide: true });
    }
    config.cpp = join(tools, 'mingw64/bin/g++.exe'); config.c = join(tools, 'mingw64/bin/gcc.exe');
  } else {
    // Render's native Node runtime includes GCC/G++; verify before using it.
    for (const [key, override, fallback] of [['cpp', 'CODEPREP_CPP_BIN', 'g++'], ['c', 'CODEPREP_C_BIN', 'gcc']]) {
      config[key] = process.env[override] || fallback;
      try { execFileSync(config[key], ['--version'], { stdio: 'pipe', timeout: 10000 }); }
      catch { throw new Error(`${fallback} is unavailable. Install GCC/G++ in the runtime image before deploying.`); }
    }
  }
  const executable = process.platform === 'win32' ? '.exe' : '';
  const hasJdk = directory => ['java', 'javac'].every(name => existsSync(join(directory, 'bin', name + executable)));
  let jdk = (await readdir(tools)).find(name => name.startsWith('jdk-') && hasJdk(join(tools, name)));
  const systemJava = process.env.CODEPREP_JAVA_BIN || (process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java' + executable) : 'java');
  const systemJavac = process.env.CODEPREP_JAVAC_BIN || (process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'javac' + executable) : 'javac');
  let systemJdk = false;
  try {
    execFileSync(systemJava, ['-version'], { stdio: 'pipe', timeout: 10000 });
    execFileSync(systemJavac, ['-version'], { stdio: 'pipe', timeout: 10000 });
    systemJdk = true;
  } catch { /* Install a full JDK, not just a Java runtime. */ }
  if (!jdk && !systemJdk) {
    const os = { win32: 'windows', linux: 'linux', darwin: 'mac' }[process.platform];
    const architecture = { x64: 'x64', arm64: 'aarch64' }[process.arch];
    if (!os || !architecture) throw new Error('Install JDK 21 and configure CODEPREP_JAVA_BIN and CODEPREP_JAVAC_BIN for this platform.');
    const response = await fetch(`https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=${architecture}&image_type=jdk&os=${os}&vendor=eclipse`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`JDK release lookup failed: ${response.status}`);
    const releases = await response.json();
    if (!releases[0]?.binary?.package?.checksum) throw new Error('No verified Temurin JDK package found.');
    const pkg = releases[0].binary.package;
    const archive = join(tools, `temurin-${os}-${architecture}-${pkg.checksum.slice(0, 16)}.${os === 'windows' ? 'zip' : 'tar.gz'}`);
    await download(pkg.link, archive, pkg.checksum);
    execFileSync('tar', ['-xf', archive, '-C', tools], { windowsHide: true, timeout: 120000 });
    jdk = (await readdir(tools)).find(name => name.startsWith('jdk-') && hasJdk(join(tools, name)));
    if (!jdk) throw new Error('The downloaded JDK does not contain java and javac.');
  }
  config.java = jdk ? join(tools, jdk, 'bin', 'java' + executable) : systemJava;
  config.javac = jdk ? join(tools, jdk, 'bin', 'javac' + executable) : systemJavac;
  // Build and runtime directories can differ on Render. Store bundled paths
  // relative to server/, never an absolute path from the build machine.
  for (const key of Object.keys(config)) if (config[key].startsWith(tools)) config[key] = relative(root, config[key]).replaceAll('\\', '/');
  await writeFile(join(tools, 'runtimes.json'), JSON.stringify(config, null, 2));
  console.log('C/C++ and Java compilers configured for ' + process.platform + '.');
}
console.log('Runner dependencies ready.');
