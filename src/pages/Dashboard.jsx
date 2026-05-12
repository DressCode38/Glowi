import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [clicked, setClicked] = useState(false)
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY })
    const down = () => setClicked(true)
    const up = () => setClicked(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [])
  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none', zIndex: 99999,
      fontSize: clicked ? '20px' : '16px',
      transition: 'font-size 0.1s',
    }}>🌸</div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('accueil')
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rdvs, setRdvs] = useState([])

  const urlParams = new URLSearchParams(window.location.search)
  const paiementReussi = urlParams.get('success') === 'true'

  const menu = [
    { id: 'accueil', icone: '🏠', label: 'Accueil' },
    { id: 'rdvs', icone: '📅', label: 'Rendez-vous' },
    { id: 'clientes', icone: '👤', label: 'Clientes' },
    { id: 'services', icone: '✨', label: 'Services' },
    { id: 'stats', icone: '📊', label: 'Stats' },
    { id: 'page', icone: '🌸', label: 'Ma page' },
  ]

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/login'); return }
      try {
        const docSnap = await getDoc(doc(db, 'pros', user.uid))
        if (docSnap.exists()) {
          const proData = { ...docSnap.data(), uid: user.uid }
          setPro(proData)
          const q = query(collection(db, 'rdvs'), where('proId', '==', user.uid))
          onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            data.sort((a, b) => {
              if (a.date === b.date) return a.heure.localeCompare(b.heure)
              return a.date.localeCompare(b.date)
            })
            setRdvs(data)
          })
        } else {
          setPro({ nom: user.displayName || 'Pro', email: user.email, plan: 'pro', uid: user.uid })
        }
      } catch (e) {
        setPro({ nom: user.displayName || 'Pro', email: user.email, plan: 'pro', uid: user.uid })
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleDeconnexion = async () => {
    await signOut(auth)
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#c4829a' }}>Glowi</p>
          <p style={{ fontSize: '13px', color: '#c4b5ac', marginTop: '8px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  const slugNom = pro?.nom?.toLowerCase().replace(/\s+/g, '-') || 'mon-salon'
  const planLabel = pro?.plan === 'starter' ? 'Starter' : pro?.plan === 'premium' ? 'Premium' : 'Pro'
  const planPrix = pro?.plan === 'starter' ? '19€' : pro?.plan === 'premium' ? '49€' : '29€'
  const aujourd_hui = new Date().toISOString().split('T')[0]
  const rdvsAVenir = rdvs.filter(r => r.date >= aujourd_hui && r.statut !== 'annulé')
  const rdvsAujourdhui = rdvs.filter(r => r.date === aujourd_hui)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dashboard-layout { display: flex; min-height: 100vh; }
        .sidebar {
          width: 240px; background: #fff; border-right: 1px solid #ede8e3;
          display: flex; flex-direction: column; padding: 32px 16px;
          position: fixed; height: 100vh; z-index: 10;
        }
        .main-content { margin-left: 240px; flex: 1; padding: 40px 48px; }
        .mobile-nav { display: none; }
        .menu-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px;
          cursor: pointer; transition: all 0.3s;
          font-size: 13px; color: #9c9189; font-weight: 300;
          margin-bottom: 4px; border: none; background: transparent;
          width: 100%; text-align: left; font-family: 'Inter', sans-serif;
        }
        .menu-item:hover { background: rgba(196,130,154,0.08); color: #c4829a; }
        .menu-item.active { background: #fdf6f8; color: #c4829a; font-weight: 500; }
        .stat-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 16px; padding: 24px;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: fadeUp 0.6s ease forwards;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(196,130,154,0.12); }
        .rdv-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #f5f0ed;
        }
        .rdv-row:last-child { border-bottom: none; }
        .badge-confirme { background: #e8f5ee; color: #1a7a45; font-size: 11px; padding: 3px 10px; border-radius: 20px; }
        .badge-attente { background: #fdf6e8; color: #9a6a1a; font-size: 11px; padding: 3px 10px; border-radius: 20px; }
        .badge-annule { background: #fef2f2; color: #dc2626; font-size: 11px; padding: 3px 10px; border-radius: 20px; }
        .btn-sakura {
          padding: 10px 24px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s; letter-spacing: 0.5px;
        }
        .btn-sakura:hover { background: #b57089; transform: translateY(-1px); }
        .btn-outline {
          padding: 10px 24px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
        .success-banner {
          background: linear-gradient(135deg, #e8f5ee, #f0faf4);
          border: 1px solid #b7e0c8; border-radius: 14px;
          padding: 18px 24px; margin-bottom: 32px;
          display: flex; align-items: center; gap: 16px;
          animation: slideDown 0.6s ease forwards;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
        .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
        .right-panel { display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .mobile-nav { display: block !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; margin-bottom: 20px !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .stat-card { padding: 16px !important; }
          * { cursor: auto !important; }
        }
      `}</style>

      <CustomCursor />

      {/* NAVBAR MOBILE */}
      <div className="mobile-nav">
        <nav style={{ background: '#fff', borderBottom: '1px solid #ede8e3', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300' }}>
            Glo<span style={{ color: '#c4829a' }}>wi</span>
          </h1>
          <button onClick={handleDeconnexion} style={{ fontSize: '12px', color: '#c4829a', background: 'transparent', border: '1px solid #c4829a', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer' }}>
            Déconnexion
          </button>
        </nav>
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #ede8e3', background: '#fff', padding: '8px 12px', gap: '8px', WebkitOverflowScrolling: 'touch' }}>
          {menu.map((m) => (
            <button key={m.id} onClick={() => setActiveMenu(m.id)} style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', background: activeMenu === m.id ? '#c4829a' : '#faf8f5', color: activeMenu === m.id ? '#fff' : '#9c9189', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
              {m.icone} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-layout">

        {/* SIDEBAR DESKTOP */}
        <div className="sidebar">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px', paddingLeft: '16px' }}>
            Glo<span style={{ color: '#c4829a' }}>wi</span>
          </h1>
          <p style={{ fontSize: '11px', color: '#c4b5ac', letterSpacing: '1px', paddingLeft: '16px', marginBottom: '40px' }}>Espace pro</p>
          <nav style={{ flex: 1 }}>
            {menu.map((m) => (
              <button key={m.id} className={`menu-item ${activeMenu === m.id ? 'active' : ''}`} onClick={() => setActiveMenu(m.id)}>
                <span style={{ fontSize: '16px' }}>{m.icone}</span>
                {m.label}
              </button>
            ))}
          </nav>
          <div style={{ borderTop: '1px solid #ede8e3', paddingTop: '20px', paddingLeft: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', marginBottom: '2px' }}>{pro?.nom}</p>
            <p style={{ fontSize: '11px', color: '#c4b5ac', marginBottom: '12px' }}>Plan {planLabel}</p>
            <button className="btn-outline" style={{ width: '100%', fontSize: '12px', padding: '8px' }} onClick={handleDeconnexion}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="main-content">

          {paiementReussi && (
            <div className="success-banner">
              <span style={{ fontSize: '32px' }}>🎉</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#1a7a45', margin: '0 0 4px' }}>Paiement réussi !</p>
                <p style={{ fontSize: '13px', color: '#2d9e5f', margin: 0, fontWeight: '300' }}>Ton abonnement {planLabel} est actif 🌸</p>
              </div>
            </div>
          )}

          {/* ACCUEIL */}
          {activeMenu === 'accueil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '6px' }}>Bonjour 🌸</p>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>{pro?.nom}</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn-outline" onClick={() => navigate('/abonnement')} style={{ fontSize: '12px', padding: '8px 16px' }}>Abonnement</button>
                  <button className="btn-sakura" onClick={() => navigate(`/pro/${slugNom}`)} style={{ fontSize: '12px', padding: '8px 16px' }}>Ma page</button>
                </div>
              </div>

              <div className="stats-grid">
                {[
                  { label: 'RDV ce mois', valeur: rdvs.filter(r => r.date?.startsWith(new Date().toISOString().slice(0,7))).length, couleur: '#c4829a' },
                  { label: 'Aujourd\'hui', valeur: rdvsAujourdhui.length, couleur: '#9b8ec4' },
                  { label: 'Clientes', valeur: new Set(rdvs.map(r => r.clientTelephone)).size, couleur: '#6dbf9e' },
                  { label: 'À venir', valeur: rdvsAVenir.length, couleur: '#e8a87c' },
                ].map((stat, i) => (
                  <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <p style={{ fontSize: '11px', color: '#9c9189', margin: '0 0 8px', fontWeight: '300' }}>{stat.label}</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: stat.couleur, margin: 0 }}>{stat.valeur}</p>
                  </div>
                ))}
              </div>

              <div className="content-grid">
                <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: '400', color: '#2c2c2c' }}>Prochains RDV</h3>
                    <span style={{ fontSize: '12px', color: '#c4829a' }}>{rdvsAVenir.length}</span>
                  </div>
                  {rdvsAVenir.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#c4b5ac' }}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
                      <p style={{ fontSize: '13px' }}>Aucun RDV 🌸</p>
                    </div>
                  ) : (
                    rdvsAVenir.slice(0, 5).map((rdv) => (
                      <div key={rdv.id} className="rdv-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🌸</div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{rdv.clientNom}</p>
                            <p style={{ fontSize: '11px', color: '#9c9189', margin: 0 }}>{rdv.service}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '12px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{rdv.heure}</p>
                          <p style={{ fontSize: '11px', color: '#c4b5ac', margin: 0 }}>{rdv.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="right-panel">
                  <div style={{ background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', border: '1px solid #e8d5db', borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '10px' }}>Abonnement</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300', color: '#2c2c2c', marginBottom: '4px' }}>Plan {planLabel}</p>
                    <p style={{ fontSize: '12px', color: '#9c9189', marginBottom: '16px', fontWeight: '300' }}>{planPrix}/mois</p>
                    <button className="btn-sakura" style={{ width: '100%', fontSize: '12px', padding: '10px' }} onClick={() => navigate('/abonnement')}>Gérer →</button>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '10px' }}>Ma page</p>
                    <p style={{ fontSize: '12px', color: '#9c9189', marginBottom: '14px', fontWeight: '300' }}>glowi.fr/{slugNom}</p>
                    <button className="btn-outline" style={{ width: '100%', fontSize: '12px', padding: '8px' }} onClick={() => navigate(`/pro/${slugNom}`)}>Voir →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDEZ-VOUS */}
          {activeMenu === 'rdvs' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Rendez-vous</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>Tous les RDV</h2>
              </div>
              <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '20px' }}>
                {rdvs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#c4b5ac' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                    <p>Aucun RDV 🌸</p>
                  </div>
                ) : (
                  rdvs.map((rdv) => (
                    <div key={rdv.id} className="rdv-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🌸</div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{rdv.clientNom}</p>
                          <p style={{ fontSize: '11px', color: '#9c9189', margin: 0 }}>{rdv.service} · {rdv.date} à {rdv.heure}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#c4829a', margin: 0 }}>{rdv.prix}€</p>
                        <span className={rdv.statut === 'confirmé' ? 'badge-confirme' : rdv.statut === 'annulé' ? 'badge-annule' : 'badge-attente'}>{rdv.statut}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CLIENTES */}
          {activeMenu === 'clientes' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Clientes</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>{new Set(rdvs.map(r => r.clientTelephone)).size} clientes</h2>
              </div>
              <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '20px' }}>
                {[...new Map(rdvs.map(r => [r.clientTelephone, r])).values()].map((rdv, i) => (
                  <div key={i} className="rdv-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🌸</div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{rdv.clientNom}</p>
                        <p style={{ fontSize: '11px', color: '#9c9189', margin: 0 }}>{rdv.clientTelephone}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9c9189', margin: 0 }}>{rdvs.filter(r => r.clientTelephone === rdv.clientTelephone).length} RDV</p>
                  </div>
                ))}
                {rdvs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#c4b5ac' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👤</div>
                    <p>Aucune cliente 🌸</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICES */}
          {activeMenu === 'services' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Services</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>Mes prestations</h2>
              </div>
              <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>Gérez vos services</h3>
                <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300', marginBottom: '20px' }}>Ajoutez, modifiez ou supprimez vos prestations</p>
                <button className="btn-sakura" onClick={() => navigate('/gestion-services')}>Gérer mes services →</button>
              </div>
            </div>
          )}

          {/* STATS */}
          {activeMenu === 'stats' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Statistiques</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>Mon activité</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total RDV', valeur: rdvs.length, couleur: '#c4829a' },
                  { label: 'Confirmés', valeur: rdvs.filter(r => r.statut === 'confirmé').length, couleur: '#6dbf9e' },
                  { label: 'Annulés', valeur: rdvs.filter(r => r.statut === 'annulé').length, couleur: '#e8a87c' },
                  { label: 'CA total', valeur: rdvs.filter(r => r.statut === 'confirmé').reduce((acc, r) => acc + (r.prix || 0), 0) + '€', couleur: '#9b8ec4' },
                ].map((stat, i) => (
                  <div key={i} className="stat-card">
                    <p style={{ fontSize: '12px', color: '#9c9189', margin: '0 0 10px', fontWeight: '300' }}>{stat.label}</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: stat.couleur, margin: 0 }}>{stat.valeur}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MA PAGE */}
          {activeMenu === 'page' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Ma page</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c' }}>Ma vitrine Glowi</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ background: '#faf8f5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#c4b5ac', margin: '0 0 4px' }}>Mon lien Glowi</p>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: 0 }}>glowi-eight.vercel.app/pro/{slugNom}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-sakura" style={{ flex: 1, fontSize: '13px' }} onClick={() => navigate(`/pro/${slugNom}`)}>Voir ma page →</button>
                    <button className="btn-outline" style={{ flex: 1, fontSize: '13px' }} onClick={() => { navigator.clipboard.writeText(`https://glowi-eight.vercel.app/pro/${slugNom}`); alert('Lien copié ! 🌸') }}>Copier le lien</button>
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Personnalisation</p>
                  <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300', marginBottom: '16px', lineHeight: '1.6' }}>
                    Photo, description, ville, horaires, Instagram, WhatsApp
                  </p>
                  <button className="btn-sakura" style={{ width: '100%' }} onClick={() => navigate('/profil')}>Personnaliser mon profil →</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Dashboard