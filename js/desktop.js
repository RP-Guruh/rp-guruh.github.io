/**
 * js/desktop.js
 * Mengelola ikon desktop, seleksi klik/double-click/tap mobile, Start Menu,
 * jam real-time di system tray, efek suara opsional, dan layar Shut Down.
 */

(function () {
  const DESKTOP_MENUS = [
    {
      id: "profile",
      label: "Data Diri",
      subtitle: "Profil & Keahlian",
      icon: "assets/icons/profile.svg"
    },
    {
      id: "education",
      label: "Pendidikan",
      subtitle: "Riwayat Akademik",
      icon: "assets/icons/education.svg"
    },
    {
      id: "experience",
      label: "Pekerjaan",
      subtitle: "Pengalaman Kerja",
      icon: "assets/icons/experience.svg"
    },
    {
      id: "portfolio",
      label: "Portofolio",
      subtitle: "Proyek Explorer",
      icon: "assets/icons/portfolio.svg"
    },
    {
      id: "contact",
      label: "Kontak",
      subtitle: "Email, WA & CV",
      icon: "assets/icons/contact.svg"
    }
  ];

  let selectedIconId = null;
  let lastTouchTimestamp = 0;
  let audioCtx = null;
  let hasUserInteracted = false;

  function isTouchOrMobile(event) {
    if (event && event.pointerType === "touch") return true;
    if (window.innerWidth < 768) return true;
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  /**
   * Sistem Suara (Opsional lewat SITE.config.sounds, default: false)
   * Tidak pernah autoplay sebelum ada interaksi pengguna.
   */
  function isSoundEnabled() {
    return Boolean(window.SITE && window.SITE.config && window.SITE.config.sounds);
  }

  function ensureAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  let startupAudioInstance = null;

  function playClick() {
    if (!hasUserInteracted || !isSoundEnabled()) return;
    try {
      const clickAudio = new Audio("assets/sounds/click.wav");
      clickAudio.volume = 0.45;
      clickAudio.play().catch(() => {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1050, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      });
    } catch (_) {
      // Abaikan jika audio tidak diizinkan
    }
  }

  function playStartupSound() {
    if (!isSoundEnabled()) return;
    try {
      if (startupAudioInstance) {
        startupAudioInstance.pause();
        startupAudioInstance.currentTime = 0;
      }
      const audio = new Audio("assets/sounds/sound.mp3");
      audio.volume = 0.85;
      startupAudioInstance = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Bila browser memblokir autoplay sebelum ada gesture pengguna,
          // putar otomatis begitu pengunjung menyentuh/mengeklik layar
          const onFirstInteraction = () => {
            if (startupAudioInstance && isSoundEnabled()) {
              startupAudioInstance.play().catch(() => {});
            }
            window.removeEventListener("pointerdown", onFirstInteraction);
            window.removeEventListener("keydown", onFirstInteraction);
          };
          window.addEventListener("pointerdown", onFirstInteraction, { once: true });
          window.addEventListener("keydown", onFirstInteraction, { once: true });
        });
      }
      return audio;
    } catch (_) {
      // Audio playback fallback
    }
  }

  function updateSoundTrayIcon() {
    const soundBtn = document.getElementById("tray-sound-btn");
    const soundImg = document.getElementById("tray-sound-icon");
    if (!soundBtn || !soundImg) return;
    const enabled = isSoundEnabled();
    soundImg.src = enabled ? "assets/icons/volume-on.svg" : "assets/icons/volume-off.svg";
    soundBtn.setAttribute(
      "aria-label",
      enabled ? "Suara efek aktif (Klik untuk matikan)" : "Suara efek mati (Klik untuk aktifkan)"
    );
    soundBtn.title = enabled ? "Suara: Aktif" : "Suara: Nonaktif";
  }

  function toggleSoundSetting() {
    hasUserInteracted = true;
    if (!window.SITE) return;
    if (!window.SITE.config) window.SITE.config = {};
    window.SITE.config.sounds = !window.SITE.config.sounds;
    updateSoundTrayIcon();
    if (window.SITE.config.sounds) {
      playStartupSound();
    }
  }

  /**
   * Render 5 ikon desktop
   */
  function renderDesktopIcons() {
    const container = document.getElementById("desktop-icons");
    if (!container) return;

    container.innerHTML = DESKTOP_MENUS.map(
      (menu) => `
      <li role="none">
        <div
          class="desktop-icon"
          role="button"
          tabindex="0"
          data-menu-id="${menu.id}"
          aria-label="${menu.label} - ${menu.subtitle}"
        >
          <div class="desktop-icon-img-wrap">
            <img src="${menu.icon}" alt="" class="desktop-icon-img" />
          </div>
          <span class="desktop-icon-label">${menu.label}</span>
        </div>
      </li>
    `
    ).join("");

    const iconEls = container.querySelectorAll(".desktop-icon");
    iconEls.forEach((iconEl, idx) => {
      const menuId = iconEl.getAttribute("data-menu-id");

      // Deteksi tap sentuh di mobile: 1 tap langsung membuka jendela
      iconEl.addEventListener("pointerup", (e) => {
        hasUserInteracted = true;
        if (isTouchOrMobile(e)) {
          lastTouchTimestamp = Date.now();
          selectDesktopIcon(menuId);
          closeStartMenu();
          window.WindowManager.openWindow(menuId);
        }
      });

      // Klik tunggal di desktop: pilih (highlight biru)
      iconEl.addEventListener("click", (e) => {
        hasUserInteracted = true;
        e.stopPropagation();
        if (Date.now() - lastTouchTimestamp < 450) return;
        selectDesktopIcon(menuId);
        closeStartMenu();
      });

      // Double-click di desktop: buka jendela
      iconEl.addEventListener("dblclick", (e) => {
        hasUserInteracted = true;
        e.stopPropagation();
        selectDesktopIcon(menuId);
        closeStartMenu();
        window.WindowManager.openWindow(menuId);
      });

      // Navigasi keyboard (Enter / Space untuk membuka, panah untuk pindah ikon)
      iconEl.addEventListener("keydown", (e) => {
        hasUserInteracted = true;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDesktopIcon(menuId);
          closeStartMenu();
          window.WindowManager.openWindow(menuId);
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = iconEls[(idx + 1) % iconEls.length];
          if (next) {
            next.focus();
            selectDesktopIcon(next.getAttribute("data-menu-id"));
          }
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = iconEls[(idx - 1 + iconEls.length) % iconEls.length];
          if (prev) {
            prev.focus();
            selectDesktopIcon(prev.getAttribute("data-menu-id"));
          }
        }
      });
    });
  }

  function selectDesktopIcon(menuId) {
    selectedIconId = menuId;
    const iconEls = document.querySelectorAll(".desktop-icon");
    iconEls.forEach((el) => {
      const isMatch = el.getAttribute("data-menu-id") === menuId;
      el.classList.toggle("is-selected", isMatch);
    });
  }

  function clearDesktopSelection() {
    selectedIconId = null;
    document.querySelectorAll(".desktop-icon.is-selected").forEach((el) => {
      el.classList.remove("is-selected");
    });
  }

  /**
   * Render Start Menu (5 menu utama, Download CV, Versi Sederhana, Shut Down)
   */
  function renderStartMenu() {
    const site = window.SITE || {};
    const profile = site.profile || {};
    const contact = site.contact || {};
    const cvUrl = contact.cv || "cv.pdf";

    const nameEl = document.getElementById("start-user-name");
    const roleEl = document.getElementById("start-user-role");
    const avatarEl = document.getElementById("start-user-avatar");

    if (nameEl) nameEl.textContent = profile.name || "Pengguna XP";
    if (roleEl) roleEl.textContent = profile.role || profile.location || "";
    if (avatarEl && profile.photo) {
      avatarEl.src = profile.photo;
    }

    const leftCol = document.getElementById("start-menu-left-items");
    if (leftCol) {
      leftCol.innerHTML = DESKTOP_MENUS.map(
        (menu) => `
        <button
          type="button"
          class="start-menu-item"
          data-start-menu-id="${menu.id}"
          role="menuitem"
        >
          <img src="${menu.icon}" alt="" class="start-item-icon" />
          <span class="start-item-text">
            <span class="start-item-title">${menu.label}</span>
            <span class="start-item-sub">${menu.subtitle}</span>
          </span>
        </button>
      `
      ).join("");

      leftCol.querySelectorAll("[data-start-menu-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          hasUserInteracted = true;
          const menuId = btn.getAttribute("data-start-menu-id");
          closeStartMenu();
          window.WindowManager.openWindow(menuId);
        });
      });
    }

    // Update link Download CV di Start Menu
    const cvLink = document.getElementById("start-download-cv");
    if (cvLink) {
      cvLink.setAttribute("href", cvUrl);
      cvLink.addEventListener("click", () => {
        closeStartMenu();
      });
    }
  }

  function toggleStartMenu() {
    hasUserInteracted = true;
    playClick();
    const menu = document.getElementById("start-menu");
    const btn = document.getElementById("start-button");
    if (!menu || !btn) return;

    const isHidden = menu.hasAttribute("hidden");
    if (isHidden) {
      menu.removeAttribute("hidden");
      btn.classList.add("is-active");
      btn.setAttribute("aria-expanded", "true");
    } else {
      closeStartMenu();
    }
  }

  function closeStartMenu() {
    const menu = document.getElementById("start-menu");
    const btn = document.getElementById("start-button");
    if (!menu || !btn) return;
    menu.setAttribute("hidden", "");
    btn.classList.remove("is-active");
    btn.setAttribute("aria-expanded", "false");
  }

  /**
   * Jam Asli Pengunjung di System Tray
   */
  function updateClock() {
    const clockEl = document.getElementById("taskbar-clock");
    if (!clockEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const dateStr = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    clockEl.textContent = timeStr;
    clockEl.title = dateStr;
    clockEl.setAttribute("aria-label", `Jam sekarang ${timeStr}, ${dateStr}`);
  }

  /**
   * Shut Down & Nyalakan Kembali
   */
  function triggerShutdown() {
    hasUserInteracted = true;
    playClick();
    closeStartMenu();
    const shutdownScreen = document.getElementById("shutdown-screen");
    if (shutdownScreen) {
      shutdownScreen.removeAttribute("hidden");
      const restartBtn = document.getElementById("restart-computer-btn");
      if (restartBtn) restartBtn.focus();
    }
  }

  function powerOnFromShutdown() {
    hasUserInteracted = true;
    playStartupSound();
    const shutdownScreen = document.getElementById("shutdown-screen");
    if (shutdownScreen) {
      shutdownScreen.setAttribute("hidden", "");
    }
  }

  /**
   * Menu Konteks Klik Kanan Desktop & Seleksi Marquee
   */
  function closeContextMenu() {
    const menu = document.getElementById("desktop-context-menu");
    if (menu) menu.setAttribute("hidden", "");
  }

  function initContextMenu() {
    const workspace = document.getElementById("desktop-workspace");
    const menu = document.getElementById("desktop-context-menu");
    if (!workspace || !menu) return;

    workspace.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".xp-window") || e.target.closest("#start-menu")) return;
      e.preventDefault();
      closeStartMenu();

      const menuWidth = 210;
      const menuHeight = 180;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 38);

      menu.style.left = `${Math.max(4, x)}px`;
      menu.style.top = `${Math.max(4, y)}px`;
      menu.removeAttribute("hidden");
    });

    document.addEventListener("pointerdown", (e) => {
      if (!e.target.closest("#desktop-context-menu")) {
        closeContextMenu();
      }
    });

    menu.querySelectorAll("[data-ctx-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-ctx-action");
        closeContextMenu();
        switch (action) {
          case "open-portfolio":
            window.WindowManager.openWindow("portfolio");
            break;
          case "open-profile":
          case "properties":
            window.WindowManager.openWindow("profile");
            break;
          case "refresh":
            clearDesktopSelection();
            renderDesktopIcons();
            playClick();
            break;
          case "open-all":
            ["profile", "education", "experience", "portfolio", "contact"].forEach((id, idx) => {
              window.setTimeout(() => window.WindowManager.openWindow(id), idx * 120);
            });
            break;
          case "simple-mode":
            if (window.App && typeof window.App.setSimpleCvMode === "function") {
              window.App.setSimpleCvMode(true);
            }
            break;
        }
      });
    });
  }

  function initMarqueeSelection() {
    const workspace = document.getElementById("desktop-workspace");
    const box = document.getElementById("desktop-selection-box");
    if (!workspace || !box) return;

    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    workspace.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (
        e.target.closest(".desktop-icon") ||
        e.target.closest(".xp-window") ||
        e.target.closest("#start-menu") ||
        e.target.closest("#desktop-context-menu")
      ) {
        return;
      }

      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      box.style.left = `${startX}px`;
      box.style.top = `${startY}px`;
      box.style.width = "0px";
      box.style.height = "0px";
      box.removeAttribute("hidden");
      clearDesktopSelection();
      closeContextMenu();
    });

    window.addEventListener("pointermove", (e) => {
      if (!isSelecting) return;
      const curX = e.clientX;
      const curY = e.clientY;

      const left = Math.min(startX, curX);
      const top = Math.min(startY, curY);
      const width = Math.abs(curX - startX);
      const height = Math.abs(curY - startY);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;

      const boxRect = { left, top, right: left + width, bottom: top + height };
      const icons = document.querySelectorAll(".desktop-icon");
      icons.forEach((icon) => {
        const r = icon.getBoundingClientRect();
        const intersects = !(
          r.right < boxRect.left ||
          r.left > boxRect.right ||
          r.bottom < boxRect.top ||
          r.top > boxRect.bottom
        );
        icon.classList.toggle("is-selected", intersects);
      });
    });

    const stopMarquee = () => {
      if (!isSelecting) return;
      isSelecting = false;
      box.setAttribute("hidden", "");
    };

    window.addEventListener("pointerup", stopMarquee);
    window.addEventListener("pointercancel", stopMarquee);
  }

  function initDesktopEvents() {
    renderDesktopIcons();
    renderStartMenu();
    updateSoundTrayIcon();
    updateClock();
    initContextMenu();
    initMarqueeSelection();
    window.setInterval(updateClock, 10000);

    // Tombol Versi Sederhana di Tray & Start Menu
    const startSimpleBtn = document.getElementById("start-simple-cv-btn");
    if (startSimpleBtn) {
      startSimpleBtn.addEventListener("click", () => {
        closeStartMenu();
        if (window.App && typeof window.App.setSimpleCvMode === "function") {
          window.App.setSimpleCvMode(true);
        }
      });
    }

    const traySimpleBtn = document.getElementById("tray-simple-cv-btn");
    if (traySimpleBtn) {
      traySimpleBtn.addEventListener("click", () => {
        if (window.App && typeof window.App.setSimpleCvMode === "function") {
          window.App.setSimpleCvMode(true);
        }
      });
    }

    // Klik pada area kosong desktop membatalkan seleksi ikon & menutup Start Menu
    const workspace = document.getElementById("desktop-workspace");
    if (workspace) {
      workspace.addEventListener("pointerdown", (e) => {
        hasUserInteracted = true;
        if (
          !e.target.closest(".desktop-icon") &&
          !e.target.closest(".xp-window") &&
          !e.target.closest("#start-menu") &&
          !e.target.closest("#desktop-context-menu")
        ) {
          clearDesktopSelection();
          closeStartMenu();
          closeContextMenu();
        }
      });
    }

    // Tombol Start
    const startBtn = document.getElementById("start-button");
    if (startBtn) {
      startBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStartMenu();
      });
    }

    // Klik di luar Start Menu menutupnya
    document.addEventListener("pointerdown", (e) => {
      hasUserInteracted = true;
      if (!e.target.closest("#start-menu") && !e.target.closest("#start-button")) {
        closeStartMenu();
      }
    });

    // Tombol Shut Down & Nyalakan Kembali
    const shutdownBtn = document.getElementById("start-shutdown-btn");
    if (shutdownBtn) {
      shutdownBtn.addEventListener("click", triggerShutdown);
    }

    const restartBtn = document.getElementById("restart-computer-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", powerOnFromShutdown);
    }

    // Tombol Suara di System Tray
    const soundBtn = document.getElementById("tray-sound-btn");
    if (soundBtn) {
      soundBtn.addEventListener("click", toggleSoundSetting);
    }

    // Tombol cepat di kolom kanan Start Menu (buka menu terkait)
    document.querySelectorAll("[data-quick-open]").forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.getAttribute("data-quick-open");
        closeStartMenu();
        if (target) {
          window.WindowManager.openWindow(target);
        }
      });
    });

    // Keyboard global: Esc menutup Start Menu atau jendela aktif
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const menu = document.getElementById("start-menu");
        if (menu && !menu.hasAttribute("hidden")) {
          closeStartMenu();
          return;
        }
        window.WindowManager.closeActiveWindow();
      }
    });
  }

  window.DesktopFX = {
    initDesktopEvents,
    playClick,
    playStartupSound,
    playStartupChord: playStartupSound,
    closeStartMenu,
    triggerShutdown,
    powerOnFromShutdown
  };
})();

