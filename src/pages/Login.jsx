import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch {
      setErreur('Email ou mot de passe incorrect')
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch {
      setErreur('Connexion Google échouée')
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

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
        .btn-sakura {
          width: 100%; padding: 14px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 14px; letter-spacing: 1px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-sakura:hover { transform: translateY(-2px); background: #b57089; }
        .btn-google {
          width: 100%; padding: 13px; background: #fff; color: #2c2c2c;
          border: 1px solid #ede8e3; border-radius: 40px; font-size: 14px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 20px;
        }
        .btn-google:hover { border-color: #c4829a; }
        .btn-retour {
          background: transparent; border: none; color: #c4829a;
          font-size: 13px; cursor: pointer; margin-bottom: 16px;
          display: flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif; padding: 0;
        }
        .btn-retour:hover { opacity: 0.7; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; font-size: 16px; color: #c4b5ac; cursor: pointer;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* BOUTON RETOUR */}
        <button className="btn-retour" onClick={() => navigate('/')}>
          ← Retour à l'accueil
        </button>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px 32px', boxShadow: '0 8px 40px rgba(196,130,154,0.1)' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: '300', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              Glo<span style={{ color: '#c4829a' }}>wi</span>
            </h1>
            <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '6px' }}>Bon retour</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c' }}>Connexion pro</h2>
          </div>

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

          <form onSubmit={handleLogin}>
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
            <button type="submit" className="btn-sakura" disabled={loading}>
              {loading ? '✦ Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#9c9189', marginTop: '24px', fontWeight: '300' }}>
            Pas encore de compte ?{' '}
            <span onClick={() => navigate('/register')} style={{ color: '#c4829a', cursor: 'pointer', fontWeight: '400' }}>Rejoindre Glowi</span>
          </p>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #ede8e3', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ Tous droits réservés</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login