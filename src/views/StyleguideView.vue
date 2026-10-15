<script setup lang="ts">
import BrButton from '@/components/ui/BrButton.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrChip from '@/components/ui/BrChip.vue'
import BrStatCard from '@/components/ui/BrStatCard.vue'
import { ref } from 'vue'

const inputValue = ref('')
const inputError = ref('Format kode salah. Harus 6 karakter.')
</script>

<template>
  <div class="min-h-screen p-6 sm:p-12 max-w-6xl mx-auto space-y-12">
    <!-- Header -->
    <header class="border-b-[3px] border-ink pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <BrBadge variant="lime">NEO-BRUTALISM</BrBadge>
          <BrBadge variant="ink">DESIGN SYSTEM</BrBadge>
        </div>
        <h1 class="text-4xl sm:text-5xl font-black">
          STYLEGUIDE <span class="text-blue">SEW</span>
        </h1>
        <p class="font-mono text-sm text-ink-soft mt-1">Design token & komponen UI Secure Exam Wrapper (Bagian 9 PRD)</p>
      </div>
      <div>
        <router-link to="/">
          <BrButton variant="secondary" size="sm">Kembali ke Beranda</BrButton>
        </router-link>
      </div>
    </header>

    <!-- Colors Section -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">1. Palette Warna</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="border-[3px] border-ink bg-[#F0EEE3] p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-ink-soft">--color-cream</div>
          <div class="font-heading font-black text-xl">#F0EEE3</div>
          <div class="text-xs font-sans mt-2 text-ink-soft">Latar Halaman</div>
        </div>
        <div class="border-[3px] border-ink bg-[#0A0A0A] text-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-neutral-400">--color-ink</div>
          <div class="font-heading font-black text-xl">#0A0A0A</div>
          <div class="text-xs font-sans mt-2 text-neutral-400">Teks Utama & Garis</div>
        </div>
        <div class="border-[3px] border-ink bg-[#2B2BE0] text-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-blue-200">--color-blue</div>
          <div class="font-heading font-black text-xl">#2B2BE0</div>
          <div class="text-xs font-sans mt-2 text-blue-200">Tombol Utama</div>
        </div>
        <div class="border-[3px] border-ink bg-[#D9F94A] text-ink p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-ink-soft">--color-lime</div>
          <div class="font-heading font-black text-xl">#D9F94A</div>
          <div class="text-xs font-sans mt-2 text-ink-soft">Badge & Aksen</div>
        </div>
        <div class="border-[3px] border-ink bg-[#FFFFFF] text-ink p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-ink-soft">--color-white</div>
          <div class="font-heading font-black text-xl">#FFFFFF</div>
          <div class="text-xs font-sans mt-2 text-ink-soft">Kartu & Tombol Sekunder</div>
        </div>
        <div class="border-[3px] border-ink bg-[#E5322D] text-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-red-200">--color-danger</div>
          <div class="font-heading font-black text-xl">#E5322D</div>
          <div class="text-xs font-sans mt-2 text-red-200">Pelanggaran & Error</div>
        </div>
        <div class="border-[3px] border-ink bg-[#1FA463] text-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-emerald-200">--color-ok</div>
          <div class="font-heading font-black text-xl">#1FA463</div>
          <div class="text-xs font-sans mt-2 text-emerald-200">Sukses & Selesai</div>
        </div>
        <div class="border-[3px] border-ink bg-[#4A4A4A] text-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
          <div class="font-mono text-xs font-bold text-neutral-300">--color-ink-soft</div>
          <div class="font-heading font-black text-xl">#4A4A4A</div>
          <div class="text-xs font-sans mt-2 text-neutral-300">Teks Isi / Paragraf</div>
        </div>
      </div>
    </section>

    <!-- Typography Section -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">2. Tipografi</h2>
      <BrCard>
        <div class="space-y-6">
          <div>
            <span class="font-mono text-xs text-ink-soft font-bold uppercase block mb-1">Archivo (Heading 800-900)</span>
            <div class="text-3xl sm:text-5xl font-black uppercase">
              Ujian Aman Tanpa Ribet
            </div>
            <div class="text-3xl sm:text-5xl font-black uppercase text-stroke mt-1">
              ANTI CURANG ANTI BOCOR
            </div>
          </div>
          <div class="border-t-[3px] border-ink pt-4">
            <span class="font-mono text-xs text-ink-soft font-bold uppercase block mb-1">JetBrains Mono (Angka & Badge)</span>
            <div class="font-mono text-xl sm:text-2xl font-bold tracking-wider">
              TOKEN: #EXAM-9921 // SISA WAKTU: 01:24:59
            </div>
          </div>
          <div class="border-t-[3px] border-ink pt-4">
            <span class="font-mono text-xs text-ink-soft font-bold uppercase block mb-1">Inter (Body text minimal 16px)</span>
            <p class="text-base text-ink-soft leading-relaxed max-w-2xl">
              Website pembungkus aman untuk form ujian eksternal (Google Form, Tally, dll.). Penyelenggara cukup menempel link form, membuat token dan daftar nama peserta. Peserta masuk lewat kode ujian + token.
            </p>
          </div>
        </div>
      </BrCard>
    </section>

    <!-- Buttons Section -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">3. Tombol (BrButton)</h2>
      <BrCard>
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-4">
            <BrButton variant="primary">Tombol Utama</BrButton>
            <BrButton variant="secondary">Tombol Sekunder</BrButton>
            <BrButton variant="lime">Aksen Lime</BrButton>
            <BrButton variant="danger">Bahaya / Kunci</BrButton>
            <BrButton variant="primary" disabled>Dinonaktifkan</BrButton>
          </div>
          <div class="flex flex-wrap items-center gap-4 border-t-[3px] border-ink pt-4">
            <BrButton size="sm" variant="primary">Small (sm)</BrButton>
            <BrButton size="md" variant="primary">Medium (md)</BrButton>
            <BrButton size="lg" variant="primary">Large (lg)</BrButton>
          </div>
        </div>
      </BrCard>
    </section>

    <!-- Badges & Chips -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">4. Badges & Chips Status</h2>
      <BrCard>
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <BrBadge variant="lime">AKTIF</BrBadge>
            <BrBadge variant="ink">OFFLINE</BrBadge>
            <BrBadge variant="blue">VERIFIKASI</BrBadge>
            <BrBadge variant="danger">PELANGGARAN</BrBadge>
            <BrBadge variant="ok">SELESAI</BrBadge>
          </div>
          <div class="flex flex-wrap items-center gap-3 border-t-[3px] border-ink pt-4">
            <span class="font-mono text-xs font-bold mr-2 text-ink-soft">Status Ujian:</span>
            <BrChip status="draft" />
            <BrChip status="scheduled" />
            <BrChip status="ongoing" />
            <BrChip status="finished" />
          </div>
        </div>
      </BrCard>
    </section>

    <!-- Inputs Section -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">5. Input Form (BrInput)</h2>
      <BrCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrInput
            v-model="inputValue"
            label="Kode Ujian"
            placeholder="CONTOH: MAT-01"
            mono
            helpText="Masukkan 6 karakter kode yang diberikan pengawas"
            required
          />
          <BrInput
            label="Token Peserta (Error state)"
            modelValue="WRONG_TOKEN"
            :error="inputError"
            mono
            required
          />
        </div>
      </BrCard>
    </section>

    <!-- Stat Cards Section -->
    <section class="space-y-4">
      <h2 class="text-2xl font-black border-l-4 border-ink pl-3">6. Kartu Statistik (BrStatCard)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BrStatCard value="200" label="PESERTA TERDAFTAR" sublabel="Maksimal 200 per sesi" variant="white" />
        <BrStatCard value="0" label="PELANGGARAN" sublabel="Toleransi bawaan: 1 kali" variant="lime" />
        <BrStatCard value="100%" label="TERKUNCI AMAN" sublabel="Watermark aktif + anti-blur" variant="cream" />
      </div>
    </section>
  </div>
</template>
