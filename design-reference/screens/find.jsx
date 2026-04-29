// FIND A MATCH — Trouver une partie
// Liste verticale avec 2 filtres : niveau (1-7) + distance/club

function ScreenFind() {
  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '64px 22px 130px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1.05 }}>Trouver<br/><span style={{ color: '#8E8E93', fontWeight: 400 }}>une partie</span></div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #E5E5EA',
          }}>
            <SearchIcon color="#000" size={20} />
          </div>
        </div>

        {/* Filter: niveau — 1 à 8 par 0.5 */}
        <div style={{ marginBottom: 18, marginTop: 8 }}>
          <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 8, letterSpacing: 0.2 }}>VOTRE NIVEAU · 5</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {(() => {
              const lvls = [];
              for (let n = 1; n <= 8; n += 0.5) lvls.push(n);
              return lvls.map(n => {
                const inRange = n >= 4 && n <= 6;
                const me = n === 5;
                const label = Number.isInteger(n) ? n.toString() : n.toFixed(1);
                return (
                  <div key={n} style={{
                    flex: '1 1 0', minWidth: 0,
                    height: 36, borderRadius: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Number.isInteger(n) ? 13 : 10,
                    fontWeight: 500,
                    background: me ? '#000' : inRange ? '#fff' : 'transparent',
                    color: me ? '#fff' : inRange ? '#000' : '#8E8E93',
                    border: me ? 'none' : `1px solid ${inRange ? '#000' : '#D8D8DC'}`,
                  }}>{label}</div>
                );
              });
            })()}
          </div>
        </div>

        {/* Filter: distance */}
        <Card padding={18} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <PinIcon size={18} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Aubenas · 25 km</div>
            <div style={{ fontSize: 13, color: '#8E8E93' }}>4 clubs aux alentours</div>
          </div>
          <ChevronRight />
        </Card>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.4 }}>7 parties trouvées</div>
          <div style={{ fontSize: 14, color: '#8E8E93' }}>Trier ↓</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FindCard day="Aujourd'hui" time="19:30" club="Tennis Club Aubenas" levels="4 à 6" players={[PLAYERS.louis, PLAYERS.thomas, PLAYERS.hugo]} slots={1} dist="3 km" hot />
          <FindCard day="Demain" time="20:00" club="Padel Privas" levels="4 à 5" players={[PLAYERS.julien, PLAYERS.enzo]} slots={2} dist="22 km" />
          <FindCard day="Jeudi 02" time="18:30" club="Aubenas Padel Center" levels="5 à 7" players={[PLAYERS.sofia, PLAYERS.lea, PLAYERS.marine]} slots={1} dist="4 km" />
          <FindCard day="Vend. 03" time="21:00" club="Tennis Club Aubenas" levels="4 à 6" players={[PLAYERS.noah]} slots={3} dist="3 km" />
        </div>
      </div>

      <TabBar active="find" />
    </div>
  );
}

function FindCard({ day, time, club, levels, players, slots, dist, hot }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.1 }}>{day}</div>
          <div style={{ fontSize: 15, color: '#8E8E93', fontStyle: 'italic', marginTop: 2 }}>{club}</div>
        </div>
        <Pill style={{ fontSize: 18 }}>{time}</Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#3C3C43', marginTop: 8, marginBottom: 14 }}>
        <span>Niveaux <strong>{levels}</strong></span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C7C7CC' }} />
        <span>{dist}</span>
        {hot && <>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C7C7CC' }} />
          <span style={{ color: ACCENT, fontWeight: 500 }}>● 1 place</span>
        </>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AvatarStack players={players} slots={slots} />
        <div style={{
          padding: '10px 18px', borderRadius: 999, background: '#000', color: '#fff',
          fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
        }}>Rejoindre <ArrowIcon color="#fff" size={14} dir="r" /></div>
      </div>
    </Card>
  );
}

window.ScreenFind = ScreenFind;
