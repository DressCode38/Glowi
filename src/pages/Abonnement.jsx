import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { PLANS } from '../stripe'

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

function Abonnement() {
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/login'); return }
      const docSnap = await getDoc(doc(db, 'pros', user.uid))
      if (docSnap.exists()) setPro({ ...docSnap.data(), uid: user.uid })
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handlePaiement = (lien) => {
    window.open(lien, '_blank')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c4829a' }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', cursor: 'none' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .btn-sakura {
          width: 100%; padding: 14px; background: #c4829a;
          color: #fff; border: none; border-radius: 40px;
          font-size: 14px; letter-spacing: 1px; cursor: none;
          font-family: 'Inter', sans-serif;
          position: relative; overflow: hidden;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-sakura:hover { transform: translateY(-2px); background: #b57089; }
        .btn-sakura:disabled { opacity: 0.5; }
        .btn-sakura::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg); transition: left 0.5s;
        }
        .btn-sakura:hover::after { left: 150%; }
        .btn-outline {
          padding: 10px 24px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 13px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
        .plan-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 20px; padding: 40px 32px;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: fadeUp 0.6s ease forwards;
          position: relative;
        }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(196,130,154,0.12); }
        .plan-card.featured {
          border: 2px solid #c4829a;
          box-shadow: 0 8px 40px rgba(196,130,154,0.15);
        }
      `}</style>

      <CustomCursor />

      {/* NAVBAR */}
      <nav style={{ padding: '20px 60px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <button className="btn-outline" onClick={() => navigate('/dashboard')}>
          ← Retour au dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeUp 0.6s ease forwards' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Abonnement</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', fontWeight: '300', color: '#2c2c2c', marginBottom: '16px' }}>
            Choisis ton plan Glowi
          </h2>
          <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300' }}>
            14 jours gratuits · Résiliation possible à tout moment
          </p>
          {pro?.plan && (
            <div style={{ display: 'inline-block', marginTop: '20px', background: '#fdf6f8', border: '1px solid #e8d5db', borderRadius: '20px', padding: '8px 20px' }}>
              <p style={{ fontSize: '13px', color: '#c4829a', margin: 0 }}>
                Plan actuel : <strong>{PLANS[pro.plan]?.nom}</strong> {pro.essaiActif ? '· Essai en cours' : '· Actif'}
              </p>
            </div>
          )}
        </div>

        {/* PLANS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
          {[
            { id: 'starter', features: ['Page pro personnalisée', 'Agenda en ligne', '5 RDV / mois', 'Confirmation email'] },
            { id: 'pro', featured: true, features: ['RDV illimités', 'Rappels SMS clients', 'Fiche cliente & stats', 'Avis clients', 'Support prioritaire'] },
            { id: 'premium', features: ['Tout le plan Pro', 'Mise en avant plateforme', 'Widget Instagram', 'Support prioritaire', 'Badge Premium'] },
          ].map((p, i) => (
            <div key={p.id} className={`plan-card ${p.featured ? 'featured' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
              {p.featured && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#c4829a', color: '#fff', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '5px 18px', borderRadius: '20px' }}>
                  Le plus choisi
                </div>
              )}
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4b5ac', textTransform: 'uppercase', marginBottom: '16px' }}>{PLANS[p.id].nom}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '32px' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', fontWeight: '300', color: p.featured ? '#c4829a' : '#2c2c2c' }}>
                  {PLANS[p.id].prix}€
                </span>
                <span style={{ fontSize: '13px', color: '#c4b5ac' }}>/mois</span>
              </div>
              <div style={{ borderTop: '1px solid #ede8e3', paddingTop: '24px', marginBottom: '32px' }}>
                {p.features.map((f, j) => (
                  <p key={j} style={{ fontSize: '13px', color: '#9c9189', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '300' }}>
                    <span style={{ color: '#c4829a' }}>✦</span> {f}
                  </p>
                ))}
              </div>
              <button
                className="btn-sakura"
                onClick={() => handlePaiement(PLANS[p.id].lien)}
                disabled={pro?.plan === p.id && !pro?.essaiActif}
                style={{ opacity: pro?.plan === p.id && !pro?.essaiActif ? 0.5 : 1 }}
              >
                {pro?.plan === p.id && !pro?.essaiActif ? 'Plan actuel ✓' : 'Choisir ce plan →'}
              </button>
            </div>
          ))}
        </div>

        {/* GARANTIES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          {[
            { icone: '🔒', titre: 'Paiement sécurisé', desc: 'Propulsé par Stripe — le standard mondial' },
            { icone: '🔄', titre: 'Sans engagement', desc: 'Résilie à tout moment depuis ton dashboard' },
            { icone: '🌸', titre: '14 jours offerts', desc: 'Teste Glowi gratuitement sans carte requise' },
          ].map((g, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{g.icone}</div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', marginBottom: '6px' }}>{g.titre}</p>
              <p style={{ fontSize: '12px', color: '#9c9189', fontWeight: '300', lineHeight: '1.6' }}>{g.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #ede8e3' }}>
        <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ Paiements sécurisés par Stripe</p>
      </div>

    </div>
  )
}

export default Abonnement