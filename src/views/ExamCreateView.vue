<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { normalizeFormUrl, hashToken, generateExamCode } from '@/lib/examUtils'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrBadge from '@/components/ui/BrBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

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

    // Check limit of 5 active exams (EX-06)
    const { count, error: countErr } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'scheduled', 'ongoing'])

    if (countErr) throw countErr
    if (count !== null && count >= 5) {
      throw new Error('Batas akun tercapai: Maksimal 5 ujian aktif (Draf/Terjadwal/Berlangsung).')
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
          <BrBadge variant="blue">EX-01</BrBadge>
          <BrBadge variant="lime">FORMULIR</BrBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase">BUAT UJIAN BARU</h1>
      </div>
      <router-link to="/dashboard">
        <BrButton variant="secondary" size="sm">BATAL & KEMBALI</BrButton>
      </router-link>
    </div>

    <!-- Alert error -->
    <div v-if="errorMessage" class="border-[3px] border-danger bg-red-100 p-4 text-danger font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#E5322D]">
      {{ errorMessage }}
    </div>

    <!-- Organizer Guidance EX-05 -->
    <div class="border-[3px] border-ink bg-ink text-white p-5 shadow-[4px_4px_0px_0px_#0A0A0A] space-y-2">
      <div class="flex items-center gap-2">
        <BrBadge variant="lime">PANDUAN PENYELENGGARA (EX-05)</BrBadge>
      </div>
      <p class="text-sm font-sans text-neutral-300">
        • Pastikan form <strong>tidak mewajibkan login Google</strong> agar peserta tidak terblokir di browser Safari / mode privat.<br />
        • Aktifkan acak urutan soal langsung di pengaturan Google Form Anda.<br />
        • Berikan durasi buka-tutup sedikit lebih longgar dibanding durasi pengerjaan peserta.
      </p>
    </div>

    <form @submit.prevent="handleCreateExam" class="space-y-6">
      <BrCard class="space-y-6">
        <h2 class="text-xl font-black uppercase border-b-[2px] border-ink pb-2">Informasi Dasar</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="title"
            label="Judul Ujian"
            placeholder="Misal: Ujian Akhir Semester Fisika 2026"
            required
          />
          <div class="flex gap-2 items-end">
            <BrInput
              v-model="code"
              label="Kode Ujian (6 Karakter Unik)"
              placeholder="MAT101"
              mono
              required
            />
            <BrButton type="button" variant="secondary" size="md" @click="code = generateExamCode()" class="h-12">
              ACAK
            </BrButton>
          </div>
        </div>

        <div class="space-y-2">
          <BrInput
            v-model="rawFormUrl"
            label="Link Form Eksternal (Google Form / Tally)"
            placeholder="https://docs.google.com/forms/d/e/.../viewform"
            required
          />
          <div class="flex items-center justify-between text-xs font-mono text-ink-soft">
            <span v-if="normalizedUrl !== rawFormUrl" class="text-blue font-bold">
              Link dinormalisasi: {{ normalizedUrl }}
            </span>
            <span v-else>Link siap digunakan</span>
            <button type="button" @click="handleTestPreview" class="underline font-bold text-ink cursor-pointer hover:text-blue">
              🔍 UJI TAMPIL (EX-04)
            </button>
          </div>
        </div>

        <!-- Preview Modal / Area (EX-04) -->
        <div v-if="previewTesting" class="border-[3px] border-ink p-4 bg-neutral-100 space-y-3">
          <div class="flex items-center justify-between font-mono text-xs font-bold">
            <span>HASIL UJI TAMPIL IFRAME:</span>
            <button type="button" @click="previewTesting = false" class="text-danger underline">TUTUP PENGUJIAN</button>
          </div>
          <p class="text-xs text-ink-soft">
            Jika iframe di bawah menampilkan form dengan baik, form siap digunakan. Jika kosong atau muncul pesan error domain menolak iframe, matikan proteksi X-Frame di provider form.
          </p>
          <div class="border-[2px] border-ink h-80 bg-white relative">
            <iframe :src="previewUrl" class="w-full h-full border-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <BrInput
            v-model="token"
            label="Token Ujian Bawaan"
            placeholder="123456"
            mono
            required
          />
          <BrInput
            v-model="durationMin"
            type="number"
            label="Durasi Pengerjaan (Menit)"
            required
          />
          <BrInput
            v-model="tolerance"
            type="number"
            label="Toleransi Pelanggaran (0-3)"
            helpText="0 = Kunci langsung, 1 = Bawaan (1 peringatan)"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="opensAt"
            type="datetime-local"
            label="Jam Buka Ujian"
            required
          />
          <BrInput
            v-model="closesAt"
            type="datetime-local"
            label="Jam Tutup Ujian"
            required
          />
        </div>
      </BrCard>

      <div class="flex justify-end gap-4">
        <router-link to="/dashboard">
          <BrButton variant="secondary" size="lg">BATAL</BrButton>
        </router-link>
        <BrButton type="submit" variant="primary" size="lg" :disabled="loading">
          {{ loading ? 'MENYIMPAN...' : 'SIMPAN & LANJUT KE DAFTAR PESERTA' }}
        </BrButton>
      </div>
    </form>
  </div>
</template>
