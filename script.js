/* =========================================================
   KUCHU DESIGNS — PREMIUM INTERACTIVE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     GLOBAL STATE
     ========================================================= */

  let cart = JSON.parse(localStorage.getItem("kuchuCart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("kuchuWishlist")) || [];

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  /* =========================================================
     ELEMENTS
     ========================================================= */

  const body = document.body;

  const cartBtn = $(".cart-btn");
  const cartCount = $(".cart-count");
  const cartOverlay = $(".cart-overlay");
  const cartSidebar = $(".cart-sidebar");
  const cartClose = $(".cart-close");
  const cartItemsContainer = $(".cart-items");
  const cartTotal = $(".cart-total strong");
  const checkoutBtn = $(".checkout-btn");

  const modalOverlay = $(".modal-overlay");
  const quickViewModal = $(".quick-view-modal");
  const quickViewImage = $("#quickViewImage");
  const quickViewTitle = $("#quickViewTitle");
  const quickViewPrice = $("#quickViewPrice");
  const modalAddCart = $(".modal-add-cart");

  const toast = $(".toast-notification");
  const toastMessage = $(".toast-message");
  const toastClose = $(".toast-close");

  /* =========================================================
     TOAST NOTIFICATION
     ========================================================= */

  let toastTimer;

  function showToast(message, type = "success") {
    if (!toast) return;

    toastMessage.textContent = message;

    toast.classList.remove("success", "error", "show");
    toast.classList.add(type);

    // Force animation restart
    void toast.offsetWidth;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  if (toastClose) {
    toastClose.addEventListener("click", () => {
      toast.classList.remove("show");
    });
  }

  /* =========================================================
     SAVE DATA
     ========================================================= */

  function saveCart() {
    localStorage.setItem("kuchuCart", JSON.stringify(cart));
  }

  function saveWishlist() {
    localStorage.setItem("kuchuWishlist", JSON.stringify(wishlist));
  }

  /* =========================================================
     CART COUNT
     ========================================================= */

  function updateCartCount() {
    if (!cartCount) return;

    const totalItems = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cartCount.textContent = totalItems;

    if (totalItems > 0) {
      cartCount.classList.add("has-items");
    } else {
      cartCount.classList.remove("has-items");
    }
  }

  /* =========================================================
     ADD TO CART
     ========================================================= */

  function addToCart(product) {
    const existingProduct = cart.find(
      item => item.id === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += product.quantity || 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1
      });
    }

    saveCart();
    updateCartCount();
    renderCart();

    showToast(`${product.name} added to your cart`);

    // Small cart animation
    if (cartBtn) {
      cartBtn.classList.add("cart-bounce");

      setTimeout(() => {
        cartBtn.classList.remove("cart-bounce");
      }, 500);
    }
  }

  /* =========================================================
     PRODUCT CARD DATA
     ========================================================= */

  function getProductFromCard(card) {
    const button = $(".add-cart-btn", card);

    if (!button) return null;

    const productName =
      button.dataset.product ||
      $(".product-title", card)?.textContent.trim() ||
      $(".product-card h3", card)?.textContent.trim() ||
      "Kuchu Design";

    const priceValue =
      button.dataset.price ||
      $(".product-price", card)?.textContent.replace(/[^\d]/g, "") ||
      "0";

    const image =
      $(".product-image img", card)?.src ||
      $("img", card)?.src ||
      "";

    return {
      id:
        button.dataset.id ||
        productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),

      name: productName,

      price: Number(priceValue),

      image: image,

      quantity: 1
    };
  }

  /* =========================================================
     PRODUCT ADD BUTTONS
     ========================================================= */

  $$(".add-cart-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      const card = button.closest(".product-card");

      if (!card) return;

      const product = getProductFromCard(card);

      if (product) {
        addToCart(product);
      }
    });
  });

  /* =========================================================
     RENDER CART
     ========================================================= */

  function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛍️</div>

          <h3>Your cart is empty</h3>

          <p>
            Discover beautiful handcrafted kuchu designs
            and add your favorites here.
          </p>

          <button class="empty-cart-btn">
            Explore Designs
          </button>
        </div>
      `;

      if (cartTotal) {
        cartTotal.textContent = "₹0";
      }

      const emptyBtn = $(".empty-cart-btn");

      if (emptyBtn) {
        emptyBtn.addEventListener("click", () => {
          closeCart();

          document
            .querySelector("#collections")
            ?.scrollIntoView({
              behavior: "smooth"
            });
        });
      }

      return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach(item => {
      const cartItem = document.createElement("div");

      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img
            src="${item.image}"
            alt="${item.name}"
          >
        </div>

        <div class="cart-item-info">

          <h4>${item.name}</h4>

          <span class="cart-item-price">
            ₹${item.price.toLocaleString("en-IN")}
          </span>

          <div class="cart-item-actions">

            <div class="quantity-controls">

              <button
                class="quantity-btn decrease"
                data-id="${item.id}"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>${item.quantity}</span>

              <button
                class="quantity-btn increase"
                data-id="${item.id}"
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

            <button
              class="remove-cart-item"
              data-id="${item.id}"
            >
              Remove
            </button>

          </div>

        </div>
      `;

      cartItemsContainer.appendChild(cartItem);
    });

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (cartTotal) {
      cartTotal.textContent =
        `₹${total.toLocaleString("en-IN")}`;
    }

    attachCartEvents();
  }

  /* =========================================================
     CART ITEM CONTROLS
     ========================================================= */

  function attachCartEvents() {
    $$(".increase").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;

        const item = cart.find(item => item.id === id);

        if (item) {
          item.quantity++;
          saveCart();
          updateCartCount();
          renderCart();
        }
      });
    });

    $$(".decrease").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;

        const item = cart.find(item => item.id === id);

        if (!item) return;

        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart = cart.filter(item => item.id !== id);
        }

        saveCart();
        updateCartCount();
        renderCart();
      });
    });

    $$(".remove-cart-item").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;

        const item = cart.find(item => item.id === id);

        cart = cart.filter(item => item.id !== id);

        saveCart();
        updateCartCount();
        renderCart();

        if (item) {
          showToast(`${item.name} removed from cart`);
        }
      });
    });
  }

  /* =========================================================
     OPEN / CLOSE CART
     ========================================================= */

  function openCart() {
    if (!cartOverlay || !cartSidebar) return;

    renderCart();

    cartOverlay.classList.add("active");
    cartSidebar.classList.add("active");

    body.classList.add("no-scroll");
  }

  function closeCart() {
    if (!cartOverlay || !cartSidebar) return;

    cartOverlay.classList.remove("active");
    cartSidebar.classList.remove("active");

    body.classList.remove("no-scroll");
  }

  if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
  }

  if (cartClose) {
    cartClose.addEventListener("click", closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", event => {
      if (event.target === cartOverlay) {
        closeCart();
      }
    });
  }

  /* =========================================================
     ESC KEY
     ========================================================= */

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCart();
      closeQuickView();
    }
  });

  /* =========================================================
     QUICK VIEW
     ========================================================= */

  let currentQuickViewProduct = null;

  function openQuickView(product) {
    if (!modalOverlay || !quickViewModal) return;

    currentQuickViewProduct = product;

    if (quickViewImage) {
      quickViewImage.src = product.image;
      quickViewImage.alt = product.name;
    }

    if (quickViewTitle) {
      quickViewTitle.textContent = product.name;
    }

    if (quickViewPrice) {
      quickViewPrice.textContent =
        `₹${product.price.toLocaleString("en-IN")}`;
    }

    const quantityInput =
      $(".quantity-selector input");

    if (quantityInput) {
      quantityInput.value = 1;
    }

    modalOverlay.classList.add("active");
    quickViewModal.classList.add("active");

    body.classList.add("no-scroll");
  }

  function closeQuickView() {
    if (!modalOverlay || !quickViewModal) return;

    modalOverlay.classList.remove("active");
    quickViewModal.classList.remove("active");

    body.classList.remove("no-scroll");

    currentQuickViewProduct = null;
  }

  $$(".quick-view-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      const card = button.closest(".product-card");

      if (!card) return;

      const product = getProductFromCard(card);

      if (product) {
        openQuickView(product);
      }
    });
  });

  /* =========================================================
     MODAL CLOSE
     ========================================================= */

  $$(".modal-close").forEach(button => {
    button.addEventListener("click", closeQuickView);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", event => {
      if (event.target === modalOverlay) {
        closeQuickView();
      }
    });
  }

  /* =========================================================
     MODAL QUANTITY
     ========================================================= */

  const quantitySelector = $(".quantity-selector");

  if (quantitySelector) {
    const minusBtn = $(".quantity-minus", quantitySelector);
    const plusBtn = $(".quantity-plus", quantitySelector);
    const input = $("input", quantitySelector);

    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        let value = Number(input.value) || 1;

        if (value > 1) {
          value--;
        }

        input.value = value;
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        let value = Number(input.value) || 1;

        if (value < 20) {
          value++;
        }

        input.value = value;
      });
    }

    if (input) {
      input.addEventListener("input", () => {
        let value = Number(input.value);

        if (value < 1 || isNaN(value)) {
          input.value = 1;
        }

        if (value > 20) {
          input.value = 20;
        }
      });
    }
  }

  /* =========================================================
     ADD TO CART FROM QUICK VIEW
     ========================================================= */

  if (modalAddCart) {
    modalAddCart.addEventListener("click", () => {
      if (!currentQuickViewProduct) return;

      const quantityInput =
        $(".quantity-selector input");

      const quantity =
        Number(quantityInput?.value) || 1;

      addToCart({
        ...currentQuickViewProduct,
        quantity
      });

      closeQuickView();
      openCart();
    });
  }

  /* =========================================================
     WISHLIST
     ========================================================= */

  function updateWishlistButtons() {
    $$(".wishlist-btn").forEach(button => {
      const card = button.closest(".product-card");

      if (!card) return;

      const product = getProductFromCard(card);

      if (!product) return;

      const exists = wishlist.some(
        item => item.id === product.id
      );

      button.classList.toggle("active", exists);

      const icon = button.querySelector("span");

      if (icon) {
        icon.textContent = exists ? "♥" : "♡";
      } else {
        button.textContent = exists ? "♥" : "♡";
      }

      button.setAttribute(
        "aria-label",
        exists
          ? "Remove from wishlist"
          : "Add to wishlist"
      );
    });
  }

  $$(".wishlist-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      const card = button.closest(".product-card");

      if (!card) return;

      const product = getProductFromCard(card);

      if (!product) return;

      const exists = wishlist.some(
        item => item.id === product.id
      );

      if (exists) {
        wishlist = wishlist.filter(
          item => item.id !== product.id
        );

        showToast("Removed from wishlist");
      } else {
        wishlist.push(product);

        showToast("Added to your wishlist");
      }

      saveWishlist();
      updateWishlistButtons();
    });
  });

  /* =========================================================
     SEARCH
     ========================================================= */

  const searchPanel = $(".search-panel");
  const searchForm = $(".search-form");
  const searchInput = $(".search-form input");
  const searchToggle = $(".search-toggle");
  const searchClose = $(".search-close");

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      searchPanel.classList.toggle("active");

      if (searchPanel.classList.contains("active")) {
        setTimeout(() => {
          searchInput?.focus();
        }, 200);
      }
    });
  }

  if (searchClose && searchPanel) {
    searchClose.addEventListener("click", () => {
      searchPanel.classList.remove("active");
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();

      const query =
        searchInput?.value.trim().toLowerCase();

      if (!query) {
        showToast("Please enter a design to search", "error");
        return;
      }

      const products = $$(".product-card");

      let found = false;

      products.forEach(card => {
        const text =
          card.textContent.toLowerCase();

        if (text.includes(query)) {
          card.classList.add("search-match");
          card.style.display = "";

          if (!found) {
            card.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

            found = true;
          }
        } else {
          card.style.display = "none";
        }
      });

      if (!found) {
        products.forEach(card => {
          card.style.display = "";
          card.classList.remove("search-match");
        });

        showToast(
          `No designs found for "${query}"`,
          "error"
        );
      } else {
        showToast(`Showing results for "${query}"`);
      }
    });
  }

  /* =========================================================
     CATEGORY FILTERS
     ========================================================= */

  const filterButtons = $$("[data-filter]");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      $$(".product-card").forEach(card => {
        const category =
          card.dataset.category?.toLowerCase() || "";

        if (
          filter === "all" ||
          !filter ||
          category === filter.toLowerCase()
        ) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* =========================================================
     FAQ ACCORDION
     ========================================================= */

  $$(".faq-item").forEach(item => {
    const question = $(".faq-question", item);

    if (!question) return;

    question.addEventListener("click", () => {
      const wasActive =
        item.classList.contains("active");

      // Close other FAQs
      $$(".faq-item").forEach(otherItem => {
        otherItem.classList.remove("active");

        const otherAnswer =
          $(".faq-answer", otherItem);

        if (otherAnswer) {
          otherAnswer.style.maxHeight = null;
        }
      });

      if (!wasActive) {
        item.classList.add("active");

        const answer =
          $(".faq-answer", item);

        if (answer) {
          answer.style.maxHeight =
            answer.scrollHeight + "px";
        }
      }
    });
  });

  /* =========================================================
     MOBILE MENU
     ========================================================= */

  const mobileMenuBtn = $(".mobile-menu-btn");
  const mobileNav = $(".mobile-nav");
  const mobileMenuClose = $(".mobile-menu-close");

  function openMobileMenu() {
    mobileNav?.classList.add("active");
    body.classList.add("no-scroll");
  }

  function closeMobileMenu() {
    mobileNav?.classList.remove("active");
    body.classList.remove("no-scroll");
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener(
      "click",
      openMobileMenu
    );
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener(
      "click",
      closeMobileMenu
    );
  }

  $$(".mobile-nav a").forEach(link => {
    link.addEventListener(
      "click",
      closeMobileMenu
    );
  });

  /* =========================================================
     SMOOTH SCROLL
     ========================================================= */

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId =
        link.getAttribute("href");

      if (
        !targetId ||
        targetId === "#" ||
        targetId.length < 2
      ) {
        return;
      }

      const target =
        document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* =========================================================
     CTA BUTTONS
     ========================================================= */

  $$("[data-scroll-to]").forEach(button => {
    button.addEventListener("click", () => {
      const targetSelector =
        button.dataset.scrollTo;

      const target =
        document.querySelector(targetSelector);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* =========================================================
     CUSTOM ORDER FORM
     ========================================================= */

  const customOrderForm = $("#customOrderForm");

  if (customOrderForm) {
    customOrderForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        const name =
          $("#name")?.value.trim();

        const phone =
          $("#phone")?.value.trim();

        const collection =
          $("#collection")?.value.trim();

        const budget =
          $("#budget")?.value.trim();

        const message =
          $("#message")?.value.trim();

        if (!name) {
          showToast("Please enter your name", "error");
          $("#name")?.focus();
          return;
        }

        if (!phone) {
          showToast(
            "Please enter your phone number",
            "error"
          );
          $("#phone")?.focus();
          return;
        }

        if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
          showToast(
            "Please enter a valid phone number",
            "error"
          );
          $("#phone")?.focus();
          return;
        }

        if (!collection) {
          showToast(
            "Please select a collection",
            "error"
          );
          $("#collection")?.focus();
          return;
        }

        if (!message) {
          showToast(
            "Please tell us about your custom order",
            "error"
          );
          $("#message")?.focus();
          return;
        }

        // Save enquiry locally
        const orderRequest = {
          name,
          phone,
          collection,
          budget,
          message,
          date: new Date().toISOString()
        };

        localStorage.setItem(
          "kuchuCustomOrder",
          JSON.stringify(orderRequest)
        );

        showToast(
          "Your custom order request has been received!"
        );

        customOrderForm.reset();

        setTimeout(() => {
          document
            .querySelector("#custom-order")
            ?.scrollIntoView({
              behavior: "smooth"
            });
        }, 800);
      }
    );
  }

  /* =========================================================
     CHECKOUT
     ========================================================= */

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        showToast(
          "Your cart is empty. Add a design first.",
          "error"
        );
        return;
      }

      const total = cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

      // Create order summary
      const orderSummary = cart
        .map(
          item =>
            `${item.name} × ${item.quantity} — ₹${
              item.price * item.quantity
            }`
        )
        .join("\n");

      console.log("Order Summary:");
      console.log(orderSummary);
      console.log("Total:", total);

      /*
        This is where you can later connect:

        - Razorpay
        - Stripe
        - WhatsApp
        - Backend checkout
        - Payment gateway
      */

      showToast(
        "Checkout is ready — connect your payment gateway here."
      );
    });
  }

  /* =========================================================
     NAVBAR SCROLL EFFECT
     ========================================================= */

  const header = $(".site-header");

  function handleHeaderScroll() {
    if (!header) return;

    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener(
    "scroll",
    handleHeaderScroll,
    { passive: true }
  );

  handleHeaderScroll();

  /* =========================================================
     BACK TO TOP
     ========================================================= */

  const backToTop = $(".back-to-top");

  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 600) {
          backToTop.classList.add("show");
        } else {
          backToTop.classList.remove("show");
        }
      },
      { passive: true }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* =========================================================
     SCROLL REVEAL ANIMATION
     ========================================================= */

  const revealElements = $$(
    ".product-card, .feature-card, .testimonial-card, .section-heading, .custom-order-content"
  );

  if ("IntersectionObserver" in window) {
    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "reveal-visible"
              );

              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12
        }
      );

    revealElements.forEach(element => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  }

  /* =========================================================
     IMAGE LAZY LOADING
     ========================================================= */

  $$("img").forEach(image => {
    if (!image.hasAttribute("loading")) {
      image.setAttribute("loading", "lazy");
    }
  });

  /* =========================================================
     PREVENT IMAGE DRAGGING
     ========================================================= */

  $$("img").forEach(image => {
    image.addEventListener("dragstart", event => {
      event.preventDefault();
    });
  });

  /* =========================================================
     ACTIVE NAVIGATION ON SCROLL
     ========================================================= */

  const navLinks = $$(
    '.site-header a[href^="#"]'
  );

  const sections = $$(
    "section[id]"
  );

  if (
    navLinks.length &&
    sections.length &&
    "IntersectionObserver" in window
  ) {
    const sectionObserver =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id = entry.target.id;

            navLinks.forEach(link => {
              link.classList.remove("active");

              if (
                link.getAttribute("href") ===
                `#${id}`
              ) {
                link.classList.add("active");
              }
            });
          });
        },
        {
          threshold: 0.35
        }
      );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  /* =========================================================
     PHONE NUMBER INPUT
     ========================================================= */

  const phoneInput = $("#phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value =
        phoneInput.value.replace(
          /[^0-9+\-\s]/g,
          ""
        );
    });
  }

  /* =========================================================
     PRODUCT CARD HOVER EFFECT
     ========================================================= */

  $$(".product-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("hovered");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("hovered");
    });
  });

  /* =========================================================
     INITIALIZE
     ========================================================= */

  updateCartCount();
  renderCart();
  updateWishlistButtons();

  console.log(
    "%cKuchu Designs ✦",
    "font-size:20px;font-weight:bold;"
  );

  console.log(
    "Premium interactive experience loaded successfully."
  );
});