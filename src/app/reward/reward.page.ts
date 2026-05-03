import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

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
    { icon: '🎉', name: 'Hari Pertama',   desc: 'Selesaikan 1 sesi belajar',     req: () => this.totalAnswered >= 1  },
    { icon: '🔥', name: '3 Hari Streak',  desc: 'Belajar 3 hari berturut-turut', req: () => this.streak >= 3         },
    { icon: '⭐', name: 'Bintang Kelas',  desc: 'Jawab 10 soal dengan benar',    req: () => this.totalCorrect >= 10  },
    { icon: '🎯', name: 'Akurasi 50%',    desc: 'Raih akurasi minimal 50%',      req: () => this.accuracy >= 50      },
    { icon: '🥇', name: 'Medali Emas',    desc: 'Raih akurasi minimal 75%',      req: () => this.accuracy >= 75      },
    { icon: '💎', name: 'Berlian',        desc: 'Raih akurasi minimal 90%',      req: () => this.accuracy >= 90      },
    { icon: '🏆', name: '7 Hari Streak',  desc: 'Belajar 7 hari berturut-turut', req: () => this.streak >= 7         },
    { icon: '👑', name: 'Level Master',   desc: 'Kumpulkan 1400 XP',             req: () => this.xp >= 1400          },
  ];

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

  // ✅ FIX: tambah AuthService di constructor
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadState();
  }

  ionViewWillEnter() {
    this.loadState();
  }

  // ✅ FIX: baca dari progress per-akun (sama seperti dashboard)
  loadState() {
    const email = localStorage.getItem('email');
    if (!email) return;

    const progress = this.authService.loadProgressForUser(email);
    if (progress) {
      this.xp            = progress.xp            ?? 0;
      this.streak        = progress.streak         ?? 0;
      this.totalCorrect  = progress.totalCorrect   ?? 0;
      this.totalAnswered = progress.totalAnswered  ?? 0;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}