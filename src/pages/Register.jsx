import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
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

function Register() {
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [metier, setMetier] = useState('')
  const [plan, setPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [etape, setEtape] = useState(1)

  const sauvegarderPro = async (user, nomPro, metierPro, planPro) => {
    await setDoc(doc(db, 'pros', user.uid), {
      uid: user.uid,
      nom: nomPro,
      email: user.email,
      metier: metierPro,
      plan: planPro,
      dateInscription: new Date(),
      essaiActif: true,
      actif: true,
    })
  }

  const handleNext = (e) => {
    e.preventDefault()
    setEtape(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: nom })
      await sauvegarderPro(result.user, nom, metier, plan)
      navigate('/dashboard')
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErreur('Cet email est déjà utilisé')
      } else if (error.code === 'auth/weak-password') {
        setErreur('Mot de passe trop court (6 caractères minimum)')
      } else {
        setErreur('Une erreur est survenue, réessaie')
      }
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setErreur('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await sauvegarderPro(result.user, result.user.displayName, metier || 'non renseigné', plan)
      navigate('/dashboard')
    } catch (error) {
      setErreur('Connexion Google échouée')
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', display: 'flex', cursor: 'none' }}>

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
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
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
        .select-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          cursor: none; transition: border-color 0.3s;
          box-sizing: border-box; appearance: none;
        }
        .select-zen:focus { border-color: #c4829a; box-shadow: 0 0 0 3px rgba(196,130,154,0.1); }
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
        .btn-back {
          width: 100%; padding: 12px; background: transparent;
          color: #c4829a; border: 1px solid #c4829a;
          border-radius: 40px; font-size: 14px; cursor: none;
          font-family: 'Inter', sans-serif; transition: all 0.3s;
          margin-top: 10px;
        }
        .btn-back:hover { background: rgba(196,130,154,0.08); }
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
        .plan-card {
          border: 1px solid #ede8e3; border-radius: 14px;
          padding: 16px; cursor: none; transition: all 0.3s;
          background: #fff;
        }
        .plan-card:hover { border-color: #c4829a; }
        .plan-card.active {
          border: 2px solid #c4829a; background: #fdf6f8;
          box-shadow: 0 4px 20px rgba(196,130,154,0.15);
        }
        .separateur {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
        }
        .separateur-line { flex: 1; height: 1px; background: #ede8e3; }
        .separateur-text { font-size: 12px; color: #c4b5ac; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); cursor: none;
          background: none; border: none; font-size: 16px;
          color: #c4b5ac; padding: 0; line-height: 1;
        }
        .eye-btn:hover { color: #c4829a; }
      `}</style>

      <CustomCursor />
      <Petales />

      {/* PANNEAU GAUCHE */}
      <div style={{
        width: '42%', background: 'linear-gradient(160deg, #fdf0f4 0%, #f5e6ef 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '250px', height: '250px', opacity: 0.07 }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%' }}>
            <path d="M100 180 Q60 140 40 100 Q20 60 60 30 Q100 0 140 30 Q180 60 160 100 Q140 140 100 180Z" fill="#c4829a"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 1s ease forwards' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', fontWeight: '300', color: '#2c2c2c', marginBottom: '16px' }}>
            Glo<span style={{ color: '#c4829a' }}>wi</span>
          </h1>
          <div style={{ width: '40px', height: '1px', background: '#c4829a', margin: '0 auto 20px' }} />
          <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300', lineHeight: 1.8, maxWidth: '240px', marginBottom: '48px' }}>
            Rejoins des centaines de professionnelles qui gèrent leurs RDV avec sérénité
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            {[
              { num: '01', titre: 'Ton profil', desc: 'Nom, métier, email' },
              { num: '02', titre: 'Ton plan', desc: 'Choisis ta formule' },
              { num: '03', titre: 'C\'est parti !', desc: '14 jours gratuits' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: etape > i ? 1 : etape === i + 1 ? 1 : 0.4, transition: 'opacity 0.4s' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: etape > i + 1 ? '#c4829a' : etape === i + 1 ? '#fdf6f8' : '#ede8e3',
                  border: etape === i + 1 ? '2px solid #c4829a' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '500',
                  color: etape > i + 1 ? '#fff' : '#c4829a',
                  transition: 'all 0.4s',
                }}>
                  {etape > i + 1 ? '✓' : s.num}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{s.titre}</p>
                  <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANNEAU DROIT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {etape === 1 && (
            <div style={{ animation: 'slideIn 0.5s ease forwards' }}>
              <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Étape 1 / 2</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>Ton profil</h2>
              <p style={{ fontSize: '13px', color: '#c4b5ac', marginBottom: '28px', fontWeight: '300' }}>
                Déjà un compte ?{' '}
                <span onClick={() => navigate('/login')} style={{ color: '#c4829a', cursor: 'none' }}>Se connecter</span>
              </p>

              <button className="btn-google" onClick={handleGoogle} disabled={loading}>
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

              <form onSubmit={handleNext}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>NOM DU SALON / PRÉNOM</label>
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Maya Nails" required className="input-zen" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TON MÉTIER</label>
                  <select value={metier} onChange={(e) => setMetier(e.target.value)} required className="select-zen">
                    <option value="">Sélectionne ton métier</option>
                    <option value="onglerie">Onglerie</option>
                    <option value="lash">Lash Artist</option>
                    <option value="headspa">Headspa</option>
                    <option value="massage">Massage</option>
                    <option value="soin-visage">Soin visage</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>ADRESSE EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" required className="input-zen" />
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>MOT DE PASSE</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-zen"
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-sakura">Continuer →</button>
              </form>
            </div>
          )}

          {etape === 2 && (
            <div style={{ animation: 'slideIn 0.5s ease forwards' }}>
              <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Étape 2 / 2</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>Choisis ton plan</h2>
              <p style={{ fontSize: '13px', color: '#c4b5ac', marginBottom: '32px', fontWeight: '300' }}>14 jours gratuits sur tous les plans ✦</p>

              {erreur && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {erreur}</p>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    { id: 'starter', nom: 'Starter', prix: '19€', desc: 'Page pro + agenda · 5 RDV/mois' },
                    { id: 'pro', nom: 'Pro', prix: '29€', desc: 'RDV illimités + SMS + stats', recommande: true },
                    { id: 'premium', nom: 'Premium', prix: '49€', desc: 'Tout Pro + mise en avant + widget' },
                  ].map((p) => (
                    <div key={p.id} className={`plan-card ${plan === p.id ? 'active' : ''}`} onClick={() => setPlan(p.id)} style={{ position: 'relative' }}>
                      {p.recommande && (
                        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#c4829a', color: '#fff', fontSize: '10px', letterSpacing: '1.5px', padding: '3px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>
                          Recommandé
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{p.nom}</p>
                          <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{p.desc}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300', color: plan === p.id ? '#c4829a' : '#2c2c2c', margin: 0 }}>{p.prix}</p>
                          <p style={{ fontSize: '11px', color: '#c4b5ac', margin: 0 }}>/mois</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-sakura" disabled={loading}>
                  {loading ? '✦ Création en cours...' : 'Créer mon compte Glowi'}
                </button>
                <button type="button" className="btn-back" onClick={() => setEtape(1)}>← Retour</button>
              </form>
            </div>
          )}

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #ede8e3', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#c4b5ac', letterSpacing: '1px' }}>© 2025 Glowi ✦ Tous droits réservés</p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Register