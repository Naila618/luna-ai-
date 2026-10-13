# 🌙 LUNA AI — Your Space to Think

<p align="center">
  <strong>A calm, personalized AI companion for curiosity, thoughtful exploration, and deep understanding.</strong>
</p>

<p align="center">
  <a href="https://luna-ai-self-eta.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Launch_LUNA_AI-777C55?style=for-the-badge&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tavus-Video_Avatar-7B2CBF?style=for-the-badge" alt="Tavus" />
  <img src="https://img.shields.io/badge/Gemini_2.5-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</p>

---

## 🚀 Live Demo & Deployment

| Resource | Link |
| :--- | :--- |
| **Live Web App** | 🔗 [**Launch LUNA AI (https://luna-ai-self-eta.vercel.app)**](https://luna-ai-self-eta.vercel.app/) |
| **Interactive Video Avatar** | 🎥 [Tavus Deployment Preview](https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4) |
| **Source Code** | 💻 [GitHub Repository](https://github.com/Naila618/luna-ai-) |

---

## 📖 Overview

**LUNA AI** is an intelligent conversational companion crafted to bring clarity to complex ideas. Rather than overwhelming users with noisy, rapid-fire responses, LUNA fosters a grounded, distraction-free environment for thinking, studying, and researching.

With an editorial warm minimalist design, **trilingual capability** (English, Hindi, Telugu), **real-time Tavus conversational video avatars**, and **deep web research with verified citations**, LUNA adapts entirely to your unique learning style and pacing.

---

## ✨ Key Features

### 🎙️ Interactive Conversational Video Avatar (Tavus)
- **Live Video Presence**: Connect face-to-face with an expressive AI video avatar powered by the [Tavus Conversational Video API](https://tavus.io).
- **Two-Way Voice & Video**: Integrated microphone toggle, audio streaming, real-time live captions, and session transcripts.
- **Embedded & Full-Screen Modes**: Launch seamless video workspaces alongside your conversation notes without losing context.

### 🔍 Deep Web Research & Live Citations
- **Grounded Answers**: When tackling intricate queries, switch on Research Mode to verify facts with real sources across the web.
- **Multi-Source Fallback**: Searches powered by **Tavily Search**, **Brave Search API**, and **Google Gemini Search Grounding**.
- **Interactive Citations Drawer**: Inspect verified source URLs, publication titles, and source snippets directly from the chat interface.

### 🧠 Resilient Multi-Provider Intelligence Engine
- **Cascading Fallbacks**: Built with high availability across AI providers:
  1. **OpenRouter API** (`google/gemini-2.0-flash-001`, `meta-llama`, etc.)
  2. **Google Gemini API** (`gemini-2.5-flash`, `gemini-2.5-pro`)
  3. **OpenAI API** (`gpt-4o-mini`)
- **System Personalization**: Automatically tailors tone, technical depth, and structure according to your custom preferences.

### 🌐 Trilingual Fluency (EN · HI · TE)
- Native conversational fluency and complete interface localization in:
  - **English**
  - **हिन्दी (Hindi)**
  - **తెలుగు (Telugu)**
- Seamless on-the-fly language switching from the chat header or settings.

### 🧘 Editorial Warm Minimalist Aesthetics
- Designed with natural, earthy tones (`#F7F5F0`, `#252720`, `#777C55`) to reduce cognitive fatigue.
- Interactive WebGL shader canvas components (`Prism`, `LaserFlow`, `ShapeGrid`) powered by **OGL**.
- Thoughtful typography, smooth micro-interactions, responsive sidebars, and clean reading layouts.

### 🎯 7-Step Guided Onboarding & Personalization
- Personalized profile builder that customizes:
  - Subject areas & learning topics
  - Explanation depth (Beginner-friendly ↔ Technical & detailed)
  - Communication mode (Voice, Text, or Both)
  - Preferred reasoning style (Step-by-step, summary-first, etc.)
- Editable anytime through the dedicated **Settings** dashboard.

### 🔐 Authentication & Session Persistence
- Secure email/password authentication via **Firebase Authentication**.
- **Guest / Anonymous mode** for instantaneous frictionless exploration.
- Full local conversation history management: create, rename, view citations, copy, and delete chats.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, Server Actions, Turbopack |
| **Frontend** | [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) | Type-safe components & reactive UI |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS variables & responsive layout |
| **Graphics / 3D** | [OGL](https://github.com/oframe/ogl) | Lightweight WebGL library for prism & shader effects |
| **Video Avatar** | [Tavus](https://maker.tavus.io/) | Conversational Video API / PAL Maker deployment |
| **Search Engine** | [Tavily](https://tavily.com/) & [Brave Search](https://brave.com/search/api/) | Real-time web retrieval & source grounding |
| **Intelligence** | Gemini 2.5 Flash / OpenRouter / OpenAI | Multi-model fallback architecture |
| **Auth & Data** | [Firebase](https://firebase.google.com/) | Firebase Authentication & Client SDK |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons |

---

## 📁 Project Structure

```text
luna-ai-/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # Multi-LLM chat streaming & fallback endpoint
│   │   │   ├── research/      # Tavily / Brave / Google search grounding
│   │   │   └── tavus/         # Tavus conversational avatar session handler
│   │   ├── chat/              # Main chat interface, sidebar, & citations drawer
│   │   ├── login/             # Firebase authentication & guest login
│   │   ├── onboarding/        # 7-step personalized preference wizard
│   │   ├── settings/          # User preferences & account controls
│   │   ├── globals.css        # Global theme styles & typography
│   │   ├── layout.tsx         # Root layout with AuthProvider & metadata
│   │   └── page.tsx           # Landing page with interactive WebGL Prism
│   ├── components/
│   │   ├── ui/                # WebGL OGL Prism, LaserFlow, ShapeGrid, Stepper
│   │   └── video/             # TavusVideoWorkspace interactive video call interface
│   ├── lib/
│   │   ├── auth/              # Firebase AuthContext & authentication hooks
│   │   ├── firebase.ts        # Firebase client initialization
│   │   ├── i18n.ts            # Multilingual dictionaries (EN, HI, TE)
│   │   └── storage.ts         # LocalStorage persistence for user conversations
│   └── types/                 # Shared TypeScript interfaces & models
├── .env.example               # Reference environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.18.0 or newer; Node.js 20+ recommended)
- [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Naila618/luna-ai-.git
cd luna-ai-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory by copying the sample template:

```bash
cp .env.example .env.local
```

Fill in the corresponding keys in `.env.local`:

```env
# ===================================================
# LUNA AI - Environment Configuration
# ===================================================

# Firebase Authentication (Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Tavus Conversational Video Avatar
TAVUS_API_KEY=your_tavus_api_key
TAVUS_REPLICA_ID=your_replica_id
TAVUS_PERSONA_ID=your_persona_id
TAVUS_DEPLOYMENT_ID=a53a81d3-78c1-4fba-bd15-2421a96e51d4
TAVUS_DEPLOYMENT_URL=https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4
NEXT_PUBLIC_TAVUS_DEPLOYMENT_URL=https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4

# Deep Web Research Providers
TAVILY_API_KEY=your_tavily_api_key
BRAVE_SEARCH_API_KEY=your_brave_api_key

# Intelligence Engine (Provide at least one)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.0-flash-001
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

> **Note**: If `GEMINI_API_KEY` or `OPENROUTER_API_KEY` is provided, LUNA will handle queries dynamically. You can test video capabilities using the default Tavus deployment URL.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🖥️ Usage Guide

1. **Onboarding**:
   - Navigate to `/onboarding` upon first login or sign-in as a guest.
   - Answer the 7 questions to calibrate LUNA's tone, preferred depth, reasoning style, and native language.
2. **Text & Voice Chat**:
   - Open `/chat` to converse. Use the microphone icon for speech-to-text input.
3. **Web Research Mode**:
   - Toggle the **Research Mode** (compass icon) before submitting queries requiring recent facts or external validation.
   - Click citations beneath assistant replies to open the verified sources panel.
4. **Tavus AI Video Call**:
   - Click the **Video** icon in the chat header to launch the Tavus video workspace.
   - Speak directly to the avatar or review live speech transcription in real time.
5. **Adjust Settings**:
   - Access `/settings` to adjust your language, reset explanations, or clear saved chat histories.

---

## 📜 Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches Next.js dev server with Turbopack |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint checks |

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<p align="center">
  Crafted with care for thoughtful conversations. ✨
</p>
