import { useMemo, useState } from "react";
import type { Product } from "./types/product";
import { initialProducts } from "./data/products";
import "./App.css";

type CartItem = {
  productId: number;
  quantity: number;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const emptyForm = {
  name: "",
  category: "Electronics",
  description: "",
  specifications: "",
  rating: "4.5",
  price: "",
  quantity: "",
  image: "",
};

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products],
  );
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addToCart(product: Product) {
    if (product.quantity < 1) {
      setMessage("OUT OF STOCK. The inventory gods said no.");
      return;
    }

    const currentItem = cart.find((item) => item.productId === product.id);
    const currentQuantity = currentItem?.quantity ?? 0;

    if (currentQuantity >= product.quantity) {
      setMessage("That's all the stock we have. Don't summon more.");
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.productId === product.id,
      );
if (existing) {
        return previous.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previous, { productId: product.id, quantity: 1 }];
    });

    setMessage('${product.name} added. The stock goblin approves.');
  }

  function changeCartQuantity(productId: number, change: number) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((previous) =>
      previous
        .map((item) => {
          if (item.productId !== productId) return item;

          return {
            ...item,
            quantity: Math.min(
              product.quantity,
              item.quantity + change,
            ),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const rating = Number(form.rating);
if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.specifications.trim() ||
      !form.image.trim() ||
      form.price === "" ||
      form.quantity === "" ||
      !Number.isFinite(price) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(rating) ||
      price <= 0 ||
      quantity < 0 ||
      !Number.isInteger(quantity) ||
      rating < 0 ||
      rating > 5
    ) {
      setMessage(
        "INVALID PRODUCT. Fill every field; use a positive price, whole-number stock, and rating from 0 to 5.",
      );
      return;
    }

    const newProduct: Product = {
      id: Math.max(0, ...products.map((product) => product.id)) + 1,
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      specifications: form.specifications.trim(),
      rating,
      price,
      quantity,
      image: form.image.trim(),
    };

    setProducts((previous) => [...previous, newProduct]);
    setCategory("All");
    setSearch("");
    setForm(emptyForm);
    setShowForm(false);
    setMessage('${newProduct.name} added to inventory. Absolute stock legend.');
  }
function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => window.scrollTo(0, 0)}>
          <span className="brand-icon">W!</span>
          <span>
            WHATTHESTOCK
            <small>INVENTORY CONTROL CENTER™</small>
          </span>
        </a>

        <div className="topbar-actions">
          <span className="live-label">
            <span className="live-dot" /> SYSTEM ONLINE
          </span>
          <button className="cart-button" onClick={() =>
            document.getElementById("inventory-cart")?.scrollIntoView({
              behavior: "smooth",
            })
          }>
            Cart <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR STOCK. YOUR CHAOS.</p>
          <h1>
            INVENTORY
            <br />
            <span>GOES BRRR.</span>
          </h1>
          <p className="hero-description">
            Manage the products. Track the stock. Avoid the inventory
            meltdown. Probably.
            </p>
          <button
            className="primary-button"
            onClick={() =>
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore inventory ↘
          </button>
        </div>

        <div className="hero-art" aria-label="Inventory status illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-package">📦</div>
          <span className="floating-tag tag-top">STOCK? CHECK.</span>
          <span className="floating-tag tag-bottom">NO THOUGHTS. JUST SKUs.</span>
          <span className="hero-star">✳</span>
        </div>

        <div className="hero-bottom">
          <span>EST. WHEN THE STOCK WENT MISSING</span>
          <span>VERSION 1.0 / CHAOS MODE</span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Inventory summary">
        <article className="stat-card">
          <span>TOTAL PRODUCTS</span>
          <strong>{products.length.toString().padStart(2, "0")}</strong>
          <small>Certified stock objects</small>
        </article>
        <article className="stat-card">
          <span>UNITS IN STOCK</span>
          <strong>{products.reduce((sum, p) => sum + p.quantity, 0)}</strong>
          <small>Physical reality check</small>
          </article>
        <article className="stat-card warning-stat">
          <span>LOW STOCK ALERTS</span>
          <strong>{products.filter((p) => p.quantity < 5).length}</strong>
          <small>Below 5 units. Yikes.</small>
        </article>
        <article className="stat-card">
          <span>CART VALUE</span>
          <strong className="money-stat">{money(cartTotal)}</strong>
          <small>Subtotal of cart items</small>
        </article>
      </section>

      {message && (
        <div className="status-message" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <section className="inventory-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE STUFF WE HAVE</p>
            <h2>THE INVENTORY<span>.</span></h2>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close form ×" : "+ Add product"}
          </button>
        </div>

        {showForm && (
          <form className="product-form" onSubmit={handleAddProduct}>
            <div className="form-heading">
              <p className="eyebrow">NEW ITEM DETECTED</p>
              <h3>Add to the chaos.</h3>
            </div>

            <div className="form-grid">
              <label>
                Product name *
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. Suspiciously Good Mouse"
                />
              </label>
              <label>
                Category *
                <input
                  required
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  placeholder="e.g. Electronics"
                />
              </label>
              <label className="wide-field">
                Description *
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="What does this product do?"
                />
              </label>
              <label className="wide-field">
                Specifications *
                <textarea
                  required
                  value={form.specifications}
                  onChange={(e) =>
                    updateForm("specifications", e.target.value)
                  }
                  placeholder="Features, size, materials..."
                />
              </label>
              <label>
                Price (PHP) *
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="999"
                />
              </label>
              <label>
                Quantity *
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                  placeholder="10"
                />
              </label>
              <label>
                Rating (0–5) *
                <input
                  required
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => updateForm("rating", e.target.value)}
                />
              </label>
              <label>
                Image URL *
                <input
                  required
                  type="url"
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </label>
            </div>

            <button className="primary-button" type="submit">
              Save product ✓
            </button>
            <p className="form-note">* All fields are required.</p>
          </form>
        )}

        <div className="toolbar">
          <div className="category-tabs" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "category-tab active" : "category-tab"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            aria-label="Search products"
            placeholder="Search the chaos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="results-line">
          <span>SHOWING {filteredProducts.length} ITEMS</span>
          <span>LOW STOCK = LESS THAN 5 UNITS</span>
        </div>
<div className="product-grid">
          {filteredProducts.map((product, index) => {
            const cartItem = cart.find((item) => item.productId === product.id);

            return (
              <article className="product-card" key={product.id}>
                <button
                  className="product-image-button"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`View details for ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                  <span className="product-number">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  {product.quantity < 5 && (
                    <span className="low-stock-badge">⚠ LOW STOCK</span>
                  )}
                </button>

                <div className="product-info">
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span>★ {product.rating.toFixed(1)}</span>
                  </div>
                  <button
                    className="product-name"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </button>
                  <p
                  className="product-description">{product.description}</p>
                  <div className="product-stock">
                    <span>IN STOCK</span>
                    <strong className={product.quantity < 5 ? "stock-low" : ""}>
                      {product.quantity} units
                    </strong>
                  </div>
                  <div className="product-bottom">
                    <div>
                      <strong className="product-price">{money(product.price)}</strong>
                      <small>per unit</small>
                    </div>
                    <button
                      className="add-button"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity === 0 ? "Sold out" : "+ Add"}
                    </button>
                  </div>

                  {cartItem && (
                    <div className="card-quantity">
                      <span>IN CART</span>
                      <div className="quantity-controls">
                        <button
                          onClick={() => changeCartQuantity(product.id, -1)}
                          aria-label={`Remove one ${product.name}`}
                        >
                          −
                        </button>
                        <strong>{cartItem.quantity}</strong>
                        <button
                          onClick={() => changeCartQuantity(product.id, 1)}
                          disabled={cartItem.quantity
                            >= product.quantity}

                          aria-label={`Add one ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="line-subtotal">
                        {money(product.price * cartItem.quantity)}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <span>¯\_(ツ)_/¯</span>
            <h3>No products found.</h3>
            <p>Try another search or category. The stock is hiding.</p>
            <button
              className="primary-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section className="cart-section" id="inventory-cart">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE DAMAGE REPORT</p>
            <h2>YOUR CART<span>.</span></h2>
          </div>
          <span className="cart-count-label">{cartCount} UNITS
            SELECTED</span>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <span>🛒</span>
            <p>Your cart is empty. Add something before the void consumes us.</p>
          </div>
        ) : (
          <div className="cart-table-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>PRICE</th>
                  <th>QUANTITY</th>
                  <th>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <tr key={item.productId}>
                      <td>{product.name}</td>
                      <td>{money(product.price)}</td>
                      <td>
                        <div className="quantity-controls">
                          <button onClick={() => changeCartQuantity(product.id, -1)}>
                            −
                          </button>
                          <strong>{item.quantity}</strong>
                          <button
                            onClick={() => changeCartQuantity(product.id, 1)}
                            disabled={item.quantity >= product.quantity}
                            >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="table-subtotal">
                        {money(product.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>TOTAL</td>
                  <td>{money(cartTotal)}</td>
                </tr>
              </tfoot>
            </table>
            <button className="clear-cart-button" onClick={() => setCart([])}>
              Clear cart
            </button>
          </div>
        )}
      </section>

      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
          role="presentation"
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-product-name"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
            ×
            </button>
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <div className="modal-content">
              <p className="eyebrow">{selectedProduct.category}</p>
              <h2 id="modal-product-name">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <h3>Specifications</h3>
              <p>{selectedProduct.specifications}</p>
              <p>Rating: ★ {selectedProduct.rating.toFixed(1)} / 5</p>
              <p>
                Stock: <strong>{selectedProduct.quantity} units</strong>
                {selectedProduct.quantity < 5 && (
                  <span className="stock-low"> — LOW STOCK</span>
                )}
              </p>
              <strong className="modal-price">{money(selectedProduct.price)}</strong>
              <button
                className="primary-button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.quantity === 0}
              >
                + Add to cart
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-icon">W!</span>
          <span>WHATTHESTOCK<small>STOCK HAPPENS.</small></span>
        </a>
        <span>MADE FOR THE CHAOS. © 2026</span>
      </footer>
      </main>
  );
}

export default App;

