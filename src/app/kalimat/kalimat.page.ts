import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

export interface DailySentence {
  english: string;
  indonesian: string;
  pronunciation: string;
  category: string;
  words: WordInfo[];
}

export interface WordInfo {
  word: string;
  meaning: string;
}

type KalimatScreen = 'list' | 'detail' | 'quiz' | 'result';

@Component({
  selector: 'app-kalimat',
  templateUrl: './kalimat.page.html',
  styleUrls: ['./kalimat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class KalimatPage implements OnInit {

  currentScreen: KalimatScreen = 'list';

  xp = 0;
  streak = 0;

  // ─── DATA KALIMAT ──────────────────────────────────────────────
  private allSentences: DailySentence[] = [
    {
      english: 'I wake up early every morning.',
      indonesian: 'Saya bangun pagi setiap hari.',
      pronunciation: '/aɪ weɪk ʌp ˈɜːrli ˈɛvri ˈmɔːrnɪŋ/',
      category: 'Kegiatan Sehari-hari',
      words: [
        { word: 'wake up', meaning: 'bangun tidur' },
        { word: 'early', meaning: 'pagi-pagi / awal' },
        { word: 'every morning', meaning: 'setiap pagi' }
      ]
    },
    {
      english: 'She drinks a glass of water before breakfast.',
      indonesian: 'Dia minum segelas air sebelum sarapan.',
      pronunciation: '/ʃiː drɪŋks ə ɡlɑːs əv ˈwɔːtər bɪˈfɔːr ˈbrɛkfəst/',
      category: 'Makanan & Minuman',
      words: [
        { word: 'drinks', meaning: 'minum' },
        { word: 'glass of water', meaning: 'segelas air' },
        { word: 'before breakfast', meaning: 'sebelum sarapan' }
      ]
    },
    {
      english: 'We go to school by bicycle.',
      indonesian: 'Kami pergi ke sekolah naik sepeda.',
      pronunciation: '/wiː ɡoʊ tə skuːl baɪ ˈbaɪsɪkəl/',
      category: 'Transportasi',
      words: [
        { word: 'go to school', meaning: 'pergi ke sekolah' },
        { word: 'by bicycle', meaning: 'naik sepeda' }
      ]
    },
    {
      english: 'My mother cooks delicious food every day.',
      indonesian: 'Ibuku memasak makanan lezat setiap hari.',
      pronunciation: '/maɪ ˈmʌðər kʊks dɪˈlɪʃəs fuːd ˈɛvri deɪ/',
      category: 'Keluarga',
      words: [
        { word: 'cooks', meaning: 'memasak' },
        { word: 'delicious', meaning: 'lezat / enak' },
        { word: 'every day', meaning: 'setiap hari' }
      ]
    },
    {
      english: 'The children play in the park after school.',
      indonesian: 'Anak-anak bermain di taman setelah sekolah.',
      pronunciation: '/ðə ˈtʃɪldrən pleɪ ɪn ðə pɑːrk ˈæftər skuːl/',
      category: 'Kegiatan Sehari-hari',
      words: [
        { word: 'children', meaning: 'anak-anak' },
        { word: 'play', meaning: 'bermain' },
        { word: 'after school', meaning: 'setelah sekolah' }
      ]
    },
    {
      english: 'I read a book before going to sleep.',
      indonesian: 'Saya membaca buku sebelum tidur.',
      pronunciation: '/aɪ rɛd ə bʊk bɪˈfɔːr ˈɡoʊɪŋ tə sliːp/',
      category: 'Kegiatan Sehari-hari',
      words: [
        { word: 'read', meaning: 'membaca' },
        { word: 'before going to sleep', meaning: 'sebelum tidur' }
      ]
    },
    {
      english: 'He studies English at school.',
      indonesian: 'Dia belajar Bahasa Inggris di sekolah.',
      pronunciation: '/hiː ˈstʌdiz ˈɪŋɡlɪʃ æt skuːl/',
      category: 'Pendidikan',
      words: [
        { word: 'studies', meaning: 'belajar / mempelajari' },
        { word: 'English', meaning: 'Bahasa Inggris' },
        { word: 'at school', meaning: 'di sekolah' }
      ]
    },
    {
      english: 'The weather is very hot today.',
      indonesian: 'Cuaca sangat panas hari ini.',
      pronunciation: '/ðə ˈwɛðər ɪz ˈvɛri hɒt təˈdeɪ/',
      category: 'Cuaca & Alam',
      words: [
        { word: 'weather', meaning: 'cuaca' },
        { word: 'very hot', meaning: 'sangat panas' },
        { word: 'today', meaning: 'hari ini' }
      ]
    },
    {
      english: 'I like eating fruits and vegetables.',
      indonesian: 'Saya suka makan buah dan sayuran.',
      pronunciation: '/aɪ laɪk ˈiːtɪŋ fruːts ænd ˈvɛdʒtəbəlz/',
      category: 'Makanan & Minuman',
      words: [
        { word: 'like', meaning: 'suka' },
        { word: 'eating', meaning: 'makan / memakan' },
        { word: 'fruits', meaning: 'buah-buahan' },
        { word: 'vegetables', meaning: 'sayuran' }
      ]
    },
    {
      english: 'She always helps her friends when they need it.',
      indonesian: 'Dia selalu membantu temannya ketika dibutuhkan.',
      pronunciation: '/ʃiː ˈɔːlweɪz hɛlps hɜːr frɛndz wɛn ðeɪ niːd ɪt/',
      category: 'Sosial',
      words: [
        { word: 'always', meaning: 'selalu' },
        { word: 'helps', meaning: 'membantu' },
        { word: 'when they need it', meaning: 'ketika dibutuhkan' }
      ]
    },
    {
      english: 'We visit our grandparents every weekend.',
      indonesian: 'Kami mengunjungi kakek-nenek setiap akhir pekan.',
      pronunciation: '/wiː ˈvɪzɪt aʊər ˈɡrænpɛrənts ˈɛvri ˈwiːkɛnd/',
      category: 'Keluarga',
      words: [
        { word: 'visit', meaning: 'mengunjungi' },
        { word: 'grandparents', meaning: 'kakek dan nenek' },
        { word: 'every weekend', meaning: 'setiap akhir pekan' }
      ]
    },
    {
      english: 'The teacher explains the lesson clearly.',
      indonesian: 'Guru menjelaskan pelajaran dengan jelas.',
      pronunciation: '/ðə ˈtiːtʃər ɪkˈspleɪnz ðə ˈlɛsən ˈklɪərli/',
      category: 'Pendidikan',
      words: [
        { word: 'explains', meaning: 'menjelaskan' },
        { word: 'lesson', meaning: 'pelajaran' },
        { word: 'clearly', meaning: 'dengan jelas' }
      ]
    },
    {
      english: 'I brush my teeth twice a day.',
      indonesian: 'Saya menggosok gigi dua kali sehari.',
      pronunciation: '/aɪ brʌʃ maɪ tiːθ twaɪs ə deɪ/',
      category: 'Kesehatan',
      words: [
        { word: 'brush my teeth', meaning: 'menggosok gigi' },
        { word: 'twice a day', meaning: 'dua kali sehari' }
      ]
    },
    {
      english: 'It is raining heavily outside.',
      indonesian: 'Di luar sedang hujan deras.',
      pronunciation: '/ɪt ɪz ˈreɪnɪŋ ˈhɛvɪli ˌaʊtˈsaɪd/',
      category: 'Cuaca & Alam',
      words: [
        { word: 'raining', meaning: 'sedang hujan' },
        { word: 'heavily', meaning: 'dengan deras' },
        { word: 'outside', meaning: 'di luar' }
      ]
    },
    {
      english: 'My father works at a hospital.',
      indonesian: 'Ayahku bekerja di rumah sakit.',
      pronunciation: '/maɪ ˈfɑːðər wɜːrks æt ə ˈhɒspɪtəl/',
      category: 'Pekerjaan',
      words: [
        { word: 'works', meaning: 'bekerja' },
        { word: 'hospital', meaning: 'rumah sakit' }
      ]
    },
    {
      english: 'Can you help me carry this bag?',
      indonesian: 'Bisakah kamu membantuku membawa tas ini?',
      pronunciation: '/kæn juː hɛlp miː ˈkæri ðɪs bæɡ/',
      category: 'Percakapan',
      words: [
        { word: 'can you', meaning: 'bisakah kamu' },
        { word: 'help me', meaning: 'membantuku' },
        { word: 'carry', meaning: 'membawa / mengangkat' }
      ]
    },
    {
      english: 'I am very happy to meet you.',
      indonesian: 'Saya sangat senang bertemu denganmu.',
      pronunciation: '/aɪ æm ˈvɛri ˈhæpi tə miːt juː/',
      category: 'Percakapan',
      words: [
        { word: 'very happy', meaning: 'sangat senang' },
        { word: 'to meet', meaning: 'bertemu' }
      ]
    },
    {
      english: 'Please close the door when you leave.',
      indonesian: 'Tolong tutup pintunya ketika kamu pergi.',
      pronunciation: '/pliːz kloʊz ðə dɔːr wɛn juː liːv/',
      category: 'Percakapan',
      words: [
        { word: 'please', meaning: 'tolong / silakan' },
        { word: 'close the door', meaning: 'tutup pintu' },
        { word: 'when you leave', meaning: 'ketika kamu pergi' }
      ]
    },
    {
      english: 'They are playing football in the field.',
      indonesian: 'Mereka sedang bermain sepak bola di lapangan.',
      pronunciation: '/ðeɪ ɑːr ˈpleɪɪŋ ˈfʊtbɔːl ɪn ðə fiːld/',
      category: 'Olahraga',
      words: [
        { word: 'playing football', meaning: 'bermain sepak bola' },
        { word: 'field', meaning: 'lapangan' }
      ]
    },
    {
      english: 'I need to buy some groceries at the market.',
      indonesian: 'Saya perlu membeli bahan makanan di pasar.',
      pronunciation: '/aɪ niːd tə baɪ sʌm ˈɡroʊsəriz æt ðə ˈmɑːrkɪt/',
      category: 'Belanja',
      words: [
        { word: 'need to buy', meaning: 'perlu membeli' },
        { word: 'groceries', meaning: 'bahan makanan / belanjaan' },
        { word: 'market', meaning: 'pasar' }
      ]
    },
  ];

  // ─── STATE ─────────────────────────────────────────────────────
  todaySentences: DailySentence[] = [];
  selectedSentence: DailySentence | null = null;
  selectedIndex = 0;

  // Quiz state
  quizSentence: DailySentence | null = null;
  quizWords: string[] = [];
  arrangedWords: string[] = [];
  availableWords: string[] = [];
  quizAnswered = false;
  quizCorrect = false;
  quizScore = 0;
  quizTotal = 0;
  quizIndex = 0;
  quizSentences: DailySentence[] = [];

  // Result state
  resultCorrectCount = 0;
  resultXpGain = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadState();
    this.loadDailySentences();
  }

  ionViewWillEnter() {
    this.loadState();
  }

  // ─── Persistence ───────────────────────────────────────────────
  loadState() {
    this.xp     = Number(localStorage.getItem('eng_xp'))     || 0;
    this.streak = Number(localStorage.getItem('eng_streak')) || 0;
  }

  saveState() {
    localStorage.setItem('eng_xp',     String(this.xp));
    localStorage.setItem('eng_streak', String(this.streak));
  }

  // ─── Daily Rotation ────────────────────────────────────────────
  private getDayIndex(): number {
    return Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  }

  private loadDailySentences() {
    const todayKey = `daily_kalimat_${this.getDayIndex()}`;
    const saved    = localStorage.getItem(todayKey);

    if (saved) {
      this.todaySentences = JSON.parse(saved);
    } else {
      const dayIdx = this.getDayIndex();
      const count  = 5;
      const total  = this.allSentences.length;
      const result: DailySentence[] = [];
      for (let i = 0; i < count; i++) {
        const idx = (dayIdx * count + i * Math.ceil(total / count)) % total;
        result.push(this.allSentences[idx]);
      }
      this.todaySentences = result;
      localStorage.setItem(todayKey, JSON.stringify(result));
      localStorage.removeItem(`daily_kalimat_${this.getDayIndex() - 1}`);
    }
  }

  // ─── Navigation ────────────────────────────────────────────────
  goBack() {
    if (this.currentScreen === 'detail') {
      this.currentScreen = 'list';
    } else if (this.currentScreen === 'quiz') {
      this.currentScreen = 'list';
    } else if (this.currentScreen === 'result') {
      this.currentScreen = 'list';
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  openDetail(sentence: DailySentence, index: number) {
    this.selectedSentence = sentence;
    this.selectedIndex    = index;
    this.currentScreen    = 'detail';
  }

  // ─── Quiz Logic ────────────────────────────────────────────────
  startQuiz() {
    this.quizSentences    = [...this.todaySentences];
    this.quizIndex        = 0;
    this.quizScore        = 0;
    this.quizTotal        = 0;
    this.resultCorrectCount = 0;
    this.loadQuizQuestion();
    this.currentScreen = 'quiz';
  }

  loadQuizQuestion() {
    this.quizSentence   = this.quizSentences[this.quizIndex];
    this.arrangedWords  = [];
    this.quizAnswered   = false;
    this.quizCorrect    = false;

    // Acak kata dari kalimat Inggris
    const words = this.quizSentence.english
      .replace(/[.,?!]/g, '')
      .split(' ')
      .filter(w => w.length > 0);
    this.quizWords      = [...words];
    this.availableWords = [...words].sort(() => Math.random() - 0.5);
  }

  pickWord(word: string, index: number) {
    if (this.quizAnswered) return;
    this.arrangedWords.push(word);
    this.availableWords.splice(index, 1);
    this.checkAutoSubmit();
  }

  removeWord(word: string, index: number) {
    if (this.quizAnswered) return;
    this.availableWords.push(word);
    this.arrangedWords.splice(index, 1);
  }

  checkAutoSubmit() {
    if (this.availableWords.length === 0) {
      this.submitQuiz();
    }
  }

  submitQuiz() {
    if (this.quizAnswered) return;
    this.quizAnswered = true;
    this.quizTotal++;

    const arranged = this.arrangedWords.join(' ');
    const original = this.quizSentence!.english.replace(/[.,?!]/g, '');
    this.quizCorrect = arranged.toLowerCase() === original.toLowerCase();

    if (this.quizCorrect) {
      this.quizScore += 15;
      this.resultCorrectCount++;
    }
  }

  nextQuiz() {
    this.quizIndex++;
    if (this.quizIndex >= this.quizSentences.length) {
      this.showResult();
    } else {
      this.loadQuizQuestion();
    }
  }

  showResult() {
    const xpGain    = this.quizScore + this.resultCorrectCount * 5;
    this.resultXpGain = xpGain;
    this.xp        += xpGain;
    this.streak     = Math.min(this.streak + 1, 7);
    this.saveState();
    this.currentScreen = 'result';
  }

  get accuracy(): number {
    if (this.quizTotal === 0) return 0;
    return Math.round((this.resultCorrectCount / this.quizSentences.length) * 100);
  }

  get resultEmoji(): string {
    if (this.accuracy >= 90) return '🏆';
    if (this.accuracy >= 70) return '🎉';
    if (this.accuracy >= 50) return '👍';
    return '😊';
  }

  get resultTitle(): string {
    if (this.accuracy >= 90) return 'Luar Biasa!';
    if (this.accuracy >= 70) return 'Bagus!';
    if (this.accuracy >= 50) return 'Lumayan!';
    return 'Terus Berlatih!';
  }
}