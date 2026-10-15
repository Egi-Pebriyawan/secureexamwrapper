<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { supabase } from '@/lib/supabase'
import { normalizeFormUrl } from '@/lib/examUtils'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'

const route = useRoute()
const router = useRouter()
const i18n = useI18nStore()
const examId = route.params.id as string

const title = ref('')
const rawFormUrl = ref('')
const code = ref('')
const opensAt = ref('')
const closesAt = ref('')
const durationMin = ref(60)
const tolerance = ref(1)
const wmOpacity = ref(0.15)
const status = ref<'draft' | 'scheduled' | 'ongoing' | 'finished'>('scheduled')

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const previewUrl = ref('')
const previewTesting = ref(false)

const normalizedUrl = computed(() => {
  return normalizeFormUrl(rawFormUrl.value)
})

const fetchExam = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (error) throw error
    if (data) {
      title.value = data.title
      rawFormUrl.value = data.form_url
      code.value = data.code
      durationMin.value = data.duration_min
      tolerance.value = data.tolerance
      wmOpacity.value = data.wm_opacity || 0.15
      status.value = data.status || 'scheduled'
      
      if (data.opens_at) {
        opensAt.value = new Date(data.opens_at).toISOString().slice(0, 16)
      }
      if (data.closes_at) {
        closesAt.value = new Date(data.closes_at).toISOString().slice(0, 16)
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat data ujian'
  } finally {
    loading.value = false
  }
}

const handleUpdateExam = async () => {
  if (!title.value || !rawFormUrl.value) {
    errorMessage.value = 'Mohon lengkapi judul dan tautan form'
    return
  }

  try {
    saving.value = true
    errorMessage.value = ''

    const { error } = await supabase
      .from('exams')
      .update({
        title: title.value,
        form_url: normalizedUrl.value,
        duration_min: Number(durationMin.value),
        tolerance: Number(tolerance.value),
        wm_opacity: Number(wmOpacity.value),
        status: status.value,
        opens_at: new Date(opensAt.value).toISOString(),
        closes_at: new Date(closesAt.value).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', examId)

    if (error) throw error

    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menyimpan perubahan ujian'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchExam()
})
</script>

<template>
  <div class="min-h-screen p-6 sm:p-12 max-w-5xl mx-auto space-y-8">
    <div class="flex items-center justify-between border-b-[3px] border-ink pb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <BrBadge variant="blue">{{ i18n.t('app_title') }}</BrBadge>
          <BrBadge variant="ink">CODE: {{ code }}</BrBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase">EDIT UJIAN</h1>
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

    <div v-if="loading" class="text-center py-12 font-mono text-sm">
      {{ i18n.t('loading') }}
    </div>

    <form v-else @submit.prevent="handleUpdateExam" class="space-y-6">
      <BrCard class="space-y-6">
        <h2 class="text-xl font-black uppercase border-b-[2px] border-ink pb-2">Informasi Ujian</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="title"
            :label="i18n.t('exam_title')"
            required
          />
          <div class="flex flex-col gap-1.5 w-full">
            <label class="font-mono text-xs uppercase font-bold tracking-wider text-ink">
              Status Ujian
            </label>
            <select
              v-model="status"
              class="w-full bg-white text-ink border-[3px] border-ink px-4 py-3 text-base shadow-[4px_4px_0px_0px_#0A0A0A] font-mono font-bold focus:outline-none"
            >
              <option value="draft">DRAF</option>
              <option value="scheduled">TERJADWAL</option>
              <option value="ongoing">BERLANGSUNG</option>
              <option value="finished">SELESAI</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <BrInput
            v-model="rawFormUrl"
            :label="i18n.t('form_link_label')"
            required
          />
          <div class="flex items-center justify-between text-xs font-mono text-ink-soft">
            <span v-if="normalizedUrl !== rawFormUrl" class="text-blue font-bold">
              Link: {{ normalizedUrl }}
            </span>
            <span v-else>Link siap digunakan</span>
            <button type="button" @click="previewTesting = !previewTesting; previewUrl = normalizedUrl" class="underline font-bold text-ink cursor-pointer hover:text-blue">
              {{ i18n.t('test_preview_btn') }}
            </button>
          </div>
        </div>

        <!-- Preview Modal / Area -->
        <div v-if="previewTesting" class="border-[3px] border-ink p-4 bg-neutral-100 space-y-3">
          <div class="flex items-center justify-between font-mono text-xs font-bold">
            <span>HASIL UJI TAMPIL:</span>
            <button type="button" @click="previewTesting = false" class="text-danger underline">TUTUP</button>
          </div>
          <div class="border-[2px] border-ink h-80 bg-white relative">
            <iframe :src="previewUrl" class="w-full h-full border-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        <BrButton type="submit" variant="primary" size="lg" :disabled="saving">
          {{ saving ? i18n.t('loading') : i18n.t('save') }}
        </BrButton>
      </div>
    </form>
  </div>
</template>
