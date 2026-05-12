import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

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

function Petales() {
  const [petales, setPetales] = useState([])
  useEffect(() => {
    const lance = () => {
      const burst = setInterval(() => {
        const id = Date.now() + Math.random()
        setPetales(prev => [...prev.slice(-20), {
          id, left: Math.random() * 100,
          duration: 7 + Math.random() * 6,
          size: 6 + Math.random() * 9,
          rotation: Math.random() * 360,
          opacity: 0.2 + Math.random() * 0.4,
        }])
        setTimeout(() => setPetales(prev => prev.filter(p => p.id !== id)), 14000)
      }, 400)
      setTimeout(() => clearInterval(burst), 4000)
    }
    lance()
    const pause = setInterval(lance, 12000 + Math.random() * 6000)
    return () => clearInterval(pause)
  }, [])
  return (
    <>
      {petales.map(p => (
        <div key={p.id} style={{
          position: 'fixed', top: '-20px', left: `${p.left}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          background: `rgba(196,130,154,${p.opacity})`,
          borderRadius: '50% 0 50% 0',
          zIndex: 9998, pointerEvents: 'none',
          animation: `fall ${p.duration}s linear forwards`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </>
  )
}

function EspaceCliente() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rdvs, setRdvs] = useState([])
  const [mode, setMode] = useState('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [erreur, setErreur] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        const q = query(collection(db, 'rdvs'), where('clientEmail', '==', u.email))
        onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          data.sort((a, b) => a.date?.localeCompare(b.date))
          setRdvs(data)
        })
      }
    })
    return () => unsub()
  }, [])

  const handleConnexion = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setErreur('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setErreur('Email ou mot de passe incorrect')
      setAuthLoading(false)
    }
  }

  const handleInscription = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setErreur('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') setErreur('Cet email est déjà utilisé')
      else if (error.code === 'auth/weak-password') setErreur('Mot de passe trop court (6 caractères minimum)')
      else setErreur('Une erreur est survenue')
      setAuthLoading(false)
    }
  }

  const handleGoogle = async () => {
    setAuthLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch {
      setErreur('Connexion Google échouée')
      setAuthLoading(false)
    }
  }

  const handleAnnuler = async (rdvId) => {
    if (!window.confirm('Confirmer l\'annulation de ce RDV ?')) return
    try {
      await updateDoc(doc(db, 'rdvs', rdvId), { statut: 'annulé' })
    } catch (e) {
      console.error(e)
    }
  }

  const aujourd_hui = new Date().toISOString().split('T')[0]
  const rdvsAVenir = rdvs.filter(r => r.date >= aujourd_hui && r.statut !== 'annulé')
  const rdvsPasses = rdvs.filter(r => r.date < aujourd_hui || r.statut === 'annulé')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c4829a' }}>Chargement... 🌸</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', cursor: 'none' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .input-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box; cursor: none;
        }
        .input-zen:focus {
          border-color: #c4829a;
          box-shadow: 0 0 0 3px rgba(196,130,154,0.1);
          background: #fff;
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
        .btn-google {
          width: 100%; padding: 13px; background: #fff;
          color: #2c2c2c; border: 1px solid #ede8e3;
          border-radius: 40px; font-size: 14px; cursor: none;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s; display: flex;
          align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 20px;
        }
        .btn-google:hover { border-color: #c4829a; transform: translateY(-1px); }
        .btn-annuler {
          padding: 6px 14px; background: transparent; color: #dc2626;
          border: 1px solid #fecaca; border-radius: 20px; font-size: 11px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-annuler:hover { background: #fef2f2; }
        .btn-avis {
          padding: 6px 14px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 20px; font-size: 11px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
          margin-top: 4px;
        }
        .btn-avis:hover { background: rgba(196,130,154,0.08); }
        .rdv-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 16px; padding: 20px 24px;
          margin-bottom: 12px; transition: all 0.3s;
          animation: fadeUp 0.5s ease forwards;
        }
        .rdv-card:hover { box-shadow: 0 4px 20px rgba(196,130,154,0.1); }
        .tab-btn {
          padding: 10px 24px; border-radius: 40px; font-size: 13px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
          border: 1px solid #ede8e3; background: #fff; color: #9c9189;
        }
        .tab-btn.active { background: #c4829a; color: #fff; border-color: #c4829a; }
        .separateur { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .separateur-line { flex: 1; height: 1px; background: #ede8e3; }
        .separateur-text { font-size: 12px; color: #c4b5ac; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); cursor: none;
          background: none; border: none; font-size: 16px;
          color: #c4b5ac; padding: 0; line-height: 1;
        }
      `}</style>

      <CustomCursor />
      <Petales />

      {/* NAVBAR */}
      <nav style={{ padding: '20px 60px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => navigate('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: '300', cursor: 'none' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        {user && (
          <button className="btn-outline" onClick={() => signOut(auth)}>Déconnexion</button>
        )}
      </nav>

      {/* PAGE NON CONNECTÉE */}
      {!user && (
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeUp 0.6s ease forwards' }}>

            <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>Espace cliente</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px', textAlign: 'center' }}>
              {mode === 'connexion' ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p style={{ fontSize: '13px', color: '#c4b5ac', marginBottom: '32px', textAlign: 'center', fontWeight: '300' }}>
              {mode === 'connexion' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
              <span onClick={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setErreur('') }} style={{ color: '#c4829a', cursor: 'none' }}>
                {mode === 'connexion' ? 'S\'inscrire' : 'Se connecter'}
              </span>
            </p>

            <button className="btn-google" onClick={handleGoogle} disabled={authLoading}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="separateur">
              <div className="separateur-line" />
              <span className="separateur-text">ou</span>
              <div className="separateur-line" />
            </div>

            {erreur && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {erreur}</p>
              </div>
            )}

            <form onSubmit={mode === 'connexion' ? handleConnexion : handleInscription}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>ADRESSE EMAIL</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" required className="input-zen" />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>MOT DE PASSE</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-zen" style={{ paddingRight: '44px' }} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-sakura" disabled={authLoading}>
                {authLoading ? '✦ Chargement...' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAGE CONNECTÉE */}
      {user && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

          {/* HEADER */}
          <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s ease forwards' }}>
            <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '8px' }}>Espace cliente</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: '#2c2c2c', marginBottom: '4px' }}>
              Bonjour 🌸
            </h2>
            <p style={{ fontSize: '13px', color: '#c4b5ac', fontWeight: '300' }}>{user.email}</p>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'RDV à venir', valeur: rdvsAVenir.length, couleur: '#c4829a' },
              { label: 'RDV passés', valeur: rdvsPasses.filter(r => r.statut !== 'annulé').length, couleur: '#9b8ec4' },
              { label: 'RDV annulés', valeur: rdvs.filter(r => r.statut === 'annulé').length, couleur: '#e8a87c' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '20px 24px', animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
                <p style={{ fontSize: '12px', color: '#9c9189', margin: '0 0 8px', fontWeight: '300' }}>{s.label}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: s.couleur, margin: 0 }}>{s.valeur}</p>
              </div>
            ))}
          </div>

          {/* ONGLETS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
            <button className="tab-btn active">
              RDV à venir ({rdvsAVenir.length})
            </button>
            <button className="tab-btn" onClick={() => navigate('/recherche')}>
              🔍 Trouver une pro
            </button>
          </div>

          {/* LISTE RDV À VENIR */}
          {rdvsAVenir.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '20px', border: '1px solid #ede8e3' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
                Aucun RDV à venir
              </h3>
              <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300', marginBottom: '24px' }}>
                Trouve une pro et réserve ta prochaine séance 🌸
              </p>
              <button className="btn-outline" onClick={() => navigate('/recherche')}>
                Trouver une pro →
              </button>
            </div>
          ) : (
            rdvsAVenir.map((rdv, i) => (
              <div key={rdv.id} className="rdv-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      🌸
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{rdv.proNom}</p>
                      <p style={{ fontSize: '13px', color: '#9c9189', margin: '0 0 3px', fontWeight: '300' }}>{rdv.service}</p>
                      <p style={{ fontSize: '12px', color: '#c4829a', margin: 0 }}>
                        {rdv.date} à {rdv.heure} · {rdv.prix}€
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ background: '#e8f5ee', color: '#1a7a45', fontSize: '11px', padding: '3px 10px', borderRadius: '20px' }}>
                      {rdv.statut}
                    </span>
                    <button className="btn-annuler" onClick={() => handleAnnuler(rdv.id)}>
                      Annuler
                    </button>
                    <button className="btn-avis" onClick={() => navigate(`/avis/${rdv.proId}`)}>
                      ⭐ Laisser un avis
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* RDV PASSÉS */}
          {rdvsPasses.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4b5ac', textTransform: 'uppercase', marginBottom: '16px' }}>Historique</p>
              {rdvsPasses.map((rdv, i) => (
                <div key={rdv.id} className="rdv-card" style={{ opacity: 0.6, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f0ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                        🌸
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{rdv.proNom}</p>
                        <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{rdv.service} · {rdv.date}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{
                        background: rdv.statut === 'annulé' ? '#fef2f2' : '#f5f0ed',
                        color: rdv.statut === 'annulé' ? '#dc2626' : '#9c9189',
                        fontSize: '11px', padding: '3px 10px', borderRadius: '20px'
                      }}>
                        {rdv.statut}
                      </span>
                      {rdv.statut !== 'annulé' && (
                        <button className="btn-avis" onClick={() => navigate(`/avis/${rdv.proId}`)}>
                          ⭐ Laisser un avis
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #ede8e3', marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ La plateforme des pros du bien-être</p>
      </div>

    </div>
  )
}

export default EspaceCliente