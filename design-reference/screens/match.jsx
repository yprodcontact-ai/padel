// PARTIE — vue détail d'une partie. 2 variantes via prop `state`.
// states: 'open' (1 place), 'full'

function ScreenMatch({ state = 'open' }) {
  const cfg = {
    open: { day: 'Demain',       time: '20:00', club: 'Tennis Club Aubenas', court: 'Terrain 3', date: 'Mer. 30 avril 2026', cta: 'Rejoindre la partie', ctaSub: '1 place restante · niveau 4 à 6', filled: 3, slots: 1 },
    full: { day: 'Aujourd\'hui',  time: '19:30', club: 'Tennis Club Aubenas', court: 'Terrain 3', date: 'Mar. 29 avril 2026', cta: 'Quitter la partie',   ctaSub: 'Vous êtes inscrit · niveau 4 à 6',  filled: 4, slots: 0 },
  }[state];

  const players = [
    { ...PLAYERS.yannis, me: true },
    { ...PLAYERS.louis },
    { ...PLAYERS.thomas },
    { ...PLAYERS.hugo },
  ];
  if (state === 'open') {
    players[3] = null;
  }

  // Levels 1 à 8, palier 0.5
  const allLevels = [];
  for (let n = 1; n <= 8; n += 0.5) allLevels.push(n);

  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '54px 22px 140px' }}>
        {/* Back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5EA' }}>
            <ChevronLeft size={18} />
          </div>
          <div style={{ fontSize: 14, color: '#8E8E93' }}>Partager</div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1.6, lineHeight: 1, flex: 1 }}>{cfg.day}</div>
            <Pill style={{ fontSize: 22, padding: '12px 22px' }}>{cfg.time}</Pill>
          </div>
          <div style={{ fontSize: 16, color: '#8E8E93', fontStyle: 'italic', marginTop: 6 }}>{cfg.date}</div>
        </div>

        {/* Club + court card */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PinIcon color="#fff" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{cfg.club}</div>
              <div style={{ fontSize: 14, color: '#8E8E93' }}>{cfg.court} · 1h30 · Aubenas</div>
            </div>
            <ArrowIcon size={16} dir="tr" />
          </div>
        </Card>

        {/* Niveau — 1 à 8 par 0.5 */}
        <Card padding={18} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#8E8E93' }}>Niveau accepté</div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>4 à 6</div>
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {allLevels.map(n => {
              const ok = n >= 4 && n <= 6;
              const label = Number.isInteger(n) ? n.toString() : n.toFixed(1);
              return (
                <div key={n} style={{
                  flex: '1 1 0', minWidth: 0,
                  height: 28, borderRadius: 6,
                  background: ok ? '#000' : '#F2F2F2',
                  color: ok ? '#fff' : '#8E8E93',
                  fontSize: Number.isInteger(n) ? 12 : 10,
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{label}</div>
              );
            })}
          </div>
        </Card>

        {/* Players */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.4 }}>Joueurs</div>
          <div style={{ fontSize: 14, color: '#8E8E93' }}>{cfg.filled}/4</div>
        </div>
        <Card padding={0} style={{ marginBottom: 14 }}>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid #F2F2F2' }}>
              {p ? (
                <>
                  <Avatar name={p.name} hue={p.hue} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>
                      {p.name}{p.me && <span style={{ color: '#8E8E93', fontWeight: 400 }}> · vous</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#8E8E93' }}>Niveau {p.level}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px dashed #B5B5BA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusIcon size={18} color="#8E8E93" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#8E8E93' }}>Place libre</div>
                    <div style={{ fontSize: 13, color: '#8E8E93' }}>Niveau 4 à 6</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </Card>

        {/* Chat link */}
        <Card padding={18} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ position: 'relative', width: 42, height: 42 }}>
            <div style={{ position: 'absolute', left: 0, top: 0 }}><Avatar name="Louis" hue={220} size={28} ring /></div>
            <div style={{ position: 'absolute', right: 0, bottom: 0 }}><Avatar name="Thomas" hue={280} size={28} ring /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>Chat de la partie</div>
            <div style={{ fontSize: 13, color: '#8E8E93' }}>Louis : J'apporte les balles 👍</div>
          </div>
          <div style={{ background: '#000', color: '#fff', borderRadius: 999, minWidth: 24, height: 24, padding: '0 7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>2</div>
          <ChevronRight />
        </Card>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'absolute', bottom: 24, left: 14, right: 14 }}>
        <div style={{
          background: state === 'open' ? '#000' : '#fff',
          color: state === 'full' ? '#000' : '#fff',
          border: state === 'full' ? '1px solid #E5E5EA' : 'none',
          borderRadius: 28, padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{cfg.cta}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{cfg.ctaSub}</div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: state === 'full' ? '#000' : ACCENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowIcon color="#fff" size={18} dir="r" />
          </div>
        </div>
      </div>
    </div>
  );
}

window.ScreenMatch = ScreenMatch;
