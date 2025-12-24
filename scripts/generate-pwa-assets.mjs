import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.resolve(process.cwd());
const publicDir = path.join(root, "public");
const inputLogo = path.join(publicDir, "regman-logo.png");

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const ensureBaseLogoExists = async () => {
  const exists = await fileExists(inputLogo);
  if (exists) {
    const stat = await fs.stat(inputLogo);
    if (stat.size > 0) return;
  }

  const makeLogoSvg = ({
    background,
    foreground,
  }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" ry="96" fill="${background}" />
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        font-size="280" font-weight="800" fill="${foreground}">R</text>
</svg>`;

  // Base logo for light mode (white bg, black text)
  const lightSvg = makeLogoSvg({
    background: "#ffffff",
    foreground: "#111111",
  });
  const lightPng = await sharp(Buffer.from(lightSvg)).png().toBuffer();
  await fs.writeFile(inputLogo, lightPng);

  // Also generate explicit light/dark logos here.
  const darkSvg = makeLogoSvg({ background: "#111111", foreground: "#ffffff" });
  const darkPng = await sharp(Buffer.from(darkSvg)).png().toBuffer();

  await fs.writeFile(path.join(publicDir, "logo-light.png"), lightPng);
  await fs.writeFile(path.join(publicDir, "logo-dark.png"), darkPng);
};

const main = async () => {
  await ensureBaseLogoExists();

  const iconsDir = path.join(publicDir, "icons");
  await ensureDir(iconsDir);

  // If logo files weren't generated above, ensure they're present.
  if (!(await fileExists(path.join(publicDir, "logo-light.png")))) {
    await fs.copyFile(inputLogo, path.join(publicDir, "logo-light.png"));
  }
  if (!(await fileExists(path.join(publicDir, "logo-dark.png")))) {
    await fs.copyFile(inputLogo, path.join(publicDir, "logo-dark.png"));
  }

  // Standard PWA icons
  const baseImage = sharp(inputLogo).png();

  const makeSquareIcon = async (size, outPath) => {
    const buffer = await baseImage
      .clone()
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    await fs.writeFile(outPath, buffer);
  };

  const makeMaskableIcon = async (size, outPath) => {
    // Maskable icons should keep content within the safe area.
    // Add ~20% padding around the logo.
    const paddingRatio = 0.2;
    const inner = Math.round(size * (1 - paddingRatio * 2));

    const logoBuffer = await baseImage
      .clone()
      .resize(inner, inner, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const canvas = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    const left = Math.round((size - inner) / 2);
    const top = Math.round((size - inner) / 2);

    const out = await canvas
      .composite([{ input: logoBuffer, left, top }])
      .png()
      .toBuffer();

    await fs.writeFile(outPath, out);
  };

  await makeSquareIcon(192, path.join(iconsDir, "icon-192.png"));
  await makeSquareIcon(512, path.join(iconsDir, "icon-512.png"));
  await makeMaskableIcon(192, path.join(iconsDir, "icon-192-maskable.png"));
  await makeMaskableIcon(512, path.join(iconsDir, "icon-512-maskable.png"));

  // Multi-size favicon.ico (16/32/48)
  const faviconPngs = await Promise.all(
    [16, 32, 48].map((s) =>
      baseImage
        .clone()
        .resize(s, s, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = await pngToIco(faviconPngs);
  await fs.writeFile(path.join(publicDir, "favicon.ico"), icoBuffer);

  // Output summary
  // eslint-disable-next-line no-console
  console.log(
    "Generated: public/favicon.ico, public/logo-light.png, public/logo-dark.png, public/icons/*"
  );
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
