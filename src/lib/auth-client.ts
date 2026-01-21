import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // On utilise l'URL d'environnement, sinon on essaie de deviner l'URL actuelle (navigateur), sinon localhost
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000")
})
