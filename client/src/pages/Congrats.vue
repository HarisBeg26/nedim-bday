<template>
  <div class="min-h-screen w-full relative overflow-hidden flex items-end justify-center pb-12 sm:pb-16">
    <img 
      src="/congrats.jpg" 
      alt="Congratulations"
      class="absolute inset-0 w-full h-full object-cover"
      style="z-index: 0;"
    />

    <div class="text-center px-6 py-8 bg-black/80 backdrop-blur-lg rounded-3xl border-4 border-orange-500 shadow-2xl max-w-3xl mx-4 relative" style="z-index: 1;">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-400 mb-4 drop-shadow-lg">ČESTITAMO!</h2>
      <p class="text-xl sm:text-2xl md:text-3xl text-orange-400 font-bold mb-3 drop-shadow-md">Prošao si Aldinov Izazov!</p>
      <p class="text-2xl sm:text-3xl md:text-4xl text-orange-300 font-bold animate-pulse drop-shadow-lg">SRETAN ROĐENDAN NEDIM!</p>
      <p class="text-lg sm:text-xl md:text-2xl text-orange-200 font-semibold mt-4">Bega šarmer, Bega guli, dodji mi vamo da te ljubnim XO</p>
      <p class="text-base sm:text-lg md:text-xl text-orange-200 mt-3 leading-relaxed">
        Tvoj omiljeni brat ti želi sretan rođendan, sa punim zdravljem i životnim navikama u novoj godini Tebe. Koliko god da si daleko, zapravo nisi jer te nosimo u kompjuteru sa sobom ha ha ha... Ali isto te nosimo ovdje (pokazuje na lijevu sisu) (udara grudi kao majmun) Puno te volimo i dajemo ti obavijest, a ti sa njom radi šta hoćeš.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const imgEl = ref<HTMLImageElement | null>(null);

onMounted(() => {
  console.log('[diag] Congrats page mounted');
  // Probe image availability with a separate Image instance to log dimensions
  const probe = new Image();
  probe.onload = () => {
    console.log('[diag] congrats.jpg loaded', { width: probe.naturalWidth, height: probe.naturalHeight });
  };
  probe.onerror = (e) => {
    console.log('[diag] congrats.jpg error', e);
  };
  probe.src = '/congrats.jpg';
});
</script>

<style scoped>
</style>
