# RAG Studio

RAG Studio adalah aplikasi desktop untuk menyiapkan project RAG. Setiap project menyimpan dokumen dan persona sendiri, sehingga knowledge base antarproject tidak tercampur.

Aplikasi menyediakan pengaturan chat model, embedding model, PostgreSQL, dan Docling. Playground dipakai untuk menguji apakah jawaban model sudah sesuai dengan knowledge base project.

## Daftar isi

- [Panduan cepat](#panduan-cepat)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [First-run setup](#first-run-setup)
- [Arsitektur](#arsitektur)
- [Alur aplikasi](#alur-aplikasi)
- [Model data](#model-data)
- [Konfigurasi](#konfigurasi)
- [Keamanan kredensial](#keamanan-kredensial)
- [Mode server](#mode-server)
- [Verifikasi rilis](#verifikasi-rilis)
- [Troubleshooting](#troubleshooting)
- [Build dari sumber](#build-dari-sumber)
- [Pengujian](#pengujian)
- [Status implementasi](#status-implementasi)
- [Struktur direktori](#struktur-direktori)

## Panduan cepat

Dua jalur yang tersedia:

**Coba tanpa setup.** Jalankan aplikasi, lalu pilih **Continue as guest**. Mode ini memakai project contoh `Demo — Solaria` dan data contoh. Tidak perlu Docker, PostgreSQL, Docling, atau Ollama. Aksi yang mengubah data dinonaktifkan.

**Pakai knowledge base sendiri.** Siapkan Docker dan Ollama, jalankan stack lokal dari menu **Settings → Setup & health**, daftar akun admin pertama, lalu buat project dan latih dokumen. Langkapnya ada di [First-run setup](#first-run-setup).

## Prasyarat

| Skenario | Yang diperlukan |
| --- | --- |
| Demo guest | Aplikasi saja |
| Stack lokal | Docker Engine + Docker Compose plugin, library GTK4/WebKitGTK di Linux atau WebView2 di Windows, Ollama yang dipasang user |
| API hosted | PostgreSQL + pgvector, docling-serve, API key penyedia model |
| Mode server | Docker, environment variable untuk rahasia, opsional sertifikat Authenticode untuk installer Windows |

Docker hanya diperlukan untuk menjalankan PostgreSQL dan Docling. Ollama tidak ikut dibundling dan tidak diunduh otomatis.

## Instalasi

Aset release tersedia di `https://github.com/RP-Guruh/rag-studio/releases`.

**Debian/Ubuntu**

```bash
sudo apt install ./rag-studio_0.1.3_amd64.deb
rag-studio
```

Package `.deb` menarik dependensi `libgtk-4-1` dan `libwebkitgtk-6.0-4` lewat apt.

**Windows**

Jalankan `rag-studio-0.1.3-windows-amd64-setup.exe`, lalu buka RAG Studio dari Start Menu. WebView2 biasanya sudah tersedia di Windows 10/11.

**Arsip Linux/macOS**

```bash
mkdir -p ~/rag-studio
cd ~/rag-studio
tar -xzf ~/Downloads/rag-studio-v0.1.3-linux-amd64.tar.gz
sudo apt install -y libgtk-4-1 libwebkitgtk-6.0-4
chmod +x rag-studio
./rag-studio
```

## First-run setup

1. Buka aplikasi, lalu pada layar login pilih **Set up RAG Studio first (Docker, database, models)**. Halaman setup sengaja bisa dibuka sebelum ada akun.
2. Buka **Settings → Setup & health**, lalu klik **Start local stack**. Docker menjalankan `pgvector/pgvector:pg16` dan `docling-serve`.
3. Tunggu status `PostgreSQL: ready` dan `Docling: ready`. Klik **Refresh** bila perlu.
4. Klik **Use local preset**. Pengaturan Database, Docling, embedding, dan chat model terisi otomatis.
5. Restart aplikasi sekali agar migrasi PostgreSQL berjalan dengan konfigurasi baru.
6. Pasang Ollama dari `ollama.com/download`, jalankan `ollama serve`, lalu tarik model:

```bash
ollama pull bge-m3
ollama pull llama3.1
```

7. Kembali ke layar login, lalu daftar akun pertama. Akun ini menjadi admin.
8. Buat project lewat tombol **New project**, atur tab **Persona**, lalu upload dokumen di tab **Knowledge Base**.
9. Klik **Train knowledge base**. Tunggu status dokumen menjadi **Ready**.
10. Buka **Playground** dan ajukan pertanyaan. Panel kanan menampilkan retrieved chunks. Tab **Evaluation** dipakai untuk mengukur kecocokan jawaban dan sumber.

Admin dapat membuat sub-user di **Settings → Users** dan memilih project yang diplot kepadanya. Sub-user bersifat **read-only**: hanya melihat dan bertanya pada project yang di-assign; tidak bisa menambah/mengubah project, mengubah persona, training, maupun membuka Settings.

## Arsitektur

```mermaid
flowchart TB
    subgraph Desktop["Desktop — Wails v3"]
        UI["Vue 3 + TypeScript + Vite"]
        Bridge["Wails bindings<br/>@wailsio/runtime + event bus"]
        Services["Go services<br/>Auth · Settings · Project · Stack · Update · Greet"]
        Domain["Domain<br/>auth · settings · projects · training<br/>embedding · chat · docling"]
        UI -->|"method call"| Bridge
        Bridge --> Services
        Services --> Domain
        Services -.->|"training:progress / training:finished<br/>chat:token / chat:done<br/>update:progress"| UI
    end

    subgraph Local["Penyimpanan lokal per user"]
        SQLite[("SQLite<br/>settings.db + auth_session")]
        Keyring["OS keyring<br/>encrypted file fallback"]
        Files[("File dokumen<br/>UserConfigDir/rag-studio/projects/id/documents")]
        Log["rag-studio.log"]
    end

    subgraph External["Layanan eksternal"]
        PG[("PostgreSQL + pgvector")]
        Docling["docling-serve"]
        Models["Chat & embedding<br/>Ollama · OpenAI-compatible<br/>Anthropic · HuggingFace"]
        GitHub["GitHub Releases"]
        Docker["Docker Compose<br/>Postgres + Docling"]
    end

    Domain --> SQLite
    Domain --> Keyring
    Domain --> Files
    Domain --> Log
    Domain --> PG
    Domain --> Docling
    Domain --> Models
    Services --> Docker
    Services --> GitHub
```

`main.go` menyambungkan store ke service Wails, menjalankan migrasi PostgreSQL saat startup bila konfigurasi sudah lengkap, lalu membuka window 1024×768. Frontend memanggil backend lewat binding dan tidak membuka PostgreSQL atau keyring sendiri.

`ProjectService` membuka koneksi PostgreSQL per operasi. `training.Manager` menjalankan maksimal dua worker dan memancarkan progres lewat event Wails.

## Alur aplikasi

```mermaid
flowchart TD
    A["Buka aplikasi"] --> B["Continue as guest<br/>demo tanpa backend"]
    B --> C["Project demo Solaria<br/>Playground pakai data contoh"]
    C --> D["Set up RAG Studio"]
    A --> E["Register<br/>akun pertama menjadi admin"]
    E --> F["Settings → Setup & health"]
    D --> F
    F --> G["Start local stack<br/>Postgres + Docling via Docker Compose"]
    G --> H["Use local preset"]
    H --> I["Restart aplikasi sekali"]
    I --> J["Install Ollama<br/>pull bge-m3 dan llama3.1"]
    J --> K["Buat project + atur Persona"]
    K --> L["Upload PDF/MD/TXT/DOC/DOCX maks 50 MB"]
    L --> M["Train knowledge base"]
    M --> N["pending → processing → indexed"]
    M --> O["failed + error_message"]
    N --> P["Playground<br/>chat streaming, sources, retrieved chunks"]
    P --> Q["Evaluation<br/>answer match dan source match"]
    E --> R["Admin membuat sub-user<br/>dan memplot project"]
```

Saat training berjalan, Docling memotong dokumen, embedder membuat vektor, lalu `chunks.embedding` diisi. Dokumen ditandai `indexed` hanya setelah semua chunk tersimpan.

## Model data

### PostgreSQL

```mermaid
erDiagram
    USERS ||--o{ USER_PROJECTS : "mengakses"
    PROJECTS ||--o{ USER_PROJECTS : "diplot"
    PROJECTS ||--o| PROJECT_PERSONAS : "memiliki"
    PROJECTS ||--o{ DOCUMENTS : "memiliki"
    DOCUMENTS ||--o{ CHUNKS : "dipotong"
    PROJECTS ||--o| PROJECT_RETRIEVAL : "pengaturan retrieval"
    PROJECTS ||--o{ EVAL_SETS : "memiliki"
    EVAL_SETS ||--o{ EVAL_CASES : "berisi"

    SCHEMA_MIGRATIONS {
        integer version PK
        text name
        timestamptz applied_at
    }
    APP_CONFIG {
        text key PK
        text value
    }
    USERS {
        uuid id PK
        text email UK
        text password_hash
        text role "admin_user"
        timestamptz created_at
        timestamptz updated_at
    }
    USER_PROJECTS {
        uuid user_id PK, FK
        uuid project_id PK, FK
    }
    PROJECTS {
        uuid id PK
        text name
        text description
        timestamptz created_at
        timestamptz updated_at
    }
    PROJECT_PERSONAS {
        uuid project_id PK, FK
        text persona_name
        text role
        text instructions
        text tone "neutral, friendly, formal, concise"
        text answer_language
        boolean strict_knowledge
        timestamptz updated_at
    }
    DOCUMENTS {
        uuid id PK
        uuid project_id FK
        text filename
        text mime_type
        bigint size_bytes
        text sha256 "UNIQUE(project_id, sha256)"
        text storage_path
        text status "pending, processing, chunked, indexed, failed"
        text error_message
        jsonb parse_options
        text embedding_model
        integer embedding_dimension
        integer chunk_count
        timestamptz created_at
        timestamptz indexed_at
    }
    CHUNKS {
        bigint id PK
        uuid document_id FK
        uuid project_id FK
        integer chunk_index "UNIQUE(document_id, chunk_index)"
        text content
        integer token_count
        integer page_number
        jsonb metadata
        vector embedding "vector(N), HNSW cosine"
    }
    PROJECT_RETRIEVAL {
        uuid project_id PK, FK
        integer top_k
        real min_score
        boolean hybrid
        boolean rerank
        boolean guardrails
        real hybrid_weight
        real rerank_weight
    }
    PROMPT_TEMPLATES {
        uuid id PK
        text name UK
        text instructions
        timestamptz created_at
    }
    EVAL_SETS {
        uuid id PK
        uuid project_id FK
        text name
        timestamptz created_at
    }
    EVAL_CASES {
        uuid id PK
        uuid set_id FK
        text question
        text expected_answer
        text expected_source_name
        timestamptz created_at
    }
```

Indeks yang dipakai:

- `idx_documents_project` untuk dokumen per project.
- `idx_chunks_project` membatasi pencarian ke satu project.
- `idx_chunks_embedding` memakai HNSW dengan `vector_cosine_ops`.
- `ON DELETE CASCADE` dari `projects → documents → chunks` menghapus turunan saat project dihapus.

### SQLite

```mermaid
erDiagram
    CHAT_MODEL_SETTINGS {
        integer id PK
        text provider
        text base_url
        text model_name
        real temperature
        integer max_output_tokens
        boolean api_key_set
        text api_key_hint
        boolean configured
    }
    EMBEDDING_MODEL_SETTINGS {
        integer id PK
        text provider
        text base_url
        text model_name
        integer vector_dimension
        integer chunk_max_tokens
        text tokenizer
        boolean api_key_set
        text api_key_hint
        boolean configured
    }
    DATABASE_SETTINGS {
        integer id PK
        text host
        integer port
        text database_name
        text username
        boolean password_set
        text password_hint
        text ssl_mode
        text schema_name
        boolean configured
    }
    DOCLING_CONNECTION {
        integer id PK
        text mode
        text base_url
        boolean api_key_set
        text api_key_hint
        integer timeout_seconds
        boolean configured
    }
    AUTH_SESSION {
        integer id PK
        text user_id
    }
```

Tabel konfigurasi berisi satu baris dengan `id = 1`. Nilai `configured` dihitung dari keberadaan baris, bukan kolom tersimpan. Kunci API dan password tidak disimpan di SQLite, hanya status `set` dan hint.

## Konfigurasi

| Halaman | Field utama | Catatan |
| --- | --- | --- |
| Setup & health | Status Docker, Postgres, Docling, Ollama | Start/stop stack lokal dan terapkan preset |
| Chat model | Provider, base URL, API key, model, temperature, max tokens | Provider: OpenAI-compatible, Anthropic, Ollama |
| Embedding model | Provider, base URL, API key, model, dimensi, chunk max tokens, tokenizer | Provider: OpenAI-compatible, Ollama, HuggingFace |
| Database | Host, port, nama, user, password, SSL, schema | Save menjalankan migrasi PostgreSQL |
| Document processing | Mode, base URL, timeout, API key | `serve` memakai docling-serve; `local` berarti server di mesin sendiri |
| Users | Email, password, plot project | Hanya admin |

Mengubah model atau dimensi embedding memerlukan re-index. Aplikasi menghapus vektor lama dan mereset dokumen agar di-embed ulang.

## Keamanan kredensial

API key dan password database disimpan di OS keyring. Bila keyring tidak tersedia, dipakai file terenkripsi di direktori konfigurasi. SQLite hanya menyimpan flag `set` dan hint.

Password akun di-hash dengan bcrypt di PostgreSQL. Session desktop disimpan di SQLite. Mode server membaca rahasia dari environment variable `RAG_STUDIO_*`.

## Mode server

File `deploy/server/docker-compose.yml` menjalankan aplikasi dalam mode server bersama PostgreSQL dan Docling. Aktifkan dengan `RAG_STUDIO_SERVER=1`.

Environment variable yang dipakai:

- `RAG_STUDIO_CONFIG_DIR` untuk direktori data.
- `RAG_STUDIO_CHAT_API_KEY`, `RAG_STUDIO_EMBEDDING_API_KEY`, `RAG_STUDIO_DOCLING_API_KEY`, `RAG_STUDIO_DB_PASSWORD`.
- `RAG_DB_PASSWORD` untuk container PostgreSQL.

Admin dan sub-user memakai database yang sama dengan mode desktop.

## Verifikasi rilis

Setiap rilis menyertakan `SHA256SUMS`.

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

Package `.deb` ditandatangani dengan kunci rilis. Import kunci publik dan verifikasi:

```bash
gpg --import docs/rag-studio-release.gpg.key
gpg --fingerprint 863320B6B89B26B2988B55883D8DC7AC7D242CF0
dpkg-sig --verify rag-studio_0.1.3_amd64.deb
gpg --verify rag-studio_0.1.3_amd64.deb.asc rag-studio_0.1.3_amd64.deb
```

Fingerprint: `863320B6B89B26B2988B55883D8DC7AC7D242CF0`.

Untuk maintainer, workflow membutuhkan secret `GPG_PRIVATE_KEY`, `GPG_KEY_ID`, dan `GPG_PASSPHRASE` bila kunci dilindungi. Installer Windows ditandatangani bila `WINDOWS_PFX_BASE64` dan `WINDOWS_PFX_PASSWORD` tersedia.

## Troubleshooting

**Register gagal dengan pesan `database is not configured`.** Buka **Settings → Setup & health** lebih dulu, jalankan stack lokal, terapkan preset, lalu restart aplikasi.

**`docker compose up` exit 1.** Periksa hal berikut:

```bash
docker compose version
docker info
ss -ltnp | grep -E '5432|5001'
cd ~/.config/rag-studio/stack && docker compose up -d && docker compose logs --tail=100
```

User harus masuk grup `docker`, lalu logout dan login ulang setelah `usermod -aG docker $USER`.

Bila error menyebut `docker-credential-desktop` atau `error getting credentials`, file `~/.docker/config.json` masih memakai credential helper Docker Desktop. Hapus `"credsStore": "desktop"` sehingga berisi `{"auths": {}}`, atau install Docker Desktop. Aplikasi juga menyediakan tombol **Retry with clean Docker config** yang menjalankan stack dengan konfigurasi Docker terisolasi.

**Status Docling tetap stopped.** Periksa `docker compose ps -a` dan log container. Port 5001 tidak boleh dipakai layanan lain.

**Ollama tidak terdeteksi.** Jalankan `ollama serve`, lalu pastikan `http://localhost:11434/api/tags` merespons.

**Jawaban menyatakan knowledge base kosong.** Dokumen belum berstatus `Ready`. Klik **Re-index knowledge base**, lalu tunggu proses selesai.

## Build dari sumber

Prasyarat: Go 1.26 atau lebih baru, Node.js dan npm, Wails v3 CLI, serta Task.

```bash
cd frontend && npm install && cd ..
task dev
task build
task package
task bindings
```

Regenerate binding diperlukan setelah method Go diubah.

## Pengujian

```bash
go test ./internal/auth ./internal/chat ./internal/embedding ./internal/projects ./internal/settings ./internal/training ./internal/stack
cd frontend && npm run build:dev
```

Paket yang bergantung pada Wails tidak dapat di-test penuh di Linux tanpa library GTK4 dan WebKitGTK. Pengecekan tipe dapat dilakukan dengan:

```bash
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build .
```

## Status implementasi

| Fitur | Status |
| --- | --- |
| Settings, migrasi PostgreSQL, project, persona | Selesai |
| Upload dokumen, dedup SHA-256, training, embedding, vektor | Selesai |
| Playground chat streaming, sources, retrieved chunks, panel debug | Selesai |
| Auth admin, sub-user, plot project, demo guest | Selesai |
| Evaluation, retrieval tuning, export/import, backup | Selesai |
| Local stack Docker Compose, health dashboard | Selesai |
| GitHub Releases, checksum, tanda tangan GPG | Selesai |
| Tanda tangan Authenticode Windows | Menunggu sertifikat |

## Struktur direktori

```text
main.go                  composition root Wails
internal/auth            akun, session, otorisasi project
internal/chat            chat client, prompt, guardrail, streaming
internal/docling         adapter doclingclient
internal/embedding       embedder untuk tiga provider
internal/projects        model, store PostgreSQL, skema, retrieval, evaluasi
internal/service         service yang di-bind ke Wails
internal/settings        model, store SQLite, secret store, probe koneksi
internal/stack           StackService untuk Docker Compose lokal
internal/training        manager worker dan pipeline chunking
internal/update          pengecekan dan unduhan GitHub Releases
frontend/src             Vue 3, pages, services, styles
frontend/bindings        binding TypeScript hasil generate Wails
deploy/local             docker-compose.yml untuk stack lokal
deploy/server            docker-compose.yml untuk mode server
deploy/linux             skrip build .deb
deploy/windows           skrip installer Inno Setup
```

