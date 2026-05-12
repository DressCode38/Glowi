import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

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
      uid: user.uid, nom: nomPro, email: user.email,
      metier: metierPro, plan: planPro,
      dateInscription: new Date(), essaiActif: true, actif: true,
    })
  }

  const handleNext = (e) => { e.preventDefault(); setEtape(2) }

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
      if (error.code === 'auth/email-already-in-use') setErreur('Cet email est déjà utilisé')
      else if (error.code === 'auth/weak-password') setErreur('Mot de passe trop court (6 caractères minimum)')
      else setErreur('Une erreur est survenue')
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await sauvegarderPro(result.user, result.user.displayName, metier || 'non renseigné', plan)
      navigate('/dashboard')
    } catch {
      setErreur('Connexion Google échouée')
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .input-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }
        .input-zen:focus { border-color: #c4829a; box-shadow: 0 0 0 3px rgba(196,130,154,0.1); background: #fff; }
        .select-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          transition: border-color 0.3s; box-sizing: border-box; appearance: none;
        }
        .btn-sakura {
          width: 100%; padding: 14px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 14px; letter-spacing: 1px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-sakura:hover { transform: translateY(-2px); background: #b57089; }
        .btn-back {
          width: 100%; padding: 12px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 14px;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s; margin-top: 10px;
        }
        .btn-google {
          width: 100%; padding: 13px; background: #fff; color: #2c2c2c;
          border: 1px solid #ede8e3; border-radius: 40px; font-size: 14px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 20px;
        }
        .btn-google:hover { border-color: #c4829a; }
        .plan-card {
          border: 1px solid #ede8e3; border-radius: 14px; padding: 14px;
          cursor: pointer; transition: all 0.3s; background: #fff;
        }
        .plan-card:hover { border-color: #c4829a; }
        .plan-card.active { border: 2px solid #c4829a; background: #fdf6f8; box-shadow: 0 4px 20px rgba(196,130,154,0.15); }
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; font-size: 16px; color: #c4b5ac; cursor: pointer;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '40px 28px', boxShadow: '0 8px 40px rgba(196,130,154,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 onClick={() => navigate('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', cursor: 'pointer', marginBottom: '6px' }}>
            Glo<span style={{ color: '#c4829a' }}>wi</span>
          </h1>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '4px' }}>Étape {etape} / 2</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: '300', color: '#2c2c2c' }}>
            {etape === 1 ? 'Ton profil' : 'Ton plan'}
          </h2>
        </div>

        {etape === 1 && (
          <div>
            <button className="btn-google" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continuer avec Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#ede8e3' }} />
              <span style={{ fontSize: '12px', color: '#c4b5ac' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: '#ede8e3' }} />
            </div>

            {erreur && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {erreur}</p>
              </div>
            )}

            <form onSubmit={handleNext}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>NOM DU SALON</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Maya Nails" required className="input-zen" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>TON MÉTIER</label>
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
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>EMAIL</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" required className="input-zen" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>MOT DE PASSE</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-zen" style={{ paddingRight: '44px' }} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-sakura">Continuer →</button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9c9189', marginTop: '20px', fontWeight: '300' }}>
              Déjà un compte ?{' '}
              <span onClick={() => navigate('/login')} style={{ color: '#c4829a', cursor: 'pointer' }}>Se connecter</span>
            </p>
          </div>
        )}

        {etape === 2 && (
          <div>
            <p style={{ fontSize: '13px', color: '#c4b5ac', marginBottom: '20px', textAlign: 'center', fontWeight: '300' }}>14 jours gratuits sur tous les plans ✦</p>

            {erreur && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {erreur}</p>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'starter', nom: 'Starter', prix: '19€', desc: 'Page pro + agenda · 5 RDV/mois' },
                  { id: 'pro', nom: 'Pro', prix: '29€', desc: 'RDV illimités + SMS + stats', recommande: true },
                  { id: 'premium', nom: 'Premium', prix: '49€', desc: 'Tout Pro + mise en avant' },
                ].map((p) => (
                  <div key={p.id} className={`plan-card ${plan === p.id ? 'active' : ''}`} onClick={() => setPlan(p.id)} style={{ position: 'relative' }}>
                    {p.recommande && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#c4829a', color: '#fff', fontSize: '10px', letterSpacing: '1.5px', padding: '3px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>
                        Recommandé
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{p.nom}</p>
                        <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{p.desc}</p>
                      </div>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '300', color: plan === p.id ? '#c4829a' : '#2c2c2c', margin: 0 }}>{p.prix}<span style={{ fontSize: '11px', color: '#c4b5ac' }}>/mois</span></p>
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" className="btn-sakura" disabled={loading}>
                {loading ? '✦ Création...' : 'Créer mon compte Glowi'}
              </button>
              <button type="button" className="btn-back" onClick={() => setEtape(1)}>← Retour</button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #ede8e3', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ Tous droits réservés</p>
        </div>
      </div>
    </div>
  )
}

export default Register