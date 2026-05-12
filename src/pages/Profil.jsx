import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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

const EMOJIS = ['💅', '👁️', '💆', '🪷', '🌿', '✨', '🌸', '💜', '🦋', '🌺', '💎', '🌙']

function Profil() {
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [succes, setSucces] = useState(false)

  const [emoji, setEmoji] = useState('✨')
  const [description, setDescription] = useState('')
  const [ville, setVille] = useState('')
  const [adresse, setAdresse] = useState('')
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [horaires, setHoraires] = useState({
    lundi: { ouvert: true, debut: '09:00', fin: '18:00' },
    mardi: { ouvert: true, debut: '09:00', fin: '18:00' },
    mercredi: { ouvert: true, debut: '09:00', fin: '18:00' },
    jeudi: { ouvert: true, debut: '09:00', fin: '18:00' },
    vendredi: { ouvert: true, debut: '09:00', fin: '18:00' },
    samedi: { ouvert: true, debut: '09:00', fin: '17:00' },
    dimanche: { ouvert: false, debut: '09:00', fin: '17:00' },
  })

  const [suggestionVilles, setSuggestionVilles] = useState([])
  const [coordonnees, setCoordonnees] = useState(null)
  const [rechercheLieu, setRechercheLieu] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/login'); return }
      const docSnap = await getDoc(doc(db, 'pros', user.uid))
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), uid: user.uid }
        setPro(data)
        setEmoji(data.emoji || '✨')
        setDescription(data.description || '')
        setVille(data.ville || '')
        setAdresse(data.adresse || '')
        setInstagram(data.instagram || '')
        setWhatsapp(data.whatsapp || '')
        setHoraires(data.horaires || horaires)
        setCoordonnees(data.coordonnees || null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const rechercherVille = async (texte) => {
    setRechercheLieu(texte)
    setVille(texte)
    if (texte.length < 3) { setSuggestionVilles([]); return }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texte)}&format=json&limit=5&countrycodes=fr&addressdetails=1`)
      const data = await res.json()
      setSuggestionVilles(data)
    } catch (e) {
      console.error(e)
    }
  }

  const choisirVille = (item) => {
    setVille(item.display_name.split(',').slice(0, 2).join(',').trim())
    setAdresse(item.display_name)
    setCoordonnees({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) })
    setSuggestionVilles([])
    setRechercheLieu('')
  }

  const sauvegarder = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'pros', pro.uid), {
        emoji, description, ville, adresse,
        instagram, whatsapp, horaires,
        coordonnees: coordonnees || null,
      })
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const joursLabels = {
    lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
    jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche'
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
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .input-zen {
          width: 100%; padding: 11px 14px;
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
        .textarea-zen {
          width: 100%; padding: 11px 14px;
          border: 1px solid #ede8e3; border-radius: 10px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box; cursor: none;
          resize: none; min-height: 100px;
        }
        .textarea-zen:focus {
          border-color: #c4829a;
          box-shadow: 0 0 0 3px rgba(196,130,154,0.1);
          background: #fff;
        }
        .btn-sakura {
          padding: 12px 32px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 14px;
          cursor: none; font-family: 'Inter', sans-serif;
          transition: all 0.3s; letter-spacing: 0.5px;
        }
        .btn-sakura:hover { background: #b57089; transform: translateY(-1px); }
        .btn-sakura:disabled { opacity: 0.6; }
        .btn-outline {
          padding: 10px 24px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 13px;
          cursor: none; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
        .emoji-btn {
          width: 44px; height: 44px; border-radius: 10px;
          border: 1.5px solid #ede8e3; background: #fff;
          font-size: 20px; cursor: none; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .emoji-btn:hover { border-color: #c4829a; transform: scale(1.1); }
        .emoji-btn.active { border-color: #c4829a; background: #fdf6f8; box-shadow: 0 0 0 3px rgba(196,130,154,0.15); }
        .suggestion-item {
          padding: 10px 14px; cursor: none; transition: background 0.2s;
          font-size: 13px; color: #2c2c2c; border-bottom: 1px solid #f5f0ed;
        }
        .suggestion-item:hover { background: #fdf6f8; color: #c4829a; }
        .suggestion-item:last-child { border-bottom: none; }
        .horaire-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid #f5f0ed;
        }
        .horaire-row:last-child { border-bottom: none; }
        .toggle {
          width: 40px; height: 22px; border-radius: 11px;
          position: relative; cursor: none; transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; position: absolute; top: 2px;
          transition: left 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .section-card {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 16px; padding: 28px;
          margin-bottom: 20px; animation: fadeUp 0.5s ease forwards;
        }
        .section-title {
          fontSize: 11px; letterSpacing: 3px; color: #c4829a;
          textTransform: uppercase; marginBottom: 20px; fontWeight: 500;
        }
      `}</style>

      <CustomCursor />

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn-sakura" onClick={sauvegarder} disabled={saving}>
            {saving ? '✦ Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '12px' }}>Mon profil</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
            Personnaliser ma page
          </h2>
          <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300' }}>
            Ces informations s'affichent sur votre page publique Glowi
          </p>
        </div>

        {/* SUCCÈS */}
        {succes && (
          <div style={{ background: '#e8f5ee', border: '1px solid #b7e0c8', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideDown 0.4s ease forwards' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <p style={{ fontSize: '13px', color: '#1a7a45', margin: 0, fontWeight: '500' }}>Profil sauvegardé avec succès !</p>
          </div>
        )}

        {/* APERÇU */}
        <div style={{ background: 'linear-gradient(135deg, #fdf0f4, #f5e6ef)', border: '1px solid #e8d5db', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 4px 16px rgba(196,130,154,0.2)', flexShrink: 0 }}>
            {emoji}
          </div>
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: '300', color: '#2c2c2c', margin: '0 0 4px' }}>{pro?.nom}</h3>
            <p style={{ fontSize: '13px', color: '#9c9189', margin: '0 0 4px', fontWeight: '300' }}>{description || 'Votre description ici...'}</p>
            {ville && <p style={{ fontSize: '12px', color: '#c4829a', margin: 0 }}>📍 {ville}</p>}
          </div>
        </div>

        {/* EMOJI */}
        <div className="section-card">
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Photo de profil</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {EMOJIS.map((e) => (
              <button key={e} className={`emoji-btn ${emoji === e ? 'active' : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#c4b5ac', marginTop: '12px' }}>Photo personnalisée disponible prochainement 🌸</p>
        </div>

        {/* DESCRIPTION */}
        <div className="section-card">
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre salon, votre spécialité, votre ambiance... Ex: Spécialiste en nail art, je vous accueille dans un cadre zen et élégant."
            className="textarea-zen"
            maxLength={300}
          />
          <p style={{ fontSize: '11px', color: '#c4b5ac', marginTop: '8px', textAlign: 'right' }}>{description.length}/300</p>
        </div>

        {/* LOCALISATION */}
        <div className="section-card">
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Localisation</p>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              value={ville}
              onChange={(e) => rechercherVille(e.target.value)}
              placeholder="Ex: Paris 11e, Lyon, Marseille..."
              className="input-zen"
            />
            {suggestionVilles.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ede8e3', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', zIndex: 50, overflow: 'hidden', animation: 'slideDown 0.2s ease forwards' }}>
                {suggestionVilles.map((item, i) => (
                  <div key={i} className="suggestion-item" onClick={() => choisirVille(item)}>
                    📍 {item.display_name.split(',').slice(0, 3).join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARTE */}
          {coordonnees && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #ede8e3', marginTop: '12px' }}>
              <iframe
                title="carte"
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordonnees.lon - 0.01},${coordonnees.lat - 0.01},${coordonnees.lon + 0.01},${coordonnees.lat + 0.01}&layer=mapnik&marker=${coordonnees.lat},${coordonnees.lon}`}
                style={{ display: 'block' }}
              />
              <div style={{ padding: '10px 14px', background: '#faf8f5', borderTop: '1px solid #ede8e3' }}>
                <p style={{ fontSize: '12px', color: '#9c9189', margin: 0 }}>📍 {ville}</p>
              </div>
            </div>
          )}
        </div>

        {/* RÉSEAUX SOCIAUX */}
        <div className="section-card">
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Réseaux sociaux</p>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>INSTAGRAM</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#c4b5ac' }}>@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="ton_compte_instagram"
                className="input-zen"
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>WHATSAPP</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>📱</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="input-zen"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
        </div>

        {/* HORAIRES */}
        <div className="section-card">
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Horaires d'ouverture</p>
          {Object.entries(joursLabels).map(([jour, label]) => (
            <div key={jour} className="horaire-row">
              <div
                className="toggle"
                style={{ background: horaires[jour]?.ouvert ? '#c4829a' : '#ede8e3' }}
                onClick={() => setHoraires(prev => ({ ...prev, [jour]: { ...prev[jour], ouvert: !prev[jour].ouvert } }))}
              >
                <div className="toggle-dot" style={{ left: horaires[jour]?.ouvert ? '20px' : '2px' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', minWidth: '90px' }}>{label}</span>
              {horaires[jour]?.ouvert ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <input
                    type="time"
                    value={horaires[jour]?.debut}
                    onChange={(e) => setHoraires(prev => ({ ...prev, [jour]: { ...prev[jour], debut: e.target.value } }))}
                    className="input-zen"
                    style={{ width: '110px', padding: '6px 10px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#9c9189' }}>→</span>
                  <input
                    type="time"
                    value={horaires[jour]?.fin}
                    onChange={(e) => setHoraires(prev => ({ ...prev, [jour]: { ...prev[jour], fin: e.target.value } }))}
                    className="input-zen"
                    style={{ width: '110px', padding: '6px 10px' }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: '#c4b5ac', fontStyle: 'italic' }}>Fermé</span>
              )}
            </div>
          ))}
        </div>

        {/* BOUTON SAUVEGARDER */}
        <button className="btn-sakura" style={{ width: '100%', padding: '16px', fontSize: '15px' }} onClick={sauvegarder} disabled={saving}>
          {saving ? '✦ Sauvegarde en cours...' : 'Sauvegarder mon profil 🌸'}
        </button>

      </div>
    </div>
  )
}

export default Profil