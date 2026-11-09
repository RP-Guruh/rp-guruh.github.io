/**
 * js/windows.js
 * Sistem manajemen jendela Windows XP (buka, tutup, drag, z-index, minimize, maximize)
 * serta perender konten dinamis dari js/data.js untuk 5 menu utama dan jendela detail proyek.
 */

(function () {
  const MENU_DEFINITIONS = {
    profile: {
      id: "profile",
      title: "Data Diri - Notepad & Profil Sistem",
      shortTitle: "Data Diri",
      icon: "assets/icons/profile.svg",
      width: 660,
      height: 490
    },
    education: {
      id: "education",
      title: "Pendidikan - Riwayat Akademik",
      shortTitle: "Pendidikan",
      icon: "assets/icons/education.svg",
      width: 620,
      height: 440
    },
    experience: {
      id: "experience",
      title: "Pekerjaan - Pengalaman Profesional",
      shortTitle: "Pekerjaan",
      icon: "assets/icons/experience.svg",
      width: 700,
      height: 510
    },
    portfolio: {
      id: "portfolio",
      title: "Portofolio - Windows Explorer",
      shortTitle: "Portofolio",
      icon: "assets/icons/portfolio.svg",
      width: 800,
      height: 530
    },
    contact: {
      id: "contact",
      title: "Kontak & Unduh CV",
      shortTitle: "Kontak",
      icon: "assets/icons/contact.svg",
      width: 600,
      height: 450
    }
  };

  let highestZIndex = 100;
  let activeWindowId = null;
  let openCascadeCount = 0;
  const openWindows = new Map(); // id -> { el, taskbarBtn, isMinimized, isMaximized }

  function isMobileViewport() {
    return window.innerWidth < 768;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Menandai teks dummy "[ISI DI SINI...]" agar langsung terlihat jelas oleh pemilik.
   */
  function formatDummyText(str) {
    const safe = escapeHtml(str);
    return safe.replace(/(\[ISI DI SINI[^\]]*\])/gi, '<span class="dummy-highlight">$1</span>');
  }

  function isPlaceholder(val) {
    return !val || String(val).includes("[ISI DI SINI");
  }

  function triggerLoadingCursor() {
    document.body.classList.add("is-loading");
    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
    }, 180);
  }

  /**
   * Render isi jendela 1: Data Diri (Bergaya System Properties sysdm.cpl XP)
   */
  function renderProfileContent(site) {
    const p = site.profile || {};
    const skillGroups = Array.isArray(p.skillGroups)
      ? p.skillGroups
      : Array.isArray(p.skillCategories)
        ? p.skillCategories
        : [];
    const cvUrl = (site.contact && site.contact.cv) || "cv.pdf";

    const skillsSectionHtml = skillGroups
      .map(
        (grp) => `
        <div class="skill-item">
          <div class="skill-item-title">${escapeHtml(grp.label || grp.category || "")}</div>
          <div class="project-tech-list compact">
            ${(grp.items || [])
            .map((item) => `<span class="xp-badge">${formatDummyText(item)}</span>`)
            .join("")}
          </div>
        </div>
      `
      )
      .join("");

    return `
      <div class="xp-menubar" aria-hidden="true">
        <div class="xp-menubar-items">
          <span><u>B</u>erkas</span>
          <span><u>S</u>unting</span>
          <span><u>T</u>ampilan</span>
          <span><u>B</u>antuan</span>
        </div>
        <span class="xp-menubar-badge">System Properties (sysdm.cpl)</span>
      </div>
      <div class="xp-window-body">
        <div class="xp-tabs-bar" role="tablist">
          <button type="button" class="xp-tab-btn is-active" role="tab" aria-selected="true" data-tab-target="tab-profile-general">
            Umum
          </button>
          <button type="button" class="xp-tab-btn" role="tab" aria-selected="false" data-tab-target="tab-profile-skills">
            Keahlian &amp; Tools
          </button>
       
        </div>

        <div id="tab-profile-general" class="xp-tab-panel" role="tabpanel">
          <div class="profile-header-card">
            <div class="profile-avatar-col">
              <img
                src="${escapeHtml(p.photo || "assets/photo.jpg")}"
                alt="Foto profil ${escapeHtml(p.name || "Pengguna")}"
                class="profile-avatar"
                onerror="this.src='assets/icons/profile.svg'"
              />
              ${p.photoNote
        ? `<span class="profile-photo-note">Foto: ${formatDummyText(p.photoNote)}</span>`
        : ""
      }
            </div>
            <div class="profile-meta">
              <h2>${formatDummyText(p.name)}</h2>
              ${p.role ? `<div class="profile-role">${formatDummyText(p.role)}</div>` : ""}
              <table class="xp-prop-table">
                <tbody>
                  <tr>
                    <th>Profesi / Peran:</th>
                    <td>${formatDummyText(p.role || "Web & Desktop Programmer")}</td>
                  </tr>
                  <tr>
                    <th>Tanggal Lahir:</th>
                    <td>${formatDummyText(p.birthDate)}</td>
                  </tr>
                  <tr>
                    <th>Domisili:</th>
                    <td>${formatDummyText(p.location)}</td>
                  </tr>
                  ${p.address
        ? `<tr>
                           <th>Alamat Domisili:</th>
                           <td>${formatDummyText(p.address)}</td>
                         </tr>`
        : ""
      }
                </tbody>
              </table>
            </div>
          </div>

          <fieldset class="xp-fieldset">
            <legend class="xp-legend">Ringkasan Profil</legend>
            <p class="profile-summary-text">${formatDummyText(p.summary)}</p>
          </fieldset>
        </div>

        <div id="tab-profile-skills" class="xp-tab-panel" role="tabpanel" hidden>
          <fieldset class="xp-fieldset">
            <legend class="xp-legend">Klasifikasi Keahlian Teknis</legend>
            <div class="profile-skills-grid">
              ${skillsSectionHtml}
            </div>
          </fieldset>
        </div>



        <div class="xp-window-footer-actions">
          <a href="${escapeHtml(cvUrl)}" download class="xp-btn xp-btn-primary">
            <img src="assets/icons/pdf.svg" alt="" class="xp-btn-icon" />
            Download CV (PDF)
          </a>
          <button type="button" class="xp-btn" data-open-menu="portfolio">
            <img src="assets/icons/portfolio.svg" alt="" class="xp-btn-icon" />
            Lihat Portofolio
          </button>
          <button type="button" class="xp-btn" data-open-menu="contact">
            <img src="assets/icons/contact.svg" alt="" class="xp-btn-icon" />
            Hubungi Saya
          </button>
        </div>
      </div>
      <div class="xp-statusbar">
        <span>Nama: ${escapeHtml(p.name || "")}</span>
        <span>Domisili: ${escapeHtml(p.location || "")}</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Render isi jendela 2: Pendidikan
   */
  function renderEducationContent(site) {
    const list = Array.isArray(site.education) ? site.education : [];
    const itemsHtml = list
      .map(
        (ed) => `
        <article class="xp-timeline-card">
          <div class="xp-timeline-top">
            <div>
              <h3 class="xp-timeline-title">${formatDummyText(ed.institution)}</h3>
              <p class="xp-timeline-sub">Program Studi: ${formatDummyText(ed.major)}</p>
            </div>
            <span class="xp-timeline-period">${escapeHtml(ed.start)} – ${escapeHtml(ed.end)}</span>
          </div>
          <div class="xp-timeline-body">
            ${ed.gpa
            ? `<div class="xp-gpa-row"><span class="xp-badge">IPK: ${formatDummyText(
              ed.gpa
            )}</span></div>`
            : ""
          }
            ${ed.notes ? `<p class="xp-note-text">${formatDummyText(ed.notes)}</p>` : ""}
          </div>
        </article>
      `
      )
      .join("");

    return `
      <div class="xp-menubar" aria-hidden="true">
        <div class="xp-menubar-items">
          <span><u>B</u>erkas</span>
          <span><u>R</u>iwayat</span>
          <span><u>B</u>antuan</span>
        </div>
        <span class="xp-menubar-badge">${list.length} Institusi</span>
      </div>
      <div class="xp-window-body">
        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Timeline Riwayat Pendidikan Formal</legend>
          <div class="xp-timeline">
            ${itemsHtml}
          </div>
        </fieldset>
      </div>
      <div class="xp-statusbar">
        <span>Total entri pendidikan: ${list.length}</span>
        <span>Pendidikan Formal &amp; Akademik</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Render isi jendela 3: Pekerjaan
   */
  function renderExperienceContent(site) {
    const list = Array.isArray(site.experience) ? site.experience : [];
    const itemsHtml = list
      .map((ex) => {
        const tasks = Array.isArray(ex.tasks) ? ex.tasks : [];
        const achievements = Array.isArray(ex.achievements) ? ex.achievements : [];
        const tech = Array.isArray(ex.tech) ? ex.tech : [];

        return `
          <article class="xp-timeline-card">
            <div class="xp-timeline-top">
              <div>
                <h3 class="xp-timeline-title">${formatDummyText(ex.position)}</h3>
                <p class="xp-timeline-sub">${formatDummyText(ex.company)}</p>
              </div>
              <span class="xp-timeline-period">${escapeHtml(ex.start)} – ${escapeHtml(ex.end)}</span>
            </div>
            <div class="xp-timeline-body">
              ${tech.length
            ? `
                <div class="project-tech-list compact">
                  ${tech.map((t) => `<span class="xp-badge">${escapeHtml(t)}</span>`).join("")}
                </div>
              `
            : ""
          }

              ${tasks.length
            ? `
                <div>
                  <strong class="xp-subhead">Tanggung Jawab:</strong>
                  <ul class="xp-list">
                    ${tasks.map((t) => `<li>${formatDummyText(t)}</li>`).join("")}
                  </ul>
                </div>
              `
            : ""
          }

              ${achievements.length
            ? `
                <div>
                  <strong class="xp-subhead xp-subhead-green">Proyek dan Kontribusi Utama:</strong>
                  <ul class="xp-list">
                    ${achievements.map((a) => `<li>${formatDummyText(a)}</li>`).join("")}
                  </ul>
                </div>
              `
            : ""
          }
            </div>
          </article>
        `;
      })
      .join("");

    return `
      <div class="xp-menubar" aria-hidden="true">
        <div class="xp-menubar-items">
          <span><u>B</u>erkas</span>
          <span><u>K</u>arier</span>
          <span><u>B</u>antuan</span>
        </div>
        <span class="xp-menubar-badge">${list.length} Pengalaman</span>
      </div>
      <div class="xp-window-body">
        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Timeline Riwayat Pekerjaan</legend>
          <div class="xp-timeline">
            ${itemsHtml}
          </div>
        </fieldset>
      </div>
      <div class="xp-statusbar">
        <span>Total riwayat pekerjaan: ${list.length}</span>
        <span>Pengalaman Profesional</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Render isi jendela 4: Portofolio bergaya Windows Explorer
   */
  function renderPortfolioContent(site) {
    const projects = Array.isArray(site.projects) ? site.projects : [];
    const ownerName = (site.profile && site.profile.name) || "Pengguna";

    const cardsHtml = projects
      .map((proj, index) => {
        const techList = Array.isArray(proj.tech) ? proj.tech : [];
        const hasValidDemo = proj.demo && !isPlaceholder(proj.demo);
        const hasValidRepo = proj.repo && !isPlaceholder(proj.repo);

        return `
          <article
            class="project-card"
            tabindex="0"
            role="button"
            aria-label="Buka detail proyek ${escapeHtml(proj.title)}"
            data-project-index="${index}"
          >
            <div class="project-thumb-wrap">
              <img
                src="${escapeHtml(proj.thumbnail || "assets/icons/project-1.svg")}"
                alt="Thumbnail ${escapeHtml(proj.title)}"
                class="project-thumb"
              />
            </div>
            <div class="project-card-body">
              <h4 class="project-card-title">${formatDummyText(proj.title)}</h4>
              <p class="project-card-desc">${formatDummyText(proj.description)}</p>
              <div class="project-tech-list">
                ${techList.map((t) => `<span class="xp-badge">${escapeHtml(t)}</span>`).join("")}
              </div>
              <div class="project-card-actions">
                <button
                  type="button"
                  class="xp-btn xp-btn-primary"
                  data-project-index="${index}"
                >
                  Detail Proyek
                </button>
                ${hasValidDemo
            ? `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener noreferrer" class="xp-btn" data-stop-prop="true">Live Demo</a>`
            : ""
          }
                ${hasValidRepo
            ? `<a href="${escapeHtml(proj.repo)}" target="_blank" rel="noopener noreferrer" class="xp-btn" data-stop-prop="true">Repo GitHub</a>`
            : ""
          }
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    const tableRowsHtml = projects
      .map((proj, index) => {
        const techList = (proj.tech || []).slice(0, 4).join(", ");
        const hasValidDemo = proj.demo && !isPlaceholder(proj.demo);
        const hasValidRepo = proj.repo && !isPlaceholder(proj.repo);

        return `
          <tr data-project-index="${index}" tabindex="0" role="button">
            <td>
              <div class="explorer-row-title">
                <img src="${escapeHtml(proj.thumbnail || "assets/icons/portfolio.svg")}" alt="" />
                <span>${formatDummyText(proj.title)}</span>
              </div>
            </td>
            <td>${formatDummyText(proj.description.slice(0, 68))}...</td>
            <td><span class="xp-badge">${escapeHtml(techList)}</span></td>
            <td>
              <div style="display:flex; gap:4px;">
                <button type="button" class="xp-btn" data-project-index="${index}">Buka</button>
                ${hasValidRepo
            ? `<a href="${escapeHtml(proj.repo)}" target="_blank" rel="noopener noreferrer" class="xp-btn" data-stop-prop="true">GitHub</a>`
            : ""
          }
                ${hasValidDemo
            ? `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener noreferrer" class="xp-btn" data-stop-prop="true">Demo</a>`
            : ""
          }
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="xp-menubar" aria-hidden="true">
        <div class="xp-menubar-items">
          <span><u>B</u>erkas</span>
          <span><u>S</u>unting</span>
          <span><u>T</u>ampilan</span>
          <span><u>F</u>avorit</span>
          <span><u>P</u>erkakas</span>
          <span><u>B</u>antuan</span>
        </div>
        <span class="xp-menubar-badge">Windows Explorer</span>
      </div>
      <div class="explorer-toolbar" aria-label="Toolbar Windows Explorer">
        <div class="explorer-toolbar-group">
          <button type="button" class="xp-btn" data-open-menu="profile">
            <img src="assets/icons/profile.svg" alt="" class="xp-btn-icon" />
            Data Diri
          </button>
          <button type="button" class="xp-btn" data-open-menu="experience">
            <img src="assets/icons/experience.svg" alt="" class="xp-btn-icon" />
            Pekerjaan
          </button>
          <button type="button" class="xp-btn" data-open-menu="contact">
            <img src="assets/icons/contact.svg" alt="" class="xp-btn-icon" />
            Kontak
          </button>
        </div>
        <div class="explorer-toolbar-sep"></div>
        <div class="explorer-toolbar-group">
          <span style="font-size:10.5px; color:#4a4942;">Tampilan:</span>
          <button type="button" class="xp-btn is-pressed" data-view-mode="cards" title="Tampilan Kartu">
            Kartu
          </button>
          <button type="button" class="xp-btn" data-view-mode="details" title="Tampilan Tabel Rincian">
            Rincian
          </button>
        </div>
      </div>
      <div class="xp-addressbar">
        <span class="xp-address-label">Alamat</span>
        <div class="xp-address-input">
          <img src="assets/icons/portfolio.svg" alt="" />
          <span>C:\\Documents and Settings\\${escapeHtml(ownerName)}\\My Documents\\Portofolio</span>
        </div>
      </div>
      <div class="xp-window-body no-padding">
        <div class="explorer-layout">
          <aside class="explorer-sidebar" aria-label="Panel tugas Explorer">
            <div class="explorer-task-box">
              <div class="explorer-task-header">Tugas Folder Proyek</div>
              <div class="explorer-task-body">
                <span>• Klik kartu/baris proyek untuk membuka jendela detail lengkap.</span>
                <span>• Gunakan tombol Repo GitHub untuk meninjau kode sumber.</span>
              </div>
            </div>
            <div class="explorer-task-box">
              <div class="explorer-task-header">Tempat Lainnya</div>
              <div class="explorer-task-body">
                <button type="button" class="xp-btn xp-btn-block" data-open-menu="profile">
                  <img src="assets/icons/profile.svg" alt="" class="xp-btn-icon" /> Data Diri
                </button>
                <button type="button" class="xp-btn xp-btn-block" data-open-menu="education">
                  <img src="assets/icons/education.svg" alt="" class="xp-btn-icon" /> Pendidikan
                </button>
                <button type="button" class="xp-btn xp-btn-block" data-open-menu="contact">
                  <img src="assets/icons/contact.svg" alt="" class="xp-btn-icon" /> Kontak
                </button>
              </div>
            </div>
            <div class="explorer-task-box">
              <div class="explorer-task-header">Detail Folder</div>
              <div class="explorer-task-body">
                <strong>Portofolio Proyek Pribadi</strong>
                <span>Folder Sistem CV</span>
                <span>Jumlah item: ${projects.length} proyek</span>
              </div>
            </div>
          </aside>
          <div class="explorer-main">
            <h3 class="explorer-group-heading">Proyek Pribadi (${projects.length} Objek) — Klik proyek untuk melihat detail</h3>
            <div id="explorer-view-cards" class="projects-grid">
              ${cardsHtml}
            </div>
            <div id="explorer-view-details" class="explorer-details-wrap" hidden>
              <table class="explorer-details-table">
                <thead>
                  <tr>
                    <th>Nama Proyek</th>
                    <th>Deskripsi</th>
                    <th>Teknologi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="xp-statusbar">
        <span>${projects.length} objek tersedia (Klik item untuk membuka jendela detail)</span>
        <span>Komputer Saya</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Render jendela popup Detail Proyek saat kartu proyek diklik
   */
  function renderProjectDetailContent(proj, index) {
    const techList = Array.isArray(proj.tech) ? proj.tech : [];
    const highlights = Array.isArray(proj.highlights) ? proj.highlights : [];
    const hasValidDemo = proj.demo && !isPlaceholder(proj.demo);
    const hasValidRepo = proj.repo && !isPlaceholder(proj.repo);

    return `
      <div class="xp-addressbar">
        <span class="xp-address-label">Lokasi</span>
        <div class="xp-address-input">
          <img src="assets/icons/portfolio.svg" alt="" />
          <span>C:\\Portofolio\\Proyek-${index + 1}\\${escapeHtml(proj.title)}</span>
        </div>
      </div>
      <div class="xp-window-body">
        <img
          src="${escapeHtml(proj.thumbnail || "assets/icons/project-1.svg")}"
          alt="Pratinjau ${escapeHtml(proj.title)}"
          class="project-detail-hero"
        />
        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Informasi Proyek</legend>
          <h3 class="project-detail-title">${formatDummyText(proj.title)}</h3>
          <p class="project-detail-desc">${formatDummyText(proj.description)}</p>
          ${highlights.length
        ? `
            <strong class="xp-subhead">Poin Penting:</strong>
            <ul class="xp-list">
              ${highlights.map((h) => `<li>${formatDummyText(h)}</li>`).join("")}
            </ul>
          `
        : ""
      }
          <div class="project-detail-links">
            ${proj.demo
        ? `<div><strong>Demo:</strong> ${hasValidDemo
          ? `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.demo)}</a>`
          : formatDummyText(proj.demo)
        }</div>`
        : ""
      }
            ${proj.repo
        ? `<div><strong>Repository:</strong> ${hasValidRepo
          ? `<a href="${escapeHtml(proj.repo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.repo)}</a>`
          : formatDummyText(proj.repo)
        }</div>`
        : ""
      }
          </div>
        </fieldset>

        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Teknologi yang Digunakan</legend>
          <div class="project-tech-list compact">
            ${techList.map((t) => `<span class="xp-badge">${escapeHtml(t)}</span>`).join("")}
          </div>
        </fieldset>

        <div class="xp-window-footer-split">
          <button type="button" class="xp-btn" data-open-menu="portfolio">
            ← Kembali ke Folder Portofolio
          </button>
          <div class="xp-window-footer-actions">
            ${hasValidDemo
        ? `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener noreferrer" class="xp-btn xp-btn-primary">Buka Live Demo ↗</a>`
        : ""
      }
            ${hasValidRepo
        ? `<a href="${escapeHtml(proj.repo)}" target="_blank" rel="noopener noreferrer" class="xp-btn xp-btn-primary">Lihat Repository GitHub ↗</a>`
        : ""
      }
          </div>
        </div>
      </div>
      <div class="xp-statusbar">
        <span>Proyek #${index + 1}: ${escapeHtml(proj.title)}</span>
        <span>Detail Portofolio</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Render isi jendela 5: Kontak
   */
  function renderContactContent(site) {
    const c = site.contact || {};
    let waHref = c.whatsappUrl || "";
    if (!waHref) {
      const digits = String(c.whatsapp || "").replace(/[^0-9]/g, "");
      const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
      waHref = intl ? `https://wa.me/${intl}` : "#";
    }
    const cvUrl = c.cv || "cv.pdf";

    return `
      <div class="xp-menubar" aria-hidden="true">
        <div class="xp-menubar-items">
          <span><u>B</u>erkas</span>
          <span><u>K</u>irim</span>
          <span><u>B</u>antuan</span>
        </div>
        <span class="xp-menubar-badge">Outlook Express - Kontak</span>
      </div>
      <div class="xp-window-body">
        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Kontak</legend>
          <div class="contact-grid">
            <div class="contact-item-card">
              <span class="contact-item-label">Alamat Email</span>
              <span class="contact-item-val">${formatDummyText(c.email)}</span>
              <div class="contact-item-action">
                <a href="mailto:${escapeHtml(c.email)}" class="xp-btn">Kirim Email</a>
              </div>
            </div>

            <div class="contact-item-card">
              <span class="contact-item-label">WhatsApp / Telepon</span>
              <span class="contact-item-val">${formatDummyText(c.whatsapp)}</span>
              <div class="contact-item-action">
                <a href="${escapeHtml(waHref)}" target="_blank" rel="noopener noreferrer" class="xp-btn">Chat WhatsApp</a>
              </div>
            </div>

            <div class="contact-item-card">
              <span class="contact-item-label">LinkedIn</span>
              <span class="contact-item-val">${formatDummyText(c.linkedin)}</span>
              <div class="contact-item-action">
                <a href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="xp-btn">Buka Profil LinkedIn</a>
              </div>
            </div>

            <div class="contact-item-card">
              <span class="contact-item-label">GitHub</span>
              <span class="contact-item-val">${formatDummyText(c.github)}</span>
              <div class="contact-item-action">
                <a href="${escapeHtml(c.github)}" target="_blank" rel="noopener noreferrer" class="xp-btn">Buka GitHub</a>
              </div>
            </div>
          </div>
          ${c.location
        ? `<div class="contact-location-row"><strong>Lokasi / Domisili:</strong> ${escapeHtml(c.location)}</div>`
        : ""
      }
        </fieldset>

        <fieldset class="xp-fieldset">
          <legend class="xp-legend">Dokumen Curriculum Vitae (PDF)</legend>
          <div class="cv-download-box">
            <div>
              <strong>Unduh salinan lengkap CV dalam format PDF (${escapeHtml(cvUrl)})</strong>
              <p class="cv-download-sub">
                Status berkas CV asli: ${formatDummyText(c.cvNote || "Tersedia")}
              </p>
            </div>
            <a href="${escapeHtml(cvUrl)}" download class="xp-btn xp-btn-primary">
              <img src="assets/icons/pdf.svg" alt="" class="xp-btn-icon" />
              Download CV (PDF)
            </a>
          </div>
        </fieldset>
      </div>
      <div class="xp-statusbar">
        <span>Lokasi: ${escapeHtml(c.location || "Cipayung, Kota Depok")}</span>
        <span>File CV: ${escapeHtml(cvUrl)}</span>
        <div class="xp-resize-grip" aria-hidden="true" title="Tarik untuk mengubah ukuran"></div>
      </div>
    `;
  }

  /**
   * Menghasilkan HTML isi jendela berdasarkan ID menu
   */
  function buildWindowMarkup(menuId, customData) {
    const site = window.SITE || {};
    switch (menuId) {
      case "profile":
        return renderProfileContent(site);
      case "education":
        return renderEducationContent(site);
      case "experience":
        return renderExperienceContent(site);
      case "portfolio":
        return renderPortfolioContent(site);
      case "contact":
        return renderContactContent(site);
      default:
        if (menuId.startsWith("project-") && customData) {
          return renderProjectDetailContent(customData.project, customData.index);
        }
        return `<div class="xp-window-body">Konten tidak ditemukan.</div>`;
    }
  }

  /**
   * Fokuskan jendela ke paling depan (z-index tertinggi) dan perbarui status taskbar
   */
  function focusWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;

    highestZIndex += 1;
    entry.el.style.zIndex = String(highestZIndex);
    activeWindowId = id;

    openWindows.forEach((item, key) => {
      const isTarget = key === id && !item.isMinimized;
      item.el.classList.toggle("is-inactive", !isTarget);
      item.taskbarBtn.classList.toggle("is-active", isTarget);
    });
  }

  /**
   * Minimize jendela ke taskbar
   */
  function minimizeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;

    entry.isMinimized = true;
    entry.el.classList.add("is-minimized");
    entry.taskbarBtn.classList.remove("is-active");

    if (activeWindowId === id) {
      activeWindowId = null;
      focusTopmostVisibleWindow();
    }
  }

  /**
   * Restore jendela yang di-minimize
   */
  function restoreWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;

    entry.isMinimized = false;
    entry.el.classList.remove("is-minimized");
    focusWindow(id);
  }

  /**
   * Toggle Maximize / Restore ukuran jendela
   */
  function toggleMaximizeWindow(id) {
    if (isMobileViewport()) return;
    const entry = openWindows.get(id);
    if (!entry) return;

    entry.isMaximized = !entry.isMaximized;
    entry.el.classList.toggle("is-maximized", entry.isMaximized);
    focusWindow(id);
  }

  /**
   * Tutup jendela & hapus tombol taskbar-nya
   */
  function closeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;

    entry.el.remove();
    entry.taskbarBtn.remove();
    openWindows.delete(id);

    if (activeWindowId === id) {
      activeWindowId = null;
      focusTopmostVisibleWindow();
    }
  }

  function focusTopmostVisibleWindow() {
    let topCandidate = null;
    let topZ = -1;

    openWindows.forEach((item, key) => {
      if (!item.isMinimized) {
        const z = parseInt(item.el.style.zIndex || "0", 10);
        if (z > topZ) {
          topZ = z;
          topCandidate = key;
        }
      }
    });

    if (topCandidate) {
      focusWindow(topCandidate);
    }
  }

  /**
   * Pasang interaksi drag pada titlebar jendela (dinonaktifkan di mobile atau saat maximize)
   */
  function attachWindowDrag(winEl, titlebarEl, id) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    titlebarEl.addEventListener("pointerdown", (e) => {
      if (isMobileViewport()) return;
      if (e.target.closest(".xp-titlebar-controls")) return;
      const entry = openWindows.get(id);
      if (!entry || entry.isMaximized) return;

      isDragging = true;
      focusWindow(id);

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = winEl.offsetLeft;
      initialTop = winEl.offsetTop;

      titlebarEl.setPointerCapture(e.pointerId);
    });

    titlebarEl.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const workspace = document.getElementById("desktop-workspace");
      const maxLeft = (workspace ? workspace.clientWidth : window.innerWidth) - 80;
      const maxTop = (workspace ? workspace.clientHeight : window.innerHeight - 36) - 36;

      const nextLeft = Math.max(0, Math.min(maxLeft, initialLeft + (e.clientX - startX)));
      const nextTop = Math.max(0, Math.min(maxTop, initialTop + (e.clientY - startY)));

      winEl.style.left = `${nextLeft}px`;
      winEl.style.top = `${nextTop}px`;
    });

    const stopDrag = () => {
      isDragging = false;
    };

    titlebarEl.addEventListener("pointerup", stopDrag);
    titlebarEl.addEventListener("pointercancel", stopDrag);

    // Double click title bar untuk maximize/restore di desktop
    titlebarEl.addEventListener("dblclick", (e) => {
      if (e.target.closest(".xp-titlebar-controls")) return;
      toggleMaximizeWindow(id);
    });
  }

  /**
   * Pasang interaksi ubah ukuran (resize) lewat grip pojok kanan bawah
   */
  function attachWindowResize(winEl, gripEl, id) {
    if (!gripEl) return;
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let initialWidth = 0;
    let initialHeight = 0;

    gripEl.addEventListener("pointerdown", (e) => {
      if (isMobileViewport()) return;
      const entry = openWindows.get(id);
      if (!entry || entry.isMaximized) return;

      e.stopPropagation();
      isResizing = true;
      focusWindow(id);

      startX = e.clientX;
      startY = e.clientY;
      initialWidth = winEl.offsetWidth;
      initialHeight = winEl.offsetHeight;

      gripEl.setPointerCapture(e.pointerId);
    });

    gripEl.addEventListener("pointermove", (e) => {
      if (!isResizing) return;
      const workspace = document.getElementById("desktop-workspace");
      const maxW = (workspace ? workspace.clientWidth : window.innerWidth) - winEl.offsetLeft - 10;
      const maxH = (workspace ? workspace.clientHeight : window.innerHeight - 36) - winEl.offsetTop - 10;

      const nextW = Math.max(310, Math.min(maxW, initialWidth + (e.clientX - startX)));
      const nextH = Math.max(220, Math.min(maxH, initialHeight + (e.clientY - startY)));

      winEl.style.width = `${nextW}px`;
      winEl.style.height = `${nextH}px`;
    });

    const stopResize = () => {
      isResizing = false;
    };

    gripEl.addEventListener("pointerup", stopResize);
    gripEl.addEventListener("pointercancel", stopResize);
  }

  /**
   * Pasang event listener untuk tombol-tombol di dalam body jendela (tab, view switcher, kartu proyek)
   */
  function bindInternalWindowActions(winEl) {
    winEl.addEventListener("click", (e) => {
      // Biarkan link eksternal berjalan tanpa memicu aksi kartu
      if (e.target.closest("[data-stop-prop='true']")) {
        return;
      }

      // Tab navigasi Windows XP (mis. pada jendela Data Diri / sysdm.cpl)
      const tabBtn = e.target.closest("[data-tab-target]");
      if (tabBtn) {
        const targetId = tabBtn.getAttribute("data-tab-target");
        const tabsBar = tabBtn.closest(".xp-tabs-bar");
        const winBody = winEl.querySelector(".xp-window-body");
        if (tabsBar && winBody) {
          tabsBar.querySelectorAll(".xp-tab-btn").forEach((b) => {
            const isTarget = b === tabBtn;
            b.classList.toggle("is-active", isTarget);
            b.setAttribute("aria-selected", isTarget ? "true" : "false");
          });
          winBody.querySelectorAll(".xp-tab-panel").forEach((panel) => {
            if (panel.id === targetId) {
              panel.removeAttribute("hidden");
            } else {
              panel.setAttribute("hidden", "");
            }
          });
        }
        return;
      }

      // Switcher Mode Tampilan Windows Explorer (Kartu vs Rincian)
      const viewBtn = e.target.closest("[data-view-mode]");
      if (viewBtn) {
        const mode = viewBtn.getAttribute("data-view-mode");
        const cardsWrap = winEl.querySelector("#explorer-view-cards");
        const detailsWrap = winEl.querySelector("#explorer-view-details");
        const toolbar = viewBtn.closest(".explorer-toolbar");
        if (toolbar) {
          toolbar.querySelectorAll("[data-view-mode]").forEach((b) => {
            b.classList.toggle("is-pressed", b === viewBtn);
          });
        }
        if (cardsWrap && detailsWrap) {
          if (mode === "details") {
            cardsWrap.setAttribute("hidden", "");
            detailsWrap.removeAttribute("hidden");
          } else {
            detailsWrap.setAttribute("hidden", "");
            cardsWrap.removeAttribute("hidden");
          }
        }
        return;
      }

      // Tombol yang membuka menu lain
      const menuTrigger = e.target.closest("[data-open-menu]");
      if (menuTrigger) {
        const targetMenu = menuTrigger.getAttribute("data-open-menu");
        if (targetMenu) {
          openWindow(targetMenu);
        }
        return;
      }

      // Kartu / baris detail proyek di dalam jendela Portofolio
      const projTrigger = e.target.closest("[data-project-index]");
      if (projTrigger) {
        const idx = parseInt(projTrigger.getAttribute("data-project-index"), 10);
        if (!Number.isNaN(idx)) {
          openProjectDetailWindow(idx);
        }
      }
    });

    winEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const projCard = e.target.closest("[data-project-index]");
        if (projCard && (e.target === projCard || e.target.closest("[data-project-index]"))) {
          e.preventDefault();
          const idx = parseInt(projCard.getAttribute("data-project-index"), 10);
          if (!Number.isNaN(idx)) {
            openProjectDetailWindow(idx);
          }
        }
      }
    });
  }

  /**
   * Membuka jendela detail untuk salah satu proyek portofolio
   */
  function openProjectDetailWindow(index) {
    const projects = (window.SITE && window.SITE.projects) || [];
    const proj = projects[index];
    if (!proj) return;

    const id = `project-${index}`;
    const def = {
      id,
      title: `Detail Proyek: ${proj.title}`,
      shortTitle: proj.title,
      icon: "assets/icons/portfolio.svg",
      width: 600,
      height: 480
    };

    createOrFocusWindow(def, { project: proj, index });
  }

  /**
   * Membuka salah satu dari 5 menu utama (atau memfokuskannya jika sudah terbuka)
   */
  function openWindow(menuId) {
    const def = MENU_DEFINITIONS[menuId];
    if (!def) return;
    createOrFocusWindow(def, null);
  }

  function createOrFocusWindow(def, customData) {
    if (window.DesktopFX && typeof window.DesktopFX.playClick === "function") {
      window.DesktopFX.playClick();
    }

    // Satu jendela per menu: jika sudah ada, pulihkan & fokuskan
    if (openWindows.has(def.id)) {
      const existing = openWindows.get(def.id);
      if (existing.isMinimized) {
        restoreWindow(def.id);
      } else {
        focusWindow(def.id);
      }
      return;
    }

    triggerLoadingCursor();

    const windowsLayer = document.getElementById("windows-layer");
    const taskbarContainer = document.getElementById("taskbar-windows");
    const workspace = document.getElementById("desktop-workspace");
    if (!windowsLayer || !taskbarContainer) return;

    const winEl = document.createElement("section");
    winEl.className = "xp-window";
    winEl.setAttribute("role", "dialog");
    winEl.setAttribute("aria-label", def.title);
    winEl.dataset.windowId = def.id;

    // Hitung ukuran dan posisi bertingkat (cascade) agar nyaman di layar desktop
    const wsWidth = workspace ? workspace.clientWidth : window.innerWidth;
    const wsHeight = workspace ? workspace.clientHeight : window.innerHeight - 36;
    const width = Math.min(def.width, wsWidth - 28);
    const height = Math.min(def.height, wsHeight - 24);

    const cascadeOffset = (openCascadeCount % 6) * 26;
    openCascadeCount += 1;

    const left = Math.max(115, Math.min(wsWidth - width - 16, 135 + cascadeOffset));
    const top = Math.max(14, Math.min(wsHeight - height - 14, 24 + cascadeOffset));

    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    winEl.style.left = `${left}px`;
    winEl.style.top = `${top}px`;

    winEl.innerHTML = `
      <header class="xp-titlebar">
        <div class="xp-titlebar-left">
          <img src="${escapeHtml(def.icon)}" alt="" class="xp-titlebar-icon" />
          <span class="xp-titlebar-text">${escapeHtml(def.title)}</span>
        </div>
        <div class="xp-titlebar-controls">
          <button type="button" class="xp-ctrl-btn xp-ctrl-minimize" aria-label="Minimize ${escapeHtml(def.shortTitle)}" title="Minimize">
            <svg viewBox="0 0 12 12" aria-hidden="true"><line x1="2" y1="9.5" x2="9" y2="9.5"/></svg>
          </button>
          <button type="button" class="xp-ctrl-btn xp-ctrl-maximize" aria-label="Maximize ${escapeHtml(def.shortTitle)}" title="Maximize">
            <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8"/><line x1="2" y1="3.5" x2="10" y2="3.5"/></svg>
          </button>
          <button type="button" class="xp-ctrl-btn xp-ctrl-close" aria-label="Tutup ${escapeHtml(def.shortTitle)}" title="Tutup (Esc)">
            <svg viewBox="0 0 12 12" aria-hidden="true"><line x1="2.5" y1="2.5" x2="9.5" y2="9.5"/><line x1="9.5" y1="2.5" x2="2.5" y2="9.5"/></svg>
          </button>
        </div>
      </header>
      ${buildWindowMarkup(def.id, customData)}
    `;

    // Buat tombol di Taskbar
    const taskbarBtn = document.createElement("button");
    taskbarBtn.type = "button";
    taskbarBtn.className = "taskbar-item";
    taskbarBtn.setAttribute("aria-label", `Jendela ${def.shortTitle}`);
    taskbarBtn.innerHTML = `
      <img src="${escapeHtml(def.icon)}" alt="" class="taskbar-item-icon" />
      <span class="taskbar-item-title">${escapeHtml(def.shortTitle)}</span>
    `;

    taskbarBtn.addEventListener("click", () => {
      const current = openWindows.get(def.id);
      if (!current) return;
      if (current.isMinimized) {
        restoreWindow(def.id);
      } else if (activeWindowId === def.id) {
        minimizeWindow(def.id);
      } else {
        focusWindow(def.id);
      }
    });

    // Event klik pada jendela langsung menaikkannya ke depan
    winEl.addEventListener("pointerdown", () => {
      focusWindow(def.id);
    });

    // Tombol Minimize, Maximize, Close
    const minBtn = winEl.querySelector(".xp-ctrl-minimize");
    const maxBtn = winEl.querySelector(".xp-ctrl-maximize");
    const closeBtn = winEl.querySelector(".xp-ctrl-close");
    const titlebarEl = winEl.querySelector(".xp-titlebar");

    minBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeWindow(def.id);
    });

    maxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMaximizeWindow(def.id);
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow(def.id);
    });

    attachWindowDrag(winEl, titlebarEl, def.id);
    attachWindowResize(winEl, winEl.querySelector(".xp-resize-grip"), def.id);
    bindInternalWindowActions(winEl);

    windowsLayer.appendChild(winEl);
    taskbarContainer.appendChild(taskbarBtn);

    openWindows.set(def.id, {
      el: winEl,
      taskbarBtn,
      isMinimized: false,
      isMaximized: isMobileViewport()
    });

    focusWindow(def.id);
  }

  function closeActiveWindow() {
    if (activeWindowId && openWindows.has(activeWindowId)) {
      closeWindow(activeWindowId);
      return true;
    }
    return false;
  }

  // Jaga agar posisi jendela tetap berada di dalam area kerja saat ukuran layar berubah
  window.addEventListener("resize", () => {
    if (isMobileViewport()) return;
    const workspace = document.getElementById("desktop-workspace");
    if (!workspace) return;
    const wsWidth = workspace.clientWidth;
    const wsHeight = workspace.clientHeight;

    openWindows.forEach((item) => {
      if (item.isMaximized) return;
      const w = Math.min(item.el.offsetWidth || 600, wsWidth - 20);
      const h = Math.min(item.el.offsetHeight || 440, wsHeight - 20);
      const curLeft = parseInt(item.el.style.left || "80", 10);
      const curTop = parseInt(item.el.style.top || "24", 10);
      item.el.style.left = `${Math.max(0, Math.min(curLeft, Math.max(0, wsWidth - w)))}px`;
      item.el.style.top = `${Math.max(0, Math.min(curTop, Math.max(0, wsHeight - h)))}px`;
    });
  });

  window.WindowManager = {
    openWindow,
    openProjectDetailWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximizeWindow,
    focusWindow,
    closeActiveWindow,
    getMenuDefinitions: () => MENU_DEFINITIONS
  };
})();
