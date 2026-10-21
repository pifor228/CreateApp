import { useState } from 'react'
import './App.css'

const trips = [
  {
    title: 'Алтай без спешки',
    location: 'Россия · 7 дней',
    price: 'от 68 000 ₽',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
    alt: 'Горное озеро и долина на рассвете',
    className: 'trip-card--altai',
  },
  {
    title: 'Тропами Дагестана',
    location: 'Россия · 5 дней',
    price: 'от 52 000 ₽',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
    alt: 'Скалистые горы в мягком вечернем свете',
    className: 'trip-card--dagestan',
  },
  {
    title: 'Карелия на выдохе',
    location: 'Россия · 4 дня',
    price: 'от 39 000 ₽',
    image:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
    alt: 'Солнечный свет в тихом хвойном лесу',
    className: 'trip-card--karelia',
  },
]

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={diagonal ? 'arrow-icon arrow-icon--diagonal' : 'arrow-icon'}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M3.5 10h12m-5-5 5 5-5 5" />
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Тихо — на главную" onClick={closeMenu}>
          тихо<span>.</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'main-nav main-nav--open' : 'main-nav'} aria-label="Главная навигация">
          <a href="#trips" onClick={closeMenu}>Путешествия</a>
          <a href="#about" onClick={closeMenu}>О нас</a>
          <a href="#journal" onClick={closeMenu}>Журнал</a>
          <a className="nav-contact" href="mailto:hello@tiho.travel" onClick={closeMenu}>
            Связаться <ArrowIcon diagonal />
          </a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Авторские путешествия по России</p>
          <h1>Ближе к природе.<br /><em>Ближе к себе.</em></h1>
          <p className="hero-description">
            Небольшие путешествия в места, где можно замедлиться, вдохнуть полной грудью и услышать себя.
          </p>
          <div className="hero-actions">
            <a className="button button--dark" href="#trips">
              Выбрать путешествие <ArrowIcon />
            </a>
            <span className="hero-note">Маленькие группы · Большие впечатления</span>
          </div>
          <div className="hero-foot">
            <span>56° 14′ 12.8″ N</span>
            <span className="hero-foot-line" />
            <span>Путешествуем иначе</span>
          </div>
        </div>

        <div className="hero-visual">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=90"
            alt="Тихая горная долина, залитая мягким утренним светом"
          />
          <div className="image-shade" />
          <div className="hero-image-caption">
            <span className="caption-kicker">Место, которое останется с тобой</span>
            <span className="caption-title">Укок, Алтай</span>
          </div>
          <div className="floating-note">
            <span className="note-mark">✳</span>
            <span>Не маршрут.<br />Состояние.</span>
          </div>
          <div className="image-index"><span>01</span> / 04</div>
        </div>
        <a href="#trips" className="scroll-cue" aria-label="Прокрутить к путешествиям">
          <span />
        </a>
      </section>

      <section className="intro section-wrap" id="about">
        <div className="section-label"><span>01</span> Наш подход</div>
        <div className="intro-content">
          <h2>Иногда лучшее,<br />что можно сделать — <em>уехать.</em></h2>
          <div className="intro-aside">
            <p>Мы собираем поездки для тех, кому хочется не просто увидеть новое место, а по-настоящему в нём побыть.</p>
            <a className="text-link" href="#journal">Узнать нашу историю <ArrowIcon /></a>
          </div>
        </div>
        <div className="value-row">
          <div className="value-item">
            <span className="value-number">01</span>
            <h3>Без толпы</h3>
            <p>До 8 человек в группе — чтобы сохранить ощущение свободы.</p>
          </div>
          <div className="value-item">
            <span className="value-number">02</span>
            <h3>С местными</h3>
            <p>Показываем места глазами тех, кто называет их домом.</p>
          </div>
          <div className="value-item">
            <span className="value-number">03</span>
            <h3>С заботой</h3>
            <p>Продумываем всё важное, оставляя место для неожиданного.</p>
          </div>
        </div>
      </section>

      <section className="trips-section" id="trips">
        <div className="section-wrap">
          <div className="trips-heading">
            <div>
              <div className="section-label"><span>02</span> Ближайшие поездки</div>
              <h2>Выдохни. <em>Мы всё придумали.</em></h2>
            </div>
            <a className="text-link trips-all" href="mailto:hello@tiho.travel">
              Все путешествия <ArrowIcon />
            </a>
          </div>
          <div className="trip-grid">
            {trips.map((trip, index) => (
              <a className={`trip-card ${trip.className}`} href="mailto:hello@tiho.travel" key={trip.title}>
                <div className="trip-image-wrap">
                  <img src={trip.image} alt={trip.alt} loading="lazy" />
                  <span className="trip-index">0{index + 1}</span>
                  <span className="trip-arrow"><ArrowIcon diagonal /></span>
                </div>
                <div className="trip-info">
                  <div>
                    <p className="trip-location">{trip.location}</p>
                    <h3>{trip.title}</h3>
                  </div>
                  <span className="trip-price">{trip.price}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="journal-section section-wrap" id="journal">
        <div className="journal-note">
          <span className="journal-star">✳</span>
          <p>Меньше планов.<br />Больше <em>жизни.</em></p>
        </div>
        <div className="journal-content">
          <div className="section-label"><span>03</span> Письма из пути</div>
          <h2>Сохраняем моменты,<br />которые <em>не хочется забыть.</em></h2>
          <p>Истории, маршруты и маленькие открытия — иногда полезно прочитать перед дорогой.</p>
          <a className="text-link" href="mailto:hello@tiho.travel">Заглянуть в журнал <ArrowIcon /></a>
        </div>
      </section>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#home">тихо<span>.</span></a>
        <p>Хорошие места. Свои люди. Твоё время.</p>
        <a href="mailto:hello@tiho.travel">hello@tiho.travel <ArrowIcon diagonal /></a>
        <span className="copyright">© тихо, 2025</span>
      </footer>
    </main>
  )
}

export default App
