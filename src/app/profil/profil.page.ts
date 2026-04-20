import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface Level {
  name: string;
  minXP: number;
  maxXP: number;
  badge: string;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ProfilPage implements OnInit {

  // ─── Data Pengguna ──────────────────────────────────
  userName: string = '';
  userInitials: string = '';
  totalXP: number = 0;
  totalCorrect: number = 0;
  totalQuestions: number = 0;
  streakDays: number = 0;
  dailyTarget: number = 10;
  notifActive: boolean = true;

  // ─── Level System (DISINKRONKAN dengan dashboard) ───
  levels: Level[] = [
    { name: 'Pemula',   minXP: 0,    maxXP: 100,  badge: '🌱 Level 1' },
    { name: 'Dasar',    minXP: 100,  maxXP: 250,  badge: '📗 Level 2' },
    { name: 'Menengah', minXP: 250,  maxXP: 500,  badge: '⭐ Level 3' },
    { name: 'Mahir',    minXP: 500,  maxXP: 900,  badge: '🔥 Level 4' },
    { name: 'Ahli',     minXP: 900,  maxXP: 1400, badge: '🏆 Level 5' },
    { name: 'Master',   minXP: 1400, maxXP: 99999, badge: '💎 Level 6' },
  ];

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  // Reload data setiap kali halaman dikunjungi
  ionViewWillEnter() {
    this.loadUserData();
  }

  // ─── Load data dari localStorage ────────────────────
  private loadUserData() {
    // Nama user
    const savedName = localStorage.getItem('userName');
    const email = localStorage.getItem('email');
    if (savedName) {
      this.userName = savedName;
      this.updateInitials(savedName);
    } else if (email) {
      const nameFromEmail = email.split('@')[0];
      this.userName = nameFromEmail;
      this.updateInitials(nameFromEmail);
    }

    // Statistik — KEY SAMA dengan dashboard.page.ts
    this.totalXP        = Number(localStorage.getItem('eng_xp'))      || 0;
    this.streakDays     = Number(localStorage.getItem('eng_streak'))   || 0;
    this.totalCorrect   = Number(localStorage.getItem('eng_correct'))  || 0;
    this.totalQuestions = Number(localStorage.getItem('eng_total'))    || 0;

    // Target harian
    const savedTarget = localStorage.getItem('dailyTarget');
    if (savedTarget) this.dailyTarget = parseInt(savedTarget);
  }

  // ─── Update inisial dari nama ────────────────────────
  private updateInitials(name: string) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      this.userInitials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      this.userInitials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  get currentLevel(): Level {
    return (
      this.levels.find(l => this.totalXP >= l.minXP && this.totalXP < l.maxXP)
      || this.levels[this.levels.length - 1]
    );
  }

  get levelProgress(): number {
    const lvl = this.currentLevel;
    return Math.round(((this.totalXP - lvl.minXP) / (lvl.maxXP - lvl.minXP)) * 100);
  }

  get accuracy(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.totalCorrect / this.totalQuestions) * 100);
  }

  // ─── Edit Profil (nama) ──────────────────────────────
  async editProfil() {
    const alert = await this.alertCtrl.create({
      header: 'Edit Nama',
      inputs: [
        {
          name: 'nama',
          type: 'text',
          placeholder: 'Masukkan nama kamu',
          value: this.userName
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Simpan',
          handler: (data): boolean => {
            const newName = data.nama?.trim();
            if (!newName) return false;
            this.userName = newName;
            this.updateInitials(newName);
            localStorage.setItem('userName', newName);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // ─── Edit Target Harian ──────────────────────────────
  async editTarget() {
    const alert = await this.alertCtrl.create({
      header: 'Target Harian',
      inputs: [
        {
          name: 'target',
          type: 'number',
          placeholder: 'Jumlah soal per hari',
          value: this.dailyTarget
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Simpan',
          handler: (data): boolean => {
            const newTarget = parseInt(data.target);
            if (!newTarget || newTarget < 1) return false;
            this.dailyTarget = newTarget;
            localStorage.setItem('dailyTarget', newTarget.toString());
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  toggleNotif() {
    this.notifActive = !this.notifActive;
  }

  // ─── Keluar ──────────────────────────────────────────
  async keluar() {
    const alert = await this.alertCtrl.create({
      header: 'Keluar',
      message: 'Apakah kamu yakin ingin keluar?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Keluar',
          role: 'destructive',
          handler: () => {
            localStorage.clear();
            this.router.navigateByUrl('/home', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
}