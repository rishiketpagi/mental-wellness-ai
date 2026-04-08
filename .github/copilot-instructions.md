# Mental Wellness AI project instructions

This is a React + Vite + Tailwind CSS + Firebase web app for youth mental wellness.

Project goals:
- Calm, safe, modern, clean UI
- Strong mobile responsiveness
- Keep the app feeling supportive, not cluttered or scary
- Preserve all existing functionality unless explicitly asked to change it

Tech stack:
- React
- Vite
- Tailwind CSS
- Firebase Auth
- Firestore
- Express backend
- Gemini API

Important rules:
- Do not break Firebase auth, Firestore reads/writes, or route protection
- Prefer reusable UI components over repeating layout code
- Use AppLayout consistently so navbar stays visible on all protected pages
- Do not reintroduce full-screen wrappers inside pages if AppLayout already provides the app shell
- Prefer mobile-first responsive improvements
- Avoid horizontal overflow on any screen size
- Keep typography, spacing, card radius, button styles, and shadows consistent
- Keep the emotional tone gentle and reassuring
- Avoid overly bright, alarming, or noisy UI
- Preserve accessibility and readability
- If refactoring, explain what files were changed and why