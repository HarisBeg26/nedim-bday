<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card';
import RadioButton from 'primevue/radiobutton';
import ProgressBar from 'primevue/progressbar';
import Divider from 'primevue/divider';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import type { LevelCompletionData, Level1Response, ApiErrorResponse } from '../types';

// Emit definition
const emit = defineEmits<{
  (e: 'completed', data: LevelCompletionData): void
}>();

// Quiz state
const currentPage = ref<number>(1);
const totalPages = 3;
const answers = ref<{[key: string]: any}>({});
const errorMsg = ref<string>('');
const isLoading = ref<boolean>(false);

// Timer state
const timeLimit = 300; // 5 minutes in seconds
const timeRemaining = ref<number>(timeLimit);
const timerActive = ref<boolean>(true);
const timerExpired = ref<boolean>(false);
const jokeMessage = ref<string>('');

// Jokes for timer expiration
const jokes = [
  "⏰ Time's up! Your brain decided to take a coffee break. All progress has been quantum erased.",
  "⏰ The universe waited patiently, but you were too slow. Starting over from the Big Bang!",
  "⏰ Even a sloth could solve this faster. Reset initiated. Try again, speed demon!",
  "⏰ Your mathematical prowess expired like milk in the sun. Fresh start required!",
  "⏰ Einstein rolled over in his grave. Timer expired. All answers evaporated into the void.",
  "⏰ Time waits for no one, and neither does this quiz. Back to square one, my friend!"
];

// Page 1: Harder Integration & Calculus
const mathQuestions = ref([
  {
    id: 'integral1',
    question: '∫ x²·e^x dx',
    options: ['e^x(x² - 2x + 2) + C', 'e^x·x² + C', 'x²·e^x - 2x·e^x + C', 'e^x(x² + 2x + 2) + C'],
    correct: 'e^x(x² - 2x + 2) + C'
  },
  {
    id: 'integral2',
    question: '∫ sin(x)·cos(x) dx',
    options: ['sin²(x)/2 + C', 'cos²(x)/2 + C', '-cos²(x)/2 + C', 'sin(x)·cos(x) + C'],
    correct: 'sin²(x)/2 + C'
  },
  {
    id: 'limit',
    question: 'lim(x→0) [sin(3x)/x]',
    type: 'input',
    correct: '3'
  }
]);

// Page 2: Advanced Physics & Differential Equations
const physicsQuestions = ref([
  {
    id: 'wave',
    question: 'What is the general solution to the wave equation ∂²u/∂t² = c²·∂²u/∂x²?',
    options: [
      'u(x,t) = f(x - ct) + g(x + ct)',
      'u(x,t) = A·sin(kx - ωt)',
      'u(x,t) = e^(ikx - iωt)',
      'u(x,t) = f(x)·g(t)'
    ],
    correct: 'u(x,t) = f(x - ct) + g(x + ct)'
  },
  {
    id: 'diffEq',
    question: 'Solve: dy/dx = y/x (general solution)',
    type: 'input',
    placeholder: 'Format: y = ...',
    correct: 'y = Cx'
  },
  {
    id: 'laplace',
    question: 'What is the Laplace transform of e^(at)?',
    options: ['1/(s - a)', '1/(s + a)', 'a/(s - a)', 's/(s - a)'],
    correct: '1/(s - a)'
  }
]);

// Page 3: Complex Analysis & Advanced Integrals
const advancedMathQuestions = ref([
  {
    id: 'complexIntegral',
    question: '∫ (from 0 to π) sin³(x) dx',
    type: 'input',
    placeholder: 'Enter exact value',
    correct: '4/3'
  },
  {
    id: 'residue',
    question: 'What is the residue of f(z) = 1/(z² + 1) at z = i?',
    options: ['1/(2i)', 'i/2', '1/2', '-i/2'],
    correct: '1/(2i)'
  },
  {
    id: 'taylorSeries',
    question: 'What is the Taylor series of ln(1+x) around x=0 (first 3 terms)?',
    type: 'input',
    placeholder: 'x - x²/2 + ...',
    correct: 'x - x²/2 + x³/3'
  },
  {
    id: 'name',
    question: 'If you survived this far, what is your name?',
    type: 'input',
    placeholder: 'Enter your name'
  }
]);

// Computed progress
const progress = computed(() => (currentPage.value / totalPages) * 100);

// Get current questions based on page
const currentQuestions = computed(() => {
  switch(currentPage.value) {
    case 1: return mathQuestions.value;
    case 2: return physicsQuestions.value;
    case 3: return advancedMathQuestions.value;
    default: return [];
  }
});

// Timer formatting
const formatTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const timeColor = computed(() => {
  if (timeRemaining.value > 120) return 'text-green-600';
  if (timeRemaining.value > 60) return 'text-yellow-600';
  return 'text-red-600 animate-pulse';
});

// Start timer
onMounted(() => {
  const interval = setInterval(() => {
    if (timerActive.value && timeRemaining.value > 0) {
      timeRemaining.value--;
    } else if (timeRemaining.value === 0 && !timerExpired.value) {
      timerExpired.value = true;
      timerActive.value = false;
      jokeMessage.value = jokes[Math.floor(Math.random() * jokes.length)] as string;
      
      // Reset after showing joke for 5 seconds
      setTimeout(() => {
        resetQuiz();
      }, 5000);
    }
  }, 1000);
  
  // Cleanup on unmount
  return () => clearInterval(interval);
});

// Navigation functions
const nextPage = () => {
  if (currentPage.value < totalPages) {
    errorMsg.value = '';
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    errorMsg.value = '';
    currentPage.value--;
  }
};

// Submit quiz
const submitQuiz = async () => {
  errorMsg.value = '';
  
  // Stop timer
  timerActive.value = false;
  
  // Validate all required answers
  if (!answers.value.name || answers.value.name.trim() === '') {
    errorMsg.value = "Please provide your name in the final question";
    timerActive.value = true;
    return;
  }
  
  isLoading.value = true;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${API_URL}/api/level1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...answers.value,
        timeUsed: timeLimit - timeRemaining.value
      })
    });
    
    const data = (await res.json()) as Level1Response | ApiErrorResponse;
    
    setTimeout(() => {
      isLoading.value = false;
      
      if ('success' in data && data.success) {
        emit('completed', { nextLevel: data.nextLevel ?? 2 });
      } else if ('message' in data) {
        errorMsg.value = data.message;
        timerActive.value = true; // Resume timer on error
      }
    }, 2000);

  } catch (e) {
    isLoading.value = false;
    errorMsg.value = "Server error. The quantum field is unstable.";
    timerActive.value = true;
  }
};

// Reset quiz
const resetQuiz = () => {
  currentPage.value = 1;
  answers.value = {};
  errorMsg.value = '';
  timeRemaining.value = timeLimit;
  timerActive.value = true;
  timerExpired.value = false;
  jokeMessage.value = '';
  alert("Quiz reset! All your intellectual progress has been quantum tunneled into the void.");
};
</script>

<template>
  <div class="space-y-8">
    <!-- Timer Expired Overlay -->
    <div v-if="timerExpired" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card class="max-w-2xl mx-4 bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-2xl border-4 border-yellow-400 animate-bounce">
        <template #content>
          <div class="text-center p-8">
            <div class="text-8xl mb-6">⏰💥</div>
            <h2 class="text-4xl font-bold mb-4">{{ jokeMessage }}</h2>
            <p class="text-xl">Resetting in a few seconds...</p>
            <div class="mt-6">
              <ProgressBar mode="indeterminate" style="height: 6px" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Header with Timer -->
    <div class="text-center mb-4 sm:mb-8">
      <!-- Mobile Layout: Stacked -->
      <div class="block md:hidden space-y-3">
        <!-- Title -->
        <h2 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-fade-in">
          🧮 Math Quiz
        </h2>
        
        <!-- Timer Card -->
        <Card class="shadow-lg border-2" :class="timeRemaining < 60 ? 'border-red-500 animate-pulse' : 'border-purple-300'">
          <template #content>
            <div class="flex justify-between items-center px-3 py-2">
              <div class="flex gap-2">
                <Chip label="Advanced" icon="pi pi-graduation-cap" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs" />
                <Chip label="Timed" icon="pi pi-clock" class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs" />
              </div>
              <div class="text-right">
                <Tag :severity="timeRemaining < 60 ? 'danger' : timeRemaining < 120 ? 'warn' : 'success'" class="text-xs mb-1">
                  <i class="pi pi-clock mr-1"></i>
                  Time
                </Tag>
                <div :class="['text-xl font-bold font-mono', timeColor]">
                  {{ formatTime }}
                </div>
                <Badge v-if="timeRemaining < 60" value="HURRY!" severity="danger" class="mt-1" />
              </div>
            </div>
          </template>
        </Card>
      </div>
      
      <!-- Desktop/Tablet Layout: Horizontal -->
      <div class="hidden md:flex justify-between items-center mb-4">
        <div class="flex gap-2">
          <Chip label="Advanced" icon="pi pi-graduation-cap" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg" />
          <Chip label="Timed" icon="pi pi-clock" class="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg" />
        </div>
        <h2 class="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-fade-in">
          🧮 Advanced Mathematical & Physical Aptitude Assessment
        </h2>
        <div class="flex flex-col items-end">
          <Card class="shadow-2xl border-4" :class="timeRemaining < 60 ? 'border-red-500 animate-pulse' : 'border-purple-300'">
            <template #content>
              <div class="flex flex-col items-center px-4 py-2">
                <Tag :severity="timeRemaining < 60 ? 'danger' : timeRemaining < 120 ? 'warn' : 'success'" class="mb-2">
                  <i class="pi pi-clock mr-2"></i>
                  Time Remaining
                </Tag>
                <div :class="['text-3xl font-bold font-mono', timeColor]">
                  {{ formatTime }}
                </div>
                <Badge v-if="timeRemaining < 60" value="HURRY!" severity="danger" class="mt-2" />
              </div>
            </template>
          </Card>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
        <Tag severity="info" rounded class="text-xs sm:text-sm">
          <i class="pi pi-user mr-1 sm:mr-2"></i>
          <span class="hidden sm:inline">Intellectual Verification Matrix</span>
          <span class="inline sm:hidden">Verification</span>
        </Tag>
        <Tag severity="danger" rounded class="text-xs sm:text-sm">
          <i class="pi pi-exclamation-triangle mr-1 sm:mr-2"></i>
          <span class="hidden sm:inline">Superior Cognitive Abilities Required</span>
          <span class="inline sm:hidden">Advanced</span>
        </Tag>
      </div>
      <div class="mt-2 sm:mt-3">
        <Message severity="warn" :closable="false" class="justify-center text-xs sm:text-sm">
          <span class="font-bold">⚠️ WARNING:</span> Timer expiry = Total reset!
        </Message>
      </div>
    </div>

    <!-- Progress Bar -->
    <Card class="mb-4 sm:mb-6">
      <template #content>
        <div class="text-center mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-semibold">Assessment Progress</h3>
          <p class="text-xs sm:text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</p>
        </div>
        <ProgressBar :value="progress" class="mb-2" />
        <div class="flex flex-col sm:flex-row justify-between text-[10px] sm:text-xs text-gray-500 gap-1 sm:gap-0">
          <span>📐 Calculus & Integration</span>
          <span>⚛️ Differential Equations</span>
          <span>∞ Complex Analysis</span>
        </div>
      </template>
    </Card>

    <!-- Quiz Content -->
    <Card class="shadow-xl sm:shadow-2xl border sm:border-2 border-purple-200 hover:shadow-purple-300 transition-all duration-300">
      <template #content>
        <div class="space-y-4 sm:space-y-6 p-2 sm:p-4">
          
          <!-- Page 1: Harder Integration & Calculus -->
          <div v-if="currentPage === 1" class="space-y-4 sm:space-y-6">
            <h3 class="text-lg sm:text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              📐 Advanced Calculus & Integration
            </h3>
            <p class="text-center text-xs sm:text-sm text-gray-600 italic">
              These problems would make Leibniz sweat...
            </p>
            
            <div v-for="(question, index) in currentQuestions" :key="question.id" class="field bg-blue-50 p-3 sm:p-6 rounded-lg sm:rounded-xl border sm:border-2 border-blue-200">
              <label class="block text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                {{ index + 1 }}. {{ question.question }}
              </label>
              
              <div v-if="question.options" class="space-y-2 sm:space-y-3">
                <div v-for="option in question.options" :key="option" class="flex items-center gap-2 sm:gap-3">
                  <RadioButton 
                    :value="option" 
                    v-model="answers[question.id]" 
                    :inputId="`${question.id}_${option}`" 
                  />
                  <label :for="`${question.id}_${option}`" class="text-sm font-mono cursor-pointer">
                    {{ option }}
                  </label>
                </div>
              </div>
              
              <InputText 
                v-else
                v-model="answers[question.id]"
                :placeholder="(question as any).placeholder || 'Enter your answer...'"
                class="w-full mt-2 font-mono text-lg"
              />
            </div>
          </div>

          <!-- Page 2: Advanced Physics & Differential Equations -->
          <div v-if="currentPage === 2" class="space-y-4 sm:space-y-6">
            <h3 class="text-lg sm:text-2xl font-bold text-center bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              ⚛️ Differential Equations & Wave Theory
            </h3>
            <p class="text-center text-xs sm:text-sm text-gray-600 italic">
              Now we're talking serious mathematics...
            </p>
            
            <div v-for="(question, index) in currentQuestions" :key="question.id" class="field bg-red-50 p-3 sm:p-6 rounded-lg sm:rounded-xl border sm:border-2 border-red-200">
              <label class="block text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                {{ index + 1 }}. {{ question.question }}
              </label>
              
              <div v-if="question.options" class="space-y-2 sm:space-y-3">
                <div v-for="option in question.options" :key="option" class="flex items-center gap-2 sm:gap-3">
                  <RadioButton 
                    :value="option" 
                    v-model="answers[question.id]" 
                    :inputId="`${question.id}_${option}`" 
                  />
                  <label :for="`${question.id}_${option}`" class="text-xs sm:text-sm font-mono cursor-pointer">
                    {{ option }}
                  </label>
                </div>
              </div>
              
              <InputText 
                v-else
                v-model="answers[question.id]"
                :placeholder="(question as any).placeholder || 'Enter your answer...'"
                class="w-full mt-2 font-mono text-base sm:text-lg"
              />
            </div>
          </div>

          <!-- Page 3: Complex Analysis & Advanced Integrals -->
          <div v-if="currentPage === 3" class="space-y-4 sm:space-y-6">
            <h3 class="text-lg sm:text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ∞ Complex Analysis & Residue Calculus
            </h3>
            <p class="text-center text-xs sm:text-sm text-gray-600 italic">
              Welcome to the final boss level of mathematics...
            </p>
            
            <div v-for="(question, index) in currentQuestions" :key="question.id" class="field p-3 sm:p-6 rounded-lg sm:rounded-xl border sm:border-2" :class="question.id === 'name' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'">
              <label class="block text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                {{ index + 1 }}. {{ question.question }}
              </label>
              
              <div v-if="question.options" class="space-y-2 sm:space-y-3">
                <div v-for="option in question.options" :key="option" class="flex items-center gap-2 sm:gap-3">
                  <RadioButton 
                    :value="option" 
                    v-model="answers[question.id]" 
                    :inputId="`${question.id}_${option}`" 
                  />
                  <label :for="`${question.id}_${option}`" class="text-sm font-mono cursor-pointer">
                    {{ option }}
                  </label>
                </div>
              </div>
              
              <InputText 
                v-else
                v-model="answers[question.id]"
                :placeholder="(question as any).placeholder || 'Enter your answer...'"
                class="w-full mt-2 font-mono text-base sm:text-lg"
                :class="{ 'border-green-400 bg-green-50': question.id === 'name' }"
              />
            </div>
          </div>

          <Message v-if="errorMsg" severity="error" :closable="false" class="mt-4">
            <div class="flex items-center gap-2">
              <i class="pi pi-times-circle"></i>
              {{ errorMsg }}
            </div>
          </Message>
        </div>
      </template>
    </Card>

    <!-- Navigation -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4">
      <Button 
        @click="prevPage"
        :disabled="currentPage === 1"
        label="← Previous"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        class="w-full sm:w-auto min-h-[44px]"
      />
      
      <div class="flex-grow text-center">
        <span class="text-xs sm:text-sm text-gray-500">
          Mathematical precision is required for advancement
        </span>
      </div>

      <Button 
        v-if="currentPage < totalPages"
        @click="nextPage"
        label="Next →"
        icon="pi pi-arrow-right"
        iconPos="right"
        severity="info"
        class="w-full sm:w-auto min-h-[44px]"
      />

      <Button 
        v-else
        @click="submitQuiz"
        :disabled="isLoading"
        :loading="isLoading"
        label="Submit Assessment"
        icon="pi pi-check"
        severity="success"
        size="large"
        class="w-full sm:w-auto min-h-[44px]"
      />

      <Button 
        @click="resetQuiz"
        label="RESET ALL"
        icon="pi pi-refresh"
        severity="danger"
        size="large"
        class="!bg-gradient-to-r !from-red-500 !to-pink-600 animate-pulse w-full sm:w-auto min-h-[44px]"
        outlined
      />
    </div>
  </div>
</template>

<style scoped>
.rotate-1 {
  animation: wobble 0.3s ease-in-out;
}

@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

:deep(.p-inputtext) {
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
}

:deep(.p-button-success) {
  font-weight: 900 !important;
  letter-spacing: 0.1em;
}

/* Custom slider styles */
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8b5cf6, #3b82f6);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.slider-thumb::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8b5cf6, #3b82f6);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider-thumb::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

/* Prevent zoom on input focus */
:deep(.p-inputtext) {
  font-size: 16px !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
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
</style>