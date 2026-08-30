import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

const PRIVATE_IP_RANGES = [
  // 127.0.0.0/8
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 10.0.0.0/8
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 192.168.0.0/16
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // 172.16.0.0/12
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  // 169.254.0.0/16 (Link Local / Cloud Metadata)
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  // 0.0.0.0/8
  /^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
];

export function normalizeAndValidateUrl(rawInput: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'Please enter a valid website URL.' };
  }

  let cleaned = rawInput.trim();

  // Basic length check
  if (cleaned.length > 2048) {
    return { valid: false, error: 'URL is too long.' };
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);

    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost, internal names, loopbacks
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === 'metadata.google.internal' ||
      hostname.includes('169.254')
    ) {
      return { valid: false, error: 'Access to private or local network resources is prohibited.' };
    }

    // Check if hostname is direct private IP
    for (const regex of PRIVATE_IP_RANGES) {
      if (regex.test(hostname)) {
        return { valid: false, error: 'Access to private IP ranges is prohibited.' };
      }
    }

    return { valid: true, normalizedUrl: parsed.href };
  } catch {
    return { valid: false, error: 'The provided URL format is invalid.' };
  }
}

export async function verifyPublicDns(hostname: string): Promise<boolean> {
  try {
    const result = await lookupAsync(hostname);
    const ip = result.address;

    for (const regex of PRIVATE_IP_RANGES) {
      if (regex.test(ip)) {
        return false;
      }
    }

    if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc00:')) {
      return false;
    }

    return true;
  } catch {
    // If DNS fails to resolve, allow crawler to attempt with proper error handling
    return true;
  }
}
