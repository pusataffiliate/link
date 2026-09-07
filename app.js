/**
 * Link Product - Main Application Logic
 * Mobile-friendly bio link catalog
 */

document.addEventListener('DOMContentLoaded', async () => {
  let allProducts = [];
  let searchQuery = '';

  // DOM Elements
  const storeBanner = document.getElementById('storeBanner');
  const storeAvatar = document.getElementById('storeAvatar');
  const storeName = document.getElementById('storeName');
  const storeBio = document.getElementById('storeBio');
  const verifiedBadge = document.getElementById('verifiedBadge');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const productList = document.getElementById('productList');
  const productCount = document.getElementById('productCount');
  const skeletonLoader = document.getElementById('skeletonLoader');
  const emptyState = document.getElementById('emptyState');

  // Format Currency to Indonesian Rupiah
  function formatRupiah(number) {
    if (!number && number !== 0) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  }

  // Toast Notification Helper
  window.showToast = function(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    if (isError) {
      toastIcon.className = 'fa-solid fa-triangle-exclamation text-amber-400 text-sm';
    } else {
      toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-sm';
    }

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // Render Store Profile
  function renderProfile(profile) {
    if (!profile) return;

    if (profile.storeBanner) storeBanner.src = profile.storeBanner;
    if (profile.storeAvatar) storeAvatar.src = profile.storeAvatar;
    if (profile.storeName) storeName.textContent = profile.storeName;
    if (profile.storeBio) storeBio.textContent = profile.storeBio;

    // Verified badge
    if (verifiedBadge) {
      verifiedBadge.style.display = profile.verified !== false ? 'flex' : 'none';
    }

    // Set page title
    document.title = `${profile.storeName || 'Katalog Produk'} - Official Link Product`;
  }

  // Render Product Cards
  function renderProducts(products) {
    if (skeletonLoader) skeletonLoader.remove();

    if (productCount) {
      productCount.textContent = products.length;
    }

    if (products.length === 0) {
      productList.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const cardsHtml = products.map(product => {
      // Calculate discount percentage
      let discountBadge = '';
      if (product.originalPrice && product.originalPrice > product.price) {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        discountBadge = `<span class="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">-${discountPercent}%</span>`;
      }

      // Format link number (pad with 0 if single digit)
      let numDisplay = product.linkNumber || '01';
      if (!isNaN(numDisplay) && parseInt(numDisplay) < 10 && !numDisplay.startsWith('0')) {
        numDisplay = '0' + numDisplay;
      }

      // Safe image URL fallback
      const imageUrl = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

      return `
        <div class="product-card p-3 sm:p-3.5 flex gap-3 sm:gap-3.5 items-stretch bg-white">
          
          <!-- Product Thumbnail -->
          <div class="product-thumb-container shrink-0">
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 class="product-thumb" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'">
            
            <!-- Link Number Floating on Image -->
            <div class="absolute top-1.5 left-1.5 z-10">
              <span class="link-number-badge shadow-md">
                #${numDisplay}
              </span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <!-- Badge -->
              ${product.badge ? `
                <div class="flex items-center gap-1.5 flex-wrap mb-1">
                  <span class="text-[10px] font-bold px-2 py-0.5 bg-orange-100/90 text-orange-700 rounded-md tracking-tight">${product.badge}</span>
                </div>
              ` : ''}

              <!-- Product Name -->
              <h3 class="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2 hover:text-orange-600 transition">
                <a href="${product.buyUrl || '#'}" target="_blank" rel="noopener noreferrer">
                  ${product.name}
                </a>
              </h3>

              <!-- Price Section -->
              <div class="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span class="text-sm sm:text-base font-extrabold text-orange-600">
                  ${formatRupiah(product.price)}
                </span>
                ${product.originalPrice ? `
                  <span class="text-[11px] text-slate-400 line-through">
                    ${formatRupiah(product.originalPrice)}
                  </span>
                  ${discountBadge}
                ` : ''}
              </div>
            </div>

            <!-- Action Buttons: Lihat Produk & Share -->
            <div class="mt-2.5 flex items-center gap-1.5">
              <a href="${product.buyUrl || '#'}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 text-center">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span class="truncate">Lihat Produk</span>
              </a>

              <!-- Share Button -->
              <button onclick="window.openShareModal('${product.id}')" 
                      class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0 active:scale-90" 
                      title="Bagikan Produk">
                <i class="fa-solid fa-share-nodes text-xs"></i>
              </button>
            </div>

          </div>

        </div>
      `;
    }).join('');

    productList.innerHTML = cardsHtml;
  }

  // Filter and Search Logic
  function filterAndRenderProducts() {
    let filtered = [...allProducts];

    // Filter by Search Query (Matches Product Name or Link Number)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const cleanNum = q.replace('#', '');
      filtered = filtered.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const numMatch = (p.linkNumber || '').toString().toLowerCase().includes(cleanNum);
        const badgeMatch = (p.badge || '').toLowerCase().includes(q);
        return nameMatch || numMatch || badgeMatch;
      });
    }

    renderProducts(filtered);
  }

  // Search Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', searchQuery === '');
      }
      filterAndRenderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      filterAndRenderProducts();
      searchInput.focus();
    });
  }

  window.resetSearchFilter = function() {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    filterAndRenderProducts();
  };

  // --- Share Modal Functions ---
  const shareModal = document.getElementById('shareModal');
  let currentShareProduct = null;

  window.openShareModal = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !shareModal) return;

    currentShareProduct = product;
    document.getElementById('shareProductThumb').querySelector('img').src = product.image;
    document.getElementById('shareProductName').textContent = `[#${product.linkNumber}] ${product.name}`;
    document.getElementById('shareProductPrice').textContent = formatRupiah(product.price);

    const btnShareWa = document.getElementById('btnShareWa');
    const waText = encodeURIComponent(`Halo, cek produk *${product.name}* (No #${product.linkNumber}) di sini: ${product.buyUrl || window.location.href}`);
    btnShareWa.href = `https://api.whatsapp.com/send?text=${waText}`;

    shareModal.classList.remove('hidden');
  };

  window.closeShareModal = function() {
    if (shareModal) shareModal.classList.add('hidden');
  };

  const btnCopyShareLink = document.getElementById('btnCopyShareLink');
  if (btnCopyShareLink) {
    btnCopyShareLink.addEventListener('click', async () => {
      if (!currentShareProduct) return;
      const copyText = currentShareProduct.buyUrl || window.location.href;
      try {
        await navigator.clipboard.writeText(copyText);
        window.showToast('✅ Link produk berhasil disalin!');
        window.closeShareModal();
      } catch (err) {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = copyText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        window.showToast('✅ Link produk berhasil disalin!');
        window.closeShareModal();
      }
    });
  }

  // Close modal when clicking outside
  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        window.closeShareModal();
      }
    });
  }

  // --- Load Initial Data ---
  async function loadData() {
    try {
      const profile = await window.dbManager.getProfile();
      renderProfile(profile);

      allProducts = await window.dbManager.getProducts();
      renderProducts(allProducts);
    } catch (err) {
      console.error("Failed to load store data:", err);
    }
  }

  await loadData();

  // Listen for real-time updates from Firebase
  window.dbManager.onProfileChange((updatedProfile) => {
    renderProfile(updatedProfile);
  });

  window.dbManager.onProductsChange((updatedProducts) => {
    allProducts = updatedProducts;
    filterAndRenderProducts();
  });

});
