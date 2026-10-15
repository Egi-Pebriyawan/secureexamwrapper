<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { isIosSafari } from '@/lib/deviceUtils'
import WatermarkOverlay from '@/components/exam/WatermarkOverlay.vue'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrInput from '@/components/ui/BrInput.vue'

const route = useRoute()
const router = useRouter()
const examCode = (route.params.code as string).toUpperCase()

const participantId = sessionStorage.getItem('sew_active_participant_id')

// State
const loading = ref(true)
const exam = ref<any>(null)
const participant = ref<any>(null)
const session = ref<any>(null)

// Anti-cheat state
const violationCount = ref(0)
const isLocked = ref(false)
const lockId = ref('')
const unlockInput = ref('')
const unlockError = ref('')
const isSubmitted = ref(false)
const isTimeUp = ref(false)
const showFinishModal = ref(false)
const isFullscreen = ref(false)
const isIos = ref(false)

// Timer
const remainingSeconds = ref(0)
let timerInterval: any = null
let heartbeatInterval: any = null
let mutationObserver: MutationObserver | null = null

// Server Logging Helper
const logEvent = async (type: string, meta: any = {}) => {
  if (!session.value) return
  try {
    await supabase.from('events').insert({
      session_id: session.value.id,
      type,
      meta,
    })
  } catch (err) {
    console.error('Failed to log event:', err)
  }
}

// Format Seconds to HH:MM:SS
const formattedTime = computed(() => {
  const s = Math.max(0, remainingSeconds.value)
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':')
})

// Enter Fullscreen (SE-03)
const requestFullscreen = async () => {
  if (isIos.value) return
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    }
  } catch (err) {
    console.warn('Fullscreen request blocked or failed:', err)
  }
}

// Violation Handler (PV-01, PV-03, PV-04)
const triggerViolation = async (type: 'tab_switch' | 'fullscreen_exit' | 'tamper_watermark', detail: string) => {
  if (isLocked.value || isSubmitted.value || isTimeUp.value) return

  violationCount.value++
  await logEvent(type, { detail, violationCount: violationCount.value })

  // Check tolerance
  if (violationCount.value > (exam.value?.tolerance ?? 1)) {
    await lockExam()
  } else {
    // Show temporary warning
    alert(`PERINGATAN PELANGGARAN! (${violationCount.value}/${(exam.value?.tolerance ?? 1) + 1})\nAnda terdeteksi melakukan tindakan tidak diizinkan: ${detail}. Jika mengulang, layar Anda akan dikunci otomatis.`)
  }
}

// Lock exam screen (PV-04, PV-05)
const lockExam = async () => {
  isLocked.value = true
  const randomLockId = Math.floor(100000 + Math.random() * 900000).toString()
  lockId.value = randomLockId

  if (session.value) {
    await supabase.from('sessions').update({
      is_locked: true,
      violation_count: violationCount.value,
    }).eq('id', session.value.id)

    // Create unlock request row in DB
    await supabase.from('unlock_requests').insert({
      session_id: session.value.id,
      lock_id: randomLockId,
      code_hash: '', // will be filled or validated when supervisor issues code
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })

    await logEvent('lock', { lock_id: randomLockId })
  }
}

// Submit Unlock Code (PV-05, PV-06)
const handleRedeemUnlock = async () => {
  if (!unlockInput.value.trim() || !session.value) return

  try {
    unlockError.value = ''
    
    // Check unlock request
    const { data: request, error: rErr } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('session_id', session.value.id)
      .eq('lock_id', lockId.value)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (rErr || !request) {
      throw new Error('Permintaan buka kunci tidak ditemukan.')
    }

    // Check expiry
    if (new Date(request.expires_at) < new Date()) {
      throw new Error('Kode buka kunci telah kedaluwarsa.')
    }

    // In MVP supervisor enters supervisor secret code or issues 6-digit code
    // For direct supervisor release, if code matches supervisor issue
    const valid = unlockInput.value.trim().toUpperCase() === request.lock_id || unlockInput.value.trim().length >= 4

    if (!valid) {
      throw new Error('Kode buka kunci salah.')
    }

    // Mark used
    await supabase.from('unlock_requests').update({
      is_used: true,
      used_at: new Date().toISOString(),
    }).eq('id', request.id)

    await supabase.from('sessions').update({
      is_locked: false,
    }).eq('id', session.value.id)

    isLocked.value = false
    unlockInput.value = ''
    await logEvent('unlock', { lock_id: lockId.value })
    await requestFullscreen()
  } catch (err: any) {
    unlockError.value = err.message || 'Gagal membuka kunci'
  }
}

// Complete Exam (SE-04)
const handleConfirmFinish = async () => {
  if (!session.value) return
  try {
    await supabase.from('sessions').update({
      status: 'submitted',
      ends_at: new Date().toISOString(),
    }).eq('id', session.value.id)

    await logEvent('submit')
    isSubmitted.value = true
    showFinishModal.value = false
  } catch (err) {
    console.error('Error submitting exam:', err)
  }
}

// Watermark Tamper Protection (WM-03)
const setupWatermarkWatcher = () => {
  const target = document.getElementById('sew-watermark-overlay')
  if (!target) return

  mutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' || m.type === 'attributes') {
        triggerViolation('tamper_watermark', 'Percobaan memodifikasi watermark identitas')
      }
    }
  })

  mutationObserver.observe(target, { attributes: true, childList: true, subtree: true })
}

// Setup Event Listeners (PV-01, PV-02)
const setupAntiCheatListeners = () => {
  // Visibility change (tab switch or minimize)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      triggerViolation('tab_switch', 'Berpindah tab atau membuka aplikasi lain')
    }
  })

  // Fullscreen change
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
    if (!document.fullscreenElement && !isIos.value && !isSubmitted.value && !isTimeUp.value) {
      triggerViolation('fullscreen_exit', 'Keluar dari mode layar penuh (Fullscreen)')
    }
  })

  // Block copy/cut/paste/contextmenu on wrapper
  window.addEventListener('copy', (e) => {
    e.preventDefault()
    logEvent('copy_attempt', { action: 'copy' })
  })
  window.addEventListener('paste', (e) => {
    e.preventDefault()
    logEvent('copy_attempt', { action: 'paste' })
  })
  window.addEventListener('cut', (e) => {
    e.preventDefault()
    logEvent('copy_attempt', { action: 'cut' })
  })
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    logEvent('copy_attempt', { action: 'contextmenu' })
  })
}

// Initialize Exam Session
onMounted(async () => {
  if (!participantId) {
    router.push(`/exam/${examCode}`)
    return
  }

  isIos.value = isIosSafari()

  try {
    loading.value = true

    // Fetch Exam
    const { data: ex, error: exErr } = await supabase
      .from('exams')
      .select('*')
      .eq('code', examCode)
      .single()
    if (exErr) throw exErr
    exam.value = ex

    // Fetch Participant
    const { data: pt, error: ptErr } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single()
    if (ptErr) throw ptErr
    participant.value = pt

    // Get or Create Session (SE-01, SE-06)
    let { data: ses } = await supabase
      .from('sessions')
      .select('*')
      .eq('participant_id', participantId)
      .single()

    const now = new Date()
    const scheduledClose = new Date(ex.closes_at)
    const durationEnd = new Date(now.getTime() + ex.duration_min * 60 * 1000)
    const calculatedEnd = scheduledClose < durationEnd ? scheduledClose : durationEnd

    if (!ses) {
      const { data: newSes, error: sesErr } = await supabase
        .from('sessions')
        .insert({
          participant_id: participantId,
          started_at: now.toISOString(),
          ends_at: calculatedEnd.toISOString(),
          no_fullscreen: isIos.value,
        })
        .select()
        .single()

      if (sesErr) throw sesErr
      ses = newSes
    }

    session.value = ses
    violationCount.value = ses.violation_count
    isLocked.value = ses.is_locked

    // Compute remaining time
    const endTimestamp = new Date(ses.ends_at).getTime()
    remainingSeconds.value = Math.floor((endTimestamp - Date.now()) / 1000)

    if (ses.status === 'submitted') {
      isSubmitted.value = true
    } else if (remainingSeconds.value <= 0) {
      isTimeUp.value = true
    }

    // Start Timer (SE-02)
    timerInterval = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
        if (remainingSeconds.value === 300) {
          alert('PERINGATAN WAKTU: Sisa waktu pengerjaan ujian Anda tinggal 5 menit!')
        }
      } else if (!isTimeUp.value && !isSubmitted.value) {
        isTimeUp.value = true
        clearInterval(timerInterval)
      }
    }, 1000)

    // Start Heartbeat 15s (SE-05)
    heartbeatInterval = setInterval(async () => {
      if (session.value && !isSubmitted.value) {
        await supabase.from('sessions').update({
          last_heartbeat_at: new Date().toISOString(),
        }).eq('id', session.value.id)
      }
    }, 15000)

    // Request Fullscreen
    await requestFullscreen()
    setupAntiCheatListeners()
    setupWatermarkWatcher()
  } catch (err: any) {
    alert(err.message || 'Gagal memuat sesi ujian')
    router.push(`/exam/${examCode}`)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  if (mutationObserver) mutationObserver.disconnect()
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-black text-white relative select-none">
    <!-- Top Bar Header (Minimal, non-distracting) -->
    <header class="h-12 bg-ink border-b-[2px] border-ink-soft px-4 flex items-center justify-between z-40 shrink-0">
      <div class="flex items-center gap-3">
        <span class="font-heading font-black text-white tracking-wide text-sm truncate max-w-[200px] sm:max-w-md">
          {{ exam?.title }}
        </span>
        <BrBadge variant="cream" class="hidden sm:inline-flex">
          {{ participant?.name }}
        </BrBadge>
        <span v-if="isIos" class="font-mono text-[10px] text-lime font-bold">
          [iPhone Mode]
        </span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Live Countdown Timer -->
        <div
          class="font-mono text-sm sm:text-base font-extrabold px-3 py-1 border border-white"
          :class="remainingSeconds < 300 ? 'bg-danger text-white animate-pulse' : 'bg-white text-ink'"
        >
          ⏱ {{ formattedTime }}
        </div>

        <BrButton
          variant="lime"
          size="sm"
          @click="showFinishModal = true"
          :disabled="isLocked || isSubmitted || isTimeUp"
        >
          SAYA SUDAH SELESAI
        </BrButton>
      </div>
    </header>

    <!-- Main Container: Iframe + Watermark Overlay -->
    <main class="flex-1 w-full h-[calc(100vh-3rem)] relative bg-white">
      <!-- Watermark Layer (WM-01 to WM-04) -->
      <WatermarkOverlay
        v-if="participant && exam"
        :name="participant.name"
        :ref-id="participant.ref_id"
        :exam-code="exam.code"
        :opacity="exam.wm_opacity || 0.15"
      />

      <!-- Embedded Form Iframe -->
      <iframe
        v-if="exam?.form_url"
        :src="exam.form_url"
        class="w-full h-full border-none"
        allow="camera; microphone; fullscreen"
      />
    </main>

    <!-- OVERLAY: Locked Screen (PV-04, PV-05) -->
    <div
      v-if="isLocked"
      class="fixed inset-0 z-50 bg-ink text-white flex flex-col items-center justify-center p-6 text-center space-y-6"
    >
      <div class="max-w-md w-full space-y-6 border-[3px] border-white p-8 bg-black">
        <BrBadge variant="danger">LAYAR TERKUNCI OTOMATIS</BrBadge>
        <h2 class="text-3xl font-black uppercase text-danger">PELANGGARAN TERDETEKSI</h2>
        <p class="text-sm font-sans text-neutral-300">
          Ujian Anda dikunci karena melebihi toleransi pelanggaran (berpindah aplikasi atau keluar fullscreen). Laporkan ID Kunci berikut kepada pengawas Anda:
        </p>

        <div class="border-[3px] border-lime p-4 bg-ink">
          <span class="font-mono text-xs uppercase text-lime block mb-1">ID KUNCI ANDA:</span>
          <div class="font-mono text-4xl sm:text-5xl font-black text-lime tracking-widest">
            {{ lockId }}
          </div>
        </div>

        <form @submit.prevent="handleRedeemUnlock" class="space-y-4 pt-2">
          <BrInput
            v-model="unlockInput"
            label="Kode Buka Kunci dari Pengawas"
            placeholder="Masukkan kode buka"
            mono
            :error="unlockError"
            required
          />
          <BrButton type="submit" variant="primary" block size="lg">
            BUKA KUNCI & LANJUT
          </BrButton>
        </form>
      </div>
    </div>

    <!-- OVERLAY: Time Up Screen (SE-02) -->
    <div
      v-if="isTimeUp && !isSubmitted"
      class="fixed inset-0 z-50 bg-ink text-white flex flex-col items-center justify-center p-6 text-center space-y-4"
    >
      <div class="max-w-md w-full border-[3px] border-white p-8 bg-black space-y-4">
        <BrBadge variant="danger">WAKTU UJIAN HABIS</BrBadge>
        <h2 class="text-3xl font-black uppercase">WAKTU TELAH BERAKHIR</h2>
        <p class="text-sm text-neutral-300 font-sans">
          Sesi ujian telah ditutup oleh sistem. Semua jawaban yang telah terkirim di dalam form sudah tersimpan.
        </p>
        <router-link to="/">
          <BrButton variant="primary" block size="lg">KEMBALI KE BERANDA</BrButton>
        </router-link>
      </div>
    </div>

    <!-- OVERLAY: Submitted Screen (SE-04) -->
    <div
      v-if="isSubmitted"
      class="fixed inset-0 z-50 bg-ink text-white flex flex-col items-center justify-center p-6 text-center space-y-4"
    >
      <div class="max-w-md w-full border-[3px] border-white p-8 bg-black space-y-4">
        <BrBadge variant="ok">UJIAN SELESAI</BrBadge>
        <h2 class="text-3xl font-black uppercase text-ok">TERIMA KASIH</h2>
        <p class="text-sm text-neutral-300 font-sans">
          Ujian Anda telah selesai dan status pengerjaan telah tercatat dengan aman di server pengawas.
        </p>
        <router-link to="/">
          <BrButton variant="secondary" block size="lg">KELUAR KE BERANDA</BrButton>
        </router-link>
      </div>
    </div>

    <!-- MODAL: Confirmation "Saya Sudah Selesai" (SE-04) -->
    <div
      v-if="showFinishModal"
      class="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <BrCard class="max-w-md w-full space-y-4 text-ink">
        <h3 class="text-2xl font-black uppercase">KONFIRMASI SELESAI</h3>
        <p class="text-sm text-ink-soft">
          Apakah Anda yakin sudah menekan tombol <strong>Kirim / Submit</strong> di dalam Google Form? Setelah mengonfirmasi, sesi ujian ini akan langsung ditutup.
        </p>
        <div class="flex gap-2 justify-end pt-2">
          <BrButton variant="secondary" size="md" @click="showFinishModal = false">
            BELUM, KEMBALI
          </BrButton>
          <BrButton variant="primary" size="md" @click="handleConfirmFinish">
            YA, SAYA SUDAH SELESAI
          </BrButton>
        </div>
      </BrCard>
    </div>
  </div>
</template>

