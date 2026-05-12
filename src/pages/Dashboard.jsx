import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
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

  const urlParams = new URLSearchParams(window.location.search)
  const paiementReussi = urlParams.get('success') === 'true'

  const menu = [
    { id: 'accueil', icone: '🏠', label: 'Accueil' },
    { id: 'rdvs', icone: '📅', label: 'Rendez-vous' },
    { id: 'clientes', icone: '👤', label: 'Clientes' },
    { id: 'services', icone: '✨', label: 'Services' },
    { id: 'stats', icone: '📊', label: 'Statistiques' },
    { id: 'page', icone: '🌸', label: 'Ma page' },
  ]

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/login'); return }
      try {
        const docSnap = await getDoc(doc(db, 'pros', user.uid))
        if (docSnap.exists()) {
          setPro(docSnap.data())
        } else {
          setPro({ nom: user.displayName || 'Pro', email: user.email, plan: 'pro' })
        }
      } catch (e) {
        setPro({ nom: user.displayName || 'Pro', email: user.email, plan: 'pro' })
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
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none' }}>
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

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', display: 'flex', cursor: 'none' }}>

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
        .menu-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px;
          cursor: none; transition: all 0.3s;
          font-size: 13px; color: #9c9189; font-weight: 300;
          margin-bottom: 4px;
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
        .btn-sakura {
          padding: 10px 24px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 13px;
          cursor: none; font-family: 'Inter', sans-serif;
          transition: all 0.3s; letter-spacing: 0.5px;
        }
        .btn-sakura:hover { background: #b57089; transform: translateY(-1px); }
        .btn-outline {
          padding: 10px 24px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 13px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
        .success-banner {
          background: linear-gradient(135deg, #e8f5ee, #f0faf4);
          border: 1px solid #b7e0c8; border-radius: 14px;
          padding: 18px 24px; margin-bottom: 32px;
          display: flex; align-items: center; gap: 16px;
          animation: slideDown 0.6s ease forwards;
        }
      `}</style>

      <CustomCursor />

      {/* SIDEBAR */}
      <div style={{
        width: '240px', background: '#fff', borderRight: '1px solid #ede8e3',
        display: 'flex', flexDirection: 'column', padding: '32px 16px',
        position: 'fixed', height: '100vh', zIndex: 10,
      }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px', paddingLeft: '16px' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <p style={{ fontSize: '11px', color: '#c4b5ac', letterSpacing: '1px', paddingLeft: '16px', marginBottom: '40px' }}>Espace pro</p>

        <nav style={{ flex: 1 }}>
          {menu.map((m) => (
            <div key={m.id} className={`menu-item ${activeMenu === m.id ? 'active' : ''}`} onClick={() => setActiveMenu(m.id)}>
              <span style={{ fontSize: '16px' }}>{m.icone}</span>
              {m.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #ede8e3', paddingTop: '20px', paddingLeft: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', marginBottom: '2px' }}>{pro?.nom}</p>
          <p style={{ fontSize: '11px', color: '#c4b5ac', marginBottom: '12px' }}>Plan {planLabel} · {pro?.essaiActif ? '14j restants' : 'Actif'}</p>
          <button className="btn-outline" style={{ width: '100%', fontSize: '12px', padding: '8px' }} onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '40px 48px' }}>

        {/* BANNIÈRE SUCCÈS PAIEMENT */}
        {paiementReussi && (
          <div className="success-banner">
            <span style={{ fontSize: '32px' }}>🎉</span>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#1a7a45', margin: '0 0 4px' }}>
                Paiement réussi — Bienvenue sur Glowi !
              </p>
              <p style={{ fontSize: '13px', color: '#2d9e5f', margin: 0, fontWeight: '300' }}>
                Ton abonnement {planLabel} est maintenant actif. C'est parti ! 🌸
              </p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '6px' }}>Bonjour 🌸</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: '#2c2c2c' }}>
              {pro?.nom}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" onClick={() => navigate('/abonnement')}>
              Gérer mon abonnement
            </button>
            <button className="btn-sakura" onClick={() => navigate(`/pro/${slugNom}`)}>
              Voir ma page publique
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'RDV ce mois', valeur: '0', evolution: 'Démarrage', couleur: '#c4829a' },
            { label: 'Clientes totales', valeur: '0', evolution: 'Démarrage', couleur: '#9b8ec4' },
            { label: 'No-shows évités', valeur: '0', evolution: '0€ économisés', couleur: '#6dbf9e' },
            { label: 'Note moyenne', valeur: '—', evolution: '0 avis', couleur: '#e8a87c' },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <p style={{ fontSize: '12px', color: '#9c9189', margin: '0 0 12px', fontWeight: '300' }}>{stat.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: '300', color: stat.couleur, margin: '0 0 6px' }}>{stat.valeur}</p>
              <p style={{ fontSize: '11px', color: '#c4b5ac', margin: 0 }}>{stat.evolution}</p>
            </div>
          ))}
        </div>

        {/* CONTENU EN 2 COLONNES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* PROCHAINS RDV */}
          <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '400', color: '#2c2c2c' }}>
                Prochains rendez-vous
              </h3>
              <span style={{ fontSize: '12px', color: '#c4829a' }}>Voir tout →</span>
            </div>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#c4b5ac' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
              <p style={{ fontSize: '14px', margin: '0 0 4px' }}>Aucun RDV pour le moment</p>
              <p style={{ fontSize: '12px' }}>Partage ta page Glowi pour recevoir tes premières réservations 🌸</p>
            </div>
          </div>

          {/* PANNEAU DROIT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* MON ABONNEMENT */}
            <div style={{ background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', border: '1px solid #e8d5db', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Mon abonnement</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c', marginBottom: '4px' }}>Plan {planLabel}</p>
              <p style={{ fontSize: '12px', color: '#9c9189', marginBottom: '20px', fontWeight: '300' }}>{planPrix}/mois · {pro?.essaiActif ? '14 jours d\'essai restants' : 'Abonnement actif'}</p>
              <button className="btn-sakura" style={{ width: '100%', fontSize: '13px' }} onClick={() => navigate('/abonnement')}>
                Gérer mon abonnement
              </button>
            </div>

            {/* MA PAGE */}
            <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Ma page Glowi</p>
              <div style={{ background: '#faf8f5', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#c4b5ac' }}>glowi.fr/</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c' }}>{slugNom}</span>
              </div>
              <button className="btn-outline" style={{ width: '100%', fontSize: '12px' }} onClick={() => navigate(`/pro/${slugNom}`)}>
                Voir ma page →
              </button>
            </div>

            {/* CONSEIL */}
            <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Conseil du jour</p>
              <p style={{ fontSize: '13px', color: '#9c9189', lineHeight: '1.7', fontWeight: '300' }}>
                Partage ton lien Glowi dans ta bio Instagram pour recevoir plus de réservations 🌸
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard