<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
import ScrollPanel from 'primevue/scrollpanel';
import ProgressBar from 'primevue/progressbar';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import type { ChatMessage, LevelCompletionData } from '../types';

const emit = defineEmits<{
  (e: 'completed', data: LevelCompletionData): void
}>();

// Barbershop state
const currentQuestion = ref<number>(0);
const wrongAnswers = ref<number>(0);
const haircutQuality = ref<number>(100); // 100 = perfect, 0 = disaster
const isCompleted = ref<boolean>(false);

// Questions progression - more complex problems
const questions = [
  { id: 0, text: "Aldin: Dobro došao u berbersku radnju! Sjedni, molim te. Kako ćemo lafe?", type: 'warmup', keywords: ['fade', 'kratko', 'normalno', 'obrijati'] },
  { id: 1, text: "Aldin: Važi brate. A reci mi, kako su ti braća?", type: 'warmup', keywords: ['dobro', 'super', 'sve', 'ok', 'uredu'] },
  { id: 2, text: "Aldin: Ma super, super. Jel ti ono nešta u Americi fiziku studiraš?", type: 'warmup', keywords: ['da', 'yes', 'yeah', 'ma da', 'jeste'] },
  { id: 3, text: "Aldin: Bravo! A šta misliš da upišeš FIT u Mostaru?", type: 'warmup', keywords: ['možda', 'razmišljam', 'vidjet', 'da'] },
  
  // Advanced Math Problems
  { id: 4, text: "Aldin: E dobro, dobro. Ajd sad malo matematika dok šišam. Koliko je ∫ x·ln(x) dx?", type: 'math', key: 'integral_ln' },
  { id: 5, text: "Aldin: Dobro, dobro. A reci mi, koliko je d/dx[e^(x²)]?", type: 'math', key: 'derivative_exp' },
  { id: 6, text: "Aldin: Ma bravo! Sad fizika - izračunaj silu gravitacije između dva tijela mase 10kg na udaljenosti 2m. (format: broj u N)", type: 'physics', key: 'gravity_force' },
  { id: 7, text: "Aldin: Odlično! Koliko je ∫₀^(π/2) sin²(x) dx?", type: 'math', key: 'definite_integral' },
  { id: 8, text: "Aldin: Svaka čast! Reci mi, ako je v = 20 m/s i t = 5s, kolika je udaljenost pri konstantnoj akceleraciji a = 2 m/s²? (format: broj u m)", type: 'physics', key: 'kinematics' },
  { id: 9, text: "Aldin: E to! A ovo - riješi diferencijalnu jednačinu: dy/dx + 2y = 4x", type: 'math', key: 'diff_equation' },
  { id: 10, text: "Aldin: Ma profesor si ti! Zadnje pitanje - kolika je energija fotona sa talasnom dužinom λ = 500nm? (format: broj u eV, 2 decimale)", type: 'physics', key: 'photon_energy' }
];

const messages = ref<ChatMessage[]>([
  { id: 1, text: "🪒 Dobro došao u Aldinovu berbersku radnju! 💈", sender: 'system' },
  { id: 2, text: questions[0]?.text || '', sender: 'system' }
]);

const userInput = ref<string>("");
const isLoading = ref<boolean>(false);

// Haircut quality visual
const haircutEmoji = computed(() => {
  if (haircutQuality.value >= 90) return "💇‍♂️✨";
  if (haircutQuality.value >= 70) return "💇‍♂️👌";
  if (haircutQuality.value >= 50) return "💇‍♂️😐";
  if (haircutQuality.value >= 30) return "💇‍♂️😬";
  if (haircutQuality.value >= 10) return "💇‍♂️😱";
  return "💇‍♂️💀";
});

const haircutStatus = computed(() => {
  if (haircutQuality.value >= 90) return "Savršena frizura!";
  if (haircutQuality.value >= 70) return "Dobra frizura";
  if (haircutQuality.value >= 50) return "Može proći...";
  if (haircutQuality.value >= 30) return "Malo je loše...";
  if (haircutQuality.value >= 10) return "Katastrofa!";
  return "Totalni užas!";
});

// Check answer
const checkAnswer = async (userAnswer: string, question: any): Promise<boolean> => {
  const normalized = userAnswer.toLowerCase().trim();
  
  if (question.type === 'warmup') {
    // Check if any keyword matches (client-side for warmup)
    return question.keywords.some((keyword: string) => normalized.includes(keyword.toLowerCase()));
  } else {
    // Math/Physics questions - use backend validation
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
      
      // Store the custom message if correct
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
  if (!userInput.value.trim()) return;

  // Add user message
  messages.value.push({
    id: Date.now(),
    text: userInput.value,
    sender: 'user'
  });

  const sentText = userInput.value;
  userInput.value = "";
  isLoading.value = true;

  // Scroll to bottom
  await nextTick();
  scrollToBottom();

  // Process answer after delay
  setTimeout(async () => {
    isLoading.value = false;
    
    const question = questions[currentQuestion.value];
    const isCorrect = await checkAnswer(sentText, question);
    
    if (isCorrect) {
      // Correct answer
      currentQuestion.value++;
      
      if (currentQuestion.value < questions.length) {
        // Use custom success message if available
        const successMessages = [
          "Aldin: Ma bravo! Vidi ga pametnjaković! ✂️",
          "Aldin: Tačno! Fino, fino... 💈",
          "Aldin: E to! Vidi ovoga kako zna! 👏",
          "Aldin: Odlično! Nastavimo... ✨"
        ];
        const successMsg = (question as any).successMessage || successMessages[Math.floor(Math.random() * 4)];
        
        messages.value.push({
          id: Date.now(),
          text: successMsg,
          sender: 'system'
        });
        
        // Add next question
        setTimeout(() => {
          const nextQuestion = questions[currentQuestion.value];
          if (nextQuestion) {
            messages.value.push({
              id: Date.now() + 1,
              text: nextQuestion.text,
              sender: 'system'
            });
            scrollToBottom();
          }
        }, 1000);
      } else {
        // Completed all questions!
        isCompleted.value = true;
        messages.value.push({
          id: Date.now(),
          text: "Aldin: E BRAVO! Savršeno si odgovorio na sva pitanja! Frizura ti je perfektna! 🏆✨",
          sender: 'system'
        });
        
        setTimeout(() => {
          messages.value.push({
            id: Date.now() + 1,
            text: "🏆 ČESTITAMO! Osvojio si 'The Guy' trofej iz legendarne 'I Wanna Win' igrice! 🏆",
            sender: 'system'
          });
          
          messages.value.push({
            id: Date.now() + 2,
            text: "🎮 Trophy Unlocked: THE GUY - Awarded for completing Aldin's Mathematical Haircut Challenge! 🎮",
            sender: 'system'
          });
          
          scrollToBottom();
          
          // Complete level after showing trophy
          setTimeout(() => {
            emit('completed', { nextLevel: 3 });
          }, 3000);
        }, 2000);
      }
    } else {
      // Wrong answer - haircut gets worse
      wrongAnswers.value++;
      haircutQuality.value = Math.max(0, haircutQuality.value - 15);
      
      const responses = [
        `Aldin: Eee ne, ne... Ups, mala greška sa makazama... 😬 (Kvalitet frizure: ${haircutQuality.value}%)`,
        `Aldin: Pogrešno brate... Ajde, pokušaj ponovo. *slučajno skrati previše* 💇‍♂️ (${haircutQuality.value}%)`,
        `Aldin: Ne, to nije tačno... Opa! *makaze skliznule* ✂️😅 (${haircutQuality.value}%)`,
        `Aldin: Nije dobro... Hm, malo sam previše uzeo ovdje... 😬 (${haircutQuality.value}%)`
      ];
      
      const responseIndex = Math.floor(Math.random() * responses.length);
      const selectedResponse = responses[responseIndex] || responses[0] || "Aldin: Ups...";
      
      messages.value.push({
        id: Date.now(),
        text: selectedResponse,
        sender: 'system'
      });
      
      // Check if haircut is ruined
      if (haircutQuality.value <= 0) {
        setTimeout(() => {
          messages.value.push({
            id: Date.now() + 1,
            text: "Aldin: Brate... potpuno sam ti upropastio frizuru. Bolje da kreneš ispočetka. 💀",
            sender: 'system'
          });
          scrollToBottom();
          
          setTimeout(() => {
            // Reset the level
            location.reload();
          }, 3000);
        }, 1500);
      }
    }
    
    scrollToBottom();
  }, 1000);
};

const scrollToBottom = () => {
  const container = document.getElementById('chat-container');
  if (container) container.scrollTop = container.scrollHeight;
};
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="text-center">
      <h2 class="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
        💈 Aldinova Berberna Radnja 💈
      </h2>
      <p class="text-gray-500 text-sm">Šišanje sa intelektualnim izazovom</p>
    </div>

    <!-- Haircut Quality Indicator -->
    <Card class="mb-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Tag :value="`${haircutQuality}%`" :severity="haircutQuality >= 70 ? 'success' : haircutQuality >= 40 ? 'warn' : 'danger'" />
              <span class="text-sm font-semibold text-gray-700">{{ haircutStatus }}</span>
            </div>
            <ProgressBar 
              :value="haircutQuality" 
              :showValue="false" 
              class="w-full"
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
          </div>
          <div class="text-6xl ml-4">{{ haircutEmoji }}</div>
        </div>
        <div class="mt-3 flex gap-2">
          <Chip :label="`❌ Greške: ${wrongAnswers}`" class="bg-red-100 text-red-700" />
          <Chip :label="`📝 Pitanje: ${currentQuestion + 1}/${questions.length}`" class="bg-orange-100 text-orange-700" />
        </div>
      </template>
    </Card>
    
    <Card class="shadow-lg overflow-hidden border-4 border-orange-300">
      <template #content>
        <ScrollPanel 
          id="chat-container" 
          class="h-[450px] pr-4"
          style="width: 100%"
        >
          <div class="space-y-4 p-2">
            <div 
              v-for="msg in messages" 
              :key="msg.id"
              class="flex animate-slide-up"
              :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div 
                :class="[
                  'px-4 py-3 max-w-[80%] shadow-lg',
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-3xl rounded-br-md' 
                    : msg.text.includes('Aldin:')
                    ? 'bg-orange-50 text-gray-900 rounded-3xl rounded-bl-md border border-orange-200'
                    : 'bg-gray-100 text-gray-900 rounded-3xl rounded-bl-md'
                ]"
                style="word-break: break-word;"
              >
                <p class="leading-relaxed text-[15px]" :class="msg.sender === 'user' ? 'text-white' : 'text-gray-900'">
                  {{ msg.text }}
                </p>
              </div>
            </div>
            
            <div v-if="isLoading" class="flex justify-start animate-pulse">
              <div class="bg-orange-50 border border-orange-200 px-4 py-3 rounded-3xl rounded-bl-md shadow-lg">
                <div class="flex items-center gap-2">
                  <i class="pi pi-spin pi-spinner text-orange-600"></i>
                  <span class="text-gray-700 text-sm">Aldin razmišlja... ✂️</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollPanel>
      </template>
    </Card>

    <div class="mt-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
      <div class="flex gap-3 items-center">
        <div class="flex-grow">
          <InputText 
            v-model="userInput"
            @keyup.enter="sendMessage"
            placeholder="Odgovori Aldinu..."
            class="w-full !rounded-full !border-gray-300 !px-5 !py-3"
            :disabled="isCompleted"
          />
        </div>
        <Button 
          @click="sendMessage"
          icon="pi pi-send"
          severity="warning"
          class="!rounded-full !w-12 !h-12 !p-0 flex items-center justify-center"
          :disabled="!userInput.trim() || isCompleted"
        />
      </div>
      <p class="text-xs text-orange-600 mt-3 text-center flex items-center justify-center gap-1">
        <i class="pi pi-exclamation-triangle"></i>
        Svaki pogrešan odgovor = lošija frizura!
      </p>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-scrollpanel-content) {
  padding-right: 1rem;
}

/* Prevent zoom on input focus */
:deep(.p-inputtext) {
  font-size: 16px !important;
  transition: none;
  transform: none;
}

:deep(.p-inputtext:focus) {
  transform: none;
  font-size: 16px !important;
}

/* Prevent card zoom effects */
:deep(.p-card) {
  transition: box-shadow 0.3s ease;
  transform: none;
}

:deep(.p-card:hover) {
  transform: none;
}

/* Modern chat animations */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Chat bubble styling */
.space-y-4 > * + * {
  margin-top: 0.75rem;
}
</style>