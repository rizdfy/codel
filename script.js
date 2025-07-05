const popup = document.getElementById("popupBox");
const header = document.getElementById("popupHeader");
const content = document.getElementById("popupContent");
const toggleBtn = document.getElementById("toggleBtn");


new Audio("audio/popup-open.aac").play();
const popupOpenSound = new Audio("audio/popup-open.aac");
const popupCloseSound = new Audio("audio/popup-close.aac");
const loadingBarSound = new Audio("audio/loading-bar.aac");



function loadContent(fileName) {
  if (!fileName) {
    console.warn("loadContent: Nama file kosong!");
    return;
  }

  fetch(fileName)
    .then(res => {
      if (!res.ok) throw new Error(`File ${fileName} tidak ditemukan`);
      return res.text();
    })
    .then(html => {
      const content = document.getElementById("popupContent");
      content.innerHTML = html;

      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = html;
      const titleTag = tempContainer.querySelector('[data-title]');

      const headerTitle = document.querySelector(".header-title");
      if (titleTag && headerTitle) {
        headerTitle.textContent = titleTag.dataset.title;
      }

      if (fileName.toLowerCase() === 'loading-bar.html') {
        // 🔊 Mainkan audio loading
        loadingBarSound.currentTime = 0;
        loadingBarSound.play().catch(() => {});
        
        // Jalankan animasi
        animateLoadingBar(() => {
          // 🔇 Hentikan audio saat selesai
          loadingBarSound.pause();
          loadingBarSound.currentTime = 0;
        });
      }
    })
    .catch(err => {
      console.warn(`File ${fileName} tidak ditemukan, menampilkan 404.html`);
      
      fetch('404.html')
        .then(res => res.text())
        .then(html => {
          const content = document.getElementById("popupContent");
          content.innerHTML = html;

          const headerTitle = document.querySelector(".header-title");
          if (headerTitle) {
            headerTitle.textContent = "404 - Not Found";
          }

          const notFoundEl = document.getElementById("notFoundFileName");
          if (notFoundEl) {
            notFoundEl.textContent = `File yang dicari: ${fileName}`;
          }
        });
    });
}





function togglePopup() {
  const isHidden = content.classList.contains("hidden");

  if (isHidden) {
    // ▶️ Suara popup buka
    popupOpenSound.currentTime = 0;
    popupOpenSound.play();

    content.classList.remove("hidden");
    content.style.display = "flex";
    void content.offsetWidth;
    content.classList.add("expand");
    content.style.opacity = "1";

    popup.style.height = "auto";
    toggleBtn.innerHTML = "▲";
  } else {
    const currentHeight = popup.offsetHeight;
    const headerHeight = header.offsetHeight;
    const footerHeight = popup.querySelector(".popup-footer").offsetHeight;
    const finalHeight = headerHeight + footerHeight;

    popup.style.height = `${currentHeight}px`;
    void popup.offsetHeight;
    popup.style.height = `${finalHeight}px`;

    content.style.opacity = "0";
    content.classList.remove("expand");

    content.addEventListener("transitionend", function fadeDone(e) {
      if (e.propertyName !== "opacity") return;

      content.classList.add("hidden");
      content.style.display = "none";
      toggleBtn.innerHTML = "▼";

      content.removeEventListener("transitionend", fadeDone);
    }, { once: true });
  }
}






function closePopup() {

  popupCloseSound.currentTime = 0;
  popupCloseSound.play();

  const content = document.getElementById("popupContent");

  const currentHeight = popup.offsetHeight;
  const headerHeight = header.offsetHeight;
  const footerHeight = popup.querySelector(".popup-footer").offsetHeight;
  const finalHeight = headerHeight + footerHeight;

  // ⬇️ Tambahkan class animasi sebelum animasi jalan
  popup.classList.add("closing");

  popup.style.height = `${currentHeight}px`;
  void popup.offsetHeight;
  popup.style.height = `${finalHeight}px`;

  content.style.opacity = "0";

  content.addEventListener("transitionend", function fadeDone(e) {
    if (e.propertyName !== "opacity") return;

    content.classList.add("hidden");
    content.style.display = "none";
    toggleBtn.innerHTML = "▼";

    popup.addEventListener("transitionend", function finalHide(ev) {
      if (ev.propertyName === "height") {
        popup.classList.remove("closing"); // reset class
        popup.style.display = "none";
        popup.style.height = "auto";
        popup.removeEventListener("transitionend", finalHide);
      }
    }, { once: true });

    content.removeEventListener("transitionend", fadeDone);
  }, { once: true });
}




function startPopupClose() {

  popupCloseSound.currentTime = 0;
  popupCloseSound.play();

  popup.classList.remove("opening");
  popup.classList.add("closing");
  popup.addEventListener("animationend", function handleClose() {
    popup.style.display = "none";
    popup.classList.remove("closing");
    popup.removeEventListener("animationend", handleClose);
  }, { once: true });
}

// Dragging
let isDragging = false;
let offsetX, offsetY;
let currentContainer = document.getElementById("layar1"); // default

header.addEventListener("mousedown", e => {
  isDragging = true;

  const containerRect = document.querySelector(".laptop-container").getBoundingClientRect();
  offsetX = e.clientX - containerRect.left - popup.offsetLeft;
  offsetY = e.clientY - containerRect.top - popup.offsetTop;
});



document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;

  const popupCenterY = popup.getBoundingClientRect().top + popup.offsetHeight / 2;
  const layar1Rect = document.getElementById("layar1").getBoundingClientRect();
  const layar2Rect = document.getElementById("layar2").getBoundingClientRect();

  if (popupCenterY >= layar2Rect.top && popupCenterY <= layar2Rect.bottom) {
    currentContainer = document.getElementById("layar2");
  } else if (popupCenterY >= layar1Rect.top && popupCenterY <= layar1Rect.bottom) {
    currentContainer = document.getElementById("layar1");
  }

  if (target && target !== currentContainer) {
    // Pindah DOM popup ke layar baru
    const posX = popup.offsetLeft;
    const posY = popup.offsetTop;
    target.appendChild(popup);
    popup.style.left = `${posX}px`;
    popup.style.top = `${posY}px`;
    currentContainer = target;
  }
});



// Resizing
const resizerRight = document.getElementById("resizerRight");
const resizerBottom = document.getElementById("resizerBottom");
const resizerCorner = document.getElementById("resizerCorner");

let isResizing = false;

function startResize(e, direction) {
  e.preventDefault();
  isResizing = direction;
}

resizerRight.addEventListener("mousedown", e => startResize(e, "right"));
resizerBottom.addEventListener("mousedown", e => startResize(e, "bottom"));
resizerCorner.addEventListener("mousedown", e => startResize(e, "corner"));

document.addEventListener("mousemove", e => {
  const layar1 = document.getElementById("layar1");
  const layar2 = document.getElementById("layar2");
  const rect1 = layar1.getBoundingClientRect();
  const rect2 = layar2.getBoundingClientRect();
  const containerRect = document.querySelector(".laptop-container").getBoundingClientRect();

  let targetRect = rect1;
  const centerY = e.clientY;

  if (centerY >= rect2.top && centerY <= rect2.bottom) {
    targetRect = rect2;
    currentContainer = layar2;
  } else if (centerY >= rect1.top && centerY <= rect1.bottom) {
    targetRect = rect1;
    currentContainer = layar1;
  }

  const popupRect = popup.getBoundingClientRect();

  if (isDragging) {
    let newLeft = e.clientX - containerRect.left - offsetX;
    let newTop = e.clientY - containerRect.top - offsetY;

    const minLeft = targetRect.left - containerRect.left;
    const minTop = targetRect.top - containerRect.top;
    const maxLeft = minLeft + targetRect.width - popup.offsetWidth;
    const maxTop = minTop + targetRect.height - popup.offsetHeight;

    popup.style.left = `${Math.max(minLeft, Math.min(newLeft, maxLeft))}px`;
    popup.style.top = `${Math.max(minTop, Math.min(newTop, maxTop))}px`;
  }

  if (isResizing) {
    const relativeLeft = popupRect.left - targetRect.left;
    const relativeTop = popupRect.top - targetRect.top;
    const maxWidth = targetRect.width - relativeLeft;
    const maxHeight = targetRect.height - relativeTop;

    if (isResizing === "right") {
      let newWidth = e.clientX - popupRect.left;
      newWidth = Math.max(150, Math.min(newWidth, maxWidth));
      popup.style.width = `${newWidth}px`;
    } else if (isResizing === "bottom") {
      let newHeight = e.clientY - popupRect.top;
      newHeight = Math.max(100, Math.min(newHeight, maxHeight));
      popup.style.height = `${newHeight}px`;
    } else if (isResizing === "corner") {
      let newWidth = e.clientX - popupRect.left;
      let newHeight = e.clientY - popupRect.top;
      popup.style.width = `${Math.max(150, Math.min(newWidth, maxWidth))}px`;
      popup.style.height = `${Math.max(100, Math.min(newHeight, maxHeight))}px`;
    }
  }
});





document.addEventListener("mouseup", () => {
  isResizing = false;
  isDragging = false;
});



  popup.addEventListener("animationend", function handleOpen() {
    content.style.display = "flex";
    void content.offsetWidth;
    content.style.opacity = "1";
    content.classList.add("expand");
    popup.removeEventListener("animationend", handleOpen);
  });


/// fungsi loading bar////
function loadLoadingBar() {
  fetch('loading-bar.html')
    .then(res => res.text())
    .then(html => {
      // Masukkan loading bar ke konten popup
      const content = document.getElementById("popupContent");
      content.innerHTML = html;

      // Ganti title popup jadi "LOADING"
      const headerTitle = document.querySelector(".header-title");
      if (headerTitle) {
        headerTitle.textContent = "LOADING";
      }

      // Jalankan animasi loading
      animateLoadingBar();
    })
    .catch(err => console.error("Gagal memuat loading-bar.html", err));
}


////fungsi loading bar///
function animateLoadingBar() {
  const percentEl = document.getElementById("loadingPercent");
  const barEl = document.getElementById("loadingBarInner");
  if (!percentEl || !barEl) return;

  // 🔊 Mainkan suara loading
  loadingBarSound.currentTime = 0;
  loadingBarSound.play().catch(() => {});

  const duration = 5000; // 5 detik
  const frameRate = 30;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  let currentFrame = 0;

  const interval = setInterval(() => {
    currentFrame++;
    const progress = currentFrame / totalFrames;
    const percent = (progress * 100).toFixed(2).padStart(5, '0');
    percentEl.textContent = percent;
    barEl.style.width = `${progress * 100}%`;

    if (currentFrame >= totalFrames) {
      clearInterval(interval);

      // 🔇 Stop audio
      loadingBarSound.pause();
      loadingBarSound.currentTime = 0;

      // ❌ Tutup popup setelah loading selesai
      closePopup();
    }
  }, 1000 / frameRate);
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector(".laptop-container");
  const layar1 = document.getElementById("layar1");
  const content = document.getElementById("popupContent");

  // Tempatkan popup di container
  container.appendChild(popup);

  // Posisikan di layar1 (atas)
  const layar1Rect = layar1.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  popup.style.position = "absolute";
  popup.style.left = `${layar1Rect.left - containerRect.left + 10}px`;
  popup.style.top = `${layar1Rect.top - containerRect.top + 10}px`;

  // Set kontainer aktif
  currentContainer = layar1;

  // Load konten awal (misalnya loading-bar.html)
  loadContent('404.html'); ///////////////////////////////////////////////////////////////////////////////////////ganti

  // 🔊 Mainkan suara popup-open saat pertama kali muncul
  popupOpenSound.currentTime = 0;
  popupOpenSound.play();

  // Tampilkan popup dengan animasi
  popup.classList.remove("opening");
  void popup.offsetWidth;
  popup.classList.add("opening");

  popup.addEventListener("animationend", function handleOpen() {
    content.style.display = "flex";
    void content.offsetWidth;
    content.style.opacity = "1";
    content.classList.add("expand");
    popup.removeEventListener("animationend", handleOpen);
  });
});


window.addEventListener('resize', () => {
  reposisiPopup();
});
function reposisiPopup() {
  const container = document.querySelector(".laptop-container");
  const targetRect = currentContainer.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Tengah relatif terhadap layar aktif
  const centerLeft = targetRect.left - containerRect.left + (targetRect.width - popup.offsetWidth) / 2;
  const centerTop = targetRect.top - containerRect.top + (targetRect.height - popup.offsetHeight) / 2;

  popup.style.left = `${centerLeft}px`;
  popup.style.top = `${centerTop}px`;
}


/////fungsi pindah layar/////
function pindahkanPopupKeLayar(idLayar) {
  const target = document.getElementById(idLayar);
  if (!target || target === currentContainer) return;

  // Simpan posisi relatif
  const offsetLeft = popup.offsetLeft;
  const offsetTop = popup.offsetTop;

  // Pindah elemen ke layar baru
  target.appendChild(popup);
  popup.style.left = `${offsetLeft}px`;
  popup.style.top = `${offsetTop}px`;

  currentContainer = target;
}



////fungsi loading number////
function animateLoadingNumber() {
  const percentEl = document.getElementById("loadingPercent");
  const barEl = document.getElementById("loadingBarInner");
  if (!percentEl || !barEl) return;

  const duration = 5000; // 5 seconds
  const frameRate = 30;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  let currentFrame = 0;

  const interval = setInterval(() => {
    currentFrame++;
    const progress = currentFrame / totalFrames;

    const percent = (progress * 100).toFixed(2).padStart(5, '0');

    // Tampilkan angka dan lebar
    percentEl.textContent = percent;
    barEl.style.width = `${progress * 100}%`;

    if (currentFrame >= totalFrames) {
      clearInterval(interval);
    }
  }, 1000 / frameRate);
}




  popup.addEventListener("animationend", function handleOpen() {
    content.style.display = "flex";
    void content.offsetWidth;
    content.style.opacity = "1";
    content.classList.add("expand");
    popup.removeEventListener("animationend", handleOpen);
  });






//////////////frolion fungsi///////////////////////
function spawnFrolion() {
  const layar2 = document.getElementById("layar2");
  const frolion = document.createElement("img");

  frolion.src = "asset/Frolion/Frolion_Move_GIF.gif";
  frolion.classList.add("frolion");

  const topMax = layar2.offsetHeight - 50;
  const randomTop = Math.random() * topMax;
  frolion.style.top = `${randomTop}px`;

  const duration = 2 + Math.random() * 3;
  frolion.style.animationDuration = `${duration}s`;

  // Saat diklik → ganti animasi ke Frolion mati
  frolion.addEventListener("click", () => {
    // ✅ 1. Kunci posisi terakhir
    const computedStyle = window.getComputedStyle(frolion);
    const currentRight = computedStyle.right;
    const currentTop = computedStyle.top;

    frolion.style.animation = "none"; // hentikan animasi gerak
    frolion.style.right = currentRight;
    frolion.style.top = currentTop;

    // ✅ 2. Ganti ke animasi mati
    frolion.src = "asset/Frolion/Frolion_Death_GIF.gif";
    frolion.style.pointerEvents = "none";

    // ✅ 3. Hapus setelah efek selesai (sesuaikan durasi gif)
    setTimeout(() => {
      frolion.remove();
    }, 300); // durasi GIF mati
  });

  layar2.appendChild(frolion);

  // Auto-remove setelah animasi gerak selesai
  setTimeout(() => {
    if (frolion.parentNode) frolion.remove();
  }, duration * 1000);
}


// Mulai spawn tiap 2–4 detik
setInterval(() => {
  spawnFrolion();
}, 2000 + Math.random() * 2000);
