// Shared visual primitives matching the home maquette
// Keep this minimal — the maquette's voice is: black/white, bold serif-less sans,
// pill nav, dotted "+ slot", level chips, big number/time pills.

const ACCENT = 'var(--accent, #19A66B)';

// Simulated avatar — uses gradient + initials so we don't ship dummy photos
function Avatar({ name = 'YN', hue = 220, size = 36, level, ring = false }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      position: 'relative', flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px #fff' : undefined,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: `linear-gradient(135deg, oklch(0.62 0.14 ${hue}), oklch(0.42 0.13 ${hue + 30}))`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: size * 0.36, letterSpacing: -0.3,
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>{initials}</div>
      {level !== undefined && (
        <div style={{
          position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
          background: '#000', color: '#fff', borderRadius: 999,
          fontSize: 9, fontWeight: 600, padding: '1px 6px',
          fontFamily: '-apple-system, system-ui, sans-serif',
          border: '1.5px solid #fff', whiteSpace: 'nowrap',
        }}>niv. {level}</div>
      )}
    </div>
  );
}

// Stack of overlapping avatars, with optional + slot
function AvatarStack({ players = [], slots = 0, size = 36 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {players.map((p, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
          <Avatar name={p.name} hue={p.hue} level={p.level} size={size} ring />
        </div>
      ))}
      {Array.from({ length: slots }).map((_, i) => (
        <div key={`s${i}`} style={{
          marginLeft: -10, width: size, height: size, borderRadius: '50%',
          border: '1.5px dashed #B5B5BA', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#8E8E93', fontSize: size * 0.5, fontWeight: 300,
        }}>+</div>
      ))}
    </div>
  );
}

// Big white pill — used for time, "Chat", "Détails"
function Pill({ children, dark = false, icon, style = {}, large = false }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: large ? '14px 22px' : '10px 18px',
      borderRadius: 999,
      background: dark ? '#000' : '#fff',
      color: dark ? '#fff' : '#000',
      border: dark ? 'none' : '1px solid #E5E5EA',
      fontSize: large ? 22 : 16, fontWeight: 500,
      fontFamily: '-apple-system, system-ui, sans-serif',
      letterSpacing: -0.3,
      ...style,
    }}>
      {children}
      {icon}
    </div>
  );
}

// Card — white rounded box used everywhere
function Card({ children, style = {}, padding = 22 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 28,
      border: '1px solid #ECECEE',
      padding,
      ...style,
    }}>{children}</div>
  );
}

// Bottom tab bar — 4 black pills + central floating + button
function TabBar({ active = 'home' }) {
  const left = [
    { id: 'home', icon: <HomeIcon /> },
    { id: 'find', icon: <SearchIcon /> },
  ];
  const right = [
    { id: 'messages', icon: <ChatIcon /> },
    { id: 'profile', icon: <UserIcon /> },
  ];
  const slot = (t) => {
    const on = t.id === active;
    return (
      <div key={t.id} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: on ? '#fff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(t.icon, { color: on ? '#000' : '#fff' })}
        </div>
      </div>
    );
  };
  return (
    <div style={{
      position: 'absolute', bottom: 26, left: 14, right: 14, zIndex: 20,
      height: 64, borderRadius: 999, background: '#000',
      display: 'flex', alignItems: 'center', padding: 6, gap: 4,
    }}>
      {left.map(slot)}
      {/* Center + button — hollow ring inside the bar */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'transparent',
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, margin: '0 4px',
      }} aria-label="Créer une partie">
        <PlusIcon color="#fff" size={22} />
      </div>
      {right.map(slot)}
    </div>
  );
}

// Icons — hand-tuned simple line icons
function HomeIcon({ color = '#fff', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function SearchIcon({ color = '#fff', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8"/>
      <path d="M16.5 16.5L21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function ChatIcon({ color = '#fff', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function UserIcon({ color = '#fff', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/>
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function BellIcon({ color = '#000', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M10 20a2 2 0 0 0 4 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function ArrowIcon({ color = '#000', size = 18, dir = 'tr' }) {
  const rot = { tr: 0, r: 45, l: 225 }[dir] ?? 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M7 17L17 7M9 7h8v8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRight({ color = '#000', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronLeft({ color = '#000', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function PlusIcon({ color = '#000', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function CheckIcon({ color = '#fff', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function PinIcon({ color = '#000', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}
function StarIcon({ color = '#000', size = 14, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <path d="M12 3l2.6 5.8L21 9.5l-4.5 4.4L17.8 21 12 17.8 6.2 21l1.3-7.1L3 9.5l6.4-.7L12 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function SettingsIcon({ color = '#000', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
function SendIcon({ color = '#fff', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12l18-9-7 18-3-8-8-1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

// iOS-style status bar (already in ios-frame; we re-stub minimal here for cards)
// Just a no-op since IOSDevice handles it.

// Sample players reused across screens
const PLAYERS = {
  yannis:  { name: 'Yannis Marc', hue: 25,  level: 5 },
  louis:   { name: 'Louis Petit',  hue: 220, level: 5 },
  thomas:  { name: 'Thomas Roy',   hue: 280, level: 5 },
  hugo:    { name: 'Hugo Vidal',   hue: 140, level: 5 },
  marine:  { name: 'Marine Roux',  hue: 340, level: 4 },
  julien:  { name: 'Julien Aubry', hue: 200, level: 6 },
  sofia:   { name: 'Sofia Mendes', hue: 10,  level: 5 },
  noah:    { name: 'Noah Lenoir',  hue: 60,  level: 4 },
  enzo:    { name: 'Enzo Garcia',  hue: 170, level: 5 },
  lea:     { name: 'Léa Bertin',   hue: 320, level: 6 },
};

Object.assign(window, {
  Avatar, AvatarStack, Pill, Card, TabBar,
  HomeIcon, SearchIcon, ChatIcon, UserIcon, BellIcon,
  ArrowIcon, ChevronRight, ChevronLeft, PlusIcon, CheckIcon,
  PinIcon, StarIcon, SettingsIcon, SendIcon,
  PLAYERS, ACCENT,
});
