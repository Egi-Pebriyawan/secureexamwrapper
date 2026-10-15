<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'
import BrCard from '@/components/ui/BrCard.vue'
import BrButton from '@/components/ui/BrButton.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'

const authStore = useAuthStore()
const i18n = useI18nStore()

const email = ref('')
const loading = ref(false)
const magicLinkSent = ref(false)
const errorMessage = ref('')

const handleEmailLogin = async () => {
  if (!email.value) return
  try {
    loading.value = true
    errorMessage.value = ''
    const { error } = await authStore.signInWithEmail(email.value)
    if (error) throw error
    magicLinkSent.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengirim link login'
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const { error } = await authStore.signInWithOAuth('google')
    if (error) throw error
  } catch (err: any) {
    errorMessage.value = `${err.message || 'Gagal login via Google'}. (${i18n.t('google_not_enabled_hint')})`
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-6 relative">
    <div class="absolute top-6 right-6">
      <BrLangSwitch />
    </div>

    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-2">
        <router-link to="/" class="inline-flex items-center gap-2 mb-2">
          <div class="w-7 h-7 bg-blue border-[2px] border-ink flex items-center justify-center text-white font-heading font-black text-sm">
            S
          </div>
          <span class="font-heading font-black tracking-tight text-lg">{{ i18n.t('app_title') }}</span>
        </router-link>
        <h1 class="text-3xl font-black uppercase">{{ i18n.t('login_title') }}</h1>
        <p class="font-mono text-xs text-ink-soft">{{ i18n.t('login_subtitle') }}</p>
      </div>

      <BrCard>
        <div v-if="magicLinkSent" class="space-y-4 text-center py-4">
          <BrBadge variant="lime">{{ i18n.t('magic_link_sent') }}</BrBadge>
          <h2 class="text-xl font-black">{{ i18n.t('check_email_title') }}</h2>
          <p class="text-sm text-ink-soft">
            {{ i18n.t('check_email_desc', { email }) }}
          </p>
          <BrButton variant="secondary" block size="sm" @click="magicLinkSent = false">
            {{ i18n.t('use_another_email') }}
          </BrButton>
        </div>

        <div v-else class="space-y-6">
          <BrButton
            variant="secondary"
            block
            :disabled="loading"
            @click="handleGoogleLogin"
            class="flex items-center gap-2"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            {{ i18n.t('login_with_google') }}
          </BrButton>

          <div class="flex items-center gap-3">
            <div class="h-[2px] bg-ink flex-1"></div>
            <span class="font-mono text-xs font-bold uppercase text-ink-soft">{{ i18n.t('or_email') }}</span>
            <div class="h-[2px] bg-ink flex-1"></div>
          </div>

          <form @submit.prevent="handleEmailLogin" class="space-y-4">
            <BrInput
              v-model="email"
              type="email"
              :label="i18n.t('email_label')"
              :placeholder="i18n.t('email_placeholder')"
              :error="errorMessage"
              required
            />

            <BrButton
              type="submit"
              variant="primary"
              block
              size="lg"
              :disabled="loading"
            >
              {{ loading ? i18n.t('sending_login_link') : i18n.t('send_login_link') }}
            </BrButton>
          </form>
        </div>
      </BrCard>

      <div class="text-center font-mono text-xs">
        <router-link to="/" class="hover:underline text-ink-soft">← {{ i18n.t('back_to_home') }}</router-link>
      </div>
    </div>
  </div>
</template>
