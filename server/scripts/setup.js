import { mkdir, readFile, writeFile, readdir, access } from 'node:fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const tools = join(root, '.tools');
await mkdir(tools, { recursive: true }); await mkdir(join(root, 'vendor'), { recursive: true });
async function download(url, file, checksum) {
  if (!existsSync(file)) {
    console.log(`Downloading ${file.split(/[\\/]/).at(-1)}…`);
    const r = await fetch(url); if (!r.ok) throw new Error(`Download failed: ${r.status} ${url}`);
    await pipeline(r.body, createWriteStream(`${file}.part`));
    const { rename } = await import('node:fs/promises'); await rename(`${file}.part`, file);
  }
  if (checksum) { const h = createHash('sha256'); for await (const c of createReadStream(file)) h.update(c); if (h.digest('hex') !== checksum.replace('sha256:', '')) throw new Error(`Checksum mismatch: ${file}`); }
}
await Promise.all([
  download('https://raw.githubusercontent.com/nlohmann/json/v3.12.0/single_include/nlohmann/json.hpp', join(root, 'vendor/json.hpp')),
  download('https://repo.maven.apache.org/maven2/com/google/code/gson/gson/2.13.2/gson-2.13.2.jar', join(root, 'vendor/gson.jar')),
]);
if (process.platform === 'win32' && process.argv.includes('--compilers')) {
  const config = {};
  if (!existsSync(join(tools, 'mingw64/bin/g++.exe'))) {
    const release = await (await fetch('https://api.github.com/repos/brechtsanders/winlibs_mingw/releases/latest')).json();
    const asset = release.assets.find(a => /x86_64.*posix.*seh.*ucrt.*zip$/.test(a.name) && !a.name.includes('llvm'));
    if (!asset) throw new Error('No supported WinLibs release found. Install g++ manually.');
    await download(asset.browser_download_url, join(tools, 'gcc.zip'), asset.digest);
    execFileSync('tar', ['-xf', join(tools, 'gcc.zip'), '-C', tools], { windowsHide: true });
  }
  config.cpp = join(tools, 'mingw64/bin/g++.exe'); config.c = join(tools, 'mingw64/bin/gcc.exe');
  let jdk = (await readdir(tools)).find(x => x.startsWith('jdk-'));
  if (!jdk) {
    const releases = await (await fetch('https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jdk&os=windows&vendor=eclipse')).json();
    const pkg = releases[0].binary.package;
    await download(pkg.link, join(tools, 'jdk.zip'), pkg.checksum);
    execFileSync('tar', ['-xf', join(tools, 'jdk.zip'), '-C', tools], { windowsHide: true });
    jdk = (await readdir(tools)).find(x => x.startsWith('jdk-'));
  }
  config.java = join(tools, jdk, 'bin/java.exe'); config.javac = join(tools, jdk, 'bin/javac.exe');
  await writeFile(join(tools, 'runtimes.json'), JSON.stringify(config, null, 2));
  console.log('Portable C/C++ and Java compilers configured.');
}
console.log('Runner dependencies ready.');
