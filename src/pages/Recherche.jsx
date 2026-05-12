import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

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

const METIERS = [
  { id: 'tous', label: 'Tous', icone: '✨' },
  { id: 'onglerie', label: 'Onglerie', icone: '💅' },
  { id: 'lash', label: 'Lash Artist', icone: '👁️' },
  { id: 'headspa', label: 'Headspa', icone: '💆' },
  { id: 'massage', label: 'Massage', icone: '🪷' },
  { id: 'soin-visage', label: 'Soin visage', icone: '🌿' },
]

function Recherche() {
  const navigate = useNavigate()
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [metierFiltre, setMetierFiltre] = useState('tous')

  useEffect(() => {
    const chargerPros = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pros'))
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setPros(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    chargerPros()
  }, [])

  const prosFiltrees = pros.filter(pro => {
    const matchMetier = metierFiltre === 'tous' || pro.metier === metierFiltre
    const matchRecherche = pro.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      pro.metier?.toLowerCase().includes(recherche.toLowerCase())
    return matchMetier && matchRecherche
  })

  const slugNom = (nom) => nom?.toLowerCase().replace(/\s+/g, '-') || 'pro'

  const iconeMetier = (metier) => {
    const m = METIERS.find(m => m.id === metier)
    return m ? m.icone : '✨'
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
        .input-recherche {
          width: 100%; padding: 16px 24px;
          border: 1px solid #ede8e3; border-radius: 40px;
          font-size: 15px; font-family: 'Inter', sans-serif;
          background: #fff; color: #2c2c2c; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box; cursor: none;
          box-shadow: 0 4px 20px rgba(196,130,154,0.08);
        }
        .input-recherche:focus {
          border-color: #c4829a;
          box-shadow: 0 4px 24px rgba(196,130,154,0.15);
        }
        .filtre-btn {
          padding: 10px 20px; border-radius: 40px;
          border: 1px solid #ede8e3; background: #fff;
          font-size: 13px; cursor: none; transition: all 0.3s;
          font-family: 'Inter', sans-serif; color: #9c9189;
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap;
        }
        .filtre-btn:hover { border-color: #c4829a; color: #c4829a; }
        .filtre-btn.active {
          background: #c4829a; color: #fff; border-color: #c4829a;
          box-shadow: 0 4px 12px rgba(196,130,154,0.3);
        }
        .pro-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 20px; padding: 28px;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
          cursor: none; animation: fadeUp 0.5s ease forwards;
        }
        .pro-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(196,130,154,0.14);
          border-color: #c4829a;
        }
        .btn-sakura {
          width: 100%; padding: 12px; background: #c4829a;
          color: #fff; border: none; border-radius: 40px;
          font-size: 13px; letter-spacing: 0.5px; cursor: none;
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
      `}</style>

      <CustomCursor />
      <Petales />

      {/* NAVBAR */}
      <nav style={{ padding: '20px 60px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => navigate('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: '300', cursor: 'none' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={() => navigate('/login')}>Connexion pro</button>
          <button className="btn-sakura" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/register')}>Rejoindre Glowi</button>
        </div>
      </nav>

      {/* HERO RECHERCHE */}
      <div style={{ background: 'linear-gradient(180deg, #fdf6f8 0%, #faf8f5 100%)', padding: '60px 60px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Trouvez votre pro bien-être</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', fontWeight: '300', color: '#2c2c2c', marginBottom: '32px', lineHeight: 1.2 }}>
          Réservez en quelques<br />
          <em style={{ color: '#c4829a' }}>secondes</em>
        </h2>

        {/* BARRE DE RECHERCHE */}
        <div style={{ maxWidth: '600px', margin: '0 auto 24px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Rechercher une onglerie, lash artist, headspa..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="input-recherche"
          />
          <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
        </div>

        {/* FILTRES MÉTIER */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
          {METIERS.map(m => (
            <button
              key={m.id}
              className={`filtre-btn ${metierFiltre === m.id ? 'active' : ''}`}
              onClick={() => setMetierFiltre(m.id)}
            >
              {m.icone} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SÉPARATEUR */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e8d5db, transparent)', margin: '0 60px' }} />

      {/* RÉSULTATS */}
      <div style={{ padding: '48px 60px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300' }}>
            {loading ? 'Chargement...' : `${prosFiltrees.length} professionnelle${prosFiltrees.length > 1 ? 's' : ''} disponible${prosFiltrees.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c4829a' }}>Chargement... 🌸</p>
          </div>
        ) : prosFiltrees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
              Aucune pro trouvée
            </h3>
            <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300' }}>
              Essaie un autre terme ou un autre métier
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {prosFiltrees.map((pro, i) => (
              <div key={pro.id} className="pro-card" style={{ animationDelay: `${i * 0.1}s` }}>

                {/* AVATAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 2px 12px rgba(196,130,154,0.15)' }}>
                    {iconeMetier(pro.metier)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{pro.nom}</h3>
                    <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>
                      {METIERS.find(m => m.id === pro.metier)?.label || pro.metier}
                    </p>
                  </div>
                </div>

                {/* INFOS */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ background: '#fdf6f8', color: '#c4829a', fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>
                    {METIERS.find(m => m.id === pro.metier)?.label || 'Bien-être'}
                  </span>
                  <span style={{ background: '#e8f5ee', color: '#1a7a45', fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>
                    ✓ Disponible
                  </span>
                  <span style={{ background: '#faf8f5', color: '#9c9189', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #ede8e3' }}>
                    Plan {pro.plan === 'starter' ? 'Starter' : pro.plan === 'premium' ? 'Premium ⭐' : 'Pro'}
                  </span>
                </div>

                {/* BOUTON */}
                <button className="btn-sakura" onClick={() => navigate(`/pro/${slugNom(pro.nom)}`)}>
                  Réserver un RDV →
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #ede8e3', marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ La plateforme des pros du bien-être</p>
      </div>

    </div>
  )
}

export default Recherche