<h1 align="center">🧠 SmartSeg</h1>

<p align="center">
  <strong>AI-assisted brain tumor segmentation platform for MRI</strong><br>
  Technicians upload multimodal MRI scans, an ensemble of attention U-Nets segments the tumor,<br>
  and doctors review and validate the result, all in one web app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat&logo=springboot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java%2017-ED8B00?style=flat&logo=openjdk&logoColor=white" alt="Java 17">
  <img src="https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=flat&logo=tensorflow&logoColor=white" alt="TensorFlow">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Dataset-BraTS%202019-8A2BE2?style=flat" alt="BraTS 2019">
</p>

<!-- Add screenshots to docs/screenshots/ and uncomment:
<p align="center">
  <img src="docs/screenshots/doctor-case.png" width="48%" alt="Doctor reviewing a segmentation">
  <img src="docs/screenshots/admin-dashboard.png" width="48%" alt="Admin dashboard">
</p>
-->

---

## ✨ Features

| Role | What they can do |
|------|------------------|
| 🧑‍🔬 **MRI technician** | Register patients, upload the 4 MRI sequences (T1, T2, FLAIR, T1ce, NIfTI), record acquisition parameters |
| 🩺 **Doctor** | Browse patients and cases, **run AI segmentation**, view the overlay on the MRI, **validate or reject** the result |
| 🛡️ **Administrator** | Approve or reject account requests, manage users, view model performance (overall, per tumor region, training summary) |

Plus: JWT authentication, role-based access on every API route, sign-up with admin approval.

---

## 🏗️ Architecture

```
 ┌──────────────────────┐   REST + JWT    ┌───────────────────────┐   HTTP   ┌────────────────────────┐
 │  React frontend      │ ───────────────▶│  Spring Boot API      │ ───────▶ │  Flask AI service      │
 │  :3000               │                 │  :8080                │          │  :5000                 │
 │  doctor / technician │                 │  auth, patients,      │          │  loads 3 Keras models, │
 │  / admin dashboards  │                 │  scans, results       │          │  ensemble → mask + PNG │
 └──────────────────────┘                 └──────────┬────────────┘          └───────────┬────────────┘
                                                     │                                   │
                                              ┌──────▼──────┐                    reads uploads/scans/
                                              │ PostgreSQL  │                    writes results/
                                              │ smartseg_db │
                                              └─────────────┘
```

**Segmentation flow:** the doctor clicks *Segment* → Spring sends the 4 scan paths to `POST /segment` → Flask picks an axial slice, normalises each sequence, runs the **3 models**, **averages their probabilities**, and saves the mask and overlay → Spring stores the result and the doctor reviews it.

---

## 🧠 The AI Models

Each input is a **240 × 240 axial slice with 4 channels** (FLAIR, T1, T1ce, T2). The output labels each pixel as background, necrosis, edema or enhancing tumor.

| # | Model | What changes | Notebook |
|---|-------|--------------|----------|
| 1 | **ARU-GD** (baseline) | Residual encoder/decoder + attention gates on skip connections | `Models/Model1/` |
| 2 | **ARU-GD + CBAM** | Adds CBAM (channel + spatial attention) and squeeze-and-excitation blocks | `Models/Model2/` |
| 3 | **ARU-GD + CBAM + Focal loss** | Same as #2, trained with a combined Dice + focal loss | `Models/Model3/` |
| 4 | **Ensemble (AVG-Prob)** ← *used in the app* | Averages the probabilities of models 1–3 | `Models/AVG-prob/` |

### Results on BraTS 2019

| Model | Dice WT | Dice TC | Dice ET | IoU WT | IoU TC | IoU ET |
|-------|:------:|:------:|:------:|:-----:|:-----:|:-----:|
| ARU-GD | 0.9045 | **0.8750** | 0.7789 | 0.8257 | **0.7778** | 0.6379 |
| ARU-GD + CBAM | 0.9037 | 0.8503 | 0.7820 | 0.8244 | 0.7395 | 0.6420 |
| ARU-GD + CBAM + Focal | 0.8947 | 0.8097 | 0.7806 | 0.8095 | 0.6802 | 0.6401 |
| **Ensemble** | **0.9141** | 0.8632 | **0.7985** | **0.8418** | 0.7594 | **0.6646** |

*WT = whole tumor, TC = tumor core, ET = enhancing tumor.*

---

## 📁 Project Structure

```
SmartSeg/
├── src/                    # React frontend (Create React App)
│   ├── services/api.js     # API client (base URL: http://localhost:8080/api)
│   └── …                   # Login, sign-up, doctor / technician / admin pages
├── smartseg-backend/       # Spring Boot API (Java 17, Maven)
│   └── src/main/java/com/smartseg/backend/
│       ├── controller/     # auth, admin, doctor, technician, shared, images
│       ├── security/       # JWT filter, role-based config
│       ├── model/          # User, Doctor, MriTechnician, Patient, MriScan, SegmentationResult…
│       └── service/        # ScanService, SegmentationService (calls Flask)…
├── smartseg-ai/            # Flask inference service
│   ├── app.py              # /health, /segment, /models/info
│   ├── segmentation.py     # Preprocessing + ensemble prediction + overlay
│   └── models/             # .h5 weights (Git LFS)
└── Models/                 # Training notebooks + weights for the 3 models and the ensemble
```

---

## 🚀 Getting Started

### Prerequisites
Node.js 18+, Java 17, PostgreSQL, Python 3.11, and **Git LFS** (for the `.h5` weights).

```bash
git lfs install
git clone https://github.com/yomn07/SmartSeg.git
cd SmartSeg
```

### 1. Database
```sql
CREATE DATABASE smartseg_db;
```
Set the username and password in `smartseg-backend/src/main/resources/application.properties`. Tables are created automatically on first run.

### 2. AI service (port 5000)
```bash
cd smartseg-ai
pip install -r requirements.txt
python app.py
```
Check it at <http://localhost:5000/health>.

### 3. Backend (port 8080)
> ⚠️ Before running, update the two folder paths to match your machine:
> - `UPLOAD_DIR` in `service/ScanService.java` → `<repo>/smartseg-ai/uploads/scans/`
> - `RESULTS_DIR` in `controller/ImageController.java` → `<repo>/smartseg-ai/results/`

```bash
cd smartseg-backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```
On first start, demo **admin**, **doctor** and **technician** accounts are created (see `config/DataInitializer.java`). Change their passwords before any real use.

### 4. Frontend (port 3000)
```bash
npm install
npm start
```
Open <http://localhost:3000>.

---

## ⚠️ Disclaimer

SmartSeg is an academic project. It is **not a medical device** and must not be used for diagnosis.

---

