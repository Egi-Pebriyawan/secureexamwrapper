import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const initAuth = async () => {
    try {
      loading.value = true
      const { data } = await supabase.auth.getUser()
      user.value = data.user
      
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })
    } finally {
      loading.value = false
    }
  }

  const signInWithEmail = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  const signInWithOAuth = async (provider: 'google') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  const signOut = async () => {
    const res = await supabase.auth.signOut()
    user.value = null
    return res
  }

  return {
    user,
    loading,
    initAuth,
    signInWithEmail,
    signInWithOAuth,
    signOut,
  }
})
