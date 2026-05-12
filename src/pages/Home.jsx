import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0px)' : 'translateY(40px)',
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

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
          id,
          left: Math.random() * 100,
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

function CarteVilles() {
  const [activeVille, setActiveVille] = useState(null)
  const villes = [
    { nom: 'Paris', x: 48, y: 38, pros: 142 },
    { nom: 'Lyon', x: 53, y: 55, pros: 67 },
    { nom: 'Marseille', x: 54, y: 72, pros: 89 },
    { nom: 'Bordeaux', x: 32, y: 60, pros: 45 },
    { nom: 'Lille', x: 48, y: 20, pros: 38 },
    { nom: 'Nantes', x: 30, y: 45, pros: 52 },
    { nom: 'Strasbourg', x: 66, y: 30, pros: 29 },
    { nom: 'Toulouse', x: 42, y: 68, pros: 61 },
  ]
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', opacity: 0.15, position: 'absolute', top: 0, left: 0 }}>
        <path d="M48 5 L52 8 L58 7 L62 12 L68 14 L72 10 L76 15 L74 22 L78 28 L75 33 L70 32 L68 38 L72 42 L70 48 L66 52 L68 58 L65 64 L60 68 L58 75 L54 80 L50 85 L46 82 L42 78 L38 72 L34 68 L30 62 L28 56 L24 50 L26 44 L22 38 L25 32 L28 26 L32 20 L36 14 L40 10 L44 7 Z" fill="#c4829a" stroke="#c4829a" strokeWidth="0.5"/>
      </svg>
      <div style={{ position: 'relative', paddingTop: '75%' }}>
        {villes.map((v) => (
          <div key={v.nom}
            style={{ position: 'absolute', left: `${v.x}%`, top: `${v.y}%`, transform: 'translate(-50%, -50%)', cursor: 'none', zIndex: 2 }}
            onMouseEnter={() => setActiveVille(v)}
            onMouseLeave={() => setActiveVille(null)}
          >
            <div style={{
              width: activeVille?.nom === v.nom ? '16px' : '10px',
              height: activeVille?.nom === v.nom ? '16px' : '10px',
              background: '#c4829a', borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: activeVille?.nom === v.nom ? '0 0 0 6px rgba(196,130,154,0.2)' : '0 2px 8px rgba(196,130,154,0.4)',
              transition: 'all 0.3s',
            }} />
            {activeVille?.nom === v.nom && (
              <div style={{
                position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                background: '#fff', border: '1px solid #ede8e3', borderRadius: '10px',
                padding: '8px 14px', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(196,130,154,0.15)'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#2c2c2c', margin: '0 0 2px' }}>{v.nom}</p>
                <p style={{ fontSize: '11px', color: '#c4829a', margin: 0 }}>{v.pros} professionnelles</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Progression() {
  const etapes = [
    { num: '01', titre: 'Crée ton compte', desc: 'En 2 minutes, sans carte bancaire' },
    { num: '02', titre: 'Personnalise ta page', desc: 'Photo, services, tarifs, disponibilités' },
    { num: '03', titre: 'Partage ton lien', desc: 'Sur Instagram, WhatsApp, partout' },
    { num: '04', titre: 'Reçois tes RDV', desc: 'Tes clientes réservent, tu te concentres sur ton art' },
  ]
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % etapes.length), 2500)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        {etapes.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < etapes.length - 1 ? 1 : 'none' }}>
            <div onClick={() => setActive(i)} style={{
              width: '44px', height: '44px', borderRadius: '50%', cursor: 'none',
              background: active >= i ? '#c4829a' : '#ede8e3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '500',
              color: active >= i ? '#fff' : '#c4b5ac',
              transition: 'all 0.4s',
              boxShadow: active === i ? '0 0 0 6px rgba(196,130,154,0.2)' : 'none',
              flexShrink: 0,
            }}>
              {active > i ? '✓' : e.num}
            </div>
            {i < etapes.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: '#ede8e3', margin: '0 8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: active > i ? '100%' : '0%',
                  background: '#c4829a', transition: 'width 0.5s ease',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: '16px', padding: '32px', textAlign: 'left' }}>
        <p style={{ fontSize: '11px', color: '#c4829a', letterSpacing: '3px', marginBottom: '12px' }}>ÉTAPE {etapes[active].num}</p>
        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '400', marginBottom: '10px', color: '#2c2c2c' }}>{etapes[active].titre}</h4>
        <p style={{ fontSize: '14px', color: '#9c9189', fontWeight: '300', lineHeight: '1.7' }}>{etapes[active].desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const statsRef = useRef()
  const [statsVisible, setStatsVisible] = useState(false)
  const count1 = useCountUp(500, 2000, statsVisible)
  const count2 = useCountUp(98, 2000, statsVisible)
  const count3 = useCountUp(14, 2000, statsVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const jouerCarillon = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const playChime = (freq, startTime, duration, volume = 0.12) => {
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, startTime)
          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.008)
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
          osc.connect(gainNode)
          gainNode.connect(ctx.destination)
          osc.start(startTime)
          osc.stop(startTime + duration)
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(freq * 2, startTime)
          gain2.gain.setValueAtTime(0, startTime)
          gain2.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.008)
          gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.5)
          osc2.connect(gain2)
          gain2.connect(ctx.destination)
          osc2.start(startTime)
          osc2.stop(startTime + duration)
        }
        const t = ctx.currentTime + 0.3
        playChime(1046, t, 2.5)
        playChime(1318, t + 0.55, 2.2)
        playChime(1568, t + 1.1, 2.8)
        playChime(2093, t + 1.65, 2.0, 0.07)
      } catch (e) {}
    }

    window.addEventListener('click', jouerCarillon, { once: true })
    return () => window.removeEventListener('click', jouerCarillon)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', margin: 0, padding: 0, background: '#faf8f5', color: '#2c2c2c', overflowX: 'hidden', cursor: 'none' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .btn-sakura {
          padding: 14px 36px; background: #c4829a; color: #fff;
          border: none; border-radius: 40px; font-size: 13px;
          letter-spacing: 1.5px; cursor: none;
          font-family: 'Inter', sans-serif;
          position: relative; overflow: hidden;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-sakura::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg); transition: left 0.5s;
        }
        .btn-sakura:hover::after { left: 150%; }
        .btn-sakura:hover { transform: translateY(-2px); background: #b57089; }
        .btn-outline {
          padding: 13px 32px; background: transparent; color: #c4829a;
          border: 1px solid #c4829a; border-radius: 40px; font-size: 13px;
          letter-spacing: 1.5px; cursor: none;
          font-family: 'Inter', sans-serif; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .btn-outline::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(196,130,154,0.2), transparent);
          transform: skewX(-20deg); transition: left 0.5s;
        }
        .btn-outline:hover::after { left: 150%; }
        .btn-outline:hover { background: rgba(196,130,154,0.08); transform: translateY(-2px); }
        .card-zen {
          background: #fff; border: 1px solid #ede8e3;
          border-radius: 16px; padding: 36px 28px;
          transition: transform 0.4s, box-shadow 0.4s, border-color 0.4s;
        }
        .card-zen:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(196,130,154,0.14);
          border-color: #c4829a;
        }
      `}</style>

      <CustomCursor />
      <Petales />

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px', borderBottom: '1px solid #ede8e3', position: 'sticky', top: 0, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: '400', letterSpacing: '2px' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h1>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/login')}>Connexion</button>
          <button className="btn-sakura" onClick={() => navigate('/register')}>Rejoindre Glowi</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(180deg, #fdf6f8 0%, #faf8f5 100%)', position: 'relative' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '24px' }}>
            La plateforme des pros du bien-être
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '76px', fontWeight: '300', lineHeight: '1.15', marginBottom: '24px', maxWidth: '800px' }}>
            Votre art mérite<br />
            <em style={{ color: '#c4829a' }}>une vitrine</em><br />
            à sa hauteur
          </h2>
          <p style={{ fontSize: '16px', color: '#9c9189', maxWidth: '460px', lineHeight: '1.9', marginBottom: '48px', fontWeight: '300', margin: '0 auto 48px' }}>
            Ongleries, lash artists, headspa, massages — gérez vos réservations avec sérénité.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-sakura" onClick={() => navigate('/register')}>Créer ma page Glowi</button>
            <button className="btn-outline" onClick={() => navigate('/login')}>Voir une démo</button>
          </div>
          <p style={{ fontSize: '12px', color: '#c4b5ac', marginTop: '24px', letterSpacing: '1px' }}>14 jours offerts · Sans engagement · Sans carte bancaire</p>
        </AnimatedSection>
      </div>

      {/* STATS */}
      <div ref={statsRef} style={{ padding: '80px 60px', background: '#fff', borderTop: '1px solid #ede8e3', borderBottom: '1px solid #ede8e3' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {[
            { valeur: count1, suffix: '+', label: 'Professionnelles actives' },
            { valeur: count2, suffix: '%', label: 'De satisfaction client' },
            { valeur: count3, suffix: '', label: 'Jours d\'essai offerts' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, minWidth: '180px', background: '#fdf6f8', border: '1px solid #ede8e3', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', fontWeight: '300', color: '#c4829a', margin: '0 0 8px' }}>
                {stat.valeur}{stat.suffix}
              </p>
              <p style={{ fontSize: '13px', color: '#9c9189', fontWeight: '300' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESSION */}
      <div style={{ padding: '100px 60px', textAlign: 'center' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Comment ça marche</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: '300', marginBottom: '56px' }}>
            Rejoindre Glowi en<br /><em style={{ color: '#c4829a' }}>4 étapes simples</em>
          </h3>
        </AnimatedSection>
        <AnimatedSection delay={0.2}><Progression /></AnimatedSection>
      </div>

      {/* CARTE */}
      <div style={{ padding: '100px 60px', textAlign: 'center', background: '#fdf6f8' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Nos professionnelles</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: '300', marginBottom: '16px' }}>
            Glowi partout<br /><em style={{ color: '#c4829a' }}>en France</em>
          </h3>
          <p style={{ fontSize: '14px', color: '#9c9189', marginBottom: '48px', fontWeight: '300' }}>Survolez une ville pour découvrir les pros disponibles</p>
        </AnimatedSection>
        <AnimatedSection delay={0.2}><CarteVilles /></AnimatedSection>
      </div>

      {/* PROBLÈME */}
      <div style={{ padding: '100px 60px', textAlign: 'center' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Le constat</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: '300', marginBottom: '56px' }}>
            Vous gérez encore vos RDV<br />par Instagram ?
          </h3>
        </AnimatedSection>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { icone: '🌿', titre: 'Des heures perdues', texte: 'Des échanges sans fin en DM pour trouver un créneau disponible' },
            { icone: '🌸', titre: 'Des revenus envolés', texte: 'Chaque RDV manqué représente en moyenne 50€ de perte sèche' },
            { icone: '🪷', titre: 'Sans professionnalité', texte: 'Vos clientes méritent une expérience à la hauteur de votre talent' },
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="card-zen" style={{ maxWidth: '270px', textAlign: 'left' }}>
                <div style={{ fontSize: '28px', marginBottom: '20px' }}>{item.icone}</div>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '400', marginBottom: '12px' }}>{item.titre}</h4>
                <p style={{ fontSize: '14px', color: '#9c9189', lineHeight: '1.8', fontWeight: '300' }}>{item.texte}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* SOLUTION */}
      <div style={{ padding: '100px 60px', textAlign: 'center', background: '#fdf6f8' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Ce que Glowi vous offre</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: '300', marginBottom: '56px' }}>
            Tout ce dont vous avez besoin,<br /><em style={{ color: '#c4829a' }}>enfin réuni</em>
          </h3>
        </AnimatedSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { numero: '01', titre: 'Page pro sur-mesure', texte: 'Une vitrine élégante à votre image, partageable en un lien' },
            { numero: '02', titre: 'Agenda en ligne', texte: 'Vos clientes réservent 24h/24 sans vous déranger' },
            { numero: '03', titre: 'Rappels automatiques', texte: 'SMS 24h avant chaque RDV — fini les lapins' },
            { numero: '04', titre: 'Fiche cliente', texte: 'Historique, préférences, allergies — tout en mémoire' },
            { numero: '05', titre: 'Tableau de bord', texte: 'Vos revenus et votre activité en temps réel' },
            { numero: '06', titre: 'Avis clients', texte: 'Collectez vos avis pour rassurer les nouvelles clientes' },
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="card-zen" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '11px', color: '#c4829a', letterSpacing: '3px', marginBottom: '16px' }}>{item.numero}</p>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: '400', marginBottom: '10px' }}>{item.titre}</h4>
                <p style={{ fontSize: '13px', color: '#9c9189', lineHeight: '1.8', fontWeight: '300' }}>{item.texte}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* TARIFS */}
      <div style={{ padding: '100px 60px', textAlign: 'center' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '16px' }}>Tarifs</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: '300', marginBottom: '56px' }}>
            Un loyer, une place sur Glowi
          </h3>
        </AnimatedSection>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { nom: 'Starter', prix: '19', features: ['Page pro personnalisée', 'Agenda en ligne', '5 RDV / mois'], featured: false },
            { nom: 'Pro', prix: '29', features: ['RDV illimités', 'Rappels SMS clients', 'Fiche cliente & stats', 'Avis clients'], featured: true },
            { nom: 'Premium', prix: '49', features: ['Tout le plan Pro', 'Mise en avant plateforme', 'Widget Instagram', 'Support prioritaire'], featured: false },
          ].map((plan, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div style={{
                background: plan.featured ? '#fdf6f8' : '#fff',
                border: plan.featured ? '1.5px solid #c4829a' : '1px solid #ede8e3',
                borderRadius: '20px', padding: '40px 32px', minWidth: '240px', textAlign: 'left',
                position: 'relative',
                boxShadow: plan.featured ? '0 8px 40px rgba(196,130,154,0.15)' : 'none',
              }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#c4829a', color: '#fff', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '5px 18px', borderRadius: '20px' }}>
                    Le plus choisi
                  </div>
                )}
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c4b5ac', textTransform: 'uppercase', marginBottom: '20px' }}>{plan.nom}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '32px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', fontWeight: '300', color: plan.featured ? '#c4829a' : '#2c2c2c' }}>{plan.prix}€</span>
                  <span style={{ fontSize: '13px', color: '#c4b5ac' }}>/mois</span>
                </div>
                <div style={{ borderTop: '1px solid #ede8e3', paddingTop: '24px', marginBottom: '32px' }}>
                  {plan.features.map((f, j) => (
                    <p key={j} style={{ fontSize: '13px', color: '#9c9189', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '300' }}>
                      <span style={{ color: '#c4829a' }}>✦</span> {f}
                    </p>
                  ))}
                </div>
                <button onClick={() => navigate('/register')} className={plan.featured ? 'btn-sakura' : 'btn-outline'} style={{ width: '100%' }}>
                  Commencer
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ padding: '100px 60px', textAlign: 'center', background: 'linear-gradient(180deg, #fdf6f8 0%, #faf8f5 100%)', borderTop: '1px solid #ede8e3' }}>
        <AnimatedSection>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#c4829a', textTransform: 'uppercase', marginBottom: '24px' }}>Prête à rejoindre Glowi ?</p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', fontWeight: '300', marginBottom: '16px', lineHeight: '1.2' }}>
            Votre talent mérite<br /><em style={{ color: '#c4829a' }}>mieux que des DMs</em>
          </h3>
          <p style={{ fontSize: '14px', color: '#9c9189', marginBottom: '40px', fontWeight: '300' }}>Rejoignez les professionnelles qui ont déjà fait le choix de Glowi</p>
          <button className="btn-sakura" onClick={() => navigate('/register')}>Créer ma page gratuitement</button>
        </AnimatedSection>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #ede8e3', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f5' }}>
        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: '400' }}>
          Glo<span style={{ color: '#c4829a' }}>wi</span>
        </h4>
        <p style={{ fontSize: '12px', color: '#c4b5ac', letterSpacing: '1px' }}>© 2025 Glowi — Tous droits réservés</p>
      </div>

    </div>
  )
}