// ============================================================
// Reach Out Engine - Configuration & Constants
// ============================================================

import { ChannelId } from '../types';

/**
 * LinkedIn Connection character limits.
 * NOTE: Limits differ between free (200 chars) and Premium (300 chars) LinkedIn accounts.
 * Flagged for periodic review against LinkedIn product updates.
 */
export const LINKEDIN_CONNECT_LIMITS = {
  free: 200,
  premium: 300,
} as const;

/**
 * Standard channel length thresholds.
 */
export const CHANNEL_LIMITS: Record<ChannelId, { maxChars?: number; maxWords?: number; minWords?: number }> = {
  linkedin_connect: {
    maxChars: 300, // Toggleable between 200 (free) and 300 (premium)
    maxWords: 55,
  },
  direct_message: {
    maxWords: 80,
    minWords: 35,
  },
  cold_email: {
    maxWords: 120,
    minWords: 60,
  },
  linkedin_inmail: {
    maxWords: 150,
    minWords: 75,
  },
  reply: {
    maxWords: 90,
    minWords: 30,
  },
};

/**
 * Case-insensitive list of banned boilerplate and cliche phrases.
 * Outreach messages containing any of these will trigger a lint warning.
 */
export const BANNED_PHRASES: string[] = [
  'i hope this email finds you well',
  'i am writing to express',
  'esteemed',
  'passionate about',
  'pick your brain',
  'kindly revert',
  'at your earliest convenience',
  'i would be grateful if you could spare',
  'dear sir/madam',
  'dear sir',
  'dear madam',
  'to whom it may concern',
];

/**
 * Color tokens for channel & scenario groups.
 * Every pair is verified to exceed WCAG AA 4.5:1 contrast against dark background (#0a0a0a / #141414).
 * Text labels are ALWAYS paired with these colors (never color-only).
 */
export const MUTED_CHANNEL_PALETTES = {
  linkedin_connect: {
    text: '#93c5fd', // blue-300: contrast ratio > 7:1 against #141414
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.28)',
    label: 'Connect',
  },
  linkedin_inmail: {
    text: '#d8b4fe', // purple-300: contrast ratio > 6.8:1 against #141414
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.28)',
    label: 'InMail',
  },
  cold_email: {
    text: '#6ee7b7', // emerald-300: contrast ratio > 8.5:1 against #141414
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.28)',
    label: 'Email',
  },
  direct_message: {
    text: '#fde047', // yellow-300: contrast ratio > 10:1 against #141414
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.28)',
    label: 'DM',
  },
  reply: {
    text: '#fda4af', // rose-300: contrast ratio > 7.2:1 against #141414
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.28)',
    label: 'Reply',
  },
} as const;
