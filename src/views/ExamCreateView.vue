<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'
import { supabase } from '@/lib/supabase'
import { normalizeFormUrl, hashToken, generateExamCode } from '@/lib/examUtils'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'

const router = useRouter()
const authStore = useAuthStore()
const i18n = useI18nStore()

const title = ref('')
const rawFormUrl = ref('')
const code = ref(generateExamCode())
const token = ref('123456')
const opensAt = ref(new Date().toISOString().slice(0, 16))
const closesAt = ref(new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 16))
const durationMin = ref(60)
const tolerance = ref(1)
const wmOpacity = ref(0.15)

const loading = ref(false)
const errorMessage = ref('')
const previewUrl = ref('')
const previewTesting = ref(false)

const normalizedUrl = computed(() => {
  return normalizeFormUrl(rawFormUrl.value)
})

const handleTestPreview = () => {
  if (!rawFormUrl.value) return
  previewTesting.value = true
  previewUrl.value = normalizedUrl.value
}

const handleCreateExam = async () => {
  if (!title.value || !rawFormUrl.value || !code.value || !token.value) {
    errorMessage.value = 'Mohon lengkapi semua data wajib'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    const { count, error: countErr } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'scheduled', 'ongoing'])

    if (countErr) throw countErr
    if (count !== null && count >= 5) {
      throw new Error('Batas akun tercapai: Maksimal 5 ujian aktif.')
    }

    const tokenHashed = await hashToken(token.value)

    const { data, error } = await supabase
      .from('exams')
      .insert({
        organizer_id: authStore.user?.id,
        title: title.value,
        form_url: normalizedUrl.value,
        code: code.value.toUpperCase().trim(),
        token_hash: tokenHashed,
        opens_at: new Date(opensAt.value).toISOString(),
        closes_at: new Date(closesAt.value).toISOString(),
        duration_min: Number(durationMin.value),
        tolerance: Number(tolerance.value),
        wm_opacity: Number(wmOpacity.value),
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) throw error

    router.push(`/dashboard/exams/${data.id}`)
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal membuat ujian'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen p-6 sm:p-12 max-w-5xl mx-auto space-y-8">
    <div class="flex items-center justify-between border-b-[3px] border-ink pb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <BrBadge variant="blue">{{ i18n.t('app_title') }}</BrBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase">{{ i18n.t('create_new_exam') }}</h1>
      </div>
      <div class="flex items-center gap-3">
        <BrLangSwitch />
        <router-link to="/dashboard">
          <BrButton variant="secondary" size="sm">{{ i18n.t('cancel') }}</BrButton>
        </router-link>
      </div>
    </div>

    <!-- Alert error -->
    <div v-if="errorMessage" class="border-[3px] border-danger bg-red-100 p-4 text-danger font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#E5322D]">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleCreateExam" class="space-y-6">
      <BrCard class="space-y-6">
        <h2 class="text-xl font-black uppercase border-b-[2px] border-ink pb-2">Informasi Dasar</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="title"
            :label="i18n.t('exam_title')"
            :placeholder="i18n.t('exam_title_placeholder')"
            required
          />
          <div class="flex gap-2 items-end">
            <BrInput
              v-model="code"
              :label="i18n.t('exam_code_label')"
              placeholder="MAT101"
              mono
              required
            />
            <BrButton type="button" variant="secondary" size="md" @click="code = generateExamCode()" class="h-12">
              {{ i18n.t('randomize_code') }}
            </BrButton>
          </div>
        </div>

        <div class="space-y-2">
          <BrInput
            v-model="rawFormUrl"
            :label="i18n.t('form_link_label')"
            :placeholder="i18n.t('form_link_placeholder')"
            required
          />
          <div class="flex items-center justify-between text-xs font-mono text-ink-soft">
            <span v-if="normalizedUrl !== rawFormUrl" class="text-blue font-bold">
              Link: {{ normalizedUrl }}
            </span>
            <span v-else>Link siap digunakan</span>
            <button type="button" @click="handleTestPreview" class="underline font-bold text-ink cursor-pointer hover:text-blue">
              {{ i18n.t('test_preview_btn') }}
            </button>
          </div>
        </div>

        <!-- Preview Modal / Area (EX-04) -->
        <div v-if="previewTesting" class="border-[3px] border-ink p-4 bg-neutral-100 space-y-3">
          <div class="flex items-center justify-between font-mono text-xs font-bold">
            <span>HASIL UJI TAMPIL IFRAME:</span>
            <button type="button" @click="previewTesting = false" class="text-danger underline">TUTUP</button>
          </div>
          <div class="border-[2px] border-ink h-80 bg-white relative">
            <iframe :src="previewUrl" class="w-full h-full border-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <BrInput
            v-model="token"
            :label="i18n.t('default_token_label')"
            placeholder="123456"
            mono
            required
          />
          <BrInput
            v-model="durationMin"
            type="number"
            :label="i18n.t('exam_duration_label')"
            required
          />
          <BrInput
            v-model="tolerance"
            type="number"
            :label="i18n.t('tolerance_setting_label')"
            :helpText="i18n.t('tolerance_help')"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="opensAt"
            type="datetime-local"
            :label="i18n.t('opens_at_label')"
            required
          />
          <BrInput
            v-model="closesAt"
            type="datetime-local"
            :label="i18n.t('closes_at_label')"
            required
          />
        </div>
      </BrCard>

      <div class="flex justify-end gap-4">
        <router-link to="/dashboard">
          <BrButton variant="secondary" size="lg">{{ i18n.t('cancel') }}</BrButton>
        </router-link>
        <BrButton type="submit" variant="primary" size="lg" :disabled="loading">
          {{ loading ? i18n.t('loading') : i18n.t('save_and_continue_btn') }}
        </BrButton>
      </div>
    </form>
  </div>
</template>
