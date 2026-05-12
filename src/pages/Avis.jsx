import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
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

function Avis() {
  const { proId } = useParams()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [note, setNote] = useState(0)
  const [hoverNote, setHoverNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [prenom, setPrenom] = useState('')
  const [loading, setLoading] = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [dejaAvis, setDejaAvis] = useState(false)

  useEffect(() => {
    const chargerPro = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pros'))
        const toutes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const proTrouvee = toutes.find(p => p.id === proId)
        if (proTrouvee) setPro(proTrouvee)
      } catch (e) {
        console.error(e)
      }
    }
    chargerPro()
  }, [proId])

  const handleEnvoyer = async (e) => {
    e.preventDefault()
    if (note === 0) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'avis'), {
        proId,
        proNom: pro?.nom,
        prenom,
        note,
        commentaire,
        date: new Date(),
      })
      setEnvoye(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
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
        .textarea-zen {
          width: 100%; padding: 12px 16px;
          border: 1px solid #ede8e3; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          background: #faf8f5; color: #2c2c2c; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box; cursor: none;
          resize: none; min-height: 120px;
        }
        .textarea-zen:focus {
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
        .btn-sakura:disabled { opacity: 0.5; }
        .btn-outline {
          width: 100%; padding: 12px; background: transparent;
          color: #c4829a; border: 1px solid #c4829a;
          border-radius: 40px; font-size: 14px; cursor: none;
          font-family: 'Inter', sans-serif; transition: all 0.3s;
          margin-top: 10px;
        }
        .btn-outline:hover { background: rgba(196,130,154,0.08); }
        .etoile {
          font-size: 36px; cursor: none;
          transition: transform 0.2s;
          display: inline-block;
        }
        .etoile:hover { transform: scale(1.2); }
      `}</style>

      <CustomCursor />

      {/* NAVBAR */}
      <nav style={{ padding: '20px 60px', borderBottom: '1px solid #ede8e3', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => navigate('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: '300', cursor: 'none' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
      </nav>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px' }}>

        {!envoye ? (
          <div style={{ animation: 'fadeUp 0.6s ease forwards' }}>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Laisser un avis</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: '#2c2c2c', marginBottom: '8px' }}>
                {pro?.nom}
              </h2>
              <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300' }}>
                Votre avis aide les autres clientes à choisir 🌸
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '20px', padding: '32px' }}>

              {/* ÉTOILES */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>
                  VOTRE NOTE
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="etoile"
                      onMouseEnter={() => setHoverNote(i)}
                      onMouseLeave={() => setHoverNote(0)}
                      onClick={() => setNote(i)}
                    >
                      {i <= (hoverNote || note) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                {note > 0 && (
                  <p style={{ fontSize: '13px', color: '#c4829a', marginTop: '10px', fontWeight: '300' }}>
                    {note === 1 ? 'Décevant' : note === 2 ? 'Passable' : note === 3 ? 'Bien' : note === 4 ? 'Très bien' : 'Excellent ! 🌸'}
                  </p>
                )}
              </div>

              <form onSubmit={handleEnvoyer}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    VOTRE PRÉNOM
                  </label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Sophie"
                    required
                    className="input-zen"
                  />
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#9c9189', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    VOTRE COMMENTAIRE
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Partagez votre expérience avec cette professionnelle..."
                    className="textarea-zen"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-sakura"
                  disabled={loading || note === 0}
                  style={{ opacity: note === 0 ? 0.5 : 1 }}
                >
                  {loading ? '✦ Envoi en cours...' : 'Publier mon avis'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease forwards' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌸</div>
            <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Merci !</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: '300', color: '#2c2c2c', marginBottom: '12px' }}>
              Avis publié !
            </h2>
            <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300', lineHeight: '1.8', marginBottom: '32px' }}>
              Merci {prenom} pour votre avis sur {pro?.nom}.<br />
              Vous aidez d'autres clientes à faire leur choix 🌸
            </p>
            <button className="btn-sakura" style={{ width: 'auto', padding: '14px 40px' }} onClick={() => navigate('/')}>
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #ede8e3', marginTop: '60px' }}>
        <p style={{ fontSize: '12px', color: '#c4b5ac' }}>© 2025 Glowi ✦ La plateforme des pros du bien-être</p>
      </div>

    </div>
  )
}

export default Avis