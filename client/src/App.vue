<script setup lang="ts">
import { ref } from 'vue';
import Level1Form from './components/Level1Form.vue';
import Level2Adventure from './components/Level2Adventure.vue';
import type { LevelCompletionData } from './types';

const currentLevel = ref<number>(1);

const handleLevelComplete = (data: LevelCompletionData) => {
  currentLevel.value = data.nextLevel;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200 flex items-center justify-center p-2 sm:p-4 md:p-6 font-sans relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div class="absolute top-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div class="absolute top-10 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    
    <div class="w-full max-w-4xl bg-white/95 backdrop-blur-lg p-4 sm:p-6 md:p-10 lg:p-12 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white/70 relative z-10">
      
      <Level1Form v-if="currentLevel === 1" @completed="handleLevelComplete" />
      
      <Level2Adventure v-if="currentLevel === 2" @completed="handleLevelComplete" />

      <div v-if="currentLevel === 3" class="text-center p-6 sm:p-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Level 3: Clicker coming soon...
        </h2>
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