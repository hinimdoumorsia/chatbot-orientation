# 🎓 OrientBot — Chatbot d'Orientation Scolaire Intelligent

![Version](https://img.shields.io/badge/version-1.0.0-7c6af7?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3.7-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1-F55036?style=for-the-badge&logo=groq&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5.23-FF6B35?style=for-the-badge)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Embeddings-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge)

---

> **OrientBot** est un chatbot éducatif intelligent conçu pour aider les nouveaux bacheliers à choisir leur filière universitaire. Il exploite la puissance du **RAG (Retrieval-Augmented Generation)**, de la **vectorisation de documents PDF**, de l'**API Groq** avec le modèle **LLaMA 3.1**, et d'une **API REST FastAPI** pour offrir des conseils d'orientation personnalisés et contextualisés.

---

## 📋 Table des matières

- [🎯 Description du projet](#-description-du-projet)
- [🧠 Architecture technique](#-architecture-technique)
- [⚙️ Fonctionnement du RAG](#️-fonctionnement-du-rag)
- [🗂️ Structure du projet](#️-structure-du-projet)
- [🚀 Installation et exécution](#-installation-et-exécution)
- [🌐 API REST — Endpoints](#-api-rest--endpoints)
- [🖥️ Interface Frontend](#️-interface-frontend)
- [📦 Déploiement sur Render](#-déploiement-sur-render)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [📞 Contact](#-contact)

---

## 🎯 Description du projet

OrientBot est une application full-stack qui démontre la maîtrise de plusieurs technologies clés de l'IA moderne :

- **LangChain LCEL** (LangChain Expression Language) pour construire des pipelines IA modulaires
- **RAG** pour ancrer les réponses du LLM dans un document de référence réel
- **Vectorisation** de documents PDF avec des embeddings multilingues HuggingFace
- **ChromaDB** comme base de données vectorielle persistante
- **API Groq** pour accéder au modèle LLaMA 3.1 de façon ultra-rapide et gratuite
- **FastAPI** pour exposer le chatbot via une API REST professionnelle
- **React + Vite** pour une interface utilisateur moderne et réactive

Le document de référence couvre toutes les filières selon la série de baccalauréat : Bac A (littéraire), Bac C/D (scientifique), Bac E/F/G (technique) et Bac Professionnel.

---

## 🧠 Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│              http://localhost:3000                       │
└─────────────────────┬───────────────────────────────────┘
                      │ POST /chat
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│              http://localhost:8000                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              LCEL Chain (RAG Pipeline)            │   │
│  │                                                  │   │
│  │  Question → Retriever → format_docs → Prompt     │   │
│  │                                    → Groq LLM    │   │
│  │                                    → StrParser   │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐      ┌──────────────┐
│  ChromaDB   │      │  Groq API    │
│ (Vectorstore│      │ LLaMA 3.1    │
│  sur disque)│      │ 8b-instant   │
└─────────────┘      └──────────────┘
       ▲
       │ Indexation (1 seule fois)
       │
┌─────────────────┐
│  PDF Document   │
│ orientation_    │
│ bacheliers.pdf  │
└─────────────────┘
```

---

## ⚙️ Fonctionnement du RAG

Le RAG (Retrieval-Augmented Generation) est le cœur de ce projet. Voici comment il fonctionne étape par étape :

### Phase 1 — Indexation (exécutée une seule fois)

```
📄 PDF
  │
  ▼
[PyPDFLoader] ──→ Extraction du texte page par page
  │
  ▼
[RecursiveCharacterTextSplitter]
  chunk_size=1000, chunk_overlap=200
  ──→ Découpage en ~50 chunks
  │
  ▼
[HuggingFaceEmbeddings]
  modèle: paraphrase-multilingual-MiniLM-L12-v2
  ──→ Chaque chunk → vecteur de 384 dimensions
  │
  ▼
[ChromaDB] ──→ Stockage persistant sur disque (vectorstore/)
```

### Phase 2 — Requête utilisateur (à chaque message)

```
❓ Question bachelier
  │
  ▼
[HuggingFaceEmbeddings] ──→ Vectorisation de la question
  │
  ▼
[ChromaDB Retriever] ──→ Recherche similarité cosinus → Top 4 chunks
  │
  ▼
[ChatPromptTemplate] ──→ Assemblage : contexte + historique + question
  │
  ▼
[ChatGroq - LLaMA 3.1] ──→ Génération de la réponse
  │
  ▼
[StrOutputParser] ──→ Réponse texte propre
  │
  ▼
✅ Réponse personnalisée au bachelier
```

### La chaîne LCEL

```python
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

L'opérateur `|` (pipe) de LCEL permet de chaîner les composants de manière lisible et modulaire, exactement comme des pipelines Unix.

---

## 🗂️ Structure du projet

```
chatbot-orientation/
│
├── main.py                          # Point d'entrée FastAPI
├── requirements.txt                 # Dépendances Python
├── Procfile                         # Configuration Render
├── .env.example                     # Modèle de variables d'environnement
├── .gitignore
│
├── app/
│   ├── __init__.py
│   ├── rag.py                       # Pipeline RAG + chaîne LCEL
│   └── routes.py                    # Endpoints API REST
│
├── data/
│   └── orientation_bacheliers.pdf   # Document de référence RAG
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                  # Interface React complète
        └── index.css
```

---

## 🚀 Installation et exécution

### Prérequis

- Python 3.11+
- Node.js 18+
- Une clé API Groq gratuite → [console.groq.com](https://console.groq.com)

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/TON_USERNAME/chatbot-orientation.git
cd chatbot-orientation
```

### Étape 2 — Créer l'environnement virtuel Python

```bash
python -m venv env

# Windows
env\Scripts\activate

# Linux / Mac
source env/bin/activate
```

### Étape 3 — Installer les dépendances Python

```bash
pip install -r requirements.txt
```

> ⚠️ L'installation peut prendre quelques minutes car elle inclut PyTorch et les modèles HuggingFace.

### Étape 4 — Configurer les variables d'environnement

```bash
# Windows
copy .env.example .env

# Linux / Mac
cp .env.example .env
```

Ouvre le fichier `.env` et ajoute ta clé Groq :

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 5 — Lancer le backend

```bash
uvicorn main:app --reload
```

Le serveur démarre sur **http://127.0.0.1:8000**

Au premier lancement, le système va automatiquement :
1. Charger le PDF `data/orientation_bacheliers.pdf`
2. Le découper en chunks
3. Créer les embeddings
4. Stocker le vectorstore dans `vectorstore/`

> 💡 Ce processus n'a lieu qu'une seule fois. Les lancements suivants chargent directement le vectorstore existant.

### Étape 6 — Tester l'API

Ouvre **http://127.0.0.1:8000/docs** dans ton navigateur pour accéder à la documentation Swagger interactive.

Teste avec :
```json
{
  "question": "J'ai le bac C, quelles filières me conseilles-tu ?"
}
```

### Étape 7 — Lancer le frontend

Ouvre un **nouveau terminal** :

```bash
cd frontend
npm install
npm run dev
```

L'interface est accessible sur **http://localhost:3000**

---

## 🌐 API REST — Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET`   | `/`      | Vérifie que l'API est en ligne |
| `GET`   | `/health`| Statut de santé du serveur |
| `POST`  | `/chat`  | Envoie une question et reçoit une réponse |
| `GET`   | `/docs`  | Documentation Swagger interactive |

### Exemple de requête

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Bac D, quelles sont mes options en sante ?"}'
```

### Exemple de réponse

```json
{
  "answer": "Avec un bac D, vous avez d'excellentes options en santé :\n\n1. **Médecine** - Durée : 7 à 12 ans...\n2. **Pharmacie** - Durée : 6 ans...\n3. **Biologie** - Durée : 3 à 5 ans..."
}
```

---

## 🖥️ Interface Frontend

L'interface React propose :

- **Header orange** avec logo et titre OrientBot
- **Zone de chat** avec bulles de messages distincts (utilisateur / bot)
- **Questions suggérées** pour guider les bacheliers
- **Indicateur de frappe** animé pendant la génération de la réponse
- **Mémoire de conversation** — le bot se souvient du contexte de la session
- **Footer noir** avec les crédits

---

## 📦 Déploiement sur Render

### Étape 1 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — OrientBot RAG Chatbot"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/chatbot-orientation.git
git push -u origin main
```

### Étape 2 — Créer un service sur Render

1. Va sur [render.com](https://render.com) et connecte-toi
2. Clique sur **New → Web Service**
3. Connecte ton dépôt GitHub
4. Configure :

| Paramètre | Valeur |
|-----------|--------|
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Environment** | `Python 3` |

### Étape 3 — Ajouter la variable d'environnement

Dans **Environment Variables** sur Render :

```
GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 4 — Déployer

Clique sur **Create Web Service**. Render va builder et déployer automatiquement.

---

## 🛠️ Technologies utilisées

| Technologie | Rôle | Version |
|-------------|------|---------|
| **Python** | Langage backend | 3.11+ |
| **FastAPI** | Framework API REST | 0.115 |
| **LangChain** | Framework LLM + LCEL | 0.3.7 |
| **LangChain Groq** | Intégration Groq | 0.2.1 |
| **Groq API** | Accès LLaMA 3.1 | — |
| **ChromaDB** | Base vectorielle | 0.5.23 |
| **HuggingFace** | Modèle d'embeddings | 0.1.2 |
| **sentence-transformers** | Vectorisation multilingue | 3.3.1 |
| **PyPDF** | Chargement PDF | 5.1.0 |
| **React** | Interface utilisateur | 18.2 |
| **Vite** | Bundler frontend | 5.0 |
| **Render** | Hébergement cloud | — |

---

## 🧩 Ce que ce projet démontre

✅ Maîtrise de **LangChain LCEL** pour construire des pipelines IA modulaires avec l'opérateur `|`

✅ Implémentation complète d'un système **RAG** : chargement PDF → chunking → embeddings → vectorstore → retrieval → génération

✅ Intégration de l'**API Groq** pour accéder à des LLMs open-source performants (LLaMA 3.1)

✅ Création d'une **API REST** professionnelle avec FastAPI et documentation Swagger automatique

✅ Gestion de la **mémoire de conversation** avec `MessagesPlaceholder` et historique des messages

✅ Déploiement en **production** sur Render avec configuration CI/CD via GitHub

---

## 📞 Contact

Développé par **Morsia Guitdam Hinimdou**

[![Portfolio](https://img.shields.io/badge/Portfolio-Voir_mon_site-FF6B35?style=for-the-badge&logo=firefox&logoColor=white)](https://site-web-nodemailer.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Morsia_Guitdam-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/morsia-guitdam-hinimdou-266bb0269/)

---

*Ce projet a été réalisé dans le cadre de l'apprentissage des technologies LangChain, LLM et IA générative.*
