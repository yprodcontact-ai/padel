// PROFIL — Yannis (mode édition)

function ScreenProfile() {
  return (
    <div style={{ background: '#F2F2F2', height: '100%', position: 'relative', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div style={{ padding: '64px 22px 130px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5EA' }}>
            <SettingsIcon size={20} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Modifier</div>
        </div>

        {/* Identity block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <Avatar name="Yannis Marc" hue={25} size={104} />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, marginTop: 14 }}>Yannis Marc</div>
          <div style={{ fontSize: 15, color: '#8E8E93', fontStyle: 'italic', marginTop: 2 }}>Aubenas, Ardèche</div>
        </div>

        {/* Level + side cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <Card style={{ flex: 1 }} padding={18}>
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 6 }}>Niveau</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1, marginBottom: 6 }}>5<span style={{ fontSize: 14, color: '#8E8E93', fontWeight: 400 }}> /8</span></div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled />)}
              {[6, 7, 8].map((i) => <StarIcon key={i} color="#D8D8DC" filled={false} />)}
            </div>
          </Card>
          <Card style={{ flex: 1 }} padding={18}>
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 6 }}>Position</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 4 }}>Gauche</div>
            <div style={{ fontSize: 13, color: '#8E8E93' }}>Main : Droitier</div>
          </Card>
        </div>

        {/* Bio */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 6, letterSpacing: 0.2 }}>BIO</div>
          <div style={{ fontSize: 15, lineHeight: 1.45 }}>
            Joueur régulier sur Aubenas, dispo en soirée et le week-end. Plutôt loisir mais j'aime les parties sérieuses. À gauche de préférence, mais flexible.
          </div>
        </Card>

        {/* Favourite clubs */}
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.4, marginBottom: 12, marginTop: 22 }}>Clubs favoris</div>
        <Card padding={0} style={{ marginBottom: 14 }}>
          {[
          { name: 'Tennis Club Aubenas', sub: '3 km · 4 terrains', games: 28 },
          { name: 'Aubenas Padel Center', sub: '4 km · 6 terrains', games: 12 },
          { name: 'Padel Privas', sub: '22 km · 2 terrains', games: 5 }].
          map((c, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid #F2F2F2' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PinIcon color="#fff" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: '#8E8E93' }}>{c.sub} · {c.games} parties jouées</div>
              </div>
              <ChevronRight color="#8E8E93" />
            </div>
          )}
        </Card>

        {/* Edit CTA */}
        <div style={{ background: '#000', color: '#fff', borderRadius: 999, padding: '16px', textAlign: 'center', fontSize: 16, fontWeight: 500, marginTop: 22 }}>
          Modifier mon profil
        </div>
      </div>

      <TabBar active="profile" />
    </div>);

}

window.ScreenProfile = ScreenProfile;