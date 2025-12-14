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

    <div v-if="currentLevel === 3" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-teal-900">
      <div class="text-center p-6 sm:p-12 bg-black/60 backdrop-blur-lg rounded-3xl border-4 border-green-400">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-4">
          🏆 CONGRATULATIONS! 🏆
        </h2>
        <p class="text-xl text-white">
          You've completed Aldin's Challenge!
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