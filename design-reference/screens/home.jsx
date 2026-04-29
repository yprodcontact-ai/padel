// HOME — recreates the maquette as our anchor reference

function ScreenHome() {
  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '64px 22px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name="Yannis Marc" hue={25} size={48} />
            <div>
              <div style={{ fontSize: 14, color: '#8E8E93', lineHeight: 1.1 }}>Bonjour</div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.05 }}>Yannis</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Pill>Chat</Pill>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #E5E5EA',
            }}>
              <BellIcon size={20} />
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1.05, marginBottom: 4 }}>
          Votre prochaine
        </div>
        <div style={{ fontSize: 36, fontWeight: 400, color: '#8E8E93', letterSpacing: -1.4, lineHeight: 1.05, marginBottom: 22 }}>
          partie de padel
        </div>

        {/* Next match card */}
        <Card style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.8, lineHeight: 1.1 }}>Aujourd'hui</div>
              <div style={{ fontSize: 16, color: '#8E8E93', fontStyle: 'italic', marginTop: 2 }}>Tennis Club Aubenas</div>
            </div>
            <Pill style={{ fontSize: 20 }}>19:30</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT }} />
            <span>Terrain réservé</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <AvatarStack
              players={[PLAYERS.louis, PLAYERS.thomas, PLAYERS.hugo]}
              slots={1}
            />
            <Pill icon={<div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: 4, marginRight: -8,
            }}><ArrowIcon color="#fff" size={14} dir="tr" /></div>}>
              Détails
            </Pill>
          </div>
        </Card>

        {/* Available */}
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.4, marginBottom: 14 }}>Parties disponibles</div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'hidden', marginRight: -22 }}>
          <AvailableCard day="Demain" time="20:00" club="Tennis Club Aubenas" levels="4 à 6"
            players={[PLAYERS.julien, PLAYERS.enzo, PLAYERS.noah]} />
          <AvailableCard day="Vendr." time="18:00" club="Padel Privas" levels="4 à 5"
            players={[PLAYERS.sofia, PLAYERS.lea]} clipped />
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

function AvailableCard({ day, time, club, levels, players, clipped = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 28, border: '1px solid #ECECEE',
      padding: 22, minWidth: 320, flexShrink: 0,
      ...(clipped ? { marginRight: -120 } : {}),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.7, lineHeight: 1.1 }}>{day}</div>
          <div style={{ fontSize: 15, color: '#8E8E93', fontStyle: 'italic', marginTop: 2 }}>{club}</div>
        </div>
        <Pill style={{ fontSize: 18 }}>{time}</Pill>
      </div>
      <div style={{ fontSize: 14, color: '#3C3C43', marginBottom: 14 }}>
        Niveaux acceptés : <strong style={{ fontWeight: 600 }}>{levels}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AvatarStack players={players} slots={1} />
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: '#F2F2F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><ArrowIcon color="#000" size={16} dir="r" /></div>
      </div>
    </div>
  );
}

window.ScreenHome = ScreenHome;
