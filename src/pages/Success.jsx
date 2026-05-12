import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Success() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard?success=true')
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-sakura {
          padding: 14px 40px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 14px;
          letter-spacing: 1px; cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-sakura:hover { transform: translateY(-2px); background: #b57089; }
      `}</style>

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.8s ease forwards', maxWidth: '500px', padding: '40px' }}>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', fontSize: '48px',
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: '0 8px 32px rgba(196,130,154,0.2)',
        }}>🌸</div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', fontWeight: '300', color: '#2c2c2c', marginBottom: '16px' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#c4829a', margin: '0 auto 24px' }} />
        <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Paiement confirmé</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c', marginBottom: '12px' }}>
          Bienvenue dans la famille !
        </h2>
        <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300', lineHeight: '1.8', marginBottom: '40px' }}>
          Ton abonnement Glowi est maintenant actif.<br />
          Tu vas être redirigée vers ton dashboard...
        </p>
        <button className="btn-sakura" onClick={() => navigate('/dashboard?success=true')}>
          Accéder à mon dashboard →
        </button>
        <p style={{ fontSize: '12px', color: '#c4b5ac', marginTop: '20px' }}>Redirection automatique dans 4 secondes 🌸</p>
      </div>
    </div>
  )
}

export default Success