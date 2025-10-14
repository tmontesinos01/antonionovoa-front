"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Usuario, LoginDTO } from '@/lib/api-types'
import { useAuth } from '@/hooks/use-api'

interface AuthContextType {
  user: Usuario | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (credentials: LoginDTO) => Promise<Usuario>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { logout: logoutHook, login: loginHook } = useAuth()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login']

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      // Aquí podrías validar el token con el backend
      // Por ahora, asumimos que si hay token, el usuario está autenticado
      setUser({ Id: 1, nombre: 'Usuario', correo: 'usuario@example.com' } as Usuario)
    }
    
    setLoading(false)
  }, []) // Sin dependencias para que solo se ejecute una vez

  // Función de login que actualiza el contexto
  const login = async (credentials: LoginDTO) => {
    setError(null)
    try {
      const usuario = await loginHook(credentials)
      setUser(usuario)
      return usuario
    } catch (error: any) {
      setError(error.message || 'Error de autenticación')
      throw error
    }
  }

  // Comentado temporalmente para evitar redirecciones automáticas
  // useEffect(() => {
  //   if (!loading) {
  //     const isPublicRoute = publicRoutes.includes(pathname)
  //     
  //     if (!user && !isPublicRoute) {
  //       // Usuario no autenticado intentando acceder a ruta protegida
  //       router.push('/login')
  //     } else if (user && isPublicRoute) {
  //       // Usuario autenticado intentando acceder a login/registro
  //       router.push('/')
  //     }
  //   }
  // }, [user, loading, pathname, router])

  const logout = () => {
    logoutHook()
    setUser(null)
    setError(null)
    router.push('/login')
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
