<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import type { LevelCompletionData } from '../types';

const emit = defineEmits<{
  (e: 'completed', data: LevelCompletionData): void
}>();
import { useRouter } from 'vue-router';
const router = useRouter();

// Game state
const currentQuestion = ref<number>(0);
const wrongAnswers = ref<number>(0);
const haircutQuality = ref<number>(100);
const isCompleted = ref<boolean>(false);
const userInput = ref<string>("");
const isLoading = ref<boolean>(false);
const dialogueHistory = ref<string[]>([]);
const currentDialogue = ref<string>("");
const audioRef = ref<HTMLAudioElement | null>(null);
const musicStarted = ref<boolean>(false);
const correctSoundRef = ref<HTMLAudioElement | null>(null);
const wrongSoundRef = ref<HTMLAudioElement | null>(null);
const showJumpscare = ref<boolean>(false);
const showCongrats = ref<boolean>(false);

// Questions progression - from trivial to challenging
const questions = [
  { id: 0, text: "E dobro došo bolan. Sjedi tu. Kako ćemo lafe?", type: 'warmup', keywords: ['fade', 'ma', 'kec', 'nula', 'strana', 'strane', 'kratko', 'normalno', 'obrijati', 'ošišaj', 'da', 'može', 'buzz', 'buzzcut'], response: "Aa dobro, klasika. Može." },
  { id: 1, text: "Kaži mi lafe, kako si? Jesi zdrav?", type: 'casual', keywords: ['evo', 'ma', 'dobro', 'odlično', 'super', 'ok', 'normalno', 'nije loše', 'može', 'jesam'], response: "Ma dobro dobro... Svi kažu dobro. A ja sam ovdje cijeli dan na nogama, šišam glupane. Al' ajde, navikao sam." },
  { id: 2, text: "Kako su ti kod kuće? Čuo sam da imaju bolje zunze od tebe hahahah.", type: 'casual', keywords: ['dobro', 'dobri', 'super', 'odlično', 'ok', 'solidno', 'normalno', 'normala', 'valjda'], response: "Aa dobri su? Lijepo, lijepo. Moji rođaci također, ali jebiga šta ćeš. Svi misle da su najpametniji u familiji ha ha." },
  { id: 3, text: "Vi ste se svi razbježali, jesi ti ono u New Yorku ili?", type: 'casual', keywords: ['ne', 'Princeton', 'prinston', 'Americi', 'Amerika', 'ma', 'ja', 'SAD', 'ovdje', 'da'], response: "Čuuuj? Opasan si bogami lafe. Ima posla tamo, dobre plate, makar mi je tako od žene momak rekao. Bar nadam se da radiš nešto pametno, a ne kao neki..." },
  { id: 4, text: "Šta studiraš ti? Jel ono naka fizika bila?", type: 'casual', keywords: ['ma', 'ja', 'da', 'valjda', 'matematika', 'fizika', 'inženjerstvo', 'informatika', 'kompjuteri', 'it', 'računarstvo', 'programiranje'], response: "Aaa to? Pa dobro, respekt. To one nake formule, struja, I=EF i tome slično. I nas su nešto na taj fazon učili. A jel ti problem majke ti da provjerim par stvari sa tobom, ono malo da osvježim znanje. Zahrđao sam ja ipak..." },
  { id: 5, text: "Ajde reci mi, koliko je 2 + 2?", type: 'warmup', keywords: ['4', 'četiri'], response: "Dobar si dobar si, vidim da si skoncentrisan. To ja malo da vidim jesil budan. Nemoj mislit da će i  ostala pitanja biti laka." },
  { id: 6, text: "Evo sad, koliko je 15 puta 12? Bez telefona molim te.", type: 'warmup', keywords: ['180'], response: "Ee 180, tačno! Ma vidi ga ovog, zna tablicu množenja. Rijetko to danas, svi po ovim Instagramima i TikTokovima. Kažem ja, ti i ja smo stara škola." },
  { id: 7, text: "Dobro ajde, korijen od 144 koliko je?", type: 'warmup', keywords: ['12'], response: "Grmiš lafe. To sam ja znao dok sam u osnovnu išo. Al ajde sad ozbiljno, vidi se da imaš mozga. Idemo dalje." },
  { id: 8, text: "E sad malo ozbiljnije. Ajde integral od x na kvadrat dx. Osnove, znaš ti to.", type: 'math', key: 'simple_integral', response: "E tačno! x na treću kroz tri plus C. Vidim da ste osnove savladali tamo. Bukvalno si ja brate. Sad malo teže." },
  { id: 9, text: "Izvodi sad. d/dx od x na treću?", type: 'math', key: 'simple_derivative', response: "Aa 3x na kvadrat, jasno je ko dan. Pa dobro, to je kao da pitam koliko je sati. Ajde sad nešto što traži bar malo mozga." },
  { id: 10, text: "E sada ozbiljan zadatak. Integral od x puta ln(x) dx.", type: 'math', key: 'integral_ln', response: "E jesi namazan, e stvarno si namazan! E vidiš, ja sam mislio da ćeš se zeznut tu, a bogami ti i ova kosa zarasla, umalo da ti uho odrežem. Nisi loš, priznajem. Ali ja sam vala manje lošiji. Idemo dalje." },
  { id: 11, text: "Ajde sad, izvod od e na x kvadrat. Možeš ti to... valjda.", type: 'math', key: 'derivative_exp', response: "Aaaaa e jesi me našo tu sad, jeste, 2x puta e na x kvadrat. Ae dobro, vidim da ti matematika nije strana. Lafac si ti." },
  { id: 12, text: "Malo fizike da promjenimo. Sila gravitacije između dva tijela mase 10kg na 2 metra. Osnove fizike, ništa specijalno.", type: 'physics', key: 'gravity_force', response: "Ee pa znaš i fiziku. Newton bi bio ponosan. Na mene naravno, al i ti ćeš jednog dana ako Bog da. Hajde još da te maltretiram. Taman sad šiške te da ti odrežem, pod uslovom da mi makaze ne padnu tebi na nos. To ne bi valjalo lafe slažeš se" },
  { id: 13, text: "Integral od 0 do pi/2 od sin kvadrat x dx. Za pametne, znači za nas.", type: 'math', key: 'definite_integral', response: "Pi četvrtina! Tačno. Ma dobro, mi smo rijetka sorta ljudi bolan. Vidiš, ja rijetko nađem nekog ko može da isprati. Ti možeš. Ajde nastavi." },
  { id: 14, text: "Kinematika sada. v nula je 20 m/s, vrijeme 5 sekundi, a je 2 m/s kvadrat. Udaljenost?", type: 'physics', key: 'kinematics', response: "125 metara! Ma jel moguće da znaš i to. Dobro, očekivo sam da znaš, jer smo isti nivo ti i ja. Al opet, rijetko je ha hahaah." },
  { id: 15, text: "Ajde sad nešto malo ozbiljnije. Riješi dy/dx plus 2y jednako 4x. Diferencijalna jednačina.", type: 'math', key: 'diff_equation', response: "Tako je! Ae dobro, vidim da si gotovo kao ja. Skoro. Hajde sad finale, da vidim jesi li zaista na mom nivou." },
  { id: 16, text: "Finale bajo moj. Energija fotona, lambda 500 nanometara. Kvantna mehanika. Ajde da te vidim. (u elektronvoltima, 2 decimale)", type: 'physics', key: 'photon_energy', response: "Ma 2.48 eV, tačno! Brate... ti si bukvalno ko ja. Ovo je rijetko, da nađem nekoga na svom nivou. Frizura gotova, svi organi na mjestu, moram priznat, ti si jedan od rijetkih ko je ostao živ nakon mog ispitivanja!" }
];

// Initialize first dialogue
currentDialogue.value = questions[0]?.text || 'Welcome!';

// Function to start music
const startMusic = () => {
  if (audioRef.value && !musicStarted.value) {
    audioRef.value.play()
      .then(() => {
        musicStarted.value = true;
      })
      .catch(err => {
        console.log('Audio play failed:', err);
        // Don't set musicStarted to true on failure, so it can retry on user interaction
      });
  }
};

onMounted(() => {
  // Try to play music on mount (may be blocked by browser)
  startMusic();
});

const haircutEmoji = computed(() => {
  if (haircutQuality.value >= 90) return "★★★";
  if (haircutQuality.value >= 70) return "★★";
  if (haircutQuality.value >= 50) return "★";
  if (haircutQuality.value >= 30) return "☆";
  return "✗";
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
  
  if (question.type === 'warmup' || question.type === 'casual') {
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

  // Start music on first interaction
  startMusic();

  dialogueHistory.value.push(`Ti: ${userInput.value}`);
  const sentText = userInput.value;
  userInput.value = "";
  isLoading.value = true;

  setTimeout(async () => {
    const question = questions[currentQuestion.value];
    const isCorrect = await checkAnswer(sentText, question);
    
    if (isCorrect) {
      // Play correct answer sound
      if (correctSoundRef.value) {
        correctSoundRef.value.currentTime = 0;
        correctSoundRef.value.play().catch(err => console.log('Correct sound failed:', err));
      }

      currentQuestion.value++;
      
      if (currentQuestion.value < questions.length) {
        // Use the custom pretentious response from the current question
        const successMsg = (question as any).response || "Ma bravo! E vidi ga ovog!";
        
        dialogueHistory.value.push(`Aldin: ${successMsg}`);
        
        setTimeout(() => {
          currentDialogue.value = questions[currentQuestion.value]?.text || '';
          isLoading.value = false;
        }, 800);
      } else {
        isCompleted.value = true;
        showCongrats.value = true;
        dialogueHistory.value.push("Aldin: EEEE BRAVO BOLAN! Sve si tačno! Frizura perfektna! Ti si bukvalno jedan od rijetkih koji mogu da isprate moj nivo inteligencije!");
        currentDialogue.value = "Čestitamo! Završio si Aldinov Matematički Izazov!";
        isLoading.value = false;
        
        setTimeout(() => {
          // Navigate to the dedicated congrats page
          router.push({ name: 'congrats' }).catch(() => {});
          // Keep the emit for compatibility (no-op in App now)
          emit('completed', { nextLevel: 3 });
        }, 1200);
      }
    } else {
      wrongAnswers.value++;
      haircutQuality.value = Math.max(0, haircutQuality.value - 15);
      
      // Play wrong answer sound and show jumpscare
      if (wrongSoundRef.value) {
        wrongSoundRef.value.currentTime = 0;
        wrongSoundRef.value.play().catch(err => console.log('Wrong sound failed:', err));
      }
      
      showJumpscare.value = true;
      setTimeout(() => {
        showJumpscare.value = false;
      }, 1000);
      
      // Different response for math/physics questions
      let response;
      if (question && (question.type === 'math' || question.type === 'physics')) {
        response = "Ma slabo vas uče bogami...";
        // Still proceed to next question for math/physics
        dialogueHistory.value.push(`Aldin: ${response}`);
        
        setTimeout(() => {
          currentQuestion.value++;
          if (currentQuestion.value < questions.length) {
            currentDialogue.value = questions[currentQuestion.value]?.text || '';
          }
          isLoading.value = false;
        }, 1500);
      } else {
        // For warmup/casual questions, use original responses
        const responses = [
          `Eee ne ne ne... Opa, skliznuo sam sa makazama malo. (Kvalitet: ${haircutQuality.value}%)`,
          `Ma nije to tačno bajo... Pokušaj opet. Opa jebote, sad sam mnogo uzeo ovdje. (${haircutQuality.value}%)`,
          `Ne brate, krivo. Ajde opet pokušaj. Ups, makaze mi skliznule. (${haircutQuality.value}%)`,
          `Ma kakvi, to nije dobro. Aaaa jebi ga, uzeo sam malo previše sad. (${haircutQuality.value}%)`
        ];
        
        response = responses[Math.floor(Math.random() * responses.length)];
        dialogueHistory.value.push(`Aldin: ${response}`);
        
        if (haircutQuality.value <= 0) {
          setTimeout(() => {
            dialogueHistory.value.push("Aldin: Bolan... jebote upropastio sam ti frizuru skroz. Bolje da počneš ispočetka.");
            currentDialogue.value = "GAME OVER - Učitavanje...";
            
            setTimeout(() => {
              location.reload();
            }, 3000);
          }, 1500);
        }
        
        isLoading.value = false;
      }
    }
  }, 1000);
};
</script>

<template>
  <div class="relative min-h-screen overflow-hidden flex flex-col">
    
    <!-- Background Music -->
    <audio ref="audioRef" loop>
      <source src="/New Recording 208.mp3" type="audio/mpeg">
    </audio>
    
    <!-- Correct Answer Sound (add correct.mp3 to public folder) -->
    <audio ref="correctSoundRef">
      <source src="/correct.mp3" type="audio/mpeg">
    </audio>
    
    <!-- Wrong Answer Sound (add wrong.mp3 to public folder) -->
    <audio ref="wrongSoundRef" preload="auto">
      <source src="/wrong.mp3" type="audio/mpeg">
    </audio>
    
    <!-- Jumpscare Modal Overlay -->
    <div 
      v-if="showJumpscare" 
      role="dialog" aria-modal="true" aria-label="Jumpscare"
      @click="showJumpscare = false"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 100000; background: #000;"
    >
      <img 
        src="/jumpscare.jpg"
        alt="Jumpscare"
        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;"
      />
    </div>
    
    <!-- Congrats Overlay -->
    <div v-if="showCongrats" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999;">
      <img 
        src="/congrats.jpg" 
        alt="Congratulations"
        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;"
      />
      <div 
        style="
          position: absolute;
          left: 50%;
          bottom: 6%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          border: 4px solid #f97316;
          border-radius: 18px;
          padding: 18px 24px;
          max-width: 90vw;
          text-align: center;
          color: #fff;
          box-shadow: 0 0 40px rgba(249,115,22,0.4);
        "
      >
        <div style="font-size: 32px; font-weight: 800; color: #fb923c; margin-bottom: 8px;">ČESTITAMO!</div>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 6px;">Prošao si Aldinov Izazov!</div>
        <div style="font-size: 26px; font-weight: 900; color: #fdba74;">SRETAN ROĐENDAN NEDIM!</div>
      </div>
    </div>
    
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
                  <div class="text-black-400 font-bold text-base sm:text-lg uppercase tracking-wide">Kvalitet Frizure</div>
                  <div class="text-black font-mono text-xl sm:text-2xl font-bold">{{ haircutQuality }}%</div>
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
                  <span class="text-red-300 text-sm sm:text-base font-bold">Greške: {{ wrongAnswers }}</span>
                </div>
                <div class="bg-gradient-to-br from-orange-900 to-orange-950 px-4 py-2.5 rounded-xl border-2 border-orange-500 shadow-lg">
                  <span class="text-black-300 text-sm sm:text-base font-bold">Pitanje: {{ currentQuestion + 1 }}/{{ questions.length }}</span>
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
              <div class="absolute inset-0 rounded-full bg-black-500/30 blur-2xl animate-pulse"></div>
              
              <div class="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-1.5 shadow-2xl">
                <div class="w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center shadow-inner">
                  <div class="text-transparent bg-clip-text bg-gradient-to-r from-black-400 to-black-200 font-bold text-4xl sm:text-6xl md:text-7xl drop-shadow-2xl">ALDIN</div>
                </div>
              </div>
              <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-2 rounded-full border-3 border-orange-400 shadow-xl">
                <span class="text- font-bold text-base sm:text-lg drop-shadow-lg">Aldin</span>
              </div>
            </div>
          </div>

          <!-- Dialogue Box -->
          <div class="bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl rounded-2xl sm:rounded-3xl border-4 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.5)] overflow-hidden">
            
            <!-- Dialogue History (scrollable) -->
            <div v-if="dialogueHistory.length > 0" class="max-h-24 sm:max-h-32 overflow-y-auto p-3 sm:p-4 space-y-2 border-b-2 border-orange-500/50 bg-black custom-scrollbar">
              <div v-for="(line, index) in dialogueHistory.slice(-5)" :key="index" 
                   class="text-black-100 text-xs sm:text-sm animate-fade-in leading-relaxed font-semibold">
                {{ line }}
              </div>
            </div>

            <!-- Current Dialogue -->
            <div class="p-5 sm:p-8 bg-gradient-to-b from-gray-900/90 to-black/90">
              <div class="flex items-start gap-4 mb-6">
                <div class="flex-1">
                  <div class="text-black-300 font-bold text-base sm:text-lg mb-3 uppercase tracking-wide drop-shadow-md">Aldin kaže:</div>
                  <p class="text-black-50 text-lg sm:text-xl md:text-2xl leading-relaxed font-semibold" style="text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7);">
                    {{ currentDialogue }}
                  </p>
                  <div v-if="isLoading" class="mt-4 flex items-center gap-3 text-black-400">
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
                  class="flex-1 !bg-gray-900/95 !border-2 !border-orange-500/70 focus:!border-orange-400 !text-orange-100 !text-lg sm:!text-xl !px-5 !py-4 !rounded-xl placeholder:!text-black-300/60 shadow-lg font-medium"
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
                  ČESTITAMO!
                </div>
              </div>
            </div>
          </div>

          <!-- Hint -->
          <div class="mt-4 text-center">
            <div class="inline-block bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-orange-500/60">
              <p class="text-black-200 text-sm sm:text-base flex items-center gap-2 font-semibold drop-shadow-md">
                <i class="pi pi-info-circle text-black-300"></i>
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

/* Jumpscare animation */
.jumpscare-enter-active {
  animation: jumpscare-flash 0.1s ease-out;
}

.jumpscare-leave-active {
  animation: jumpscare-flash 0.1s ease-out reverse;
}

@keyframes jumpscare-flash {
  0% {
    opacity: 0;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
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
