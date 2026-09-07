/**
 * Link Product - Admin Dashboard Logic
 * Authentication, CRUD operations for products, profile management, and Firebase configuration
 */

document.addEventListener('DOMContentLoaded', async () => {
  let products = [];
  let currentProfile = {};
  let isRegisterMode = false;

  // DOM Elements - Auth Section
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const authForm = document.getElementById('authForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const authErrorAlert = document.getElementById('authErrorAlert');
  const authErrorMessage = document.getElementById('authErrorMessage');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const btnAuthSubmitText = document.getElementById('btnAuthSubmitText');
  const btnToggleAuthMode = document.getElementById('btnToggleAuthMode');
  const authHeading = document.getElementById('authHeading');
  const authSubheading = document.getElementById('authSubheading');
  const userEmailBadge = document.getElementById('userEmailBadge');
  const btnLogout = document.getElementById('btnLogout');

  // DOM Elements - Tabs & Table
  const tabBtnProducts = document.getElementById('tabBtnProducts');
  const tabBtnProfile = document.getElementById('tabBtnProfile');
  const tabBtnFirebase = document.getElementById('tabBtnFirebase');
  const tabContentProducts = document.getElementById('tabContentProducts');
  const tabContentProfile = document.getElementById('tabContentProfile');
  const tabContentFirebase = document.getElementById('tabContentFirebase');

  const adminProductTableBody = document.getElementById('adminProductTableBody');
  const adminEmptyTable = document.getElementById('adminEmptyTable');
  const tabProductCount = document.getElementById('tabProductCount');
  const adminSearchInput = document.getElementById('adminSearchInput');

  // DOM Elements - Product Modal
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const productModalTitle = document.getElementById('productModalTitle');
  const editProductId = document.getElementById('editProductId');
  const btnSubmitProductText = document.getElementById('btnSubmitProductText');

  // Product Form Inputs
  const inputLinkNumber = document.getElementById('inputLinkNumber');
  const inputBadge = document.getElementById('inputBadge');
  const inputProductName = document.getElementById('inputProductName');
  const inputPrice = document.getElementById('inputPrice');
  const inputOriginalPrice = document.getElementById('inputOriginalPrice');
  const inputImage = document.getElementById('inputImage');
  const inputImgPreview = document.getElementById('inputImgPreview');
  const inputBuyUrl = document.getElementById('inputBuyUrl');

  // Profile Form Inputs
  const profileForm = document.getElementById('profileForm');
  const formBannerUrl = document.getElementById('formBannerUrl');
  const formBannerPreview = document.getElementById('formBannerPreview');
  const formAvatarUrl = document.getElementById('formAvatarUrl');
  const formAvatarPreview = document.getElementById('formAvatarPreview');
  const formStoreName = document.getElementById('formStoreName');
  const formVerifiedBadge = document.getElementById('formVerifiedBadge');
  const formStoreBio = document.getElementById('formStoreBio');

  // Firebase Config Form Inputs
  const firebaseConfigForm = document.getElementById('firebaseConfigForm');
  const fbApiKey = document.getElementById('fbApiKey');
  const fbDatabaseURL = document.getElementById('fbDatabaseURL');
  const fbProjectId = document.getElementById('fbProjectId');
  const fbAuthDomain = document.getElementById('fbAuthDomain');

  const dbStatusDot = document.getElementById('dbStatusDot');
  const dbStatusText = document.getElementById('dbStatusText');

  // Format Currency
  function formatRupiah(number) {
    if (!number && number !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  }

  // Admin Toast Helper
  window.showAdminToast = function(message, isError = false) {
    const toast = document.getElementById('adminToast');
    const toastMessage = document.getElementById('adminToastMessage');
    const toastIcon = document.getElementById('adminToastIcon');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    if (isError) {
      toastIcon.className = 'fa-solid fa-circle-xmark text-rose-400 text-base';
    } else {
      toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-base';
    }

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  // Update Database Status indicator
  function updateDbStatus() {
    if (window.dbManager.isFirebaseReady) {
      dbStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      dbStatusText.textContent = 'Firebase Connected';
    } else {
      dbStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      dbStatusText.textContent = 'Local Storage Mode';
    }
  }

  // --- FIREBASE AUTHENTICATION LOGIC ---
  function showAuthError(msg) {
    if (authErrorAlert && authErrorMessage) {
      authErrorMessage.textContent = msg;
      authErrorAlert.classList.remove('hidden');
    }
  }

  function hideAuthError() {
    if (authErrorAlert) {
      authErrorAlert.classList.add('hidden');
    }
  }

  // Toggle Between Sign In & Register Mode
  if (btnToggleAuthMode) {
    btnToggleAuthMode.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      hideAuthError();

      if (isRegisterMode) {
        authHeading.textContent = 'Daftar Akun Admin';
        authSubheading.textContent = 'Buat akun admin baru untuk mengakses dashboard Firebase';
        btnAuthSubmitText.textContent = 'Daftar & Masuk';
        btnToggleAuthMode.textContent = 'Sudah punya akun? Masuk di sini';
      } else {
        authHeading.textContent = 'Login Admin';
        authSubheading.textContent = 'Masuk dengan akun Firebase untuk mengelola katalog produk';
        btnAuthSubmitText.textContent = 'Masuk ke Dashboard';
        btnToggleAuthMode.textContent = 'Belum punya akun admin? Buat Akun Baru';
      }
    });
  }

  // Handle Login / Register Form Submission
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthError();

      const email = authEmail.value.trim();
      const password = authPassword.value;

      btnAuthSubmit.disabled = true;
      btnAuthSubmitText.textContent = isRegisterMode ? 'Mendaftarkan...' : 'Memverifikasi...';

      try {
        if (isRegisterMode) {
          await window.dbManager.register(email, password);
          window.showAdminToast('🎉 Pendaftaran berhasil! Selamat datang.');
        } else {
          await window.dbManager.login(email, password);
          window.showAdminToast('✅ Berhasil masuk!');
        }
      } catch (err) {
        console.error("Auth error:", err);
        let errorMsg = 'Gagal masuk: ' + err.message;

        if (err.code === 'auth/user-not-found') {
          errorMsg = 'Akun tidak ditemukan. Silakan periksa kembali email Anda atau buat akun baru.';
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          errorMsg = 'Kata sandi salah. Silakan coba lagi.';
        } else if (err.code === 'auth/email-already-in-use') {
          errorMsg = 'Email ini sudah terdaftar. Silakan gunakan mode login.';
        } else if (err.code === 'auth/weak-password') {
          errorMsg = 'Kata sandi terlalu pendek. Minimal 6 karakter.';
        } else if (err.code === 'auth/invalid-email') {
          errorMsg = 'Format alamat email tidak valid.';
        } else if (err.code === 'auth/operation-not-allowed') {
          errorMsg = 'Fitur Email/Password belum diaktifkan di Firebase Console. Buka Firebase Console > Authentication > Sign-in method > aktifkan Email/Password.';
        }

        showAuthError(errorMsg);
      } finally {
        btnAuthSubmit.disabled = false;
        btnAuthSubmitText.textContent = isRegisterMode ? 'Daftar & Masuk' : 'Masuk ke Dashboard';
      }
    });
  }

  // Handle Logout
  window.handleLogout = async function() {
    if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
      try {
        await window.dbManager.logout();
        window.showAdminToast('👋 Anda telah keluar.');
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
  };

  // Auth State Listener
  window.dbManager.onAuthChange((user) => {
    if (user) {
      // User is logged in
      if (loginSection) loginSection.classList.add('hidden');
      if (dashboardSection) dashboardSection.classList.remove('hidden');
      if (userEmailBadge) userEmailBadge.textContent = user.email || 'Admin';
      loadAllData();
    } else {
      // If Firebase is configured with Auth, require login
      if (window.dbManager.isFirebaseReady) {
        if (loginSection) loginSection.classList.remove('hidden');
        if (dashboardSection) dashboardSection.classList.add('hidden');
      } else {
        // Fallback for initial local setup before Firebase is connected
        if (loginSection) loginSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (userEmailBadge) userEmailBadge.textContent = 'Mode Offline (Local Storage)';
        loadAllData();
      }
    }
  });

  // --- TAB NAVIGATION ---
  window.switchTab = function(tabName) {
    const tabs = [
      { name: 'products', btn: tabBtnProducts, content: tabContentProducts },
      { name: 'profile', btn: tabBtnProfile, content: tabContentProfile },
      { name: 'firebase', btn: tabBtnFirebase, content: tabContentFirebase }
    ];

    tabs.forEach(t => {
      if (t.name === tabName) {
        t.btn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition bg-orange-500 text-white shadow-md';
        t.content.classList.remove('hidden');
      } else {
        t.btn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition text-slate-400 hover:text-white hover:bg-slate-800';
        t.content.classList.add('hidden');
      }
    });
  };

  // --- RENDER PRODUCTS TABLE ---
  function renderProductsTable(items) {
    if (tabProductCount) tabProductCount.textContent = items.length;

    if (items.length === 0) {
      adminProductTableBody.innerHTML = '';
      adminEmptyTable.classList.remove('hidden');
      return;
    }

    adminEmptyTable.classList.add('hidden');

    const rows = items.map(p => {
      let numDisplay = p.linkNumber || '01';
      if (!isNaN(numDisplay) && parseInt(numDisplay) < 10 && !numDisplay.startsWith('0')) {
        numDisplay = '0' + numDisplay;
      }

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 text-center">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-bold font-mono text-xs border border-orange-500/30">
              #${numDisplay}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
              <img src="${p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}" 
                   alt="${p.name}" 
                   class="w-full h-full object-cover"
                   onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'">
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-white max-w-xs sm:max-w-sm truncate">${p.name}</div>
            ${p.badge ? `<div class="mt-1"><span class="text-[10px] text-orange-300 bg-orange-950/60 border border-orange-800/40 px-1.5 py-0.5 rounded">${p.badge}</span></div>` : ''}
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-orange-400 font-mono">${formatRupiah(p.price)}</div>
            ${p.originalPrice ? `<div class="text-[10px] text-slate-500 line-through font-mono">${formatRupiah(p.originalPrice)}</div>` : ''}
          </td>
          <td class="py-3 px-4">
            <a href="${p.buyUrl || '#'}" target="_blank" class="text-slate-400 hover:text-orange-400 flex items-center gap-1 max-w-[140px] truncate transition">
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              <span class="truncate">${p.buyUrl || '-'}</span>
            </a>
          </td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="window.openEditProductModal('${p.id}')" class="p-1.5 rounded-lg bg-slate-700/80 hover:bg-orange-500 text-slate-300 hover:text-white transition" title="Edit Produk">
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button onclick="window.confirmDeleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg bg-slate-700/80 hover:bg-rose-600 text-slate-300 hover:text-white transition" title="Hapus Produk">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    adminProductTableBody.innerHTML = rows;
  }

  // --- PRODUCT MODAL MANAGEMENT ---
  window.openAddProductModal = function() {
    productForm.reset();
    editProductId.value = '';
    productModalTitle.innerHTML = '<i class="fa-solid fa-plus text-orange-500"></i> Tambah Produk Baru';
    btnSubmitProductText.textContent = 'Simpan Produk';

    // Auto calculate next link number
    const maxNum = products.reduce((max, p) => {
      const num = parseInt(p.linkNumber) || 0;
      return num > max ? num : max;
    }, 0);
    const nextNum = (maxNum + 1 < 10) ? '0' + (maxNum + 1) : (maxNum + 1).toString();
    inputLinkNumber.value = nextNum;
    inputImgPreview.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

    productModal.classList.remove('hidden');
    inputProductName.focus();
  };

  window.openEditProductModal = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editProductId.value = product.id;
    inputLinkNumber.value = product.linkNumber || '';
    inputBadge.value = product.badge || '';
    inputProductName.value = product.name || '';
    inputPrice.value = product.price || '';
    inputOriginalPrice.value = product.originalPrice || '';
    inputImage.value = product.image || '';
    inputImgPreview.src = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
    inputBuyUrl.value = product.buyUrl || '';

    productModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-orange-500"></i> Edit Produk';
    btnSubmitProductText.textContent = 'Simpan Perubahan';

    productModal.classList.remove('hidden');
  };

  window.closeProductModal = function() {
    productModal.classList.add('hidden');
  };

  // Live image preview in product modal
  if (inputImage) {
    inputImage.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      inputImgPreview.src = val !== '' ? val : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
    });
  }

  // Handle Product Form Submit (Add/Edit)
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = editProductId.value;
      const productData = {
        linkNumber: inputLinkNumber.value.trim(),
        badge: inputBadge.value.trim(),
        name: inputProductName.value.trim(),
        price: Number(inputPrice.value) || 0,
        originalPrice: inputOriginalPrice.value ? Number(inputOriginalPrice.value) : null,
        image: inputImage.value.trim(),
        buyUrl: inputBuyUrl.value.trim()
      };

      try {
        if (id) {
          await window.dbManager.updateProduct(id, productData);
          window.showAdminToast('✅ Produk berhasil diperbarui!');
        } else {
          await window.dbManager.addProduct(productData);
          window.showAdminToast('✅ Produk baru berhasil ditambahkan!');
        }

        window.closeProductModal();
        await loadProducts();
      } catch (err) {
        console.error("Error saving product:", err);
        window.showAdminToast('❌ Gagal menyimpan produk: ' + err.message, true);
      }
    });
  }

  // Confirm and Delete Product
  window.confirmDeleteProduct = async function(id, name) {
    if (confirm(`Apakah Anda yakin ingin menghapus produk:\n"${name}"?`)) {
      try {
        await window.dbManager.deleteProduct(id);
        window.showAdminToast('🗑️ Produk berhasil dihapus!');
        await loadProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        window.showAdminToast('❌ Gagal menghapus produk: ' + err.message, true);
      }
    }
  };

  // Search Products in Admin
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cleanNum = query.replace('#', '');
      const filtered = products.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(query);
        const numMatch = (p.linkNumber || '').toString().toLowerCase().includes(cleanNum);
        const badgeMatch = (p.badge || '').toLowerCase().includes(query);
        return nameMatch || numMatch || badgeMatch;
      });
      renderProductsTable(filtered);
    });
  }

  // --- PROFILE FORM MANAGEMENT ---
  function populateProfileForm(profile) {
    currentProfile = profile || {};
    formBannerUrl.value = profile.storeBanner || '';
    formBannerPreview.src = profile.storeBanner || '';
    formAvatarUrl.value = profile.storeAvatar || '';
    formAvatarPreview.src = profile.storeAvatar || '';
    formStoreName.value = profile.storeName || '';
    formVerifiedBadge.value = profile.verified !== false ? 'true' : 'false';
    formStoreBio.value = profile.storeBio || '';
  }

  // Profile Form Previews
  if (formBannerUrl) {
    formBannerUrl.addEventListener('input', (e) => {
      formBannerPreview.src = e.target.value.trim();
    });
  }
  if (formAvatarUrl) {
    formAvatarUrl.addEventListener('input', (e) => {
      formAvatarPreview.src = e.target.value.trim();
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedProfile = {
        storeBanner: formBannerUrl.value.trim(),
        storeAvatar: formAvatarUrl.value.trim(),
        storeName: formStoreName.value.trim(),
        verified: formVerifiedBadge.value === 'true',
        storeBio: formStoreBio.value.trim()
      };

      try {
        await window.dbManager.saveProfile(updatedProfile);
        window.showAdminToast('✅ Profil toko berhasil diperbarui!');
      } catch (err) {
        console.error("Error updating profile:", err);
        window.showAdminToast('❌ Gagal memperbarui profil: ' + err.message, true);
      }
    });
  }

  // --- FIREBASE CONFIG FORM ---
  function populateFirebaseConfigForm() {
    const config = window.dbManager.getSavedConfig();
    fbApiKey.value = config.apiKey || '';
    fbDatabaseURL.value = config.databaseURL || '';
    fbProjectId.value = config.projectId || '';
    fbAuthDomain.value = config.authDomain || '';
  }

  if (firebaseConfigForm) {
    firebaseConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newConfig = {
        apiKey: fbApiKey.value.trim(),
        databaseURL: fbDatabaseURL.value.trim(),
        projectId: fbProjectId.value.trim(),
        authDomain: fbAuthDomain.value.trim() || `${fbProjectId.value.trim()}.firebaseapp.com`
      };

      window.dbManager.saveConfig(newConfig);
      window.showAdminToast('🔄 Menyambungkan ke Firebase...');
      
      setTimeout(async () => {
        updateDbStatus();
        if (window.dbManager.isFirebaseReady) {
          window.showAdminToast('🎉 Berhasil terhubung ke Firebase Database!');
        } else {
          window.showAdminToast('⚠️ Konfigurasi disimpan, silakan refresh halaman untuk memverifikasi koneksi.');
        }
      }, 800);
    });
  }

  window.clearFirebaseConfig = function() {
    if (confirm('Kembali ke mode Local Storage (Browser Cache)?')) {
      localStorage.removeItem('firebase_link_config');
      window.dbManager.saveConfig({});
      populateFirebaseConfigForm();
      updateDbStatus();
      window.showAdminToast('Mode Local Storage aktif.');
    }
  };

  // Reset to Demo Data
  window.resetToDemoPrompt = async function() {
    if (confirm('Apakah Anda ingin mengisi ulang data profil & produk dengan data contoh (demo)?')) {
      try {
        await window.dbManager.resetToDemoData();
        window.showAdminToast('✅ Data contoh berhasil dimuat ulang!');
        await loadAllData();
      } catch (err) {
        window.showAdminToast('❌ Gagal mereset data: ' + err.message, true);
      }
    }
  };

  // --- LOAD DATA ---
  async function loadProducts() {
    products = await window.dbManager.getProducts();
    renderProductsTable(products);
  }

  async function loadAllData() {
    updateDbStatus();
    populateFirebaseConfigForm();

    const profile = await window.dbManager.getProfile();
    populateProfileForm(profile);

    await loadProducts();
  }
});
