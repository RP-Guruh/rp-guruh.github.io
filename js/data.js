const SITE = {
  config: {
    bootScreen: true,
    sounds: true,
    language: "id"
  },

  profile: {
    name: "Guruh Rachmat Pribadi",
    role: "Web Programmer (Pengembang Aplikasi Web dan Desktop)",
    birthDate: "Jakarta, 23 Juli 1998",
    location: "Cipayung, Kota Depok",
    address: "Jalan Rawa Sari, Cipayung, Kota Depok",
    photo: "assets/photo.jpg",
    photoNote: "[ISI DI SINI]",
    summary:
      "Pengembang aplikasi web dan desktop dengan pengalaman menggunakan Laravel dan Ruby on Rails untuk membangun aplikasi web yang efisien dan terstruktur. Untuk aplikasi desktop, terbiasa memakai Qt (Python) dan Slint (Rust) sehingga dapat membuat antarmuka yang responsif dan modern. Terampil menganalisis kebutuhan pengguna dan menerjemahkannya menjadi solusi perangkat lunak yang fungsional dan mudah digunakan.",
    skills: [
      "Laravel",
      "MySQL",
      "PostgreSQL",
      "RESTful API",
      "Git",
      "Java & Spring Boot",
      "JavaFX",
      "AI / RAG Integration"
    ],
    skillGroups: [
      {
        label: "Web Development",
        items: ["Laravel", "Ruby on Rails (BEGINNER)", "Golang (BEGINNER)", "Tailwind CSS", "Bootstrap"]
      },
      {
        label: "Desktop Development",
        items: ["Qt (Python)", "Slint (Rust)"]
      },
      {
        label: "Database",
        items: ["MySQL", "SQLite", "PostgreSQL (pgvector)"]
      },
      {
        label: "API & Tools",
        items: ["RESTful API", "Git"]
      },
      {
        label: "Skill Tambahan (Proyek Pribadi)",
        items: ["Java", "Spring Boot", "JavaFX", "Integrasi AI / RAG (Ollama, Spring AI)"]
      }
    ]
  },

  education: [
    {
      institution: "Universitas Indraprasta PGRI, Jakarta Timur",
      major: "Teknik Informatika",
      start: "2016",
      end: "2020",
      gpa: "3.68",
      notes:
        "Fokus pada pengembangan aplikasi dan sistem berbasis web. Pada program Kuliah Kerja Praktik (KKP), dipercaya mengembangkan aplikasi web berbasis Progressive Web App (PWA) di PT Synergi Properti. Aplikasi ini mendukung tim marketing menjangkau pelanggan lebih efektif lewat platform yang cepat, ringan, dan bisa digunakan secara offline. Proyek ini mengasah kemampuan membangun solusi web modern dan memperkuat pemahaman tentang bagaimana teknologi memberi nilai nyata bagi kebutuhan bisnis."
    }
  ],

  experience: [
    {
      company: "PT Dwi Tunggal Putra (Menara Tendean / MTen), Jakarta Selatan",
      position: "Web Programmer",
      start: "Mei 2022",
      end: "Sekarang",
      tech: ["Laravel", "Vue.js", "Metronic (Bootstrap Template)", "Tailwind CSS"],
      tasks: [
        "Mengembangkan dan memelihara berbagai aplikasi internal dan eksternal berbasis web yang dipakai seluruh divisi perusahaan.",
        "Fokus pada efisiensi sistem, integrasi proses bisnis, dan peningkatan pengalaman pengguna, baik internal maupun pelanggan."
      ],
      achievements: [
        "Sistem ERP internal (modul sales, pre sales, logistik, keuangan, purchasing, HR management, operasional, hingga IT support): menyatukan alur kerja antar-divisi dalam satu sistem terstruktur, mempercepat pelaporan dan pengambilan keputusan, mengurangi duplikasi data dan human error, serta mempercepat pencarian riwayat request user.",
        "Aplikasi pemantauan kapal (modul CCTV): menampilkan rekaman tangkapan berdasarkan channel dan tanggal untuk mempermudah tim operasional (customer) memantau aktivitas kapal serta mendukung dokumentasi audit atau laporan.",
        "Sistem email massal ke pelanggan: pengiriman berdasarkan kategori dan template yang bisa dipilih, mempercepat komunikasi massal dengan format konsisten dan tepat waktu.",
        "Portal pelanggan: pelanggan memantau layanan yang digunakan secara mandiri dengan data real-time, meningkatkan transparansi layanan, dan mengurangi beban tim customer service.",
        "Sistem pengajuan biaya perjalanan dinas digital: menggantikan form kertas, menghilangkan potensi manipulasi data pengajuan, mempercepat persetujuan dan pencatatan biaya, serta mempermudah pelacakan dan rekapitulasi biaya dinas."
      ]
    },
    {
      company: "Universitas Indonesia Maju, Lenteng Agung, Jakarta Selatan",
      position: "Staff IT",
      start: "Januari 2020",
      end: "April 2022",
      tech: ["Sistem Informasi Akademik", "Aplikasi Internal Kampus"],
      tasks: [
        "Mendukung operasional IT harian dan kebutuhan teknis berbagai divisi, terutama sistem informasi akademik dan pelaporan administratif.",
        "Selain support teknis, aktif mengembangkan aplikasi internal untuk meningkatkan efisiensi dan mengurangi proses manual."
      ],
      achievements: [
        "Sistem pencetakan ijazah mahasiswa: divisi BAAK dapat mencetak otomatis tanpa menyesuaikan desain satu per satu di Microsoft Publisher, menghemat waktu pencetakan secara signifikan, mengurangi risiko kesalahan layout dan data, serta menstandarkan format ijazah.",
        "Aplikasi internal on-demand untuk unit kampus (program studi, keperawatan, administrasi), antara lain sistem evaluasi program studi dan aplikasi triase keperawatan."
      ]
    }
  ],

  projects: [
    {
      id: "rag-studio",
      title: "RAG Studio, Platform AI Multi-Project",
      description:
        "Studio RAG (Retrieval-Augmented Generation) desktop lokal dengan isolasi data per proyek, untuk mengunggah dokumen lalu menanyakannya lewat chatbot.",
      thumbnail: "assets/project/multiple_rag/gambar1.png",
      images: [
        "assets/project/multiple_rag/gambar1.png",
        "assets/project/multiple_rag/gambar2.png",
        "assets/project/multiple_rag/gambar3.png"
      ],
      tech: [
        "Java 21/25",
        "Spring Boot 4",
        "JavaFX 23",
        "PostgreSQL + pgvector",
        "SQLite",
        "Apache PDFBox",
        "Apache POI",
        "Ollama"
      ],
      demo: "",
      repo: "https://github.com/RP-Guruh/multiple-rag-project",
      highlights: [
        "Ingesti dokumen PDF, Word, Excel, dan teks, dengan OCR berbasis vision untuk PDF hasil scan.",
        "Pemecahan teks (chunking) rekursif, embedding vektor dengan fallback otomatis ke Ollama lokal.",
        "Pencarian hybrid: kemiripan vektor (HNSW cosine) dikombinasikan dengan pencocokan kata kunci.",
        "Isolasi pengetahuan ketat per proyek dan jawaban hanya berdasarkan konteks dokumen.",
        "Antarmuka desktop modern dengan dashboard, unggah drag-and-drop, dan playground chatbot."
      ]
    },
    {
      id: "9router-cli",
      title: "9Router CLI (Spring Shell AI)",
      description:
        "CLI interaktif berbasis Spring Shell untuk chat dengan model AI langsung dari terminal. Kompatibel dengan OpenAI API, 9Router, Ollama, vLLM, dan sejenisnya.",
      thumbnail: "assets/project/shell_ai/gambar_1.png",
      images: [
        "assets/project/shell_ai/gambar_1.png"
      ],
      tech: [
        "Java 21",
        "Spring Boot",
        "Spring Shell",
        "Spring AI",
        "PostgreSQL + pgvector",
        "Ollama (bge-m3)",
        "JLine"
      ],
      demo: "",
      repo: "https://github.com/RP-Guruh/spring-shell-ai",
      highlights: [
        "Chat terminal dengan streaming respons, spinner, dan render markdown.",
        "Mention file dan gambar dengan @path plus autocomplete Tab, mendukung analisis gambar (multimodal vision).",
        "Tool calling dinamis (cuaca dan manipulasi file) dengan persetujuan pengguna di terminal (human-in-the-loop).",
        "Manajemen konteks otomatis: kompresi riwayat obrolan di latar belakang saat batas token terlampaui.",
        "Memori jangka panjang semantik (pgvector, embedding 1024 dimensi) dan pencarian riwayat dengan /search."
      ]
    },
    {
      id: "susut-ink",
      title: "Susut.ink, Aplikasi Short URL",
      description:
        "Web pemendek tautan (URL shortener) mirip Bit.ly untuk membuat tautan pendek dari URL panjang.",
      thumbnail: "assets/icons/project-2.svg",
      thumbnailNote: "[ISI DI SINI]",
      tech: ["Golang (Gofiber)", "SQLite", "Tailwind CSS"],
      demo: "[ISI DI SINI] (kemungkinan susut.ink)",
      repo: "[ISI DI SINI]",
      highlights: [
        "Memudahkan berbagi tautan ringkas dan rapi untuk sosial media, kampanye, atau pelacakan.",
        "Dibangun sebagai latihan skalabilitas dan kecepatan dengan Gofiber sebagai backend ringan."
      ]
    },
    {
      id: "lead-generator",
      title: "Lead Generator, Aplikasi Scraping Lokasi dan Sosial Media",
      description:
        "Aplikasi desktop untuk scraping data dari Google Maps dan sosial media, untuk kebutuhan marketing, riset lokasi bisnis, dan analisis pesaing.",
      thumbnail: "assets/icons/project-3.svg",
      thumbnailNote: "[ISI DI SINI]",
      tech: ["Python", "Qt", "SQLite"],
      demo: "",
      repo: "[ISI DI SINI]",
      highlights: [
        "Membantu tim marketing mengumpulkan informasi usaha sejenis di wilayah tertentu.",
        "Hasil scraping dapat diekspor ke Excel untuk analisis dan segmentasi prospek.",
        "Cocok untuk riset pasar lokal, direct marketing, dan strategi promosi."
      ]
    },
    {
      id: "shalat-reminder",
      title: "Shalat Reminder, Aplikasi Pengingat Waktu Shalat",
      description:
        "Aplikasi desktop ringan yang mengingatkan pengguna saat waktu shalat tiba.",
      thumbnail: "assets/icons/project-5.svg",
      thumbnailNote: "[ISI DI SINI]",
      tech: ["Rust", "Slint"],
      demo: "",
      repo: "[ISI DI SINI]",
      highlights: [
        "Notifikasi waktu shalat beserta suara adzan otomatis.",
        "Multi-platform (Windows dan Linux).",
        "Pengingat langsung di desktop tanpa perlu membuka aplikasi mobile."
      ]
    }
  ],

  contact: {
    email: "github.guruh@gmail.com",
    whatsapp: "0896 3045 8220",
    whatsappUrl: "https://wa.me/6289630458220",
    linkedin: "https://www.linkedin.com/in/guruh-rachmat-pribadi",
    github: "https://github.com/RP-Guruh",
    location: "Cipayung, Kota Depok",
    cv: "cv.pdf",
    cvNote: "[ISI DI SINI]"
  }
};

window.SITE = SITE;
