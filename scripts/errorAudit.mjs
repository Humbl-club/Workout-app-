/**
 * Comprehensive Error Audit Script
 * Uses Puppeteer to crawl the app and capture ALL errors
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3002';
const TIMEOUT = 10000;

// Store all issues found
const issues = {
  consoleErrors: [],
  consoleWarnings: [],
  networkErrors: [],
  jsExceptions: [],
  reactErrors: [],
  missingElements: [],
  navigationErrors: []
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function auditApp() {
  console.log('\n========================================');
  console.log('   REBLD Error Audit - Puppeteer');
  console.log('========================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to iPhone dimensions
  await page.setViewport({ width: 390, height: 844 });

  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    const entry = {
      type,
      text: text.substring(0, 500), // Truncate long messages
      url: location?.url || 'unknown',
      line: location?.lineNumber || 0
    };

    if (type === 'error') {
      issues.consoleErrors.push(entry);
    } else if (type === 'warning') {
      issues.consoleWarnings.push(entry);
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', error => {
    issues.jsExceptions.push({
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
  });

  // Capture failed network requests
  page.on('requestfailed', request => {
    issues.networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown error'
    });
  });

  // Capture response errors
  page.on('response', response => {
    if (response.status() >= 400) {
      issues.networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    // 1. Load the main page
    console.log('1. Loading main page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: TIMEOUT });
    await sleep(2000);

    // Check for React error boundaries
    const errorBoundary = await page.$('[class*="error"]');
    if (errorBoundary) {
      const errorText = await errorBoundary.evaluate(el => el.textContent);
      if (errorText?.toLowerCase().includes('error')) {
        issues.reactErrors.push({ location: 'main page', message: errorText });
      }
    }

    // Take screenshot of initial state
    await page.screenshot({ path: '/tmp/rebld-audit-1-initial.png' });
    console.log('   Screenshot saved: /tmp/rebld-audit-1-initial.png');

    // 2. Check if we're on auth page or dashboard
    const pageContent = await page.content();
    const isAuthPage = pageContent.includes('Sign in') || pageContent.includes('cl-sign');

    if (isAuthPage) {
      console.log('2. On auth page - checking for Clerk errors...');
      await sleep(2000);
      await page.screenshot({ path: '/tmp/rebld-audit-2-auth.png' });
      console.log('   Screenshot saved: /tmp/rebld-audit-2-auth.png');

      // Note: Can't proceed past auth without credentials
      console.log('   NOTE: Cannot test authenticated pages without login');
    } else {
      console.log('2. Already authenticated, testing app pages...');

      // Try to find and click on navigation items
      const navItems = await page.$$('nav a, nav button, [role="navigation"] a');
      console.log(`   Found ${navItems.length} navigation items`);

      // Check for HomePage content
      const homeContent = await page.$('main, [data-page="home"], .home-page');
      if (homeContent) {
        console.log('3. Testing HomePage components...');
        await sleep(1000);
        await page.screenshot({ path: '/tmp/rebld-audit-3-home.png' });
      }

      // Try clicking different nav items
      const navRoutes = ['/', '/plan', '/logbook', '/profile', '/buddies'];
      for (const route of navRoutes) {
        try {
          console.log(`4. Testing route: ${route}`);
          await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle2', timeout: TIMEOUT });
          await sleep(1500);

          // Check for visible errors on page
          const errorElements = await page.$$('[class*="error"], [class*="Error"], .toast-error');
          for (const el of errorElements) {
            const text = await el.evaluate(e => e.textContent);
            if (text && text.length > 0) {
              issues.reactErrors.push({ location: route, message: text.substring(0, 200) });
            }
          }

          await page.screenshot({ path: `/tmp/rebld-audit-${route.replace('/', '') || 'home'}.png` });
        } catch (err) {
          issues.navigationErrors.push({ route, error: err.message });
        }
      }
    }

    // 5. Check for common React issues
    console.log('5. Checking for common React issues...');

    // Check for key prop warnings
    const keyWarnings = issues.consoleWarnings.filter(w =>
      w.text.includes('key') && w.text.includes('prop')
    );

    // Check for undefined property access
    const undefinedErrors = issues.consoleErrors.filter(e =>
      e.text.includes('undefined') || e.text.includes('null')
    );

  } catch (error) {
    console.error('Fatal error during audit:', error.message);
    issues.jsExceptions.push({ message: error.message, stack: error.stack });
  }

  await browser.close();

  // Generate report
  console.log('\n========================================');
  console.log('         AUDIT RESULTS');
  console.log('========================================\n');

  // Console Errors
  if (issues.consoleErrors.length > 0) {
    console.log(`\n[CONSOLE ERRORS] (${issues.consoleErrors.length})`);
    console.log('─'.repeat(50));
    issues.consoleErrors.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.text}`);
      if (e.url !== 'unknown') console.log(`   Source: ${e.url}:${e.line}`);
    });
  }

  // JS Exceptions
  if (issues.jsExceptions.length > 0) {
    console.log(`\n[JS EXCEPTIONS] (${issues.jsExceptions.length})`);
    console.log('─'.repeat(50));
    issues.jsExceptions.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.message}`);
      if (e.stack) console.log(`   Stack: ${e.stack.split('\n')[0]}`);
    });
  }

  // React Errors
  if (issues.reactErrors.length > 0) {
    console.log(`\n[REACT/UI ERRORS] (${issues.reactErrors.length})`);
    console.log('─'.repeat(50));
    issues.reactErrors.forEach((e, i) => {
      console.log(`\n${i + 1}. Location: ${e.location}`);
      console.log(`   Message: ${e.message}`);
    });
  }

  // Network Errors
  if (issues.networkErrors.length > 0) {
    console.log(`\n[NETWORK ERRORS] (${issues.networkErrors.length})`);
    console.log('─'.repeat(50));
    issues.networkErrors.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.url}`);
      console.log(`   Error: ${e.failure || `Status ${e.status}`}`);
    });
  }

  // Navigation Errors
  if (issues.navigationErrors.length > 0) {
    console.log(`\n[NAVIGATION ERRORS] (${issues.navigationErrors.length})`);
    console.log('─'.repeat(50));
    issues.navigationErrors.forEach((e, i) => {
      console.log(`\n${i + 1}. Route: ${e.route}`);
      console.log(`   Error: ${e.error}`);
    });
  }

  // Warnings (summarized)
  if (issues.consoleWarnings.length > 0) {
    console.log(`\n[WARNINGS] (${issues.consoleWarnings.length} total)`);
    console.log('─'.repeat(50));
    // Group by type
    const warningGroups = {};
    issues.consoleWarnings.forEach(w => {
      const key = w.text.substring(0, 50);
      warningGroups[key] = (warningGroups[key] || 0) + 1;
    });
    Object.entries(warningGroups).forEach(([msg, count]) => {
      console.log(`   ${count}x: ${msg}...`);
    });
  }

  // Summary
  const totalIssues =
    issues.consoleErrors.length +
    issues.jsExceptions.length +
    issues.reactErrors.length +
    issues.networkErrors.length +
    issues.navigationErrors.length;

  console.log('\n========================================');
  console.log('         SUMMARY');
  console.log('========================================');
  console.log(`Total Critical Issues: ${totalIssues}`);
  console.log(`  - Console Errors: ${issues.consoleErrors.length}`);
  console.log(`  - JS Exceptions: ${issues.jsExceptions.length}`);
  console.log(`  - React/UI Errors: ${issues.reactErrors.length}`);
  console.log(`  - Network Errors: ${issues.networkErrors.length}`);
  console.log(`  - Navigation Errors: ${issues.navigationErrors.length}`);
  console.log(`  - Warnings: ${issues.consoleWarnings.length}`);
  console.log('\nScreenshots saved to /tmp/rebld-audit-*.png');
  console.log('========================================\n');

  // Return issues for programmatic use
  return issues;
}

auditApp().catch(console.error);
