import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, GeneratedVocab, GeneratedGame } from '../services/gemini.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService, UserProgress } from '../services/auth.service';

export interface VocabQuestion {
  word: string;
  phonetic: string;
  example: string;
  answer: string;
  choices: string[];
}

export interface GameWord {
  indo: string;
  eng: string;
  hint: string;
}

export type Screen = 'home' | 'vocab' | 'game' | 'result';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DashboardPage implements OnInit, OnDestroy {

  nama = '';
  currentScreen: Screen = 'home';

  xp = 0;
  streak = 0;
  totalCorrect = 0;
  totalAnswered = 0;

  levels = [
    { name: 'Pemula',       xp: 0,     next: 100   },
    { name: 'Dasar',        xp: 100,   next: 250   },
    { name: 'Menengah',     xp: 250,   next: 500   },
    { name: 'Mahir',        xp: 500,   next: 900   },
    { name: 'Ahli',         xp: 900,   next: 1400  },
    { name: 'Master',       xp: 1400,  next: 2000  },
    { name: 'Legend',       xp: 2000,  next: 3000  },
    { name: 'Grand Master', xp: 3000,  next: 5000  },
    { name: 'Champion',     xp: 5000,  next: 8000  },
    { name: 'Mythic',       xp: 8000,  next: 99999 },
  ];

  rewards = [
    { min: 0,  icon: '🌟', name: 'Bintang Pemula' },
    { min: 50, icon: '⭐', name: 'Bintang Perak'  },
    { min: 75, icon: '🥇', name: 'Medali Emas'    },
    { min: 90, icon: '💎', name: 'Berlian'         },
  ];

  days = ['S','S','R','K','J','S','M'];

  private allVocabPool: VocabQuestion[] = [
    { word: 'CAT',       phonetic: '/kæt/',        example: '"The cat is sleeping."',              answer: 'Kucing',              choices: ['Kucing','Anjing','Kelinci','Tikus']                },
    { word: 'DOG',       phonetic: '/dɒɡ/',         example: '"My dog likes to play."',             answer: 'Anjing',              choices: ['Kucing','Anjing','Harimau','Singa']                },
    { word: 'BIRD',      phonetic: '/bɜːrd/',       example: '"The bird sings in the morning."',    answer: 'Burung',              choices: ['Ikan','Burung','Katak','Kupu-kupu']                },
    { word: 'FISH',      phonetic: '/fɪʃ/',         example: '"I caught a big fish."',              answer: 'Ikan',                choices: ['Ikan','Udang','Kepiting','Cumi']                   },
    { word: 'RABBIT',    phonetic: '/ˈræbɪt/',      example: '"The rabbit eats carrots."',          answer: 'Kelinci',             choices: ['Tikus','Hamster','Kelinci','Tupai']                },
    { word: 'APPLE',     phonetic: '/ˈæpəl/',       example: '"I eat an apple every morning."',     answer: 'Apel',                choices: ['Apel','Jeruk','Mangga','Anggur']                   },
    { word: 'MANGO',     phonetic: '/ˈmæŋɡoʊ/',     example: '"The mango is very sweet."',          answer: 'Mangga',              choices: ['Pepaya','Pisang','Mangga','Jambu']                 },
    { word: 'GRAPE',     phonetic: '/ɡreɪp/',       example: '"She loves eating grapes."',          answer: 'Anggur',              choices: ['Leci','Anggur','Stroberi','Ceri']                  },
    { word: 'BANANA',    phonetic: '/bəˈnɑːnə/',    example: '"Monkeys love bananas."',             answer: 'Pisang',              choices: ['Pisang','Pepaya','Durian','Nanas']                 },
    { word: 'ORANGE',    phonetic: '/ˈɒrɪndʒ/',     example: '"I drink orange juice."',             answer: 'Jeruk',               choices: ['Lemon','Jeruk','Nanas','Semangka']                 },
    { word: 'RED',       phonetic: '/rɛd/',         example: '"The rose is red."',                  answer: 'Merah',               choices: ['Merah','Biru','Hijau','Kuning']                    },
    { word: 'BLUE',      phonetic: '/bluː/',         example: '"The sky is blue."',                  answer: 'Biru',                choices: ['Ungu','Biru','Hitam','Abu-abu']                    },
    { word: 'GREEN',     phonetic: '/ɡriːn/',       example: '"Grass is green."',                   answer: 'Hijau',               choices: ['Hijau','Kuning','Oranye','Coklat']                 },
    { word: 'YELLOW',    phonetic: '/ˈjɛloʊ/',      example: '"The sun is yellow."',                answer: 'Kuning',              choices: ['Emas','Kuning','Krem','Oranye']                    },
    { word: 'WHITE',     phonetic: '/waɪt/',        example: '"Snow is white."',                    answer: 'Putih',               choices: ['Putih','Hitam','Abu-abu','Perak']                  },
    { word: 'EYE',       phonetic: '/aɪ/',          example: '"She has beautiful eyes."',           answer: 'Mata',                choices: ['Mata','Hidung','Telinga','Mulut']                  },
    { word: 'HAND',      phonetic: '/hænd/',        example: '"Wash your hands before eating."',    answer: 'Tangan',              choices: ['Kaki','Tangan','Kepala','Bahu']                    },
    { word: 'NOSE',      phonetic: '/noʊz/',        example: '"My nose is itchy."',                 answer: 'Hidung',              choices: ['Hidung','Bibir','Pipi','Dagu']                     },
    { word: 'MOUTH',     phonetic: '/maʊθ/',        example: '"Open your mouth wide."',             answer: 'Mulut',               choices: ['Gigi','Mulut','Lidah','Tenggorokan']               },
    { word: 'LEG',       phonetic: '/lɛɡ/',         example: '"He broke his leg."',                 answer: 'Kaki',                choices: ['Lutut','Kaki','Paha','Betis']                      },
    { word: 'HAPPY',     phonetic: '/ˈhæpi/',       example: '"She looks happy today."',            answer: 'Bahagia',             choices: ['Sedih','Marah','Bahagia','Takut']                  },
    { word: 'SMART',     phonetic: '/smɑːrt/',      example: '"She is a smart student."',           answer: 'Pintar',              choices: ['Bodoh','Pintar','Malas','Rajin']                   },
    { word: 'STRONG',    phonetic: '/strɒŋ/',       example: '"He is very strong."',                answer: 'Kuat',                choices: ['Lemah','Kuat','Tinggi','Pendek']                   },
    { word: 'BEAUTIFUL', phonetic: '/ˈbjuːtɪfəl/', example: '"The sunset is beautiful."',          answer: 'Indah',               choices: ['Jelek','Besar','Indah','Kecil']                    },
    { word: 'KIND',      phonetic: '/kaɪnd/',       example: '"She is very kind to animals."',      answer: 'Baik hati',           choices: ['Jahat','Baik hati','Pemarah','Pemalu']             },
    { word: 'BOOK',      phonetic: '/bʊk/',         example: '"I read a book before bed."',         answer: 'Buku',                choices: ['Pensil','Buku','Kertas','Tas']                     },
    { word: 'WATER',     phonetic: '/ˈwɔːtər/',     example: '"Drink more water every day."',       answer: 'Air',                 choices: ['Api','Tanah','Angin','Air']                        },
    { word: 'CHAIR',     phonetic: '/tʃɛr/',        example: '"Please sit on the chair."',          answer: 'Kursi',               choices: ['Meja','Kursi','Lemari','Rak']                      },
    { word: 'TABLE',     phonetic: '/ˈteɪbəl/',     example: '"Put it on the table."',              answer: 'Meja',                choices: ['Meja','Lantai','Dinding','Pintu']                  },
    { word: 'DOOR',      phonetic: '/dɔːr/',        example: '"Please close the door."',            answer: 'Pintu',               choices: ['Jendela','Pintu','Dinding','Atap']                 },
    { word: 'RUN',       phonetic: '/rʌn/',         example: '"I run every morning."',              answer: 'Berlari',             choices: ['Berjalan','Berlari','Melompat','Berenang']         },
    { word: 'SLEEP',     phonetic: '/sliːp/',       example: '"I need to sleep early."',            answer: 'Tidur',               choices: ['Makan','Minum','Berlari','Tidur']                  },
    { word: 'EAT',       phonetic: '/iːt/',         example: '"We eat dinner together."',           answer: 'Makan',               choices: ['Makan','Minum','Memasak','Mencuci']                },
    { word: 'JUMP',      phonetic: '/dʒʌmp/',       example: '"The frog can jump high."',           answer: 'Melompat',            choices: ['Berlari','Melompat','Merangkak','Terbang']         },
    { word: 'SWIM',      phonetic: '/swɪm/',        example: '"I love to swim in the pool."',       answer: 'Berenang',            choices: ['Berenang','Menyelam','Berlayar','Mendayung']       },
    { word: 'SCHOOL',    phonetic: '/skuːl/',       example: '"I go to school every day."',         answer: 'Sekolah',             choices: ['Kantor','Sekolah','Rumah Sakit','Pasar']           },
    { word: 'HOUSE',     phonetic: '/haʊs/',        example: '"My house is near the park."',        answer: 'Rumah',               choices: ['Gedung','Rumah','Istana','Gubuk']                  },
    { word: 'MARKET',    phonetic: '/ˈmɑːrkɪt/',    example: '"Mom buys vegetables at the market."',answer: 'Pasar',               choices: ['Toko','Pasar','Mall','Warung']                     },
    { word: 'PARK',      phonetic: '/pɑːrk/',       example: '"Children play at the park."',        answer: 'Taman',               choices: ['Hutan','Kebun','Taman','Ladang']                   },
    { word: 'HOSPITAL',  phonetic: '/ˈhɒspɪtəl/',  example: '"The doctor works at the hospital."', answer: 'Rumah Sakit',         choices: ['Klinik','Rumah Sakit','Apotek','Puskesmas']        },
    { word: 'MOTHER',    phonetic: '/ˈmʌðər/',      example: '"My mother cooks every morning."',    answer: 'Ibu',                 choices: ['Ibu','Ayah','Kakak','Adik']                        },
    { word: 'FATHER',    phonetic: '/ˈfɑːðər/',     example: '"My father goes to work early."',     answer: 'Ayah',                choices: ['Paman','Ayah','Kakek','Sepupu']                    },
    { word: 'SISTER',    phonetic: '/ˈsɪstər/',     example: '"My sister likes to draw."',          answer: 'Kakak/Adik perempuan',choices: ['Saudara laki-laki','Kakak/Adik perempuan','Ibu','Bibi'] },
    { word: 'FRIEND',    phonetic: '/frɛnd/',       example: '"She is my best friend."',            answer: 'Teman',               choices: ['Musuh','Keluarga','Teman','Guru']                  },
    { word: 'TEACHER',   phonetic: '/ˈtiːtʃər/',    example: '"Our teacher is very kind."',         answer: 'Guru',                choices: ['Dokter','Guru','Polisi','Petani']                  },
    { word: 'SUN',       phonetic: '/sʌn/',         example: '"The sun rises in the east."',        answer: 'Matahari',            choices: ['Bulan','Bintang','Matahari','Awan']                },
    { word: 'RAIN',      phonetic: '/reɪn/',        example: '"I love walking in the rain."',       answer: 'Hujan',               choices: ['Angin','Hujan','Salju','Kabut']                    },
    { word: 'TREE',      phonetic: '/triː/',        example: '"The tree is very tall."',            answer: 'Pohon',               choices: ['Bunga','Pohon','Rumput','Daun']                    },
    { word: 'FLOWER',    phonetic: '/ˈflaʊər/',     example: '"She picked a beautiful flower."',    answer: 'Bunga',               choices: ['Bunga','Daun','Akar','Ranting']                    },
    { word: 'MOUNTAIN',  phonetic: '/ˈmaʊntɪn/',    example: '"We climbed the mountain together."', answer: 'Gunung',              choices: ['Bukit','Gunung','Lembah','Ngarai']                 },
    { word: 'RICE',      phonetic: '/raɪs/',        example: '"We eat rice every day."',            answer: 'Nasi',                choices: ['Nasi','Roti','Mie','Jagung']                       },
    { word: 'BREAD',     phonetic: '/brɛd/',        example: '"I eat bread for breakfast."',        answer: 'Roti',                choices: ['Kue','Roti','Biskuit','Cracker']                   },
    { word: 'MILK',      phonetic: '/mɪlk/',        example: '"Drink a glass of milk every day."',  answer: 'Susu',                choices: ['Susu','Jus','Teh','Kopi']                         },
  ];

  private readonly defaultVocabPool: VocabQuestion[] = [...this.allVocabPool];

  private allGamePool: GameWord[] = [
    { indo: 'Kucing',   eng: 'CAT',      hint: '3 huruf, hewan peliharaan'         },
    { indo: 'Anjing',   eng: 'DOG',      hint: '3 huruf, sahabat manusia'          },
    { indo: 'Burung',   eng: 'BIRD',     hint: '4 huruf, bisa terbang'             },
    { indo: 'Ikan',     eng: 'FISH',     hint: '4 huruf, hidup di air'             },
    { indo: 'Singa',    eng: 'LION',     hint: '4 huruf, raja hutan'               },
    { indo: 'Gajah',    eng: 'ELEPHANT', hint: '8 huruf, hewan terbesar di darat'  },
    { indo: 'Kuda',     eng: 'HORSE',    hint: '5 huruf, bisa ditunggangi'         },
    { indo: 'Kelinci',  eng: 'RABBIT',   hint: '6 huruf, telinganya panjang'       },
    { indo: 'Apel',     eng: 'APPLE',    hint: '5 huruf, buah merah/hijau'         },
    { indo: 'Pisang',   eng: 'BANANA',   hint: '6 huruf, buah kuning'              },
    { indo: 'Mangga',   eng: 'MANGO',    hint: '5 huruf, buah tropis manis'        },
    { indo: 'Jeruk',    eng: 'ORANGE',   hint: '6 huruf, buah berwarna oranye'     },
    { indo: 'Anggur',   eng: 'GRAPE',    hint: '5 huruf, buah kecil ungu/hijau'    },
    { indo: 'Buku',     eng: 'BOOK',     hint: '4 huruf, untuk membaca'            },
    { indo: 'Meja',     eng: 'TABLE',    hint: '5 huruf, tempat menaruh benda'     },
    { indo: 'Kursi',    eng: 'CHAIR',    hint: '5 huruf, untuk duduk'              },
    { indo: 'Pintu',    eng: 'DOOR',     hint: '4 huruf, untuk masuk rumah'        },
    { indo: 'Jendela',  eng: 'WINDOW',   hint: '6 huruf, lubang cahaya di dinding' },
    { indo: 'Pensil',   eng: 'PENCIL',   hint: '6 huruf, untuk menulis'            },
    { indo: 'Rumah',    eng: 'HOUSE',    hint: '5 huruf, tempat tinggal'           },
    { indo: 'Sekolah',  eng: 'SCHOOL',   hint: '6 huruf, tempat belajar'           },
    { indo: 'Pasar',    eng: 'MARKET',   hint: '6 huruf, tempat jual beli'         },
    { indo: 'Taman',    eng: 'PARK',     hint: '4 huruf, tempat bermain'           },
    { indo: 'Makan',    eng: 'EAT',      hint: '3 huruf, kegiatan makan'           },
    { indo: 'Tidur',    eng: 'SLEEP',    hint: '5 huruf, istirahat malam'          },
    { indo: 'Terbang',  eng: 'FLY',      hint: '3 huruf, seperti burung'           },
    { indo: 'Berlari',  eng: 'RUN',      hint: '3 huruf, bergerak cepat'           },
    { indo: 'Berenang', eng: 'SWIM',     hint: '4 huruf, bergerak di air'          },
    { indo: 'Melompat', eng: 'JUMP',     hint: '4 huruf, loncat ke atas'           },
    { indo: 'Membaca',  eng: 'READ',     hint: '4 huruf, melihat tulisan'          },
    { indo: 'Menulis',  eng: 'WRITE',    hint: '5 huruf, membuat tulisan'          },
    { indo: 'Matahari', eng: 'SUN',      hint: '3 huruf, bintang terdekat bumi'    },
    { indo: 'Hujan',    eng: 'RAIN',     hint: '4 huruf, air dari langit'          },
    { indo: 'Pohon',    eng: 'TREE',     hint: '4 huruf, tumbuhan besar'           },
    { indo: 'Bunga',    eng: 'FLOWER',   hint: '6 huruf, tumbuhan harum'           },
    { indo: 'Gunung',   eng: 'MOUNTAIN', hint: '8 huruf, daratan sangat tinggi'    },
    { indo: 'Laut',     eng: 'SEA',      hint: '3 huruf, air asin luas'            },
    { indo: 'Nasi',     eng: 'RICE',     hint: '4 huruf, makanan pokok Indonesia'  },
    { indo: 'Roti',     eng: 'BREAD',    hint: '5 huruf, makanan dari tepung'      },
    { indo: 'Susu',     eng: 'MILK',     hint: '4 huruf, minuman dari sapi'        },
    { indo: 'Air',      eng: 'WATER',    hint: '5 huruf, minuman paling penting'   },
  ];

  private readonly defaultGamePool: GameWord[] = [...this.allGamePool];

  vocabQuestions: VocabQuestion[] = [];
  gameWords: GameWord[] = [];

  vocabIndex = 0;
  vocabScore = 0;
  vocabAnswered = false;
  vocabResults: boolean[] = [];
  shuffledChoices: string[] = [];
  selectedAnswer = '';
  correctAnswer = '';
  vocabTimeLeft = 100;
  private vocabTimer: any;

  gameIndex = 0;
  gameScore = 0;
  gameCorrectCount = 0;
  gameInput = '';
  gameAnswered = false;
  gameTimeLeft = 100;
  gameCorrectThisRound = false;
  private gameTimer: any;
  hintBoxes: string[] = [];

  resultTitle = '';
  resultSub = '';
  resultTrophyIcon = '';
  resultCorrect = '';
  resultXp = '';
  resultAccuracy = '';
  resultReward = '';
  private resultMode: 'vocab' | 'game' = 'vocab';

  isGenerating = false;
  generateCooldownSec = 0;
  private cooldownTimer: any;

  // ✅ Sound effect
  private correctSound = new Audio('assets/sound/correct.wav');
  private wrongSound   = new Audio('assets/sound/wrong.wav');

  private readonly REQUEST_DELAY_MS = 3000;
  private readonly MAX_VOCAB_POOL = 200;
  private readonly MAX_GAME_POOL = 150;

  constructor(
    private router: Router,
    private gemini: GeminiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadUserName();
    this.loadState();
  }

  ionViewWillEnter() {
    this.loadUserName();
    this.loadState();
  }

  ngOnDestroy() {
    this.clearTimer();
    this.clearVocabTimer();
    this.clearCooldownTimer();
  }

  private getCurrentEmail(): string {
    return localStorage.getItem('email') || '';
  }

  loadState() {
    const email = this.getCurrentEmail();
    if (!email) return;
    const progress = this.authService.loadProgressForUser(email);
    if (progress) {
      this.xp            = progress.xp           ?? 0;
      this.streak        = progress.streak        ?? 0;
      this.totalCorrect  = progress.totalCorrect  ?? 0;
      this.totalAnswered = progress.totalAnswered ?? 0;
      if (progress.vocabPool && Array.isArray(progress.vocabPool) && progress.vocabPool.length) {
        this.allVocabPool = progress.vocabPool;
      } else {
        this.allVocabPool = [...this.defaultVocabPool];
      }
      if (progress.gamePool && Array.isArray(progress.gamePool) && progress.gamePool.length) {
        this.allGamePool = progress.gamePool;
      } else {
        this.allGamePool = [...this.defaultGamePool];
      }
      if (progress.lastPlayed) {
        const last = new Date(progress.lastPlayed);
        const today = new Date();
        const lastDate  = new Date(last.getFullYear(),  last.getMonth(),  last.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays  = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) this.streak = 0;
      }
    } else {
      this.xp = 0; this.streak = 0; this.totalCorrect = 0; this.totalAnswered = 0;
      this.allVocabPool = [...this.defaultVocabPool];
      this.allGamePool  = [...this.defaultGamePool];
    }
  }

  saveState() {
    const email = this.getCurrentEmail();
    if (!email) return;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const progress: UserProgress = {
      xp: this.xp, streak: this.streak,
      totalCorrect: this.totalCorrect, totalAnswered: this.totalAnswered,
      lastPlayed: todayDate.toISOString(),
      vocabPool: this.allVocabPool, gamePool: this.allGamePool,
    };
    this.authService.saveProgressForUser(email, progress);
  }

  // ✅ Helper putar sound
  private playSound(audio: HTMLAudioElement) {
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  get currentLevelIndex(): number {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (this.xp >= this.levels[i].xp) return i;
    }
    return 0;
  }
  get currentLevel() { return this.levels[this.currentLevelIndex]; }
  get levelProgress(): number {
    const lv = this.currentLevel;
    return Math.min(Math.round(((this.xp - lv.xp) / (lv.next - lv.xp)) * 100), 100);
  }
  get streakDays() {
    return this.days.map((d, i) => ({
      label: d,
      state: i < this.streak % 7 ? 'done' : i === this.streak % 7 ? 'today' : 'empty'
    }));
  }

  private loadUserName() {
    const n = localStorage.getItem('userName');
    const e = localStorage.getItem('email');
    if (n) this.nama = n;
    else if (e) this.nama = e.split('@')[0];
  }

  showHome() {
    this.clearTimer();
    this.clearVocabTimer();
    this.currentScreen = 'home';
  }
  goToProfil() { this.router.navigate(['/profil']); }
  logout()     { this.authService.logout(); }

  startVocab() {
    this.vocabQuestions = this.getRandomQuestions(this.allVocabPool, 10);
    if (!this.vocabQuestions.length) { this.showToast('Belum ada soal!', 'warning'); return; }
    this.vocabIndex = 0;
    this.vocabScore = 0;
    this.vocabResults = [];
    this.loadVocabQuestion();
    this.currentScreen = 'vocab';
  }

  loadVocabQuestion() {
    this.clearVocabTimer();
    const q = this.vocabQuestions[this.vocabIndex];
    this.shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5);
    this.selectedAnswer = '';
    this.correctAnswer = q.answer;
    this.vocabAnswered = false;
    this.vocabTimeLeft = 100;
    this.startVocabTimer();
  }

  startVocabTimer() {
    this.vocabTimer = setInterval(() => {
      this.vocabTimeLeft--;
      if (this.vocabTimeLeft <= 0) {
        this.clearVocabTimer();
        if (!this.vocabAnswered) {
          this.vocabAnswered = true;
          this.selectedAnswer = '';
          this.vocabResults.push(false);
          this.totalAnswered++;
          this.playSound(this.wrongSound); // ✅ sound salah saat timeout
        }
      }
    }, 150);
  }

  clearVocabTimer() {
    if (this.vocabTimer) { clearInterval(this.vocabTimer); this.vocabTimer = null; }
  }

  get currentVocabQ() { return this.vocabQuestions[this.vocabIndex]; }

  answerVocab(choice: string) {
    if (this.vocabAnswered) return;
    this.clearVocabTimer();
    this.vocabAnswered = true;
    this.selectedAnswer = choice;
    const correct = choice === this.correctAnswer;
    if (correct) {
      this.vocabScore += 10;
      this.totalCorrect++;
      this.playSound(this.correctSound); // ✅ sound benar
    } else {
      this.playSound(this.wrongSound); // ✅ sound salah
    }
    this.vocabResults.push(correct);
    this.totalAnswered++;
  }

  choiceClass(choice: string): string {
    if (!this.vocabAnswered) return '';
    if (choice === this.correctAnswer) return 'correct';
    if (choice === this.selectedAnswer) return 'wrong';
    return 'dimmed';
  }

  nextVocabQuestion() {
    this.clearVocabTimer();
    this.vocabIndex++;
    if (this.vocabIndex >= this.vocabQuestions.length) {
      this.showResult('vocab');
    } else {
      setTimeout(() => { this.loadVocabQuestion(); }, 100);
    }
  }

  startGame() {
    this.gameWords = this.getRandomQuestions(this.allGamePool, 8);
    if (!this.gameWords.length) { this.showToast('Belum ada kata game!', 'warning'); return; }
    this.gameIndex = 0;
    this.gameScore = 0;
    this.gameCorrectCount = 0;
    this.loadGameQuestion();
    this.currentScreen = 'game';
  }

  loadGameQuestion() {
    this.clearTimer();
    this.gameInput = '';
    this.gameAnswered = false;
    this.gameCorrectThisRound = false;
    this.gameTimeLeft = 100;
    this.updateHintBoxes();
    this.startTimer();
  }

  get currentGameQ() { return this.gameWords[this.gameIndex]; }

  updateHintBoxes() {
    const eng = this.currentGameQ.eng.toUpperCase();
    const input = this.gameInput.trim().toUpperCase();
    this.hintBoxes = Array.from({ length: eng.length }, (_, i) => input[i] || '');
  }

  onGameInput() {
    this.updateHintBoxes();
    const userInput = this.gameInput.trim().toUpperCase();
    if (userInput === this.currentGameQ.eng.trim().toUpperCase() && !this.gameAnswered)
      this.submitGame(true, false);
  }

  startTimer() {
    this.gameTimer = setInterval(() => {
      this.gameTimeLeft--;
      if (this.gameTimeLeft <= 0) { this.clearTimer(); this.submitGame(false, true); }
    }, 150);
  }

  clearTimer() {
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
  }

  submitGame(correct: boolean, timeout: boolean) {
    if (this.gameAnswered) return;
    this.gameAnswered = true;
    this.gameCorrectThisRound = correct;
    this.clearTimer();
    if (correct) {
      this.gameScore += 10 + Math.round(this.gameTimeLeft / 10);
      this.totalCorrect++;
      this.gameCorrectCount++;
      this.playSound(this.correctSound); // ✅ sound benar di game
    } else {
      this.playSound(this.wrongSound); // ✅ sound salah di game
    }
    this.totalAnswered++;
  }

  nextGameQuestion() {
    this.clearTimer();
    this.gameIndex++;
    if (this.gameIndex >= this.gameWords.length) {
      this.showResult('game');
    } else {
      setTimeout(() => { this.loadGameQuestion(); }, 100);
    }
  }

  private getRandomQuestions<T>(pool: T[], count: number): T[] {
    if (!pool.length) return [];
    const s = [...pool];
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    return s.slice(0, Math.min(count, s.length));
  }

  showResult(mode: 'vocab' | 'game') {
    this.clearVocabTimer();
    this.resultMode = mode;
    const total   = mode === 'vocab' ? this.vocabQuestions.length : this.gameWords.length;
    const correct = mode === 'vocab' ? this.vocabResults.filter(Boolean).length : this.gameCorrectCount;
    const score   = mode === 'vocab' ? this.vocabScore : this.gameScore;
    const xpGain  = Math.round(score * 0.5 + correct * 5);
    const acc     = Math.round((correct / total) * 100);

    this.xp += xpGain;

    const email = this.getCurrentEmail();
    const savedProgress = this.authService.loadProgressForUser(email);
    const lastPlayed = savedProgress?.lastPlayed ?? null;

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (lastPlayed) {
      const last = new Date(lastPlayed);
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        // sama hari, streak tidak berubah
      } else if (diffDays === 1) {
        this.streak = this.streak + 1;
      } else {
        this.streak = 1;
      }
    } else {
      this.streak = 1;
    }

    this.saveState();

    const titles   = ['Perlu Latihan Lagi','Lumayan!','Bagus!','Luar Biasa!','Sempurna!'];
    const trophies = ['😅','😊','👍','🎉','🏆'];
    const ti       = Math.min(Math.floor(acc / 25), 4);
    const reward   = [...this.rewards].filter(r => acc >= r.min).pop()!;

    this.resultTrophyIcon = trophies[ti];
    this.resultTitle      = titles[ti];
    this.resultSub        = `Kamu menjawab ${correct} dari ${total} soal dengan benar`;
    this.resultCorrect    = `${correct}/${total}`;
    this.resultXp         = `+${xpGain}`;
    this.resultAccuracy   = `${acc}%`;
    this.resultReward     = `${reward.icon} Reward: ${reward.name}`;
    this.currentScreen    = 'result';
  }

  replayMode() {
    if (this.resultMode === 'vocab') this.startVocab();
    else this.startGame();
  }

  async generateNewQuestions() {
    if (this.isGenerating) { await this.showToast('Sedang proses...', 'warning'); return; }
    if (this.generateCooldownSec > 0) { await this.showToast(`Tunggu ${this.generateCooldownSec}s lagi`, 'warning'); return; }
    if (this.allVocabPool.length >= this.MAX_VOCAB_POOL) { await this.showToast('Pool soal sudah penuh!', 'warning'); return; }

    const alert = await this.alertCtrl.create({
      header: '✨ Generate Soal dengan AI',
      subHeader: 'Powered by Groq (Llama 3.1)',
      inputs: [{ name: 'topic', type: 'text', placeholder: 'Topik: Animals, Food, Family...' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Generate', handler: (d) => this.doGenerate(d.topic) }
      ]
    });
    await alert.present();
  }

  private async doGenerate(topic: string) {
    this.isGenerating = true;
    const loading = await this.loadingCtrl.create({ message: 'Membuat soal vocab... (1/2)', spinner: 'crescent' });
    await loading.present();

    try {
      const newVocab = await this.gemini.generateVocabQuestions(topic).toPromise();
      if (newVocab?.length) {
        const available = this.MAX_VOCAB_POOL - this.allVocabPool.length;
        const toAdd = newVocab.slice(0, available).map(v => ({
          word: v.word, phonetic: v.phonetic, example: v.example, answer: v.answer, choices: v.choices
        }));
        this.allVocabPool = [...this.allVocabPool, ...toAdd];
      }

      if (this.allGamePool.length < this.MAX_GAME_POOL) {
        loading.message = 'Membuat kata game... (2/2)';
        await new Promise(r => setTimeout(r, this.REQUEST_DELAY_MS));
        const newGames = await this.gemini.generateGameWords(topic).toPromise();
        if (newGames?.length) {
          const available = this.MAX_GAME_POOL - this.allGamePool.length;
          const toAdd = newGames.slice(0, available).map(g => ({ indo: g.indo, eng: g.eng, hint: g.hint }));
          this.allGamePool = [...this.allGamePool, ...toAdd];
        }
      }

      this.saveState();
      await loading.dismiss();
      this.startCooldown(15);

      const playAlert = await this.alertCtrl.create({
        header: '✅ Soal Baru Siap!',
        message: `📚 Vocab pool: ${this.allVocabPool.length} soal\n🎮 Game pool: ${this.allGamePool.length} kata\n\nMau langsung main sekarang?`,
        buttons: [
          { text: 'Nanti', role: 'cancel' },
          { text: '📖 Tebak Arti', handler: () => { this.startVocab(); } },
          { text: '🎮 Susun Kata', handler: () => { this.startGame(); } }
        ]
      });
      await playAlert.present();

    } catch (error: any) {
      await loading.dismiss();
      if (error.status === 429) { await this.showToast('⚠️ Rate limit Groq. Tunggu sebentar lalu coba lagi.', 'warning'); this.startCooldown(30); }
      else if (error.status === 401) { await this.showToast('❌ API Key Groq tidak valid.', 'danger'); }
      else if (error instanceof SyntaxError) { await this.showToast('⚠️ Format JSON dari AI tidak valid. Coba lagi.', 'warning'); }
      else { await this.showToast('❌ Gagal generate soal. Periksa koneksi internet.', 'danger'); }
    } finally {
      this.isGenerating = false;
    }
  }

  private startCooldown(seconds: number) {
    this.generateCooldownSec = seconds;
    this.clearCooldownTimer();
    this.cooldownTimer = setInterval(() => {
      this.generateCooldownSec--;
      if (this.generateCooldownSec <= 0) this.clearCooldownTimer();
    }, 1000);
  }

  private clearCooldownTimer() {
    if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = null; }
  }

  get generateButtonLabel(): string {
    if (this.isGenerating) return '⏳ Generating...';
    if (this.generateCooldownSec > 0) return `⏱ Cooldown ${this.generateCooldownSec}s`;
    return '✨ Generate Soal Baru dengan AI';
  }

  get isGenerateDisabled(): boolean {
    return this.isGenerating || this.generateCooldownSec > 0;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const t = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    await t.present();
  }
}