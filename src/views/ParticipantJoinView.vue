<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { hashToken } from '@/lib/examUtils'
import { getOrCreateDeviceId, getUserAgentSummary } from '@/lib/deviceUtils'
import BrCard from '@/components/ui/BrCard.vue'
import BrButton from '@/components/ui/BrButton.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrBadge from '@/components/ui/BrBadge.vue'

const route = useRoute()
const router = useRouter()

// Steps: 1: Code -> 2: Token -> 3: Choose Name -> 4: Rules & Consent
const step = ref<1 | 2 | 3 | 4>(1)

const examCode = ref((route.params.code as string) || '')
const token = ref('')
const selectedParticipantId = ref('')
const agreementChecked = ref(false)

const exam = ref<any>(null)
const availableParticipants = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')

const tokenAttempts = ref(0)
const isRateLimited = ref(false)

onMounted(async () => {
  if (examCode.value) {
    await handleVerifyCode()
  }
})

// Step 1: Verify Exam Code
const handleVerifyCode = async () => {
  if (!examCode.value.trim()) return

  try {
    loading.value = true
    errorMessage.value = ''

    const cleanCode = examCode.value.toUpperCase().trim()

    const { data, error } = await supabase
      .from('exams')
      .select('id, title, code, token_hash, status, duration_min, opens_at, closes_at, tolerance')
      .eq('code', cleanCode)
      .single()

    if (error || !data) {
      throw new Error('Kode ujian tidak ditemukan. Periksa kembali kode Anda.')
    }

    exam.value = data
    step.value = 2
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memeriksa kode ujian'
  } finally {
    loading.value = false
  }
}

// Step 2: Verify Token (PA-02, PA-04)
const handleVerifyToken = async () => {
  if (isRateLimited.value) {
    errorMessage.value = 'Terlalu banyak percobaan salah. Silakan tunggu 1 menit.'
    return
  }

  if (!token.value.trim()) return

  try {
    loading.value = true
    errorMessage.value = ''

    const tokenHashed = await hashToken(token.value.trim())

    // Fetch participants for this exam
    const deviceId = getOrCreateDeviceId()
    const { data: parts, error: pErr } = await supabase
      .from('participants')
      .select('*')
      .eq('exam_id', exam.value.id)

    if (pErr) throw pErr

    // Check if token matches default exam token or matches individual token
    const isGlobalValid = exam.value.token_hash === tokenHashed
    const hasIndividualMatch = parts?.some(p => p.individual_token_hash === tokenHashed)

    if (!isGlobalValid && !hasIndividualMatch) {
      tokenAttempts.value++
      if (tokenAttempts.value >= 5) {
        isRateLimited.value = true
        setTimeout(() => {
          isRateLimited.value = false
          tokenAttempts.value = 0
        }, 60000)
        throw new Error('Terlalu banyak percobaan salah (PA-04). Akses diblokir 60 detik.')
      }
      throw new Error('Token ujian tidak valid.')
    }

    // Filter available participants: not locked to other device (PA-03, PA-05)
    availableParticipants.value = (parts || []).filter(p => {
      // If individual token was entered, filter to only that participant
      if (hasIndividualMatch && !isGlobalValid) {
        return p.individual_token_hash === tokenHashed
      }
      // Allowed if not locked or locked to the current device
      return !p.locked_name || p.device_id === deviceId
    })

    if (availableParticipants.value.length === 0) {
      throw new Error('Semua nama peserta untuk ujian ini telah terhubung ke perangkat lain.')
    }

    step.value = 3
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memverifikasi token'
  } finally {
    loading.value = false
  }
}

// Step 3: Select Name & Lock Device (PA-03, PA-05)
const handleSelectName = async () => {
  if (!selectedParticipantId.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const deviceId = getOrCreateDeviceId()
    const uaSummary = getUserAgentSummary()

    // Lock participant to this device
    const { error } = await supabase
      .from('participants')
      .update({
        device_id: deviceId,
        user_agent_summary: uaSummary,
        locked_name: true,
      })
      .eq('id', selectedParticipantId.value)

    if (error) throw error

    // Store state in session storage
    sessionStorage.setItem('sew_active_participant_id', selectedParticipantId.value)
    sessionStorage.setItem('sew_active_exam_id', exam.value.id)

    step.value = 4
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memilih nama peserta'
  } finally {
    loading.value = false
  }
}

// Step 4: Rules & Agreement -> Start Exam (T10, DP-04)
const handleStartExam = () => {
  if (!agreementChecked.value) return
  router.push(`/exam/${exam.value.code}/run`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-6">
    <div class="w-full max-w-lg space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <router-link to="/" class="inline-flex items-center gap-2 mb-2">
          <div class="w-7 h-7 bg-blue border-[2px] border-ink flex items-center justify-center text-white font-heading font-black text-sm">
            S
          </div>
          <span class="font-heading font-black tracking-tight text-lg">SECURE EXAM</span>
        </router-link>
        
        <div class="flex items-center justify-center gap-2">
          <BrBadge :variant="step === 1 ? 'blue' : 'lime'">LANGKAH {{ step }} DARI 4</BrBadge>
        </div>
        <h1 class="text-3xl font-black uppercase">
          {{ step === 1 ? 'MASUKKAN KODE UJIAN' :
             step === 2 ? 'MASUKKAN TOKEN' :
             step === 3 ? 'PILIH NAMA ANDA' : 'TATA TERTIB & PERSETUJUAN' }}
        </h1>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="border-[3px] border-danger bg-red-100 p-4 text-danger font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#E5322D]">
        {{ errorMessage }}
      </div>

      <!-- Card Step 1: Code -->
      <BrCard v-if="step === 1">
        <form @submit.prevent="handleVerifyCode" class="space-y-4">
          <BrInput
            v-model="examCode"
            label="Kode Ujian (6 Karakter)"
            placeholder="CONTOH: MAT101"
            mono
            required
          />
          <BrButton type="submit" variant="primary" block size="lg" :disabled="loading">
            {{ loading ? 'MEMERIKSA KODE...' : 'LANJUT KE TOKEN' }}
          </BrButton>
        </form>
      </BrCard>

      <!-- Card Step 2: Token -->
      <BrCard v-else-if="step === 2">
        <form @submit.prevent="handleVerifyToken" class="space-y-4">
          <div class="border-b-[2px] border-ink pb-2">
            <span class="font-mono text-xs text-ink-soft block">Ujian:</span>
            <strong class="font-heading text-lg uppercase">{{ exam.title }}</strong>
          </div>

          <BrInput
            v-model="token"
            label="Token Ujian"
            placeholder="Masukkan token dari pengawas"
            mono
            required
          />
          <div class="flex gap-2">
            <BrButton type="button" variant="secondary" size="md" @click="step = 1">
              KEMBALI
            </BrButton>
            <BrButton type="submit" variant="primary" size="md" block :disabled="loading || isRateLimited">
              {{ loading ? 'MEMERIKSA...' : 'VERIFIKASI TOKEN' }}
            </BrButton>
          </div>
        </form>
      </BrCard>

      <!-- Card Step 3: Choose Name -->
      <BrCard v-else-if="step === 3">
        <form @submit.prevent="handleSelectName" class="space-y-4">
          <div class="space-y-1">
            <label class="font-mono text-xs uppercase font-bold tracking-wider">
              Pilih Nama Peserta:
            </label>
            <p class="text-xs text-ink-soft">
              * Nama yang dipilih akan dikunci permanen ke perangkat ini selama ujian.
            </p>
          </div>

          <div class="border-[3px] border-ink max-h-60 overflow-y-auto bg-white p-2 space-y-1">
            <label
              v-for="p in availableParticipants"
              :key="p.id"
              class="flex items-center gap-3 p-3 border-b border-ink/20 hover:bg-lime/20 cursor-pointer select-none"
              :class="selectedParticipantId === p.id ? 'bg-lime/40 font-bold' : ''"
            >
              <input
                type="radio"
                name="participant"
                :value="p.id"
                v-model="selectedParticipantId"
                class="w-4 h-4 text-blue accent-blue"
              />
              <div class="flex-1">
                <div class="text-sm uppercase font-bold">{{ p.name }}</div>
                <div v-if="p.ref_id" class="font-mono text-xs text-ink-soft">{{ p.ref_id }}</div>
              </div>
            </label>
          </div>

          <div class="flex gap-2">
            <BrButton type="button" variant="secondary" size="md" @click="step = 2">
              KEMBALI
            </BrButton>
            <BrButton type="submit" variant="primary" size="md" block :disabled="loading || !selectedParticipantId">
              KUNCI NAMA & LANJUT
            </BrButton>
          </div>
        </form>
      </BrCard>

      <!-- Card Step 4: Rules & Consent (T10, DP-04) -->
      <BrCard v-else-if="step === 4" class="space-y-6">
        <div class="space-y-3">
          <h2 class="text-xl font-black uppercase border-b-[2px] border-ink pb-2">
            ATURAN KEAMANAN UJIAN
          </h2>
          <ul class="font-sans text-sm text-ink-soft space-y-2 list-disc list-inside">
            <li>Halaman akan berjalan dalam mode <strong>layar penuh (Fullscreen)</strong>.</li>
            <li>Dilarang berpindah tab atau membuka aplikasi lain. Tindakan ini akan <strong>menambah hitungan pelanggaran</strong> dan mengunci layar ujian Anda.</li>
            <li>Layar ujian dilindungi <strong>Watermark Transparan</strong> berisi nama & identitas Anda untuk mencegah foto atau kebocoran soal.</li>
            <li>Tindakan copy, paste, dan klik kanan di pembungkus dinonaktifkan.</li>
          </ul>
        </div>

        <div class="border-[3px] border-ink bg-cream p-4 space-y-2">
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="agreementChecked"
              class="w-5 h-5 mt-0.5 accent-blue border-ink"
            />
            <span class="text-xs font-sans text-ink">
              Saya memahami tata tertib di atas dan menyetujui perekaman log integritas pengerjaan ujian ini oleh sistem Secure Exam Wrapper (DP-04).
            </span>
          </label>
        </div>

        <BrButton
          variant="primary"
          block
          size="lg"
          :disabled="!agreementChecked"
          @click="handleStartExam"
        >
          🚀 MULAI UJIAN SEKARANG
        </BrButton>
      </BrCard>
    </div>
  </div>
</template>
