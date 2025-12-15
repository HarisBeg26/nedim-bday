<script setup lang="ts">
import { ref } from 'vue';
import Level2Adventure from './components/Level2Adventure.vue';
import type { LevelCompletionData } from './types';

const currentLevel = ref<number>(2); // Start directly at Level 2

const handleLevelComplete = (data: LevelCompletionData) => {
  currentLevel.value = data.nextLevel;
};
</script>

<template>
  <div class="min-h-screen font-sans relative overflow-hidden">
    <Level2Adventure v-if="currentLevel === 2" @completed="handleLevelComplete" />

    <div v-if="currentLevel === 3" class="min-h-screen flex flex-col items-center justify-end pb-12 sm:pb-16 relative overflow-hidden">
      <!-- Background Image -->
      <img 
        src="/congrats.jpg" 
        alt="Congratulations" 
        class="absolute inset-0 w-full h-full object-cover"
        style="z-index: 0;"
      />
      
      <!-- Message Box -->
      <div class="text-center px-6 py-8 bg-black/80 backdrop-blur-lg rounded-3xl border-4 border-orange-500 shadow-2xl max-w-3xl mx-4 relative" style="z-index: 1;">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-400 mb-4 drop-shadow-lg">
          🎉 ČESTITAMO! 🎉
        </h2>
        <p class="text-xl sm:text-2xl md:text-3xl text-white font-bold mb-3 drop-shadow-md">
          Prošao si Aldinov Izazov!
        </p>
        <p class="text-2xl sm:text-3xl md:text-4xl text-orange-300 font-bold animate-pulse drop-shadow-lg">
          🎂 SRETAN ROĐENDAN NEDIM! 🎂
        </p>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>