<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { hashToken } from '@/lib/examUtils'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrChip from '@/components/ui/BrChip.vue'

const route = useRoute()
const examId = route.params.id as string

const exam = ref<any>(null)
const participants = ref<any[]>([])
const loading = ref(true)
const rawPaste = ref('')
const singleName = ref('')
const singleRefId = ref('')
const singleToken = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const fetchExamDetail = async () => {
  try {
    loading.value = true
    const { data: ex, error: exErr } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (exErr) throw exErr
    exam.value = ex

    const { data: parts, error: partErr } = await supabase
      .from('participants')
      .select('*')
      .eq('exam_id', examId)
      .order('name', { ascending: true })

    if (partErr) throw partErr
    participants.value = parts || []
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

// PA-01: Bulk paste from Excel/CSV
const handleBulkImport = async () => {
  if (!rawPaste.value.trim()) return

  try {
    errorMessage.value = ''
    successMessage.value = ''

    const lines = rawPaste.value.trim().split(/\r?\n/)
    const currentCount = participants.value.length

    if (currentCount + lines.length > 200) {
      throw new Error(`Batas maksimal peserta adalah 200 (Saat ini: ${currentCount}, Anda menambahkan: ${lines.length}).`)
    }

    const newParticipants: any[] = []

    for (const line of lines) {
      if (!line.trim()) continue
      // Format: Nama, ID/Kelas, TokenIndividual (opsional) dipisahkan koma atau tab
      const parts = line.split(/[,\t]+/).map(p => p.trim())
      const name = parts[0]
      const refId = parts[1] || null
      const individualToken = parts[2] || null

      let tokenHash = null
      if (individualToken) {
        tokenHash = await hashToken(individualToken)
      }

      if (name) {
        newParticipants.push({
          exam_id: examId,
          name,
          ref_id: refId,
          individual_token_hash: tokenHash,
        })
      }
    }

    const { data, error } = await supabase
      .from('participants')
      .upsert(newParticipants, { onConflict: 'exam_id,name' })
      .select()

    if (error) throw error

    successMessage.value = `Berhasil mengimpor ${data.length} peserta!`
    rawPaste.value = ''
    await fetchExamDetail()
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengimpor data peserta'
  }
}

// Single Add
const handleAddSingle = async () => {
  if (!singleName.value.trim()) return

  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (participants.value.length >= 200) {
      throw new Error('Batas maksimal 200 peserta per ujian tercapai.')
    }

    let tokenHash = null
    if (singleToken.value.trim()) {
      tokenHash = await hashToken(singleToken.value.trim())
    }

    const { error } = await supabase
      .from('participants')
      .insert({
        exam_id: examId,
        name: singleName.value.trim(),
        ref_id: singleRefId.value.trim() || null,
        individual_token_hash: tokenHash,
      })

    if (error) throw error

    singleName.value = ''
    singleRefId.value = ''
    singleToken.value = ''
    successMessage.value = 'Peserta berhasil ditambahkan'
    await fetchExamDetail()
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menambahkan peserta'
  }
}

// Unlock participant device lock (PA-03)
const handleResetDevice = async (pId: string) => {
  try {
    const { error } = await supabase
      .from('participants')
      .update({
        device_id: null,
        locked_name: false,
        user_agent_summary: null,
      })
      .eq('id', pId)

    if (error) throw error
    await fetchExamDetail()
  } catch (err: any) {
    alert(err.message || 'Gagal mereset perangkat peserta')
  }
}

onMounted(() => {
  fetchExamDetail()
})
</script>

<template>
  <div class="min-h-screen p-6 sm:p-12 max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-ink pb-6">
      <div v-if="exam">
        <div class="flex items-center gap-2 mb-2">
          <BrBadge variant="ink">KODE: {{ exam.code }}</BrBadge>
          <BrChip :status="exam.status" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase">{{ exam.title }}</h1>
        <p class="font-mono text-xs text-ink-soft mt-1">
          Durasi: {{ exam.duration_min }} menit • Toleransi: {{ exam.tolerance }}x pelanggaran
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/dashboard">
          <BrButton variant="secondary" size="sm">KEMBALI</BrButton>
        </router-link>
        <router-link :to="`/dashboard/exams/${examId}/report`">
          <BrButton variant="lime" size="sm">LIHAT LAPORAN</BrButton>
        </router-link>
      </div>
    </div>

    <!-- Alert status -->
    <div v-if="errorMessage" class="border-[3px] border-danger bg-red-100 p-4 text-danger font-mono text-xs font-bold">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="border-[3px] border-ok bg-emerald-100 p-4 text-ok font-mono text-xs font-bold">
      {{ successMessage }}
    </div>

    <!-- Participants Management (PA-01) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left: Import form -->
      <div class="lg:col-span-5 space-y-6">
        <BrCard class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black uppercase">TEMPEL DARI EXCEL / CSV</h2>
            <BrBadge variant="lime">BULK IMPORT</BrBadge>
          </div>
          <p class="text-xs text-ink-soft font-mono">
            Format per baris:<br />
            <strong>Nama Peserta, Nomor Induk/Kelas, Token Individual (opsional)</strong>
          </p>
          <textarea
            v-model="rawPaste"
            rows="6"
            class="w-full bg-cream border-[3px] border-ink p-3 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-blue/30"
            placeholder="Ahmad Subarjo, XII-IPA-1&#10;Budi Santoso, XII-IPA-1&#10;Citra Lestari, XII-IPA-2, TOKEN99"
          ></textarea>
          <BrButton variant="primary" block size="md" @click="handleBulkImport">
            IMPOR DAFTAR NAMA
          </BrButton>
        </BrCard>

        <!-- Single input form -->
        <BrCard class="space-y-4">
          <h2 class="text-lg font-black uppercase">TAMBAH 1 PESERTA</h2>
          <BrInput v-model="singleName" label="Nama Lengkap" placeholder="Nama siswa" required />
          <BrInput v-model="singleRefId" label="NISN / Kelas (Opsional)" placeholder="XII-IPA-1" />
          <BrInput v-model="singleToken" label="Token Khusus (Opsional)" placeholder="Biarkan kosong jika pakai token ujian" mono />
          <BrButton variant="secondary" block size="md" @click="handleAddSingle">
            + SIMPAN PESERTA
          </BrButton>
        </BrCard>
      </div>

      <!-- Right: Participants Table (PA-01, PA-03, PA-05) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black uppercase">
            DAFTAR PESERTA ({{ participants.length }}/200)
          </h2>
          <span class="font-mono text-xs text-ink-soft">
            Terkunci ke perangkat: {{ participants.filter(p => p.locked_name).length }}
          </span>
        </div>

        <div class="border-[3px] border-ink bg-white overflow-hidden shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse font-sans text-sm">
              <thead class="bg-ink text-white font-mono text-xs uppercase">
                <tr>
                  <th class="p-3 border-b-[3px] border-ink">No</th>
                  <th class="p-3 border-b-[3px] border-ink">Nama Peserta</th>
                  <th class="p-3 border-b-[3px] border-ink">ID / Kelas</th>
                  <th class="p-3 border-b-[3px] border-ink">Status Perangkat</th>
                  <th class="p-3 border-b-[3px] border-ink">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="participants.length === 0">
                  <td colspan="5" class="p-8 text-center font-mono text-xs text-ink-soft">
                    Belum ada data peserta. Gunakan form di sebelah kiri untuk menambahkan.
                  </td>
                </tr>
                <tr
                  v-for="(p, idx) in participants"
                  :key="p.id"
                  :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#F0EEE3]/50'"
                  class="border-b border-ink/20"
                >
                  <td class="p-3 font-mono text-xs font-bold">{{ idx + 1 }}</td>
                  <td class="p-3 font-bold uppercase">{{ p.name }}</td>
                  <td class="p-3 font-mono text-xs">{{ p.ref_id || '-' }}</td>
                  <td class="p-3">
                    <span v-if="p.locked_name" class="inline-flex items-center gap-1 font-mono text-xs text-danger font-bold">
                      🔒 Terkunci ({{ p.user_agent_summary || 'Device' }})
                    </span>
                    <span v-else class="font-mono text-xs text-ok font-bold">
                      🔓 Bebas
                    </span>
                  </td>
                  <td class="p-3">
                    <button
                      v-if="p.locked_name"
                      @click="handleResetDevice(p.id)"
                      class="font-mono text-xs underline font-bold text-blue hover:text-ink cursor-pointer"
                    >
                      Buka Perangkat
                    </button>
                    <span v-else class="font-mono text-xs text-ink-soft">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
