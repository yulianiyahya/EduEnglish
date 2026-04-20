import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reward',
  templateUrl: './reward.page.html',
  styleUrls: ['./reward.page.scss'],
  standalone: false,
})
export class RewardPage implements OnInit {

  xp = 0;
  totalCorrect = 0;
  totalAnswered = 0;
  streak = 0;

  get accuracy(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.totalCorrect / this.totalAnswered) * 100);
  }

  badges = [
    { icon: '🎉', name: 'Hari Pertama',   desc: 'Selesaikan 1 sesi belajar',     req: () => this.totalAnswered >= 1         },
    { icon: '🔥', name: '3 Hari Streak',  desc: 'Belajar 3 hari berturut-turut', req: () => this.streak >= 3                },
    { icon: '⭐', name: 'Bintang Kelas',  desc: 'Jawab 10 soal dengan benar',    req: () => this.totalCorrect >= 10         },
    { icon: '🎯', name: 'Akurasi 50%',    desc: 'Raih akurasi minimal 50%',      req: () => this.accuracy >= 50             },
    { icon: '🥇', name: 'Medali Emas',    desc: 'Raih akurasi minimal 75%',      req: () => this.accuracy >= 75             },
    { icon: '💎', name: 'Berlian',        desc: 'Raih akurasi minimal 90%',      req: () => this.accuracy >= 90             },
    { icon: '🏆', name: '7 Hari Streak',  desc: 'Belajar 7 hari berturut-turut', req: () => this.streak >= 7                },
    { icon: '👑', name: 'Level Master',   desc: 'Kumpulkan 1400 XP',             req: () => this.xp >= 1400                 },
  ];

  levels = [
    { name: 'Pemula',   xp: 0,    next: 100   },
    { name: 'Dasar',    xp: 100,  next: 250   },
    { name: 'Menengah', xp: 250,  next: 500   },
    { name: 'Mahir',    xp: 500,  next: 900   },
    { name: 'Ahli',     xp: 900,  next: 1400  },
    { name: 'Master',   xp: 1400, next: 99999 },
  ];

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

  get unlockedCount(): number {
    return this.badges.filter(b => b.req()).length;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadState();
  }

  ionViewWillEnter() {
    this.loadState();
  }

  loadState() {
    this.xp            = Number(localStorage.getItem('eng_xp'))      || 0;
    this.streak        = Number(localStorage.getItem('eng_streak'))   || 0;
    this.totalCorrect  = Number(localStorage.getItem('eng_correct'))  || 0;
    this.totalAnswered = Number(localStorage.getItem('eng_total'))    || 0;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}