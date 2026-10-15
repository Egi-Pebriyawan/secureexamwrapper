import { defineStore } from 'pinia'
import { ref } from 'vue'
import { translations, type Language } from '@/locales'

export const useI18nStore = defineStore('i18n', () => {
  const currentLang = ref<Language>(
    (localStorage.getItem('sew_lang') as Language) || 'id'
  )

  const setLanguage = (lang: Language) => {
    currentLang.value = lang
    localStorage.setItem('sew_lang', lang)
  }

  const toggleLanguage = () => {
    setLanguage(currentLang.value === 'id' ? 'en' : 'id')
  }

  const t = (key: keyof typeof translations['id'], params?: Record<string, string>) => {
    let text = translations[currentLang.value][key] || translations['id'][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v)
      })
    }
    return text
  }

  return {
    currentLang,
    setLanguage,
    toggleLanguage,
    t,
  }
})

