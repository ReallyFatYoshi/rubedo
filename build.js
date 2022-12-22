const archiver = require("archiver");
const fs = require("fs-extra");
const esbuild = require("esbuild");
const path = require("path");
const isDev = process.argv[2] === "dev";

const ver = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
)?.version;
// const devDir = path?.join(
//   process.env.USERPROFILE,
//   "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/"
// ) || "";

esbuild
  .build({
    entryPoints: ["project/src/index.ts"],
    bundle: true,
    outfile: "project/scripts/index.js",
    minify: !isDev,
    platform: "neutral",
    watch: isDev,
    external: [
      "@minecraft/server",
      "@minecraft/server-ui",
      "@minecraft/server-net",
      "@minecraft/server-admin",
    ],
    legalComments: isDev ? "none" : "none",
  })
  .then(() => {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `[${new Date().toLocaleTimeString()}]`,
      `Built for ${isDev ? "development" : "production"}...`
    );

    if (!isDev) {
      const distDir = path.join(__dirname, "dist");
      buildPack(path.join(__dirname,"project"),distDir);
    }
  });

function buildPack(target,destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const output = fs.createWriteStream(path.join(destination, ver + ".mcpack"));
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.pipe(output);

  archive.directory(target, false)

  archive.finalize();
}
