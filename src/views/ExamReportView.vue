<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import BrButton from '@/components/ui/BrButton.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrStatCard from '@/components/ui/BrStatCard.vue'

const route = useRoute()
const examId = route.params.id as string

const loading = ref(true)
const exam = ref<any>(null)
const participants = ref<any[]>([])
const sessions = ref<any[]>([])
const events = ref<any[]>([])

const fetchReportData = async () => {
  try {
    loading.value = true

    const { data: ex } = await supabase.from('exams').select('*').eq('id', examId).single()
    exam.value = ex

    const { data: parts } = await supabase.from('participants').select('*').eq('exam_id', examId)
    participants.value = parts || []

    // Fetch sessions
    const partIds = (parts || []).map(p => p.id)
    if (partIds.length > 0) {
      const { data: sess } = await supabase
        .from('sessions')
        .select('*')
        .in('participant_id', partIds)
      sessions.value = sess || []

      const sessIds = (sess || []).map(s => s.id)
      if (sessIds.length > 0) {
        const { data: evs } = await supabase
          .from('events')
          .select('*')
          .in('session_id', sessIds)
          .order('created_at', { ascending: false })
        events.value = evs || []
      }
    }
  } catch (err) {
    console.error('Error fetching report:', err)
  } finally {
    loading.value = false
  }
}

// Participant report rows (RP-01, RP-03)
const participantRows = computed(() => {
  return participants.value.map(p => {
    const s = sessions.value.find(sess => sess.participant_id === p.id)
    const pEvents = s ? events.value.filter(e => e.session_id === s.id) : []
    const violations = s ? s.violation_count : 0
    const needsReview = violations >= 2 || (s && s.is_locked)

    return {
      id: p.id,
      name: p.name,
      refId: p.ref_id,
      userAgent: p.user_agent_summary || '-',
      startedAt: s ? new Date(s.started_at).toLocaleTimeString() : '-',
      status: s ? s.status : 'Belum Mulai',
      violations,
      needsReview,
      noFullscreen: s?.no_fullscreen || false,
      events: pEvents,
    }
  })
})

// RP-04: Export CSV
const exportCSV = () => {
  const headers = ['Nama', 'ID/Kelas', 'Status', 'Waktu Mulai', 'Pelanggaran', 'Perlu Ditinjau', 'Mode iPhone', 'Perangkat']
  const rows = participantRows.value.map(r => [
    `"${r.name}"`,
    `"${r.refId || ''}"`,
    `"${r.status}"`,
    `"${r.startedAt}"`,
    r.violations,
    r.needsReview ? 'YA' : 'TIDAK',
    r.noFullscreen ? 'YA' : 'TIDAK',
    `"${r.userAgent}"`,
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Laporan_Ujian_${exam.value?.code || 'SEW'}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchReportData()
})
</script>

<template>
  <div class="min-h-screen p-6 sm:p-12 max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-ink pb-6">
      <div v-if="exam">
        <div class="flex items-center gap-2 mb-2">
          <BrBadge variant="lime">AUDIT KEJADIAN</BrBadge>
          <BrBadge variant="ink">KODE: {{ exam.code }}</BrBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase">LAPORAN UJIAN</h1>
        <p class="font-mono text-xs text-ink-soft mt-1">
          {{ exam.title }} • Rekapitulasi integritas pengerjaan peserta (RP-01 - RP-05)
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link :to="`/dashboard/exams/${examId}`">
          <BrButton variant="secondary" size="sm">KEMBALI</BrButton>
        </router-link>
        <BrButton variant="primary" size="sm" @click="exportCSV">
          📥 EKSPOR CSV (RP-04)
        </BrButton>
      </div>
    </div>

    <!-- Summary Metrics (RP-02) -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <BrStatCard
        :value="participants.length"
        label="TOTAL PESERTA"
        sublabel="Terdaftar pada ujian ini"
        variant="white"
      />
      <BrStatCard
        :value="sessions.filter(s => s.status === 'submitted').length"
        label="SUDAH SELESAI"
        sublabel="Peserta telah mengirim"
        variant="cream"
      />
      <BrStatCard
        :value="participantRows.filter(r => r.needsReview).length"
        label="PERLU DITINJAU"
        sublabel="Ambang pelanggaran ≥2x"
        variant="lime"
      />
      <BrStatCard
        :value="events.length"
        label="TOTAL KEJADIAN"
        sublabel="Log pelanggaran tercatat"
        variant="ink"
      />
    </div>

    <!-- Participants Audit Table -->
    <section class="space-y-4">
      <h2 class="text-xl font-black uppercase">REKAP PESERTA & INDIKASI PELANGGARAN</h2>

      <div class="border-[3px] border-ink bg-white overflow-hidden shadow-[4px_4px_0px_0px_#0A0A0A]">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse font-sans text-sm">
            <thead class="bg-ink text-white font-mono text-xs uppercase">
              <tr>
                <th class="p-3 border-b-[3px] border-ink">Peserta</th>
                <th class="p-3 border-b-[3px] border-ink">ID / Kelas</th>
                <th class="p-3 border-b-[3px] border-ink">Status</th>
                <th class="p-3 border-b-[3px] border-ink">Mulai</th>
                <th class="p-3 border-b-[3px] border-ink">Pelanggaran</th>
                <th class="p-3 border-b-[3px] border-ink">Perangkat</th>
                <th class="p-3 border-b-[3px] border-ink">Status Tinjau</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="participantRows.length === 0">
                <td colspan="7" class="p-8 text-center font-mono text-xs text-ink-soft">
                  Belum ada peserta yang mengikuti ujian ini.
                </td>
              </tr>
              <tr
                v-for="(row, idx) in participantRows"
                :key="row.id"
                :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#F0EEE3]/50'"
                class="border-b border-ink/20"
              >
                <td class="p-3 font-bold uppercase">{{ row.name }}</td>
                <td class="p-3 font-mono text-xs">{{ row.refId || '-' }}</td>
                <td class="p-3 font-mono text-xs font-bold uppercase">{{ row.status }}</td>
                <td class="p-3 font-mono text-xs">{{ row.startedAt }}</td>
                <td class="p-3 font-mono text-xs font-black">
                  <span :class="row.violations > 0 ? 'text-danger' : 'text-ok'">
                    {{ row.violations }}x
                  </span>
                </td>
                <td class="p-3 font-mono text-xs text-ink-soft">
                  {{ row.userAgent }}
                  <span v-if="row.noFullscreen" class="text-danger font-bold block">[Tanpa Fullscreen]</span>
                </td>
                <td class="p-3">
                  <BrBadge v-if="row.needsReview" variant="danger">
                    PERLU DITINJAU (RP-03)
                  </BrBadge>
                  <BrBadge v-else variant="ok">
                    AMAN
                  </BrBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
