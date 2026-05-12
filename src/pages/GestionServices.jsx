import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
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

function GestionServices() {
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [succes, setSucces] = useState(false)
  const [nouveauService, setNouveauService] = useState({ nom: '', duree: '', prix: '' })
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/login'); return }
      const docSnap = await getDoc(doc(db, 'pros', user.uid))
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), uid: user.uid }
        setPro(data)
        setServices(data.services || [
          { nom: 'Pose gel complète', duree: '1h30', prix: 45 },
          { nom: 'Remplissage', duree: '1h', prix: 35 },
          { nom: 'Nail art', duree: '30min', prix: 15 },
          { nom: 'Dépose', duree: '30min', prix: 20 },
          { nom: 'Beauté des pieds', duree: '45min', prix: 30 },
        ])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const sauvegarder = async (newServices) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'pros', pro.uid), { services: newServices })
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const ajouterService = () => {
    if (!nouveauService.nom || !nouveauService.duree || !nouveauService.prix) return
    let newServices
    if (editIndex !== null) {
      newServices = services.map((s, i) => i === editIndex ? { ...nouveauService, prix: Number(nouveauService.prix) } : s)
      setEditIndex(null)
    } else {
      newServices = [...services, { ...nouveauService, prix: Number(nouveauService.prix) }]
    }
    setServices(newServices)
    setNouveauService({ nom: '', duree: '', prix: '' })
    setAfficherFormulaire(false)
    sauvegarder(newServices)
  }

  const supprimerService = (index) => {
    if (!window.confirm('Supprimer ce service ?')) return
    const newServices = services.filter((_, i) => i !== index)
    setServices(newServices)
    sauvegarder(newServices)
  }

  const editerService = (index) => {
    setNouveauService({ ...services[index], prix: String(services[index].prix) })
    setEditIndex(index)
    setAfficherFormulaire(true)
  }

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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .input-zen {
          width: 100%; padding: 10px 14px;
          border: 1px solid #ede8e3; border-radius: 10px;
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
        .btn-danger {
          padding: 6px 14px; background: transparent; color: #dc2626;
          border: 1px solid #fecaca; border-radius: 20px; font-size: 11px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-danger:hover { background: #fef2f2; }
        .btn-edit {
          padding: 6px 14px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 20px; font-size: 11px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-edit:hover { background: rgba(196,130,154,0.08); }
        .service-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; background: #fff; border: 1px solid #ede8e3;
          border-radius: 14px; margin-bottom: 10px;
          animation: fadeUp 0.4s ease forwards;
          transition: box-shadow 0.3s;
        }
        .service-row:hover { box-shadow: 0 4px 20px rgba(196,130,154,0.1); }
      `}</style>

      <CustomCursor />

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <button className="btn-outline" onClick={() => navigate('/dashboard')}>
          ← Retour au dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s ease forwards' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Dashboard</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
            Mes services
          </h2>
          <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300' }}>
            Gérez les prestations proposées sur votre page Glowi
          </p>
        </div>

        {/* BANNIÈRE SUCCÈS */}
        {succes && (
          <div style={{ background: '#e8f5ee', border: '1px solid #b7e0c8', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideDown 0.4s ease forwards' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <p style={{ fontSize: '13px', color: '#1a7a45', margin: 0, fontWeight: '500' }}>Services sauvegardés avec succès !</p>
          </div>
        )}

        {/* LISTE DES SERVICES */}
        <div style={{ marginBottom: '24px' }}>
          {services.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
              <p style={{ fontSize: '14px', color: '#c4b5ac', fontWeight: '300' }}>Aucun service pour le moment</p>
              <p style={{ fontSize: '12px', color: '#ede8e3', marginTop: '4px' }}>Ajoutez votre premier service ci-dessous</p>
            </div>
          ) : (
            services.map((s, i) => (
              <div key={i} className="service-row" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fdf6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    ✨
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 3px' }}>{s.nom}</p>
                    <p style={{ fontSize: '12px', color: '#9c9189', margin: 0, fontWeight: '300' }}>{s.duree}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '300', color: '#c4829a' }}>{s.prix}€</span>
                  <button className="btn-edit" onClick={() => editerService(i)}>Modifier</button>
                  <button className="btn-danger" onClick={() => supprimerService(i)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FORMULAIRE AJOUT/EDIT */}
        {afficherFormulaire ? (
          <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '28px', marginBottom: '16px', animation: 'slideDown 0.3s ease forwards' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', marginBottom: '20px' }}>
              {editIndex !== null ? '✏️ Modifier le service' : '➕ Nouveau service'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>NOM DU SERVICE</label>
                <input
                  type="text"
                  value={nouveauService.nom}
                  onChange={(e) => setNouveauService({ ...nouveauService, nom: e.target.value })}
                  placeholder="Ex: Pose gel complète"
                  className="input-zen"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>DURÉE</label>
                <input
                  type="text"
                  value={nouveauService.duree}
                  onChange={(e) => setNouveauService({ ...nouveauService, duree: e.target.value })}
                  placeholder="Ex: 1h30"
                  className="input-zen"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#9c9189', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>PRIX (€)</label>
                <input
                  type="number"
                  value={nouveauService.prix}
                  onChange={(e) => setNouveauService({ ...nouveauService, prix: e.target.value })}
                  placeholder="45"
                  className="input-zen"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-sakura" onClick={ajouterService} disabled={saving}>
                {saving ? '✦ Sauvegarde...' : editIndex !== null ? 'Modifier' : 'Ajouter'}
              </button>
              <button className="btn-outline" onClick={() => { setAfficherFormulaire(false); setEditIndex(null); setNouveauService({ nom: '', duree: '', prix: '' }) }}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-outline"
            style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '14px' }}
            onClick={() => setAfficherFormulaire(true)}
          >
            + Ajouter un service
          </button>
        )}

      </div>
    </div>
  )
}

export default GestionServices