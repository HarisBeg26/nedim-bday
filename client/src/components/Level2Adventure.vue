<script setup lang="ts">
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import type { LevelCompletionData } from '../types';

const emit = defineEmits<{
  (e: 'completed', data: LevelCompletionData): void
}>();

// Game state
const currentQuestion = ref<number>(0);
const wrongAnswers = ref<number>(0);
const haircutQuality = ref<number>(100);
const isCompleted = ref<boolean>(false);
const userInput = ref<string>("");
const isLoading = ref<boolean>(false);
const dialogueHistory = ref<string[]>([]);
const currentDialogue = ref<string>("");

// Questions progression
const questions = [
  { id: 0, text: "Dobro došao u berbersku radnju! Sjedni, molim te. Kako ćemo lafe?", type: 'warmup', keywords: ['fade', 'kratko', 'normalno', 'obrijati'] },
  { id: 1, text: "Važi brate. A reci mi, kako su ti braća?", type: 'warmup', keywords: ['dobro', 'super', 'sve', 'ok', 'uredu'] },
  { id: 2, text: "Ma super, super. Jel ti ono nešta u Americi fiziku studiraš?", type: 'warmup', keywords: ['da', 'yes', 'yeah', 'ma da', 'jeste'] },
  { id: 3, text: "Bravo! A šta misliš da upišeš FIT u Mostaru?", type: 'warmup', keywords: ['možda', 'razmišljam', 'vidjet', 'da'] },
  { id: 4, text: "E dobro, dobro. Ajd sad malo matematika dok šišam. Koliko je ∫ x·ln(x) dx?", type: 'math', key: 'integral_ln' },
  { id: 5, text: "Dobro, dobro. A reci mi, koliko je d/dx[e^(x²)]?", type: 'math', key: 'derivative_exp' },
  { id: 6, text: "Ma bravo! Sad fizika - izračunaj silu gravitacije između dva tijela mase 10kg na udaljenosti 2m. (format: broj u N)", type: 'physics', key: 'gravity_force' },
  { id: 7, text: "Odlično! Koliko je ∫₀^(π/2) sin²(x) dx?", type: 'math', key: 'definite_integral' },
  { id: 8, text: "Svaka čast! Reci mi, ako je v = 20 m/s i t = 5s, kolika je udaljenost pri konstantnoj akceleraciji a = 2 m/s²? (format: broj u m)", type: 'physics', key: 'kinematics' },
  { id: 9, text: "E to! A ovo - riješi diferencijalnu jednačinu: dy/dx + 2y = 4x", type: 'math', key: 'diff_equation' },
  { id: 10, text: "Ma profesor si ti! Zadnje pitanje - kolika je energija fotona sa talasnom dužinom λ = 500nm? (format: broj u eV, 2 decimale)", type: 'physics', key: 'photon_energy' }
];

// Initialize first dialogue
currentDialogue.value = questions[0].text;

const haircutEmoji = computed(() => {
  if (haircutQuality.value >= 90) return "💇‍♂️✨";
  if (haircutQuality.value >= 70) return "💇‍♂️👌";
  if (haircutQuality.value >= 50) return "💇‍♂️😐";
  if (haircutQuality.value >= 30) return "💇‍♂️😬";
  return "💇‍♂️💀";
});

const haircutStatus = computed(() => {
  if (haircutQuality.value >= 90) return "Savršena frizura!";
  if (haircutQuality.value >= 70) return "Dobra frizura";
  if (haircutQuality.value >= 50) return "Može proći...";
  if (haircutQuality.value >= 30) return "Malo je loše...";
  return "Katastrofa!";
});

const checkAnswer = async (userAnswer: string, question: any): Promise<boolean> => {
  const normalized = userAnswer.toLowerCase().trim();
  
  if (question.type === 'warmup') {
    return question.keywords.some((keyword: string) => normalized.includes(keyword.toLowerCase()));
  } else {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${API_URL}/api/level2/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionKey: question.key,
          answer: userAnswer
        })
      });

      const result = await response.json();
      if (result.correct && result.message) {
        question.successMessage = result.message;
      }
      return result.correct;
    } catch (error) {
      console.error('Error checking answer:', error);
      return false;
    }
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  dialogueHistory.value.push(`Ti: ${userInput.value}`);
  const sentText = userInput.value;
  userInput.value = "";
  isLoading.value = true;

  setTimeout(async () => {
    const question = questions[currentQuestion.value];
    const isCorrect = await checkAnswer(sentText, question);
    
    if (isCorrect) {
      currentQuestion.value++;
      
      if (currentQuestion.value < questions.length) {
        const successMessages = [
          "Ma bravo! Vidi ga pametnjaković! ✂️",
          "Tačno! Fino, fino... 💈",
          "E to! Vidi ovoga kako zna! 👏",
          "Odlično! Nastavimo... ✨"
        ];
        const successMsg = (question as any).successMessage || successMessages[Math.floor(Math.random() * 4)];
        
        dialogueHistory.value.push(`Aldin: ${successMsg}`);
        
        setTimeout(() => {
          currentDialogue.value = questions[currentQuestion.value].text;
          isLoading.value = false;
        }, 800);
      } else {
        isCompleted.value = true;
        dialogueHistory.value.push("Aldin: E BRAVO! Savršeno si odgovorio na sva pitanja! Frizura ti je perfektna! 🏆✨");
        currentDialogue.value = "🎮 Trophy Unlocked: THE GUY - Awarded for completing Aldin's Mathematical Haircut Challenge! 🎮";
        isLoading.value = false;
        
        setTimeout(() => {
          emit('completed', { nextLevel: 3 });
        }, 4000);
      }
    } else {
      wrongAnswers.value++;
      haircutQuality.value = Math.max(0, haircutQuality.value - 15);
      
      const responses = [
        `Eee ne, ne... Ups, mala greška sa makazama... 😬 (Kvalitet: ${haircutQuality.value}%)`,
        `Pogrešno brate... Ajde, pokušaj ponovo. *slučajno skrati previše* 💇‍♂️ (${haircutQuality.value}%)`,
        `Ne, to nije tačno... Opa! *makaze skliznule* ✂️😅 (${haircutQuality.value}%)`,
        `Nije dobro... Hm, malo sam previše uzeo ovdje... 😬 (${haircutQuality.value}%)`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      dialogueHistory.value.push(`Aldin: ${response}`);
      
      if (haircutQuality.value <= 0) {
        setTimeout(() => {
          dialogueHistory.value.push("Aldin: Brate... potpuno sam ti upropastio frizuru. Bolje da kreneš ispočetka. 💀");
          currentDialogue.value = "GAME OVER - Reloading...";
          
          setTimeout(() => {
            location.reload();
          }, 3000);
        }, 1500);
      }
      
      isLoading.value = false;
    }
  }, 1000);
};
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-cover bg-center"
       style="background-image: url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2574');">
    
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    
    <!-- Main content -->
    <div class="relative z-10 min-h-screen flex flex-col">
      
      <!-- Top HUD -->
      <div class="p-3 sm:p-6">
        <div class="max-w-7xl mx-auto">
          <div class="bg-black/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-orange-500/50 shadow-2xl">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <div class="text-orange-400 font-bold text-sm sm:text-base">Kvalitet Frizure</div>
                  <div class="text-white font-mono text-lg sm:text-xl">{{ haircutQuality }}%</div>
                  <div class="text-2xl sm:text-3xl">{{ haircutEmoji }}</div>
                </div>
                <ProgressBar 
                  :value="haircutQuality" 
                  :showValue="false"
                  class="h-3 sm:h-4"
                  :pt="{
                    value: {
                      style: {
                        background: haircutQuality >= 70 ? 'linear-gradient(to right, #10b981, #059669)' :
                                    haircutQuality >= 40 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                    'linear-gradient(to right, #ef4444, #dc2626)'
                      }
                    }
                  }"
                />
                <div class="text-orange-300 text-xs sm:text-sm mt-1">{{ haircutStatus }}</div>
              </div>
              
              <div class="flex flex-col gap-2">
                <div class="bg-red-900/50 px-3 py-1 rounded-lg border border-red-500">
                  <span class="text-red-300 text-xs sm:text-sm">❌ Greške: {{ wrongAnswers }}</span>
                </div>
                <div class="bg-orange-900/50 px-3 py-1 rounded-lg border border-orange-500">
                  <span class="text-orange-300 text-xs sm:text-sm">📝 {{ currentQuestion + 1 }}/{{ questions.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Character and dialogue area -->
      <div class="flex-1 flex items-end justify-center px-3 sm:px-6 pb-4">
        <div class="max-w-7xl w-full">
          
          <!-- Character Avatar -->
          <div class="flex justify-center mb-4">
            <div class="relative">
              <div class="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-1 shadow-2xl">
                <div class="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-6xl sm:text-8xl md:text-9xl">
                  💈
                </div>
              </div>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/90 px-4 py-1 rounded-full border-2 border-orange-500">
                <span class="text-orange-400 font-bold text-sm sm:text-base">Aldin</span>
              </div>
            </div>
          </div>

          <!-- Dialogue Box -->
          <div class="bg-black/90 backdrop-blur-md rounded-xl sm:rounded-2xl border-4 border-orange-500 shadow-2xl overflow-hidden">
            
            <!-- Dialogue History (scrollable) -->
            <div class="max-h-32 sm:max-h-48 overflow-y-auto p-3 sm:p-4 space-y-2 border-b-2 border-orange-500/30 custom-scrollbar">
              <div v-for="(line, index) in dialogueHistory.slice(-5)" :key="index" 
                   class="text-gray-300 text-xs sm:text-sm animate-fade-in">
                {{ line }}
              </div>
            </div>

            <!-- Current Dialogue -->
            <div class="p-4 sm:p-6 bg-gradient-to-b from-orange-900/20 to-transparent">
              <div class="flex items-start gap-3 mb-4">
                <div class="text-orange-400 text-2xl sm:text-3xl">💬</div>
                <div class="flex-1">
                  <div class="text-orange-400 font-bold text-sm sm:text-base mb-2">Aldin kaže:</div>
                  <p class="text-white text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                    {{ currentDialogue }}
                  </p>
                  <div v-if="isLoading" class="mt-3 flex items-center gap-2 text-orange-400">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span class="text-sm">Aldin razmišlja...</span>
                  </div>
                </div>
              </div>

              <!-- Input Area -->
              <div v-if="!isCompleted" class="flex gap-2 sm:gap-3">
                <InputText 
                  v-model="userInput"
                  @keyup.enter="sendMessage"
                  placeholder="Upiši svoj odgovor..."
                  class="flex-1 !bg-black/50 !border-orange-500/50 !text-white placeholder:!text-gray-400 !text-base sm:!text-lg !px-4 !py-3"
                  :disabled="isLoading"
                />
                <Button 
                  @click="sendMessage"
                  icon="pi pi-send"
                  class="!bg-gradient-to-r !from-orange-500 !to-red-600 !border-0 !px-4 sm:!px-6 !py-3"
                  :disabled="!userInput.trim() || isLoading"
                  size="large"
                />
              </div>

              <div v-else class="text-center">
                <div class="text-green-400 text-xl sm:text-2xl font-bold animate-pulse">
                  🏆 ČESTITAMO! 🏆
                </div>
              </div>
            </div>
          </div>

          <!-- Hint -->
          <div class="mt-3 text-center">
            <p class="text-orange-300 text-xs sm:text-sm flex items-center justify-center gap-2">
              <i class="pi pi-info-circle"></i>
              <span>Svaki pogrešan odgovor smanjuje kvalitet frizure!</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.7);
}

/* Input styling */
:deep(.p-inputtext) {
  font-size: 16px !important;
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3) !important;
}
</style>
