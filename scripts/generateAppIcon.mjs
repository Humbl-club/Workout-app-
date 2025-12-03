#!/usr/bin/env node

/**
 * Generate REBLD App Icons for iOS
 *
 * This script creates:
 * - 1024x1024 app icon (required for iOS)
 * - favicon.ico for web
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Brand colors
const BRAND = {
  background: '#0A0A0A',
  coral: '#E07A5F',
  white: '#FFFFFF',
};

// Create a simple SVG icon (R letter stylized)
const createIconSVG = (size) => {
  const padding = size * 0.15;
  const textSize = size * 0.5;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${BRAND.background}" rx="${size * 0.2}"/>

  <!-- Subtle glow -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${BRAND.coral}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${BRAND.coral}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="url(#glow)"/>

  <!-- R Letter - Bold stylized -->
  <text
    x="${size * 0.26}"
    y="${size * 0.68}"
    font-family="SF Pro Display, -apple-system, system-ui, sans-serif"
    font-size="${textSize}"
    font-weight="800"
    fill="${BRAND.white}">R</text>

  <!-- Accent bar (like in REBLD branding) -->
  <rect
    x="${size * 0.58}"
    y="${size * 0.28}"
    width="${size * 0.18}"
    height="${size * 0.44}"
    rx="${size * 0.04}"
    fill="${BRAND.coral}"/>
</svg>`;
};

// Alternative: Full "REBLD" text icon (compact)
const createFullLogoSVG = (size) => {
  const fontSize = size * 0.22;
  const centerY = size * 0.58;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners for iOS -->
  <rect width="${size}" height="${size}" fill="${BRAND.background}"/>

  <!-- Subtle radial glow -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${BRAND.coral}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${BRAND.coral}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.45}" fill="url(#glow)"/>

  <!-- RE in white -->
  <text
    x="${size * 0.17}"
    y="${centerY}"
    font-family="SF Pro Display, -apple-system, system-ui, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    letter-spacing="-${size * 0.008}"
    fill="${BRAND.white}">RE</text>

  <!-- BLD in coral -->
  <text
    x="${size * 0.405}"
    y="${centerY}"
    font-family="SF Pro Display, -apple-system, system-ui, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    letter-spacing="-${size * 0.008}"
    fill="${BRAND.coral}">BLD</text>
</svg>`;
};

async function generateIcons() {
  console.log('🎨 Generating REBLD app icons...\n');

  const outputDir = join(projectRoot, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate 1024x1024 icon (iOS requirement)
  const iconSVG = createFullLogoSVG(1024);

  try {
    await sharp(Buffer.from(iconSVG))
      .resize(1024, 1024)
      .png({ quality: 100 })
      .toFile(join(outputDir, 'AppIcon-512@2x.png'));

    console.log('✅ Generated: AppIcon-512@2x.png (1024x1024)');

    // Also create web favicon
    const faviconPath = join(projectRoot, 'public', 'favicon.png');
    await sharp(Buffer.from(createFullLogoSVG(512)))
      .resize(512, 512)
      .png({ quality: 100 })
      .toFile(faviconPath);

    console.log('✅ Generated: public/favicon.png (512x512)');

    // Create 32x32 favicon for web
    const favicon32Path = join(projectRoot, 'public', 'favicon-32.png');
    await sharp(Buffer.from(createFullLogoSVG(128)))
      .resize(32, 32)
      .png({ quality: 100 })
      .toFile(favicon32Path);

    console.log('✅ Generated: public/favicon-32.png (32x32)');

    // Create 192x192 for PWA
    const pwaIconPath = join(projectRoot, 'public', 'icon-192.png');
    await sharp(Buffer.from(createFullLogoSVG(192)))
      .resize(192, 192)
      .png({ quality: 100 })
      .toFile(pwaIconPath);

    console.log('✅ Generated: public/icon-192.png (192x192)');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npx cap sync');
    console.log('2. Open Xcode and verify the icon appears correctly');
    console.log('3. Build for TestFlight');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
