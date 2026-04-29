// MESSAGES — Liste de conversations + vue discussion (2 artboards)

function ScreenMessagesList() {
  const convos = [
    { kind: 'match', title: 'Aujourd\'hui · 19:30', club: 'Tennis Club Aubenas', last: 'Louis: J\'apporte les balles 👍', time: '14:32', unread: 2, players: [PLAYERS.louis, PLAYERS.thomas, PLAYERS.hugo] },
    { kind: 'match', title: 'Demain · 20:00', club: 'Padel Privas', last: 'Vous: Ok parfait à demain', time: '12:08', unread: 0, players: [PLAYERS.julien, PLAYERS.enzo, PLAYERS.noah] },
    { kind: 'dm', name: 'Marine Roux', last: 'Tu veux rejouer samedi ?', time: 'Hier', unread: 1, hue: 340 },
    { kind: 'dm', name: 'Louis Petit', last: 'GG pour la victoire 🎾', time: 'Lun.', unread: 0, hue: 220 },
    { kind: 'match', title: 'Jeu. 02 · 18:30', club: 'Aubenas Padel Center', last: 'Sofia: On confirme le terrain ?', time: 'Lun.', unread: 0, players: [PLAYERS.sofia, PLAYERS.lea, PLAYERS.marine] },
    { kind: 'dm', name: 'Julien Aubry', last: 'Merci pour la partie !', time: '28 avr.', unread: 0, hue: 200 },
  ];

  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '64px 22px 130px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1.05 }}>Messages</div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5EA' }}>
            <PlusIcon size={20} />
          </div>
        </div>

        {/* Search pill */}
        <div style={{ background: '#fff', border: '1px solid #ECECEE', borderRadius: 999, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <SearchIcon color="#8E8E93" size={18} />
          <div style={{ color: '#8E8E93', fontSize: 15 }}>Rechercher</div>
        </div>

        <Card padding={0}>
          {convos.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderTop: i === 0 ? 'none' : '1px solid #F2F2F2',
            }}>
              {c.kind === 'match' ? (
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0 }}><Avatar name={c.players[0].name} hue={c.players[0].hue} size={32} ring /></div>
                  <div style={{ position: 'absolute', right: 0, bottom: 0 }}><Avatar name={c.players[1].name} hue={c.players[1].hue} size={32} ring /></div>
                </div>
              ) : (
                <Avatar name={c.name} hue={c.hue} size={48} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.kind === 'match' ? c.title : c.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#8E8E93', flexShrink: 0, marginLeft: 8 }}>{c.time}</div>
                </div>
                <div style={{ fontSize: 14, color: c.unread ? '#000' : '#8E8E93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: c.unread ? 500 : 400 }}>
                  {c.kind === 'match' && <span style={{ color: '#8E8E93', fontStyle: 'italic' }}>{c.club} · </span>}
                  {c.last}
                </div>
              </div>
              {c.unread > 0 && (
                <div style={{ background: '#000', color: '#fff', borderRadius: 999, minWidth: 22, height: 22, padding: '0 7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{c.unread}</div>
              )}
            </div>
          ))}
        </Card>
      </div>

      <TabBar active="messages" />
    </div>
  );
}

function ScreenMessagesChat() {
  const msgs = [
    { from: 'them', who: 'Louis', hue: 220, text: 'Salut les gars ! On confirme pour ce soir 19:30 ?', time: '14:02' },
    { from: 'me', text: 'Oui je suis chaud 💪', time: '14:05' },
    { from: 'them', who: 'Thomas', hue: 280, text: 'Pareil pour moi. Terrain réservé ?', time: '14:08' },
    { from: 'them', who: 'Louis', hue: 220, text: 'Oui terrain 3, 1h30. Il manque encore 1 joueur niveau 4-6', time: '14:10' },
    { from: 'me', text: 'Je peux demander à Julien, il cherchait à jouer', time: '14:18' },
    { from: 'them', who: 'Hugo', hue: 140, text: 'Top, je viens en avance pour échauffement', time: '14:25' },
    { from: 'them', who: 'Louis', hue: 220, text: 'J\'apporte les balles 👍', time: '14:32' },
  ];

  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '54px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(242,242,242,0.92)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 5, borderBottom: '1px solid #ECECEE' }}>
        <ChevronLeft size={24} />
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <div style={{ position: 'absolute', left: 0, top: 0 }}><Avatar name="Louis Petit" hue={220} size={28} ring /></div>
          <div style={{ position: 'absolute', right: 0, bottom: 0 }}><Avatar name="Thomas Roy" hue={280} size={28} ring /></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>Aujourd'hui · 19:30</div>
          <div style={{ fontSize: 12, color: '#8E8E93' }}>Tennis Club Aubenas · 4 joueurs</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5EA' }}>
          <ArrowIcon size={14} dir="tr" />
        </div>
      </div>

      {/* Pinned match info */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ background: '#000', color: '#fff', borderRadius: 18, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ flex: 1 }}>Terrain 3 réservé · 1h30</span>
          <span style={{ color: '#8E8E93' }}>3/4</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {msgs.map((m, i) => {
          const prevSame = i > 0 && msgs[i-1].from === m.from && (m.from === 'me' || msgs[i-1].who === m.who);
          if (m.from === 'me') {
            return (
              <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
                <div style={{ background: '#000', color: '#fff', padding: '10px 14px', borderRadius: 22, borderBottomRightRadius: 6, fontSize: 15, lineHeight: 1.35 }}>{m.text}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', textAlign: 'right', marginTop: 3, marginRight: 6 }}>{m.time}</div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ width: 28, visibility: prevSame ? 'hidden' : 'visible' }}>
                <Avatar name={m.who} hue={m.hue} size={28} />
              </div>
              <div>
                {!prevSame && <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 3, marginLeft: 4 }}>{m.who}</div>}
                <div style={{ background: '#fff', border: '1px solid #ECECEE', padding: '10px 14px', borderRadius: 22, borderBottomLeftRadius: 6, fontSize: 15, lineHeight: 1.35 }}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px 32px', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid #ECECEE', background: '#fff' }}>
        <div style={{ flex: 1, background: '#F2F2F2', borderRadius: 999, padding: '12px 18px', fontSize: 15, color: '#8E8E93' }}>Message…</div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SendIcon color="#fff" size={18} />
        </div>
      </div>
    </div>
  );
}

window.ScreenMessagesList = ScreenMessagesList;
window.ScreenMessagesChat = ScreenMessagesChat;
