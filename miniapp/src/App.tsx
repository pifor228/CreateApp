import { useMemo, useState } from 'react'
import './App.css'

type Category = 'Керамика' | 'Текстиль' | 'Для дома' | 'Свет'

type Product = {
  id: number
  name: string
  category: Category
  price: number
  image: string
  badge?: string
}

type CartItem = {
  productId: number
  quantity: number
}

const categories = ['Всё', 'Керамика', 'Текстиль', 'Для дома', 'Свет'] as const

const products: Product[] = [
  {
    id: 1,
    name: 'Ваза «Тихое утро»',
    category: 'Керамика',
    price: 3200,
    image:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85',
    badge: 'Хит',
  },
  {
    id: 2,
    name: 'Льняная скатерть',
    category: 'Текстиль',
    price: 4900,
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    name: 'Чашка «Облако»',
    category: 'Керамика',
    price: 1800,
    image:
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=85',
    badge: 'Новинка',
  },
  {
    id: 4,
    name: 'Подсвечник «Форма»',
    category: 'Для дома',
    price: 2400,
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    name: 'Настольная лампа',
    category: 'Свет',
    price: 8700,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
    badge: 'Мало осталось',
  },
  {
    id: 6,
    name: 'Плед «Тёплый песок»',
    category: 'Текстиль',
    price: 6200,
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 7,
    name: 'Керамическая ваза',
    category: 'Керамика',
    price: 3900,
    image:
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 8,
    name: 'Диффузор «Лес после дождя»',
    category: 'Для дома',
    price: 2900,
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85',
  },
]

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat('ru-RU').format(price)} ₽`

function App() {
  const [activeCategory, setActiveCategory] = useState<string>('Всё')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru')

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'Всё' || product.category === activeCategory
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase('ru').includes(query) ||
        product.category.toLocaleLowerCase('ru').includes(query)
      const matchesFavorite =
        !favoritesOnly || favorites.includes(product.id)

      return matchesCategory && matchesSearch && matchesFavorite
    })
  }, [activeCategory, favorites, favoritesOnly, search])

  const cartProducts = cart.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  })
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  function addToCart(productId: number) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === productId,
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { productId, quantity: 1 }]
    })
    setCartOpen(true)
  }

  function changeQuantity(productId: number, change: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function toggleFavorite(productId: number) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(productId)
        ? currentFavorites.filter((id) => id !== productId)
        : [...currentFavorites, productId],
    )
  }

  return (
    <main>
      <div className="announcement">
        <span>Предметный дизайн для современного дома</span>
        <span className="announcement-note">Доставка по России · бережная упаковка</span>
      </div>

      <header className="store-header">
        <a className="store-logo" href="#home" aria-label="Дом тихо — на главную">
          тихо<span>.</span>
        </a>
        <nav className="store-nav" aria-label="Основная навигация">
          <a href="#catalog">Каталог</a>
          <a href="#story">Наша история</a>
          <a href="#footer">Контакты</a>
        </nav>
        <button
          className="cart-trigger"
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Открыть корзину, товаров: ${cartCount}`}
        >
          Корзина <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <section className="shop-hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Коллекция предметов для дома</p>
          <h1>Форма.<br /><em>Материал. Атмосфера.</em></h1>
          <p className="hero-description">
            Предметы, которые сочетают выразительный дизайн и повседневную
            функциональность. Для пространства, в котором хочется быть.
          </p>
          <a className="button button--dark" href="#catalog">
            Смотреть коллекцию <span aria-hidden="true">↗</span>
          </a>
          <div className="hero-details">
            <span>Независимые мастерские</span>
            <span>Натуральные материалы</span>
            <span>Доставка по России</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=90"
            alt="Современная светлая гостиная в натуральной цветовой гамме"
          />
          <div className="hero-image-caption">
            <span>Коллекция для дома</span>
            <strong>Спокойствие в деталях</strong>
          </div>
          <span className="hero-stamp" aria-hidden="true">ТИХО<br />ДОМА</span>
        </div>
      </section>

      <section className="catalog section-wrap" id="catalog">
        <div className="catalog-heading">
          <div>
            <p className="section-label"><span>01</span> Коллекция сезона</p>
            <h2>Продуманные детали <em>для дома.</em></h2>
          </div>
          <p className="catalog-intro">
            Фактурные материалы, лаконичные формы и внимание к деталям.
          </p>
        </div>

        <div className="catalog-controls">
          <div className="category-list" aria-label="Категории товаров">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'category-button is-active' : 'category-button'}
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
            <button
              className={`category-button favorites-filter${favoritesOnly ? ' is-active' : ''}`}
              type="button"
              onClick={() => setFavoritesOnly((current) => !current)}
              aria-pressed={favoritesOnly}
              aria-label={`Показать избранное, выбрано ${favorites.length}`}
            >
              <span aria-hidden="true">♡</span> Избранное
              {favorites.length > 0 && <span className="favorites-count">{favorites.length}</span>}
            </button>
          </div>
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Найти вещь..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Поиск по товарам"
            />
          </label>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className={`product-image product-image--${index % 4}`}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <button
                    className={`favorite-button${favorites.includes(product.id) ? ' is-favorite' : ''}`}
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={`${favorites.includes(product.id) ? 'Убрать из избранного' : 'Добавить в избранное'}: ${product.name}`}
                    aria-pressed={favorites.includes(product.id)}
                  >
                    <span aria-hidden="true">{favorites.includes(product.id) ? '♥' : '♡'}</span>
                  </button>
                  <button
                    className="quick-add"
                    type="button"
                    onClick={() => addToCart(product.id)}
                    aria-label={`Добавить в корзину: ${product.name}`}
                  >
                    +
                  </button>
                </div>
                <div className="product-info">
                  <div>
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <span className="product-price">{formatPrice(product.price)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-search">
            <span aria-hidden="true">{favoritesOnly && favorites.length === 0 ? '♡' : '⌕'}</span>
            <p>{favoritesOnly && favorites.length === 0 ? 'Пока нет избранных вещей' : 'Ничего не нашли'}</p>
            <button type="button" onClick={() => { setSearch(''); setActiveCategory('Всё'); setFavoritesOnly(false) }}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </section>

      <section className="story-section" id="story">
        <div className="story-mark" aria-hidden="true">т.</div>
        <div className="story-copy">
          <p className="section-label"><span>02</span> О магазине</p>
          <h2>Меньше случайного.<br /><em>Больше вашего.</em></h2>
          <p>
            Мы собираем предметы от небольших мастерских и независимых авторов.
            Каждую вещь выбираем за качество, долговечность и ясную идею.
          </p>
          <a href="#catalog" className="text-link">Перейти в каталог <span aria-hidden="true">→</span></a>
        </div>
        <div className="story-image">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85"
            alt="Тёплый уголок дома с предметами ручной работы"
            loading="lazy"
          />
        </div>
      </section>

      <footer className="store-footer" id="footer">
        <a className="store-logo" href="#home">тихо<span>.</span></a>
        <p>Продуманные предметы для повседневной жизни.</p>
        <a href="mailto:hello@tiho.store">hello@tiho.store <span aria-hidden="true">↗</span></a>
        <span className="copyright">© тихо, 2025</span>
      </footer>

      {cartOpen && (
        <div className="cart-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCartOpen(false)
        }}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="cart-heading">
              <div>
                <p className="section-label">Ваш выбор</p>
                <h2 id="cart-title">Корзина <span>({cartCount})</span></h2>
              </div>
              <button
                className="cart-close"
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Закрыть корзину"
              >
                ×
              </button>
            </div>
            {cartProducts.length ? (
              <>
                <div className="cart-items">
                  {cartProducts.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={item.image} alt="" />
                      <div className="cart-item-info">
                        <p>{item.category}</p>
                        <h3>{item.name}</h3>
                        <strong>{formatPrice(item.price)}</strong>
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label={`Уменьшить количество: ${item.name}`}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label={`Увеличить количество: ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="cart-summary">
                  <div><span>Итого</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <p>Доставка рассчитывается при оформлении</p>
                  <button className="button button--dark checkout-button" type="button" disabled>
                    Скоро здесь будет оформление
                  </button>
                  <button className="continue-shopping" type="button" onClick={() => setCartOpen(false)}>
                    Продолжить покупки
                  </button>
                </div>
              </>
            ) : (
              <div className="cart-empty">
                <span aria-hidden="true">♡</span>
                <p>Здесь пока тихо</p>
                <span>Добавьте в корзину что-нибудь для дома.</span>
                <button className="button button--dark" type="button" onClick={() => setCartOpen(false)}>
                  Перейти к покупкам
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}

export default App
