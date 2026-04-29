// NOTIFICATIONS

function ScreenNotifications() {
  const groups = [
    { label: 'Aujourd\'hui', items: [
      { kind: 'joined', who: 'Hugo Vidal', hue: 140, sub: 'a rejoint votre partie de ce soir', match: 'Aujourd\'hui · 19:30', time: '14h' },
      { kind: 'reminder', sub: 'Rappel : votre partie commence dans 1h', match: 'Tennis Club Aubenas · Terrain 3', time: '18h30' },
    ]},
    { label: 'Cette semaine', items: [
      { kind: 'joined', who: 'Marine Roux', hue: 340, sub: 'a rejoint votre partie de jeudi', match: 'Jeu. 02 · 18:30', time: 'Hier' },
      { kind: 'cancelled', sub: 'Partie annulée par l\'organisateur', match: 'Mer. 30 · 21:00 · Privas', time: 'Lun.' },
      { kind: 'joined', who: 'Sofia Mendes', hue: 10, sub: 'a rejoint votre partie de jeudi', match: 'Jeu. 02 · 18:30', time: 'Lun.' },
    ]},
    { label: 'Plus ancien', items: [
      { kind: 'reminder', sub: 'Rappel : votre partie commence dans 1h', match: 'Padel Privas · Terrain 1', time: '24 avr.' },
      { kind: 'cancelled', sub: 'Partie annulée — météo', match: 'Sam. 19 · 10:00 · Aubenas', time: '19 avr.' },
    ]},
  ];

  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '64px 22px 130px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1.05 }}>Notifications</div>
          <div style={{ fontSize: 14, color: '#8E8E93' }}>Tout lire</div>
        </div>

        {groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 10, letterSpacing: 0.2, textTransform: 'uppercase' }}>{g.label}</div>
            <Card padding={0}>
              {g.items.map((n, i) => (
                <NotifRow key={i} n={n} divider={i > 0} />
              ))}
            </Card>
          </div>
        ))}
      </div>

      <TabBar active="home" />
    </div>
  );
}

function NotifRow({ n, divider }) {
  const isUnread = n.time === '14h' || n.time === '18h30';
  let visual;
  if (n.kind === 'joined') {
    visual = <Avatar name={n.who} hue={n.hue} size={44} />;
  } else if (n.kind === 'reminder') {
    visual = (
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BellIcon color="#fff" size={20} />
      </div>
    );
  } else {
    visual = (
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 300 }}>×</div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
      borderTop: divider ? '1px solid #F2F2F2' : 'none',
      position: 'relative',
    }}>
      {isUnread && (
        <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
      )}
      {visual}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, lineHeight: 1.35, marginBottom: 4 }}>
          {n.who && <strong style={{ fontWeight: 600 }}>{n.who} </strong>}
          <span style={{ color: n.who ? '#3C3C43' : '#000' }}>{n.sub}</span>
        </div>
        <div style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic' }}>{n.match}</div>
      </div>
      <div style={{ fontSize: 12, color: '#8E8E93', flexShrink: 0 }}>{n.time}</div>
    </div>
  );
}

window.ScreenNotifications = ScreenNotifications;
