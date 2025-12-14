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

// Questions progression - from trivial to challenging
const questions = [
  { id: 0, text: "Dobro došao u berbersku radnju! Sjedni, molim te. Kako ćemo lafe?", type: 'warmup', keywords: ['fade', 'kratko', 'normalno', 'obrijati'], response: "Ah da, klasičan stil. Razumijem, razumijem... Inače, vidim da si intelektualac, pa ajde malo da popričamo dok šišam." },
  { id: 1, text: "Reci mi brate, koliko je 2 + 2? Samo da vidim jesi li budan haha.", type: 'warmup', keywords: ['4', 'četiri'], response: "Hehe, pa naravno! To je osnova osnove. Ti i ja smo, vidim, na istom nivou. Ajde, malo ozbiljnije sad..." },
  { id: 2, text: "Koliko je 15 × 12? Brzo, bez kalkulatora!", type: 'warmup', keywords: ['180'], response: "Ah, 180! Elementarno, dragi moj Watson. Vidi se da si obrazovan čovjek, kao i ja. Nastavimo sa malo težim stvarima..." },
  { id: 3, text: "Dobro. Reci mi, koliko je √144?", type: 'warmup', keywords: ['12'], response: "Ma jasno, 12! To sam i ja znao dok sam bio u osnovnoj. Ali hajde sad, gdje si ti studirao? Ah, nisam ni pitao... Idemo dalje sa pravim izazovima za intelektualce." },
  { id: 4, text: "E sad nešto zanimljivije. Koliko je ∫ x² dx? Jednostavna integracija, znaš ti to.", type: 'math', key: 'simple_integral', response: "Tačno! x³/3 + C. Pa to je osnovna matematika, brate. Ti i ja smo, vidim, isti nivo. Idemo na malo kompleksnije..." },
  { id: 5, text: "Derivacija sada. Što je d/dx[x³]? Trivijalnost, znam.", type: 'math', key: 'simple_derivative', response: "3x²! Naravno, naravno. Elementarne operacije za nas intelektualce. Hajde sad nešto što zahtijeva... 'malo' više razmišljanja." },
  { id: 6, text: "E sada pravi zadatak. Izračunaj ∫ x·ln(x) dx. Integration by parts, nije teško za ljude kao što smo ti i ja.", type: 'math', key: 'integral_ln', response: "Hah! Pa to je... da, tačno! Dobro si riješio. Vidi se da nisi amater. Kao ni ja, naravno. Idemo na nešto ozbiljnije..." },
  { id: 7, text: "Hajde sada, d/dx[e^(x²)]. Chain rule, ali znaš ti to bolje od mene... *sarcastično se smije*", type: 'math', key: 'derivative_exp', response: "Bravo, bravo! 2x·e^(x²). Ti zaista razumiješ matematiku... skoro kao i ja. *namiguje* Idemo dalje." },
  { id: 8, text: "Malo fizike. Kolika je sila gravitacije između dva tijela mase 10kg na 2m udaljenosti? Osnove fizike, ništa teško. (format: naučna notacija)", type: 'physics', key: 'gravity_force', response: "E vidiš! Newton bi bio ponosan... na nas obojicu, naravno. Ajde, još malo da te izazovem..." },
  { id: 9, text: "Ovaj integral: ∫₀^(π/2) sin²(x) dx. Za prave znalce kao mi, ovo je... pa gotovo dosadno.", type: 'math', key: 'definite_integral', response: "π/4! Precizno! Ti i ja smo, vidim, rijetka vrsta... *ponosno klimne glavom* Nastavimo." },
  { id: 10, text: "Dobro, kinematika. v₀ = 20 m/s, t = 5s, a = 2 m/s². Kolika je udaljenost? Jednostavna kinematika za nas. (format: broj u m)", type: 'physics', key: 'kinematics', response: "125 metara! Ma da, da... očekivao sam. Ti i ja smo isti nivo, to sam odmah vidio. Još malo..." },
  { id: 11, text: "Sada, malo ozbiljnije. Riješi dy/dx + 2y = 4x. Diferencijalna jednačina. Ništa što mi dvojica ne možemo.", type: 'math', key: 'diff_equation', response: "Bravo! Vidi se da si... gotovo kao ja. *lagano se smije* Evo, zadnje pitanje za prave intelektualce..." },
  { id: 12, text: "Finale! Energija fotona, λ = 500nm. Kvantna mehanika, za one kao mi. E = hc/λ (format: broj u eV, 2 decimale)", type: 'physics', key: 'photon_energy', response: "Perfektno! 2.48 eV! Ti si... pa zapravo kao ja! Rijetko nalazim jednake sebi. Frizura je gotova, i moram priznati - ti si jedan od rijetkih koji je na mom nivou! 👏" }
];

// Initialize first dialogue
currentDialogue.value = questions[0]?.text || 'Welcome!';

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
        // Use the custom pretentious response from the current question
        const successMsg = (question as any).response || "Ma bravo! Vidi ga pametnjaković! ✂️";
        
        dialogueHistory.value.push(`Aldin: ${successMsg}`);
        
        setTimeout(() => {
          currentDialogue.value = questions[currentQuestion.value]?.text || '';
          isLoading.value = false;
        }, 800);
      } else {
        isCompleted.value = true;
        dialogueHistory.value.push("Aldin: E BRAVO! Savršeno si odgovorio na sva pitanja! Frizura ti je perfektna! Ti si jedan od rijetkih koji razumijem mojom brijaču inteligenciju! 🏆✨");
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
  <div class="relative min-h-screen overflow-hidden flex flex-col">
    
    <!-- Background Layer -->
    <div class="absolute inset-0 bg-cover bg-center"
         style="background-image: url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2574');">
      <div class="absolute inset-0 bg-black/75 backdrop-blur-[2px]"></div>
    </div>
    
    <!-- Top HUD - Separated with solid background -->
    <div class="relative z-20 bg-gradient-to-b from-black via-gray-900/95 to-transparent border-b-2 border-orange-500/30">
      <div class="p-4 sm:p-6">
        <div class="max-w-7xl mx-auto">
          <div class="bg-gradient-to-r from-gray-900 to-black backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-3 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
            <div class="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div class="flex-1 min-w-[200px]">
                <div class="flex items-center gap-3 mb-3">
                  <div class="text-orange-400 font-bold text-base sm:text-lg uppercase tracking-wide">Kvalitet Frizure</div>
                  <div class="text-white font-mono text-xl sm:text-2xl font-bold">{{ haircutQuality }}%</div>
                  <div class="text-3xl sm:text-4xl">{{ haircutEmoji }}</div>
                </div>
                <ProgressBar 
                  :value="haircutQuality" 
                  :showValue="false"
                  class="h-4 sm:h-5"
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
                <div class="text-orange-300 text-sm sm:text-base mt-2 font-medium">{{ haircutStatus }}</div>
              </div>
              
              <div class="flex gap-3">
                <div class="bg-gradient-to-br from-red-900 to-red-950 px-4 py-2.5 rounded-xl border-2 border-red-500 shadow-lg">
                  <span class="text-red-300 text-sm sm:text-base font-bold">❌ Greške: {{ wrongAnswers }}</span>
                </div>
                <div class="bg-gradient-to-br from-orange-900 to-orange-950 px-4 py-2.5 rounded-xl border-2 border-orange-500 shadow-lg">
                  <span class="text-orange-300 text-sm sm:text-base font-bold">📝 {{ currentQuestion + 1 }}/{{ questions.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- Main Game Area with Background -->
    <div class="relative z-10 flex-1 flex items-end justify-center px-3 sm:px-6 pb-4">
      <div class="max-w-7xl w-full">
          
          <!-- Character Avatar -->
          <div class="flex justify-center mb-6 sm:mb-8">
            <div class="relative">
              <!-- Glow effect -->
              <div class="absolute inset-0 rounded-full bg-orange-500/30 blur-2xl animate-pulse"></div>
              
              <div class="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-1.5 shadow-2xl">
                <div class="w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center text-7xl sm:text-9xl md:text-[10rem] shadow-inner">
                  💈
                </div>
              </div>
              <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-2 rounded-full border-3 border-orange-400 shadow-xl">
                <span class="text-white font-bold text-base sm:text-lg drop-shadow-lg">Aldin</span>
              </div>
            </div>
          </div>

          <!-- Dialogue Box -->
          <div class="bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl rounded-2xl sm:rounded-3xl border-4 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.5)] overflow-hidden">
            
            <!-- Dialogue History (scrollable) -->
            <div v-if="dialogueHistory.length > 0" class="max-h-24 sm:max-h-32 overflow-y-auto p-3 sm:p-4 space-y-2 border-b-2 border-orange-500/50 bg-black/60 custom-scrollbar">
              <div v-for="(line, index) in dialogueHistory.slice(-5)" :key="index" 
                   class="text-gray-100 text-xs sm:text-sm animate-fade-in leading-relaxed font-medium">
                {{ line }}
              </div>
            </div>

            <!-- Current Dialogue -->
            <div class="p-5 sm:p-8 bg-gradient-to-b from-gray-900/90 to-black/90">
              <div class="flex items-start gap-4 mb-6">
                <div class="text-orange-400 text-3xl sm:text-4xl flex-shrink-0">💬</div>
                <div class="flex-1">
                  <div class="text-orange-300 font-bold text-base sm:text-lg mb-3 uppercase tracking-wide drop-shadow-md">Aldin kaže:</div>
                  <p class="text-white text-lg sm:text-xl md:text-2xl leading-relaxed font-semibold" style="text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7);">
                    {{ currentDialogue }}
                  </p>
                  <div v-if="isLoading" class="mt-4 flex items-center gap-3 text-orange-400">
                    <i class="pi pi-spin pi-spinner text-lg"></i>
                    <span class="text-base">Aldin razmišlja...</span>
                  </div>
                </div>
              </div>

              <!-- Input Area -->
              <div v-if="!isCompleted" class="flex gap-3 sm:gap-4">
                <InputText 
                  v-model="userInput"
                  @keyup.enter="sendMessage"
                  placeholder="Upiši svoj odgovor..."
                  class="flex-1 !bg-gray-800/90 !border-2 !border-orange-500/70 focus:!border-orange-400 !text-white !text-lg sm:!text-xl !px-5 !py-4 !rounded-xl placeholder:!text-gray-400 shadow-lg font-medium"
                  :disabled="isLoading"
                />
                <Button 
                  @click="sendMessage"
                  icon="pi pi-send"
                  class="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700 !border-0 !px-6 sm:!px-8 !py-4 !rounded-xl !shadow-xl hover:!shadow-2xl transition-all"
                  :disabled="!userInput.trim() || isLoading"
                  size="large"
                />
              </div>

              <div v-else class="text-center py-4">
                <div class="text-green-400 text-2xl sm:text-3xl font-bold animate-pulse drop-shadow-lg">
                  🏆 ČESTITAMO! 🏆
                </div>
              </div>
            </div>
          </div>

          <!-- Hint -->
          <div class="mt-4 text-center">
            <div class="inline-block bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-orange-500/60">
              <p class="text-orange-200 text-sm sm:text-base flex items-center gap-2 font-semibold drop-shadow-md">
                <i class="pi pi-info-circle text-orange-300"></i>
                <span>Svaki pogrešan odgovor smanjuje kvalitet frizure!</span>
              </p>
            </div>
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
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.4) !important;
  transform: translateY(-2px);
}

:deep(.p-button) {
  transition: all 0.3s ease;
}

:deep(.p-button:hover:not(:disabled)) {
  transform: translateY(-2px);
}

:deep(.p-progressbar) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(.p-progressbar-value) {
  border-radius: 12px;
  box-shadow: 0 0 20px currentColor;
}
</style>
