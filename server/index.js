const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://nedim-bday.vercel.app',
        'https://hbday-nembid.vercel.app',
        /\.vercel\.app$/  // Allow all Vercel preview deployments
      ]
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Correct answers for the mathematical quiz
const CORRECT_ANSWERS = {
    // Page 1: Advanced Calculus & Integration
    integral1: 'e^x(x² - 2x + 2) + C',
    integral2: 'sin²(x)/2 + C',
    limit: '3',
    
    // Page 2: Differential Equations & Wave Theory
    wave: 'u(x,t) = f(x - ct) + g(x + ct)',
    diffEq: 'y = Cx',
    laplace: '1/(s - a)',
    
    // Page 3: Complex Analysis & Residue Calculus
    complexIntegral: '4/3',
    residue: '1/(2i)',
    taylorSeries: 'x - x²/2 + x³/3',
    
    // Level 2 answer
    level2: "I am old and I admit it",
    level5: "NEDIM"
};

// Helper function to normalize answers for comparison
const normalizeAnswer = (answer) => {
    if (!answer) return '';
    return answer.toString().trim().toLowerCase();
};

// Helper function to check if answer is approximately correct
const isAnswerCorrect = (userAnswer, correctAnswer) => {
    const normalized = normalizeAnswer(userAnswer);
    const correct = normalizeAnswer(correctAnswer);
    
    // For limit answers
    if (correct === '3') {
        const num = parseFloat(normalized);
        return num === 3;
    }
    
    // For differential equations
    if (correct.includes('cx') || correct.includes('c x')) {
        return normalized.includes('cx') || normalized.includes('c*x') || normalized.includes('c x');
    }
    
    // For complex integrals
    if (correct === '4/3') {
        return normalized === '4/3' || parseFloat(normalized) === (4/3) || normalized === '1.333' || normalized === '1.33';
    }
    
    // For Taylor series
    if (correct.includes('x²/2')) {
        return normalized.includes('x²/2') || normalized.includes('x^2/2');
    }
    
    // For residues
    if (correct.includes('2i')) {
        return normalized.includes('2i') || normalized.includes('1/2i') || normalized.includes('1/(2i)');
    }
    
    // Exact match for other answers
    return normalized === correct;
};

// Level 2 - Barbershop Adventure Answer Key (Progressive difficulty)
const LEVEL2_ANSWERS = {
  // Simple warm-up integrals
  'simple_integral': {
    variations: ['x³/3+c', 'x^3/3+c', 'x³/3', 'x^3/3', '(x^3)/3+c', '(x³)/3+c'],
    message: "E tačno! x³/3 + C. Pa to je elementarno bajo moj. Vidiš, mi smo na istom nivou bukvalno. Sad malo teže."
  },
  'simple_derivative': {
    variations: ['3x²', '3x^2', '3*x^2', '3*x²'],
    message: "Aa 3x na kvadrat, jasno je ko dan. Pa dobro, to je kao da pitam koliko je sat. Ajde sad nešto što traži bar malo mozga."
  },
  // Integration by parts
  'integral_ln': {
    variations: ['x²ln(x)/2-x²/4', 'x^2*ln(x)/2-x^2/4', '(x^2/2)*(ln(x)-1/2)', 'x²/2*ln(x)-x²/4', 'x^2lnx/2-x^2/4'],
    message: "Ala si ga riješio bolan! E vidiš, ja sam mislio da ćeš se zeznut tu. Nisi loš, priznajem. Kao ni ja da se razumijemo. Idemo dalje."
  },
  // Chain rule derivative
  'derivative_exp': {
    variations: ['2xe^(x²)', '2x*e^(x^2)', '2xe^x²', '2x*e^(x²)', '2xexp(x²)', '2xexp(x^2)'],
    message: "Pa jebote znaš! 2x puta e na x kvadrat. Ae dobro, vidim da ti matematika nije strana. Dobro došo u klub bajo."
  },
  // Gravity force calculation
  'gravity_force': {
    checkFunction: (answer) => {
      const normalized = answer.toLowerCase().replace(/\s/g, '');
      return normalized.includes('1.67') || normalized.includes('1.6685') || 
             (normalized.includes('10^-9') || normalized.includes('e-9') || normalized.includes('×10⁻⁹'));
    },
    message: "Ee pa znaš i fiziku. Newton bi bio ponosan. Na mene naravno, al i na tebe malo. Hajde još da te testiramo."
  },
  // Definite integral of sin²(x)
  'definite_integral': {
    variations: ['π/4', 'pi/4', '3.14/4', '0.785', 'π/4', 'π÷4', '0.7854'],
    message: "Pi četvrtina! Tačno. Ma dobro, mi smo rijetka sorta ljudi bolan. Vidiš, ja rijetko nađem nekog ko može da isprati. Ti možeš. Ajde nastavi."
  },
  // Kinematics equation
  'kinematics': {
    variations: ['125', '125m'],
    message: "125 metara! Ma jel moguće da znaš i to. Dobro, očekivo sam da znaš, jer smo isti nivo ti i ja. Al opet, rijetko je."
  },
  // Differential equation solution
  'diff_equation': {
    variations: ['y=2x-1+ce^(-2x)', 'y=2x-1+c*e^(-2x)', '2x-1+ce^-2x', 'y=2x-1+ce^(-2x)', '2x-1+c*e^(-2x)'],
    message: "Jebote znaš! Ae dobro, vidim da si gotovo kao ja. Skoro. Hajde sad finale, da vidim jesi li zaista na mom nivou."
  },
  // Photon energy calculation
  'photon_energy': {
    checkFunction: (answer) => {
      const normalized = answer.toLowerCase().replace(/\s/g, '');
      const num = parseFloat(normalized);
      return (num >= 2.47 && num <= 2.49) || normalized.includes('2.48');
    },
    message: "Ma 2.48 eV, tačno! Brate... ti si bukvalno ko ja. Ovo je rijetko, da nađem nekoga na svom nivou. Frizura gotova, moram priznat - ti si jedan od rijetkih ko me može pratit!"
  }
};

// Check Level 2 answer
app.post('/api/level2/check', (req, res) => {
  const { questionKey, answer } = req.body;
  
  if (!questionKey || !answer) {
    return res.status(400).json({ error: 'Missing questionKey or answer' });
  }

  const correctAnswer = LEVEL2_ANSWERS[questionKey];
  if (!correctAnswer) {
    return res.status(400).json({ error: 'Invalid question key' });
  }

  let isCorrect = false;
  const normalized = answer.toLowerCase().replace(/\s+/g, '').trim();

  // Check using custom function if available
  if (correctAnswer.checkFunction) {
    isCorrect = correctAnswer.checkFunction(answer);
  } else if (correctAnswer.variations) {
    // Check against variations
    isCorrect = correctAnswer.variations.some(variation => {
      const varNormalized = variation.toLowerCase().replace(/\s+/g, '');
      return normalized === varNormalized || 
             normalized.includes(varNormalized) ||
             varNormalized.includes(normalized);
    });
  }

  if (isCorrect) {
    res.json({
      correct: true,
      message: correctAnswer.message
    });
  } else {
    res.json({
      correct: false,
      message: "Aldin: Auuu brate, to nije tačno... *šiške malo više sa strane* ✂️😬"
    });
  }
});

app.post('/api/level1', (req, res) => {
    const answers = req.body;
    
    // Check if name is provided
    if (!answers.name || answers.name.trim() === '') {
        return res.status(400).json({ error: "Name is required to complete the assessment" });
    }
    
    // Get time used
    const timeUsed = answers.timeUsed || 0;
    delete answers.timeUsed; // Remove from answers object
    
    // Calculate score
    let score = 0;
    let totalQuestions = 0;
    const incorrectAnswers = [];
    
    // Check each answer
    Object.keys(CORRECT_ANSWERS).forEach(key => {
        if (key === 'level2' || key === 'level5') return; // Skip level 2 answers
        
        totalQuestions++;
        const userAnswer = answers[key];
        const correctAnswer = CORRECT_ANSWERS[key];
        
        if (isAnswerCorrect(userAnswer, correctAnswer)) {
            score++;
        } else {
            incorrectAnswers.push({
                question: key,
                userAnswer: userAnswer || 'No answer provided',
                correctAnswer: correctAnswer
            });
        }
    });
    
    const percentage = Math.round((score / totalQuestions) * 100);
    const timeBonus = timeUsed < 180 ? ' ⚡ Speed bonus achieved!' : '';
    
    // Determine if they pass (need at least 46% to pass for harder problems)
    if (percentage >= 46) {
        res.json({ 
            success: true, 
            message: `Congratulations ${answers.name}! Your mathematical prowess has been verified. Score: ${score}/${totalQuestions} (${percentage}%)${timeBonus}`,
            nextLevel: 2,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            timeUsed: timeUsed
        });
    } else {
        // Provide feedback on incorrect answers
        let feedback = `Assessment failed. Score: ${score}/${totalQuestions} (${percentage}%). `;
        feedback += `You need at least 46% to proceed. `;
        
        if (incorrectAnswers.length > 0) {
            feedback += `Incorrect answers: ${incorrectAnswers.length}. `;
            feedback += "These problems require advanced calculus, differential equations, and complex analysis.";
        }
        
        res.status(400).json({ 
            message: feedback,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            incorrectAnswers: incorrectAnswers.slice(0, 3) // Show first 3 incorrect answers
        });
    }
});

app.post('/api/level2', (req, res) => {
    const { answer } = req.body;
    if (answer === CORRECT_ANSWERS.level2) {
        res.json({ success: true, nextLevel: 3 });
    } else {
        res.status(400).json({ message: "Incorrect. The system is disappointed in you." });
    }
});

app.get('/api/reward', (req, res) => {
    res.json({
        image: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmxkcHFuOXViOTR3ZnExa2MzOGcxcm1wMzdhdW9tOWtiYzJ1YXpzbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LGBKlgMCKQbkDKcG4t/giphy.gif",
        text: "HAPPY BIRTHDAY NEDIM! YOU SURVIVED... FOR NOW..."
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});