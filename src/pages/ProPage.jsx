import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc } from 'firebase/firestore'
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

function ProPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serviceChoisi, setServiceChoisi] = useState(null)
  const [dateChoisie, setDateChoisie] = useState('')
  const [heureChoisie, setHeureChoisie] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [etape, setEtape] = useState(1)
  const [confirme, setConfirme] = useState(false)
  const [loadingRdv, setLoadingRdv] = useState(false)

  const services = [
    { id: 1, nom: 'Pose gel complète', duree: '1h30', prix: 45 },
    { id: 2, nom: 'Remplissage', duree: '1h', prix: 35 },
    { id: 3, nom: 'Nail art', duree: '30min', prix: 15 },
    { id: 4, nom: 'Dépose', duree: '30min', prix: 20 },
    { id: 5, nom: 'Beauté des pieds', duree: '45min', prix: 30 },
  ]

  const creneaux = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  useEffect(() => {
    const chargerPro = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pros'))
        const toutes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const slugNom = (nom) => nom?.toLowerCase().replace(/\s+/g, '-') || ''
        const proTrouvee = toutes.find(p => slugNom(p.nom) === id)
        if (proTrouvee) setPro(proTrouvee)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    chargerPro()
  }, [id])

  const handleReservation = async (e) => {
    e.preventDefault()
    setLoadingRdv(true)
    try {
      await addDoc(collection(db, 'rdvs'), {
        proId: pro.id,
        proNom: pro.nom,
        clientNom: nom,
        clientTelephone: telephone,
        clientEmail: emailCliente,
        service: serviceChoisi.nom,
        prix: serviceChoisi.prix,
        date: dateChoisie,
        heure: heureChoisie,
        statut: 'confirmé',
        dateCreation: new Date(),
      })
      setConfirme(true)
    } catch (e) {
      console.error(e)
    }
    setLoadingRdv(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c4829a' }}>Chargement... 🌸</p>
      </div>
    )
  }

  if (!pro) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c4829a' }}>Pro introuvable 🌸</p>
      </div>
    )
  }

  const iconeMetier = { onglerie: '💅', lash: '👁️', headspa: '💆', massage: '🪷', 'soin-visage': '🌿' }

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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .service-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 14px; padding: 18px 20px;
          cursor: none; transition: all 0.3s;
          display: flex; justify-content: space-between; align-items: center;
        }
        .service-card:hover { border-color: #c4829a; transform: translateX(4px); }
        .service-card.active {
          border: 2px solid #c4829a; background: #fdf6f8;
          box-shadow: 0 4px 20px rgba(196,130,154,0.12);
        }
        .creneau {
          padding: 10px 16px; border-radius: 10px;
          border: 1px solid #ede8e3; background: #fff;
          font-size: 13px; cursor: none; transition: all 0.3s;
          color: #2c2c2c; font-family: 'Inter', sans-serif;
        }
        .creneau:hover { border-color: #c4829a; }
        .creneau.active {
          background: #c4829a; color: #fff; border-color: #c4829a;
          box-shadow: 0 4px 12px rgba(196,130,154,0.3);
        }
        .input-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c;
          outline: none; transition: border-color 0.3s, box-shadow 0.3s;
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
          width: 100%; padding: 12px; background: transparent;
          color: #c4829a; border: 1px solid #c4829a;
          border-radius: 40px; font-size: 14px; cursor: none;
          font-family: 'Inter', sans-serif; transition: all 0.3s;
          margin-top: 10px;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
      `}</style>

      <CustomCursor />
      <Petales />

      {/* NAVBAR */}
      <nav style={{ padding: '20px 60px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => navigate('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300', cursor: 'none' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-outline" style={{ width: 'auto', marginTop: 0, padding: '8px 20px', fontSize: '13px' }} onClick={() => navigate('/recherche')}>
            ← Toutes les pros
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6dbf9e' }} />
            <span style={{ fontSize: '12px', color: '#9c9189', fontWeight: '300' }}>Disponible aujourd'hui</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>

        {/* PROFIL PRO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '3px solid #fff', boxShadow: '0 4px 20px rgba(196,130,154,0.15)', flexShrink: 0 }}>
            {iconeMetier[pro.metier] || '✨'}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '300', color: '#2c2c2c', marginBottom: '6px' }}>{pro.nom}</h2>
            <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300', marginBottom: '10px' }}>{pro.metier} · Glowi</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#fdf6f8', color: '#c4829a', fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>{pro.metier}</span>
              <span style={{ background: '#e8f5ee', color: '#1a7a45', fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>✓ Disponible</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>

          {/* GAUCHE — SERVICES */}
          <div>
            <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s ease 0.1s both' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '20px' }}>Prestations</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.map((s) => (
                  <div key={s.id} className={`service-card ${serviceChoisi?.id === s.id ? 'active' : ''}`} onClick={() => setServiceChoisi(s)}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{s.nom}</p>
                      <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{s.duree}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '300', color: serviceChoisi?.id === s.id ? '#c4829a' : '#2c2c2c', margin: 0 }}>{s.prix}€</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DROITE — RÉSERVATION */}
          <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
            {!confirme ? (
              <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '20px', padding: '32px', animation: 'scaleIn 0.5s ease forwards' }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '20px' }}>Réserver</p>

                {etape === 1 && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>DATE</label>
                      <input type="date" value={dateChoisie} onChange={(e) => setDateChoisie(e.target.value)} className="input-zen" />
                    </div>
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>HEURE</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {creneaux.map((c) => (
                          <div key={c} className={`creneau ${heureChoisie === c ? 'active' : ''}`} onClick={() => setHeureChoisie(c)}>{c}</div>
                        ))}
                      </div>
                    </div>
                    {serviceChoisi && (
                      <div style={{ background: '#fdf6f8', border: '1px solid #e8d5db', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                        <p style={{ fontSize: '12px', color: '#9c9189', margin: '0 0 4px', fontWeight: '300' }}>Prestation sélectionnée</p>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{serviceChoisi.nom}</p>
                        <p style={{ fontSize: '13px', color: '#c4829a', margin: 0 }}>{serviceChoisi.prix}€ · {serviceChoisi.duree}</p>
                      </div>
                    )}
                    <button className="btn-sakura" onClick={() => serviceChoisi && dateChoisie && heureChoisie && setEtape(2)} style={{ opacity: serviceChoisi && dateChoisie && heureChoisie ? 1 : 0.5 }}>
                      Continuer →
                    </button>
                  </div>
                )}

                {etape === 2 && (
                  <form onSubmit={handleReservation}>
                    <div style={{ background: '#fdf6f8', border: '1px solid #e8d5db', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 4px' }}>{serviceChoisi?.nom}</p>
                      <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{dateChoisie} à {heureChoisie} · {serviceChoisi?.prix}€</p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TON PRÉNOM</label>
                      <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Sophie" required className="input-zen" />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TON EMAIL</label>
                      <input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} placeholder="ton@email.com" required className="input-zen" />
                    </div>
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TON TÉLÉPHONE</label>
                      <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 XX XX XX XX" required className="input-zen" />
                      <p style={{ fontSize: '11px', color: '#c4b5ac', marginTop: '6px' }}>Tu recevras un rappel SMS 24h avant 🌸</p>
                    </div>
                    <button type="submit" className="btn-sakura" disabled={loadingRdv}>
                      {loadingRdv ? '✦ Confirmation...' : 'Confirmer mon RDV'}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setEtape(1)}>← Modifier</button>
                  </form>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', animation: 'scaleIn 0.5s ease forwards' }}>
                <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌸</div>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>C'est confirmé !</p>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
                  À bientôt {nom} !
                </h3>
                <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300', lineHeight: '1.7', marginBottom: '8px' }}>
                  {serviceChoisi?.nom}<br />
                  <strong style={{ color: '#c4829a' }}>{dateChoisie} à {heureChoisie}</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#c4b5ac', marginTop: '16px', marginBottom: '24px' }}>
                  Un rappel SMS te sera envoyé 24h avant 🌸
                </p>
                <button className="btn-sakura" onClick={() => navigate('/espace-cliente')}>
                  Voir mes RDV →
                </button>
                <button className="btn-outline" onClick={() => navigate('/')}>
                  Retour à l'accueil
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #ede8e3', marginTop: '60px' }}>
        <p style={{ fontSize: '12px', color: '#c4b5ac' }}>Réservation propulsée par <span style={{ color: '#c4829a', fontWeight: '500' }}>Glowi ✦</span></p>
      </div>

    </div>
  )
}

export default ProPage