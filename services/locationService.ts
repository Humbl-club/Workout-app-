/**
 * Location & Device Tracking Service
 *
 * Privacy-first location tracking:
 * - Country/region only (no precise location)
 * - Device info for analytics
 * - Timezone for scheduling
 */

interface LocationData {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  ip: string | null;
}

interface DeviceData {
  deviceType: 'mobile' | 'tablet' | 'desktop' | null;
  os: string | null;
  osVersion: string | null;
  browser: string | null;
  browserVersion: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
}

/**
 * Get user's approximate location from IP (privacy-first)
 * Uses ipapi.co free tier (1000 requests/day)
 */
export async function getLocationFromIP(): Promise<LocationData> {
  try {
    // Try ipapi.co first (free, no key needed)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();

    return {
      country: data.country_name || null,
      countryCode: data.country_code || null,
      region: data.region || null,
      city: data.city || null,
      timezone: data.timezone || null,
      ip: data.ip || null, // Consider hashing this for privacy
    };
  } catch (error) {
    console.error('Location detection failed:', error);

    // Fallback: try timezone API
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return {
        country: null,
        countryCode: null,
        region: null,
        city: null,
        timezone,
        ip: null,
      };
    } catch {
      return {
        country: null,
        countryCode: null,
        region: null,
        city: null,
        timezone: null,
        ip: null,
      };
    }
  }
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Parse user agent to extract OS and browser info
 */
function parseUserAgent() {
  const ua = navigator.userAgent;

  // Detect OS
  let os = null;
  let osVersion = null;

  if (/Windows NT 10.0/.test(ua)) {
    os = 'Windows';
    osVersion = '10';
  } else if (/Windows NT/.test(ua)) {
    os = 'Windows';
  } else if (/Mac OS X ([\d._]+)/.test(ua)) {
    os = 'macOS';
    const match = ua.match(/Mac OS X ([\d._]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android ([\d.]+)/.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android ([\d.]+)/);
    if (match) osVersion = match[1];
  } else if (/iPhone OS ([\d_]+)/.test(ua) || /iPad.*OS ([\d_]+)/.test(ua)) {
    os = 'iOS';
    const match = ua.match(/(?:iPhone|iPad).*OS ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Detect Browser
  let browser = null;
  let browserVersion = null;

  if (/Edg\/([\d.]+)/.test(ua)) {
    browser = 'Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/Chrome\/([\d.]+)/.test(ua) && !/Edg/.test(ua)) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) browserVersion = match[1];
  }

  return { os, osVersion, browser, browserVersion };
}

/**
 * Get complete device information
 */
export function getDeviceData(): DeviceData {
  const { os, osVersion, browser, browserVersion } = parseUserAgent();

  return {
    deviceType: detectDeviceType(),
    os,
    osVersion,
    browser,
    browserVersion,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
}

/**
 * Get app version from package.json (if available)
 */
export function getAppVersion(): string {
  // This would be set during build
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
}

/**
 * Track user login (call this once per session)
 * Returns both location and device data
 */
export async function trackUserLogin() {
  const [locationData, deviceData] = await Promise.all([
    getLocationFromIP(),
    Promise.resolve(getDeviceData()),
  ]);

  return {
    locationData: {
      ...locationData,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    deviceData: {
      ...deviceData,
      appVersion: getAppVersion(),
      lastUpdated: new Date().toISOString(),
    },
  };
}
