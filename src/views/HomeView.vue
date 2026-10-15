<script setup lang="ts">
import BrButton from '@/components/ui/BrButton.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrStatCard from '@/components/ui/BrStatCard.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const examCode = ref('')

const handleJoin = () => {
  if (!examCode.value) return
  router.push(`/exam/${examCode.value.toUpperCase().trim()}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <header class="border-b-[3px] border-ink bg-white sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue border-[3px] border-ink flex items-center justify-center text-white font-heading font-black text-lg">
            S
          </div>
          <span class="font-heading font-black text-xl tracking-tight uppercase">SECURE EXAM</span>
          <BrBadge variant="lime" class="hidden sm:inline-flex">MVP</BrBadge>
        </div>

        <div class="flex items-center gap-4">
          <router-link to="/styleguide" class="font-mono text-xs font-bold tracking-wider hover:underline text-ink">
            STYLEGUIDE
          </router-link>
          <router-link to="/login">
            <BrButton size="sm" variant="primary">MASUK PENYELENGGARA</BrButton>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Content -->
    <main class="flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Left Column: Landing / Entry -->
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2">
          <BrBadge variant="lime">FORM WRAPPER</BrBadge>
          <span class="font-mono text-xs font-bold uppercase tracking-wider text-ink-soft">Google Form / Tally</span>
        </div>

        <div>
          <h1 class="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            UJIAN AMAN <br />
            <span class="text-blue">TANPA RIBET</span>
          </h1>
          <h2 class="text-3xl sm:text-5xl font-black uppercase text-stroke mt-1 leading-none tracking-tight">
            ANTI CURANG & BOCOR
          </h2>
        </div>

        <p class="text-ink-soft text-lg max-w-xl leading-relaxed">
          Bungkus Google Form atau form ujian Anda dengan fullscreen anti-pindah tab, watermark identitas tahan tangkapan layar, dan pemantau pelanggaran otomatis.
        </p>

        <!-- Quick Entry for Participant -->
        <BrCard class="max-w-md">
          <form @submit.prevent="handleJoin" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold uppercase tracking-wider">PESERTA UJIAN</span>
              <BrBadge variant="cream">MASUK CEPAT</BrBadge>
            </div>
            <BrInput
              v-model="examCode"
              placeholder="KODE UJIAN (MISAL: MAT-101)"
              mono
              required
            />
            <BrButton type="submit" variant="primary" block size="lg">
              MASUK UJIAN
            </BrButton>
          </form>
        </BrCard>
      </div>

      <!-- Right Column: Features stat cards -->
      <div class="lg:col-span-5 space-y-4">
        <BrStatCard
          value="WATERMARK"
          label="IDENTITAS DINAMIS"
          sublabel="Teks nama & kode menyilang layar mencegah foto/kebocoran HP kedua"
          variant="lime"
        />
        <BrStatCard
          value="LOCKOUT"
          label="ANTI PINDAH TAB"
          sublabel="Toleransi otomatis mengunci layar bila peserta curang membuka aplikasi lain"
          variant="white"
        />
        <BrStatCard
          value="LAPORAN"
          label="AUDIT LENGKAP"
          sublabel="Rekap waktu pengerjaan, log pelanggaran, dan ekspor CSV untuk guru"
          variant="cream"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t-[3px] border-ink bg-white py-6">
      <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <p>© 2026 SECURE EXAM WRAPPER. NEO-BRUTALISM EDITION.</p>
        <div class="flex items-center gap-4">
          <router-link to="/styleguide" class="hover:underline">KOMPONEN UI</router-link>
          <span>•</span>
          <span>BAHASA INDONESIA</span>
        </div>
      </div>
    </footer>
  </div>
</template>

