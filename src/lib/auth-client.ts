import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // Priorité à l'URL d'environnement, sinon URL actuelle du navigateur
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000")
})
