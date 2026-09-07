/**
 * Firebase Database & Auth Configuration & Data Access Layer
 * Supports Firebase Realtime Database & Firebase Auth with LocalStorage Fallback
 */

// Default Configuration (Can be customized via Admin Panel or direct edit)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "", // e.g., "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app"
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Default Demo Data for Store Profile
const DEFAULT_STORE_PROFILE = {
  storeName: "Glamour Official Shop",
  storeBio: "✨ Official Link Katalog Produk & Rekomendasi Pilihan Terbaik!",
  storeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  storeBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  verified: true
};

// Default Demo Data for Products
const DEFAULT_PRODUCTS = [
  {
    id: "prod_01",
    linkNumber: "01",
    name: "Oversized Knit Sweater Korean Style Premium",
    badge: "🔥 Best Seller",
    price: 119000,
    originalPrice: 220000,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80",
    buyUrl: "https://shopee.co.id",
    createdAt: Date.now() - 10000
  },
  {
    id: "prod_02",
    linkNumber: "02",
    name: "Vintage Shoulder Bag Leather Kulit Sintetis",
    badge: "⚡ Diskon 50%",
    price: 89000,
    originalPrice: 178000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=80",
    buyUrl: "https://tokopedia.com",
    createdAt: Date.now() - 20000
  },
  {
    id: "prod_03",
    linkNumber: "03",
    name: "Wireless Earphone Bluetooth 5.3 Deep Bass",
    badge: "⭐ Viral TikTok",
    price: 145000,
    originalPrice: 299000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
    buyUrl: "https://tiktok.com",
    createdAt: Date.now() - 30000
  },
  {
    id: "prod_04",
    linkNumber: "04",
    name: "Minimalist Pastel Tumbler Stainless Steel 500ml",
    badge: "✨ New Arrival",
    price: 75000,
    originalPrice: 120000,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
    buyUrl: "https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan%20Tumbler%20Pastel",
    createdAt: Date.now() - 40000
  },
  {
    id: "prod_05",
    linkNumber: "05",
    name: "Aesthetic Desk Lamp LED 3 Color Temperature",
    badge: "🔥 Rekomendasi",
    price: 68000,
    originalPrice: 110000,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80",
    buyUrl: "https://shopee.co.id",
    createdAt: Date.now() - 50000
  }
];

class DatabaseManager {
  constructor() {
    this.isFirebaseReady = false;
    this.firebaseApp = null;
    this.rtdb = null;
    this.auth = null;
    this.listeners = [];
    this.init();
  }

  getSavedConfig() {
    try {
      const stored = localStorage.getItem('firebase_link_config');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read stored Firebase config", e);
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(config) {
    localStorage.setItem('firebase_link_config', JSON.stringify(config));
    this.init();
  }

  async init() {
    const config = this.getSavedConfig();
    
    // Check if Firebase config has at least apiKey and (databaseURL or projectId)
    if (config && config.apiKey && (config.databaseURL || config.projectId) && window.firebase) {
      try {
        if (!window.firebase.apps || window.firebase.apps.length === 0) {
          this.firebaseApp = window.firebase.initializeApp(config);
        } else {
          this.firebaseApp = window.firebase.app();
        }
        
        if (window.firebase.database) {
          this.rtdb = window.firebase.database();
        }

        if (window.firebase.auth) {
          this.auth = window.firebase.auth();
        }

        this.isFirebaseReady = true;
        console.log("✅ Firebase successfully initialized.");
      } catch (err) {
        console.error("❌ Firebase init error:", err);
        this.isFirebaseReady = false;
      }
    } else {
      this.isFirebaseReady = false;
      console.log("ℹ️ Running in Local Storage Mode (Firebase configuration optional).");
    }

    // Initialize default local storage data if not present
    this.ensureInitialData();
  }

  ensureInitialData() {
    if (!localStorage.getItem('store_profile')) {
      localStorage.setItem('store_profile', JSON.stringify(DEFAULT_STORE_PROFILE));
    }
    if (!localStorage.getItem('store_products')) {
      localStorage.setItem('store_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  }

  // --- Auth Operations ---
  async login(email, password) {
    if (!this.auth) {
      throw new Error("Firebase Auth belum aktif. Pastikan konfigurasi Firebase sudah benar.");
    }
    return await this.auth.signInWithEmailAndPassword(email, password);
  }

  async register(email, password) {
    if (!this.auth) {
      throw new Error("Firebase Auth belum aktif. Pastikan konfigurasi Firebase sudah benar.");
    }
    return await this.auth.createUserWithEmailAndPassword(email, password);
  }

  async logout() {
    if (this.auth) {
      return await this.auth.signOut();
    }
    return Promise.resolve();
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null;
  }

  onAuthChange(callback) {
    if (this.auth) {
      return this.auth.onAuthStateChanged(callback);
    } else {
      callback(null);
    }
  }

  // --- Profile Operations ---
  async getProfile() {
    if (this.isFirebaseReady && this.rtdb) {
      try {
        const snapshot = await this.rtdb.ref('store_profile').once('value');
        if (snapshot.exists()) {
          const profile = snapshot.val();
          localStorage.setItem('store_profile', JSON.stringify(profile));
          return profile;
        }
      } catch (e) {
        console.warn("Error fetching profile from Firebase, falling back to local storage:", e);
      }
    }
    
    // Fallback to local storage
    const local = localStorage.getItem('store_profile');
    return local ? JSON.parse(local) : DEFAULT_STORE_PROFILE;
  }

  async saveProfile(profileData) {
    localStorage.setItem('store_profile', JSON.stringify(profileData));
    
    if (this.isFirebaseReady && this.rtdb) {
      try {
        await this.rtdb.ref('store_profile').set(profileData);
      } catch (e) {
        console.error("Error saving profile to Firebase:", e);
        throw e;
      }
    }
    return profileData;
  }

  // --- Product Operations ---
  async getProducts() {
    if (this.isFirebaseReady && this.rtdb) {
      try {
        const snapshot = await this.rtdb.ref('products').once('value');
        if (snapshot.exists()) {
          const val = snapshot.val();
          const products = Array.isArray(val) 
            ? val.filter(p => p !== null && p !== undefined)
            : Object.keys(val).map(key => ({ ...val[key], id: val[key].id || key }));
          
          // Sort by link number
          products.sort((a, b) => {
            const numA = parseInt(a.linkNumber) || 0;
            const numB = parseInt(b.linkNumber) || 0;
            return numA - numB;
          });

          localStorage.setItem('store_products', JSON.stringify(products));
          return products;
        }
      } catch (e) {
        console.warn("Error fetching products from Firebase, using local storage:", e);
      }
    }

    // Fallback to local storage
    const local = localStorage.getItem('store_products');
    const products = local ? JSON.parse(local) : DEFAULT_PRODUCTS;
    return products.sort((a, b) => (parseInt(a.linkNumber) || 0) - (parseInt(b.linkNumber) || 0));
  }

  async addProduct(product) {
    const products = await this.getProducts();
    const newProduct = {
      ...product,
      id: product.id || 'prod_' + Date.now(),
      createdAt: Date.now()
    };

    products.push(newProduct);
    localStorage.setItem('store_products', JSON.stringify(products));

    if (this.isFirebaseReady && this.rtdb) {
      try {
        await this.rtdb.ref(`products/${newProduct.id}`).set(newProduct);
      } catch (e) {
        console.error("Error adding product to Firebase:", e);
        throw e;
      }
    }
    return newProduct;
  }

  async updateProduct(id, updatedData) {
    let products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedData, updatedAt: Date.now() };
      localStorage.setItem('store_products', JSON.stringify(products));

      if (this.isFirebaseReady && this.rtdb) {
        try {
          await this.rtdb.ref(`products/${id}`).update(products[index]);
        } catch (e) {
          console.error("Error updating product in Firebase:", e);
          throw e;
        }
      }
      return products[index];
    }
    throw new Error("Produk tidak ditemukan");
  }

  async deleteProduct(id) {
    let products = await this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('store_products', JSON.stringify(products));

    if (this.isFirebaseReady && this.rtdb) {
      try {
        await this.rtdb.ref(`products/${id}`).remove();
      } catch (e) {
        console.error("Error deleting product from Firebase:", e);
        throw e;
      }
    }
    return true;
  }

  async resetToDemoData() {
    localStorage.setItem('store_profile', JSON.stringify(DEFAULT_STORE_PROFILE));
    localStorage.setItem('store_products', JSON.stringify(DEFAULT_PRODUCTS));

    if (this.isFirebaseReady && this.rtdb) {
      try {
        await this.rtdb.ref('store_profile').set(DEFAULT_STORE_PROFILE);
        const prodMap = {};
        DEFAULT_PRODUCTS.forEach(p => prodMap[p.id] = p);
        await this.rtdb.ref('products').set(prodMap);
      } catch (e) {
        console.error("Error syncing reset data to Firebase:", e);
      }
    }
    return true;
  }

  // Subscribe to real-time changes
  onProductsChange(callback) {
    if (this.isFirebaseReady && this.rtdb) {
      this.rtdb.ref('products').on('value', snapshot => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const products = Array.isArray(val) 
            ? val.filter(p => p !== null && p !== undefined)
            : Object.keys(val).map(key => ({ ...val[key], id: val[key].id || key }));
          
          products.sort((a, b) => (parseInt(a.linkNumber) || 0) - (parseInt(b.linkNumber) || 0));
          localStorage.setItem('store_products', JSON.stringify(products));
          callback(products);
        } else {
          callback([]);
        }
      });
    }
  }

  onProfileChange(callback) {
    if (this.isFirebaseReady && this.rtdb) {
      this.rtdb.ref('store_profile').on('value', snapshot => {
        if (snapshot.exists()) {
          const profile = snapshot.val();
          localStorage.setItem('store_profile', JSON.stringify(profile));
          callback(profile);
        }
      });
    }
  }
}

// Global Database Manager instance
window.dbManager = new DatabaseManager();
