// ═══════════════════════════════════════════════════════════
// TradeNova SN — Custom Original SVG Icons Library
// Handcrafted financial vector icons with theme support
// ═══════════════════════════════════════════════════════════

const Icons = {
  // ── Brand Logo ──────────────────────────────────────────
  logo: (size = 24, cls = '') => `
    <img src="/icons/icon-192.png" class="brand-logo-img ${cls}" width="${size}" height="${size}" alt="TradeNova SN" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block;" />`,

  // ── Navigation Icons ────────────────────────────────────
  dashboard: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="2" fill="currentColor" fill-opacity="0.12"/>
      <rect x="14" y="3" width="7" height="5" rx="2"/>
      <rect x="14" y="12" width="7" height="9" rx="2" fill="currentColor" fill-opacity="0.12"/>
      <rect x="3" y="16" width="7" height="5" rx="2"/>
      <line x1="5.5" y1="7.5" x2="7.5" y2="7.5" stroke-width="2"/>
      <circle cx="17.5" cy="16.5" r="1.5" fill="currentColor"/>
    </svg>`,

  marketwatch: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="7" y1="3" x2="7" y2="6"/>
      <rect x="4.5" y="6" width="5" height="9" rx="1.5" fill="currentColor" fill-opacity="0.2"/>
      <line x1="7" y1="15" x2="7" y2="21"/>
      <line x1="17" y1="3" x2="17" y2="8"/>
      <rect x="14.5" y="8" width="5" height="8" rx="1.5" fill="currentColor" fill-opacity="0.45"/>
      <line x1="17" y1="16" x2="17" y2="21"/>
    </svg>`,

  trade: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 15 2" fill="currentColor" fill-opacity="0.15"/>
    </svg>`,

  positions: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="2.5" fill="currentColor" fill-opacity="0.1"/>
      <path d="M16 7V4.5A2.5 2.5 0 0 0 13.5 2h-3A2.5 2.5 0 0 0 8 4.5V7"/>
      <circle cx="12" cy="14" r="3"/>
      <line x1="12" y1="12.5" x2="12" y2="15.5"/>
      <line x1="10.5" y1="14" x2="13.5" y2="14"/>
    </svg>`,

  closed: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fill-opacity="0.1"/>
      <path d="M7.5 12L10.5 15L16.5 9" stroke-width="2.2"/>
    </svg>`,

  orders: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="currentColor" fill-opacity="0.1"/>
      <path d="M4 6h16"/>
      <line x1="8.5" y1="11" x2="15.5" y2="11"/>
      <line x1="8.5" y1="15" x2="13" y2="15"/>
    </svg>`,

  funds: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fill-opacity="0.1"/>
      <path d="M8.5 7h7M8.5 10.5h6M8.5 7v7.5c2.5 0 4.5-1.5 4.5-4s-2-3.5-4.5-3.5M11.5 13.5L15.5 18" stroke-width="2"/>
    </svg>`,

  reports: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <path d="M3 11l5-5 5 4 8-7" stroke-width="2"/>
      <polyline points="17 3 21 3 21 7" stroke-width="2"/>
    </svg>`,

  notifications: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="currentColor" fill-opacity="0.1"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      <circle cx="18.5" cy="4.5" r="2.5" fill="currentColor"/>
    </svg>`,

  clients: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="currentColor" fill-opacity="0.1"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,

  whatsapp: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" fill-opacity="0.15"/>
      <path d="M9.5 9.5c.3-.6.6-.6 1-.6.2 0 .4.1.5.3.3.6.8 1.8.8 2 0 .2-.1.4-.2.5l-.4.5c-.1.1-.3.2-.2.4.3.6.9 1.4 1.7 1.9.3.2.5.2.7 0l.6-.6c.2-.2.3-.2.5-.1s1.4.7 1.7.8c.2.1.3.2.3.4s-.1 1.2-.7 1.6c-.5.4-1.2.5-2 .2-1.8-.7-3.4-2.2-4.3-4-.7-1.4-.4-2.5.3-3z"/>
    </svg>`,

  kite: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fill-opacity="0.2"/>
    </svg>`,

  branding: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.996 6.5 17.5 2 12 2z"/>
    </svg>`,

  // ── Theme Switcher Icons ────────────────────────────────
  sun: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" fill-opacity="0.25"/>
      <line x1="12" y1="2" x2="12" y2="4.5"/>
      <line x1="12" y1="19.5" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.99" y2="5.99"/>
      <line x1="18.01" y1="18.01" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4.5" y2="12"/>
      <line x1="19.5" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.99" y2="18.01"/>
      <line x1="18.01" y1="5.99" x2="19.78" y2="4.22"/>
    </svg>`,

  moon: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fill-opacity="0.2"/>
      <circle cx="18" cy="5" r="0.75" fill="currentColor"/>
    </svg>`,

  // ── Actions & Utility Icons ─────────────────────────────
  logout: (size = 18, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>`,

  search: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21"/>
    </svg>`,

  searchLens: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="10.5" cy="10.5" r="7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.5 15.5L21.5 21.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.5 8C8.2 6.8 9.5 6.2 11 6.2" stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.85"/>
      <circle cx="17" cy="7" r="1" fill="currentColor" fill-opacity="0.5"/>
    </svg>`,

  phone: (size = 13, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="5.5" y="2" width="13" height="20" rx="3.5" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
      <line x1="10" y1="5" x2="14" y2="5" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="18" r="1.25" fill="currentColor"/>
      <path d="M8 8.5H16" stroke-width="1.2" stroke-opacity="0.35" stroke-linecap="round"/>
    </svg>`,

  mapPin: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="12" cy="9" r="2.5" stroke-width="1.8" fill="currentColor" fill-opacity="0.4"/>
    </svg>`,

  chevronDown: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 9L12 15L18 9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  clearClose: (size = 13, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9.5" stroke-width="1.6" fill="currentColor" fill-opacity="0.15"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  plus: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

  minus: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

  close: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

  gainers: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>`,

  losers: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`,

  star: (size = 16, cls = '', filled = false) => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`,

  activity: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,

  shield: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.1"/>
    </svg>`,

  wallet: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="5" width="20" height="15" rx="3" fill="currentColor" fill-opacity="0.1"/>
      <path d="M16 12.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
      <path d="M6 5V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"/>
    </svg>`,

  target: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5"/>
      <circle cx="12" cy="12" r="5.5" fill="currentColor" fill-opacity="0.15"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>`,

  bank: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 8 12 3 21 8 3 8" fill="currentColor" fill-opacity="0.15"/>
      <line x1="5" y1="8" x2="5" y2="18"/>
      <line x1="10" y1="8" x2="10" y2="18"/>
      <line x1="14" y1="8" x2="14" y2="18"/>
      <line x1="19" y1="8" x2="19" y2="18"/>
      <line x1="2" y1="18" x2="22" y2="18"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>`,

  checkCircle: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,

  crossCircle: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,

  gamepad: (size = 16, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="6" fill="currentColor" fill-opacity="0.1"/>
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1" fill="currentColor"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
    </svg>`,

  // ── Client Configuration Modal Tabs ─────────────────────
  clientPersonal: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill="currentColor" fill-opacity="0.15"/>
      <circle cx="12" cy="7" r="4" fill="currentColor" fill-opacity="0.2"/>
      <path d="M16 11l2 2 4-4" stroke-width="2.1"/>
    </svg>`,

  clientRMS: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" fill="currentColor" fill-opacity="0.15"/>
      <circle cx="12" cy="11.5" r="3" stroke-width="1.8"/>
      <path d="M12 8.5v1M12 14v1M9 11.5h1M14 11.5h1" stroke-width="2"/>
    </svg>`,

  clientMCX: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 14l3.5-8h9l3.5 8H4z" fill="currentColor" fill-opacity="0.15"/>
      <rect x="2" y="14" width="20" height="6" rx="1.5" fill="currentColor" fill-opacity="0.25"/>
      <line x1="8" y1="17" x2="16" y2="17" stroke-width="1.8"/>
      <line x1="8.5" y1="6" x2="7" y2="14"/>
      <line x1="15.5" y1="6" x2="17" y2="14"/>
    </svg>`,

  clientEquity: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" y1="3" x2="6" y2="21"/>
      <rect x="4" y="7" width="4" height="9" rx="1" fill="currentColor" fill-opacity="0.25"/>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <rect x="10" y="9" width="4" height="6" rx="1" fill="currentColor" fill-opacity="0.45"/>
      <path d="M15 14l3-3 4 4" stroke-width="2"/>
      <polyline points="18 11 22 11 22 15" stroke-width="2"/>
    </svg>`,

  clientSecurity: (size = 15, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" fill-opacity="0.18"/>
      <path d="M8 10V6.5a4 4 0 0 1 8 0V10"/>
      <circle cx="12" cy="14.5" r="1.5" fill="currentColor"/>
      <path d="M12 16v2.5" stroke-width="2"/>
    </svg>`,

  // ── Financial Actions & Tools ───────────────────────────
  excel: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.12"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke-width="2"/>
      <line x1="8" y1="17" x2="16" y2="17" stroke-width="2"/>
      <line x1="12" y1="9.5" x2="12" y2="20.5" stroke-dasharray="1 1.5"/>
    </svg>`,

  deposit: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fill-opacity="0.16"/>
      <line x1="12" y1="7.5" x2="12" y2="16.5" stroke-width="2.3"/>
      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke-width="2.3"/>
    </svg>`,

  withdraw: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fill-opacity="0.16"/>
      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke-width="2.3"/>
    </svg>`,

  userPlus: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="8.5" cy="7" r="4" fill="currentColor" fill-opacity="0.2"/>
      <line x1="20" y1="8" x2="20" y2="14" stroke-width="2.2"/>
      <line x1="23" y1="11" x2="17" y2="11" stroke-width="2.2"/>
    </svg>`,

  calendar: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.12"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <circle cx="8" cy="14" r="1" fill="currentColor"/>
      <circle cx="12" cy="14" r="1" fill="currentColor"/>
      <circle cx="16" cy="14" r="1" fill="currentColor"/>
      <circle cx="8" cy="18" r="1" fill="currentColor"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>`,

  lightning: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.2"/>
    </svg>`,

  chartBar: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="3" y1="20" x2="21" y2="20"/>
    </svg>`,

  bse: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M4 18V9l8-6 8 6v9" fill="currentColor" fill-opacity="0.12"/>
      <line x1="9" y1="18" x2="9" y2="12"/>
      <line x1="12" y1="18" x2="12" y2="10"/>
      <line x1="15" y1="18" x2="15" y2="12"/>
      <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
    </svg>`,

  volume: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`,

  volumeMute: (size = 14, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`,

  edit: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="currentColor" fill-opacity="0.1"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`,

  trash: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="currentColor" fill-opacity="0.1"/>
    </svg>`,

  slash: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.1"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>`,

  check: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

  alertTriangle: (size = 13, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fill-opacity="0.15"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,

  zapOff: (size = 12, cls = '') => `
    <svg class="c-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="12.41 6.75 13 2 10.57 4.92"/>
      <polyline points="18.57 12.91 21 10 15.66 10"/>
      <polyline points="8 8 3 14 12 14 11 22 16 16"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`,

  // Quick lookup helper
  get(name, size = 18, cls = '') {
    return this[name] ? this[name](size, cls) : '';
  }
};

window.Icons = Icons;
