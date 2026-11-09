/**
 * js/main.js
 * Titik masuk inisialisasi aplikasi: layar boot opsional,
 * injeksi konten fallback SEO & aksesibilitas dari js/data.js, serta deteksi prefers-reduced-motion.
 */

(function () {
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /**
   * Membangun HTML CV lengkap untuk konten fallback yang dapat dibaca screen reader,
   * mesin pencari, serta mode "Versi Sederhana" bagi rekruter.
   */
  function buildPlainCvHtml(site) {
    const p = site.profile || {};
    const education = Array.isArray(site.education) ? site.education : [];
    const experience = Array.isArray(site.experience) ? site.experience : [];
    const projects = Array.isArray(site.projects) ? site.projects : [];
    const contact = site.contact || {};
    const skillGroups = Array.isArray(p.skillGroups) ? p.skillGroups : [];
    const skills = Array.isArray(p.skills) ? p.skills : [];
    const cvUrl = contact.cv || "cv.pdf";

    let skillsListHtml = "";
    if (skillGroups.length > 0) {
      skillsListHtml = skillGroups
        .map(
          (grp) => `
        <div style="margin-bottom: 6px;">
          <strong>${escapeHtml(grp.label)}:</strong>
          <span>${(grp.items || []).map(escapeHtml).join(", ")}</span>
        </div>
      `
        )
        .join("");
    } else {
      skillsListHtml = `<p>${skills.map(escapeHtml).join(" • ")}</p>`;
    }

    return `
      <div class="simple-cv-topbar" aria-label="Aksi Versi Sederhana">
        <span class="simple-cv-topbar-title">Curriculum Vitae — ${escapeHtml(p.name)}</span>
        <div class="simple-cv-topbar-actions">
          <button type="button" id="exit-simple-cv-btn" class="xp-btn xp-btn-primary">
            🗔 Kembali ke Desktop Windows XP
          </button>
          <button type="button" onclick="window.print()" class="xp-btn">
            🖶 Cetak Halaman
          </button>
          <a href="${escapeHtml(cvUrl)}" download class="xp-btn">
            <img src="assets/icons/pdf.svg" alt="" class="xp-btn-icon" />
            Download CV (PDF)
          </a>
        </div>
      </div>

      <main class="simple-cv-paper">
        <header>
          <h1>${escapeHtml(p.name)}</h1>
          ${p.role ? `<div class="simple-cv-role">${escapeHtml(p.role)}</div>` : ""}
          <div class="simple-cv-meta">
            <span><strong>Domisili:</strong> ${escapeHtml(p.location)}</span>
            ${p.address ? ` | <span><strong>Alamat:</strong> ${escapeHtml(p.address)}</span>` : ""}
            <br />
            <span><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></span>
            | <span><strong>WhatsApp:</strong> ${escapeHtml(contact.whatsapp)}</span>
            | <span><strong>GitHub:</strong> <a href="${escapeHtml(contact.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.github)}</a></span>
            | <span><strong>LinkedIn:</strong> <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.linkedin)}</a></span>
          </div>
        </header>

        <section aria-labelledby="cv-sec-profile">
          <h2 id="cv-sec-profile">1. Ringkasan Profil</h2>
          <p>${escapeHtml(p.summary)}</p>
        </section>

        <section aria-labelledby="cv-sec-skills">
          <h2 id="cv-sec-skills">2. Keahlian &amp; Teknologi</h2>
          ${skillsListHtml}
        </section>

        <section aria-labelledby="cv-sec-exp">
          <h2 id="cv-sec-exp">3. Riwayat Pekerjaan</h2>
          ${experience
            .map(
              (ex) => `
            <article class="simple-cv-entry">
              <div class="simple-cv-entry-head">
                <strong>${escapeHtml(ex.position)} — ${escapeHtml(ex.company)}</strong>
                <span>${escapeHtml(ex.start)} – ${escapeHtml(ex.end)}</span>
              </div>
              ${
                Array.isArray(ex.tech) && ex.tech.length
                  ? `<div style="font-size:12px; color:#4a4942; margin-top:2px;">Teknologi: ${ex.tech.map(escapeHtml).join(", ")}</div>`
                  : ""
              }
              ${
                Array.isArray(ex.tasks) && ex.tasks.length
                  ? `<div style="margin-top:5px;"><strong>Tanggung Jawab:</strong>
                     <ul>
                       ${ex.tasks.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
                     </ul></div>`
                  : ""
              }
              ${
                Array.isArray(ex.achievements) && ex.achievements.length
                  ? `<div style="margin-top:5px;"><strong>Proyek &amp; Kontribusi Utama:</strong>
                     <ul>
                       ${ex.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
                     </ul></div>`
                  : ""
              }
            </article>
          `
            )
            .join("")}
        </section>

        <section aria-labelledby="cv-sec-edu">
          <h2 id="cv-sec-edu">4. Riwayat Pendidikan</h2>
          ${education
            .map(
              (ed) => `
            <article class="simple-cv-entry">
              <div class="simple-cv-entry-head">
                <strong>${escapeHtml(ed.institution)}</strong>
                <span>${escapeHtml(ed.start)} – ${escapeHtml(ed.end)}</span>
              </div>
              <div>Program Studi: ${escapeHtml(ed.major)} ${ed.gpa ? `| IPK: ${escapeHtml(ed.gpa)}` : ""}</div>
              ${ed.notes ? `<p style="margin:4px 0 0 0;">${escapeHtml(ed.notes)}</p>` : ""}
            </article>
          `
            )
            .join("")}
        </section>

        <section aria-labelledby="cv-sec-proj">
          <h2 id="cv-sec-proj">5. Portofolio Proyek Pribadi</h2>
          ${projects
            .map(
              (pr) => `
            <article class="simple-cv-entry">
              <div class="simple-cv-entry-head">
                <strong>${escapeHtml(pr.title)}</strong>
                ${
                  pr.repo && !String(pr.repo).includes("[ISI DI SINI")
                    ? `<a href="${escapeHtml(pr.repo)}" target="_blank" rel="noopener noreferrer">Repo GitHub ↗</a>`
                    : ""
                }
              </div>
              <p style="margin:3px 0 5px 0;">${escapeHtml(pr.description)}</p>
              <div style="font-size:12px; color:#4a4942;">
                <strong>Teknologi:</strong> ${(pr.tech || []).map(escapeHtml).join(", ")}
              </div>
              ${
                Array.isArray(pr.highlights) && pr.highlights.length
                  ? `<ul>
                       ${pr.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
                     </ul>`
                  : ""
              }
            </article>
          `
            )
            .join("")}
        </section>

        <section aria-labelledby="cv-sec-contact">
          <h2 id="cv-sec-contact">6. Kontak &amp; Unduh Berkas</h2>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
            <li><strong>WhatsApp:</strong> <a href="${escapeHtml(contact.whatsappUrl || "https://wa.me/6289630458220")}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.whatsapp)}</a></li>
            <li><strong>LinkedIn:</strong> <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.linkedin)}</a></li>
            <li><strong>GitHub:</strong> <a href="${escapeHtml(contact.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.github)}</a></li>
          </ul>
        </section>
      </main>
    `;
  }

  function setSimpleCvMode(enable) {
    if (enable) {
      document.body.classList.add("is-simple-cv");
      window.location.hash = "cv";
    } else {
      document.body.classList.remove("is-simple-cv");
      if (window.location.hash === "#cv") {
        history.replaceState(null, document.title, window.location.pathname);
      }
    }
  }

  function populateSeoFallback() {
    const site = window.SITE || {};
    const p = site.profile || {};
    const html = buildPlainCvHtml(site);

    if (p.name) {
      const cleanName = String(p.name).replace(/\[ISI DI SINI:\s*|\]/g, "");
      const cleanRole = p.role ? String(p.role).replace(/\[ISI DI SINI:\s*|\]/g, "") : "Portofolio & CV";
      const pageTitle = `${cleanName} — ${cleanRole} | Portofolio & CV Windows XP`;
      document.title = pageTitle;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && p.summary) {
        metaDesc.setAttribute("content", `${cleanName} (${cleanRole}): ${p.summary}`);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", pageTitle);
      }
    }

    const seoFallback = document.getElementById("seo-accessible-cv");
    if (seoFallback) {
      seoFallback.innerHTML = html;
      const exitBtn = document.getElementById("exit-simple-cv-btn");
      if (exitBtn) {
        exitBtn.addEventListener("click", () => {
          setSimpleCvMode(false);
        });
      }
    }
  }

  /**
   * Mengelola layar boot Windows XP berdasarkan flag SITE.config.bootScreen
   */
  function handleBootScreen() {
    const bootEl = document.getElementById("boot-screen");
    if (!bootEl) return;

    const shouldShowBoot =
      window.SITE &&
      window.SITE.config &&
      window.SITE.config.bootScreen === true &&
      !prefersReducedMotion();

    if (!shouldShowBoot) {
      bootEl.setAttribute("hidden", "");
      return;
    }

    bootEl.removeAttribute("hidden");

    // Putar sound startup saat booting (assets/sounds/sound.mp3)
    if (window.DesktopFX && typeof window.DesktopFX.playStartupSound === "function") {
      window.DesktopFX.playStartupSound();
    }

    // Interaksi klik/sentuh di layar boot langsung memicu pemutaran jika terhalang kebijakan autoplay peramban
    bootEl.addEventListener(
      "pointerdown",
      () => {
        if (window.DesktopFX && typeof window.DesktopFX.playStartupSound === "function") {
          window.DesktopFX.playStartupSound();
        }
      },
      { once: true }
    );

    const finishBoot = () => {
      if (bootEl.hasAttribute("hidden")) return;
      bootEl.style.opacity = "0";
      window.setTimeout(() => {
        bootEl.setAttribute("hidden", "");
        bootEl.style.opacity = "1";
      }, 350);
    };

    window.setTimeout(finishBoot, 2000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    populateSeoFallback();

    if (window.DesktopFX && typeof window.DesktopFX.initDesktopEvents === "function") {
      window.DesktopFX.initDesktopEvents();
    }

    if (window.location.hash === "#cv") {
      setSimpleCvMode(true);
    }

    handleBootScreen();
  });

  window.App = {
    setSimpleCvMode,
    isSimpleCvMode: () => document.body.classList.contains("is-simple-cv")
  };
})();
