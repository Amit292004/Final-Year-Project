import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('CareerFit AI - Bounce Back Academy Architecture & Design System Suite', () => {
  const indexCssPath = path.resolve('src/index.css');
  const tailwindConfigPath = path.resolve('tailwind.config.js');
  const landingPagePath = path.resolve('src/pages/public/LandingPage.jsx');
  const publicLayoutPath = path.resolve('src/components/layout/PublicLayout.jsx');
  const sidebarPath = path.resolve('src/components/layout/Sidebar.jsx');
  const topbarPath = path.resolve('src/components/layout/Topbar.jsx');
  const animatedNumberPath = path.resolve('src/components/ui/AnimatedNumber.jsx');

  test('Design Tokens & Global CSS mirror Bounce Back Academy Architecture', () => {
    assert.ok(fs.existsSync(indexCssPath), 'src/index.css must exist');
    const css = fs.readFileSync(indexCssPath, 'utf8');

    // Obsidian canvas & surface definitions
    assert.ok(css.includes('#09090b'), 'Must define deep obsidian #09090b');
    assert.ok(css.includes('#111114'), 'Must define dark surface #111114');
    assert.ok(css.includes('#18181b'), 'Must define card surface #18181b');
    assert.ok(css.includes('#f97316'), 'Must define brand orange #f97316');

    // Key micro-interaction classes from Bounce Back Academy
    assert.ok(css.includes('.noise'), 'Must contain .noise atmospheric layer');
    assert.ok(css.includes('.beam'), 'Must contain .beam volumetric lighting');
    assert.ok(css.includes('.liveChip'), 'Must contain .liveChip telemetry indicator');
    assert.ok(css.includes('.liveDot'), 'Must contain .liveDot pulsing badge');
    assert.ok(css.includes('.eyebrow'), 'Must contain .eyebrow monospace section marker');
    assert.ok(css.includes('.eyebrowNum'), 'Must contain .eyebrowNum orange numeral marker');
    assert.ok(css.includes('.hairline-grid'), 'Must contain .hairline-grid 1px system');
    assert.ok(css.includes('.hairline-card'), 'Must contain .hairline-card component');
    assert.ok(css.includes('.tactile-card'), 'Must contain .tactile-card interactive hover');
    assert.ok(css.includes('.haptic-btn'), 'Must contain .haptic-btn press interaction');
    assert.ok(css.includes('.kinetic-text'), 'Must contain .kinetic-text gradient');
  });

  test('Tailwind Configuration includes Bounce Back Academy Palette', () => {
    assert.ok(fs.existsSync(tailwindConfigPath), 'tailwind.config.js must exist');
    const config = fs.readFileSync(tailwindConfigPath, 'utf8');

    assert.ok(config.includes('obsidian:'), 'Must configure obsidian color');
    assert.ok(config.includes('surface:'), 'Must configure surface color');
    assert.ok(config.includes('surfaceCard:'), 'Must configure surfaceCard color');
    assert.ok(config.includes('surfaceBorder:'), 'Must configure surfaceBorder color');
    assert.ok(config.includes('brandOrange:'), 'Must configure brandOrange color');
  });

  test('AnimatedNumber Component ported and functional', () => {
    assert.ok(fs.existsSync(animatedNumberPath), 'AnimatedNumber.jsx must exist');
    const component = fs.readFileSync(animatedNumberPath, 'utf8');

    assert.ok(component.includes('AnimatedNumber'), 'Must export AnimatedNumber component');
    assert.ok(component.includes('requestAnimationFrame') || component.includes('setInterval'), 'Must have animation loop');
  });

  test('LandingPage implements Bounce Back Academy Blueprint & Toolkit Grid', () => {
    assert.ok(fs.existsSync(landingPagePath), 'LandingPage.jsx must exist');
    const page = fs.readFileSync(landingPagePath, 'utf8');

    // Live Telemetry & Candidate Indicator
    assert.ok(page.includes('liveChip'), 'Must render live activity chip');
    assert.ok(page.includes('liveDot'), 'Must render pulsing live dot');
    assert.ok(page.includes('2,840+'), 'Must display live candidate counter');

    // Hero Architecture & Kinetic Text
    assert.ok(page.includes('kinetic-text'), 'Must use kinetic-text gradient');
    assert.ok(page.includes('Launch Free Workspace'), 'Must offer primary CTA');
    assert.ok(page.includes('AnimatedNumber'), 'Must render AnimatedNumber metrics');

    // Section Eyebrows in Bounce Back Monospace Format
    assert.ok(page.includes('01</span> // PLATFORM UTILITIES'), 'Must have section 01 eyebrow');
    assert.ok(page.includes('02</span> // INTERACTIVE ENGINE'), 'Must have section 02 eyebrow');
    assert.ok(page.includes('03</span> // SYSTEM WORKFLOW'), 'Must have section 03 eyebrow');
    assert.ok(page.includes('04</span> // METHODOLOGY COMPARISON'), 'Must have section 04 eyebrow');
    assert.ok(page.includes('05</span> // VERIFIED OUTCOMES'), 'Must have section 05 eyebrow');
    assert.ok(page.includes('06</span> // KNOWLEDGE BASE'), 'Must have section 06 eyebrow');

    // 1px Hairline Toolkit Grid
    assert.ok(page.includes('hairline-grid'), 'Must use hairline-grid container');
    assert.ok(page.includes('hairline-card'), 'Must render hairline-card components');

    // All 6 core platform tools present in toolkit
    assert.ok(page.includes('Deterministic ATS Scorer'), 'Tool 1 ATS Scorer');
    assert.ok(page.includes('pgvector Semantic Matcher'), 'Tool 2 pgvector Matcher');
    assert.ok(page.includes('Google X-Y-Z Rewriter'), 'Tool 3 Google X-Y-Z');
    assert.ok(page.includes('Voice RAG STAR Interviewer'), 'Tool 4 Voice RAG');
    assert.ok(page.includes('Explainable Skill Gap Matrix'), 'Tool 5 Skill Gap');
    assert.ok(page.includes('Application Pipeline & Velocity'), 'Tool 6 Pipeline Velocity');
  });

  test('Layouts adhere to Dark Obsidian Shell', () => {
    assert.ok(fs.existsSync(publicLayoutPath), 'PublicLayout.jsx must exist');
    assert.ok(fs.existsSync(sidebarPath), 'Sidebar.jsx must exist');
    assert.ok(fs.existsSync(topbarPath), 'Topbar.jsx must exist');

    const publicLayout = fs.readFileSync(publicLayoutPath, 'utf8');
    const sidebar = fs.readFileSync(sidebarPath, 'utf8');
    const topbar = fs.readFileSync(topbarPath, 'utf8');

    assert.ok(publicLayout.includes('bg-obsidian'), 'PublicLayout must have bg-obsidian canvas');
    assert.ok(sidebar.includes('bg-obsidian'), 'Sidebar must have bg-obsidian shell');
    assert.ok(topbar.includes('bg-obsidian'), 'Topbar must have bg-obsidian backdrop');
  });

  test('Zero-Emoji Compliance across all page files', () => {
    const pagesDir = path.resolve('src/pages');
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

    function getFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(filePath));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          results.push(filePath);
        }
      });
      return results;
    }

    const files = getFiles(pagesDir);
    assert.ok(files.length > 5, 'Must scan multiple page files');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const hasEmoji = emojiRegex.test(content);
      assert.strictEqual(
        hasEmoji,
        false,
        `File ${path.basename(file)} contains emojis, which violates professional typography guidelines`
      );
    }
  });
});
