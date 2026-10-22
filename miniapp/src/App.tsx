import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Category = 'Керамика' | 'Текстиль' | 'Для дома' | 'Свет'

type Product = {
  id: number
  name: string
  category: Category
  price: number
  image: string
  stock: number
  badge?: string
}

type CartItem = {
  productId: number
  quantity: number
}

const categories = ['Всё', 'Керамика', 'Текстиль', 'Для дома', 'Свет'] as const

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat('ru-RU').format(price)} ₽`

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Всё')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch('/api/products/', { signal: controller.signal })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Не удалось загрузить каталог.')
        }
        setProducts(data.products)
        setCsrfToken(data.csrfToken)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setProductsError(error instanceof Error ? error.message : 'Ошибка загрузки каталога.')
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false)
      }
    }

    void loadProducts()
    return () => controller.abort()
  }, [])

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
  }, [activeCategory, favorites, favoritesOnly, products, search])

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
    const product = products.find((entry) => entry.id === productId)
    const currentQuantity =
      cart.find((item) => item.productId === productId)?.quantity ?? 0
    if (!product || currentQuantity >= product.stock) return

    setOrderError('')
    setOrderSuccess(null)
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
    const product = products.find((entry) => entry.id === productId)
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(
                  product?.stock ?? item.quantity,
                  item.quantity + change,
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOrderSubmitting(true)
    setOrderError('')

    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          customerName: formData.get('customerName'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Не удалось оформить заказ.')
      }
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          data.products.find((updatedProduct: Product) => updatedProduct.id === product.id) ??
          product,
        ),
      )
      setOrderSuccess(data.order.id)
      setCart([])
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Ошибка оформления заказа.')
    } finally {
      setOrderSubmitting(false)
    }
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

        {productsLoading ? (
          <div className="catalog-message" role="status">Загружаем каталог…</div>
        ) : productsError ? (
          <div className="catalog-message catalog-message--error" role="alert">
            {productsError}
          </div>
        ) : visibleProducts.length > 0 ? (
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
                    disabled={
                      product.stock === 0 ||
                      (cart.find((item) => item.productId === product.id)?.quantity ?? 0) >= product.stock
                    }
                    aria-label={`Добавить в корзину: ${product.name}`}
                  >
                    {product.stock === 0 ? 'Нет в наличии' : '+'}
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
            {orderSuccess ? (
              <div className="order-success" role="status">
                <span aria-hidden="true">✓</span>
                <h3>Заказ №{orderSuccess} принят</h3>
                <p>Мы свяжемся с вами по телефону для подтверждения.</p>
                <button
                  className="button button--dark"
                  type="button"
                  onClick={() => {
                    setOrderSuccess(null)
                    setCartOpen(false)
                  }}
                >
                  Продолжить покупки
                </button>
              </div>
            ) : cartProducts.length ? (
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
                            disabled={item.quantity >= item.stock}
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
                  <p>Оплата согласовывается после подтверждения заказа.</p>
                  <form className="checkout-form" onSubmit={submitOrder}>
                    <label>
                      Ваше имя
                      <input name="customerName" autoComplete="name" required minLength={2} maxLength={120} />
                    </label>
                    <label>
                      Телефон
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+7 999 123-45-67"
                        required
                        pattern="[+()0-9 .-]{7,24}"
                        title="Введите корректный номер телефона"
                      />
                    </label>
                    <label>
                      Адрес доставки
                      <input name="address" autoComplete="street-address" required minLength={5} maxLength={300} />
                    </label>
                    {orderError && <p className="checkout-error" role="alert">{orderError}</p>}
                    <button className="button button--dark checkout-button" type="submit" disabled={orderSubmitting || !csrfToken}>
                      {orderSubmitting ? 'Отправляем заказ…' : 'Оформить заказ'}
                    </button>
                  </form>
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
