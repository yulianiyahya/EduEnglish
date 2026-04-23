import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
  profileImage: string | null = null; // base64 atau path
  totalXP: number = 0;
  totalCorrect: number = 0;
  totalQuestions: number = 0;
  streakDays: number = 0;
  dailyTarget: number = 10;
  notifActive: boolean = true;

  // ─── Level System ───────────────────────────────────
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
    private alertCtrl: AlertController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadProfileImage();
  }

  ionViewWillEnter() {
    this.loadUserData();
    this.loadProfileImage();
  }

  // ─── Load data dari localStorage ────────────────────
  private loadUserData() {
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

    this.totalXP        = Number(localStorage.getItem('eng_xp'))      || 0;
    this.streakDays     = Number(localStorage.getItem('eng_streak'))   || 0;
    this.totalCorrect   = Number(localStorage.getItem('eng_correct'))  || 0;
    this.totalQuestions = Number(localStorage.getItem('eng_total'))    || 0;

    const savedTarget = localStorage.getItem('dailyTarget');
    if (savedTarget) this.dailyTarget = parseInt(savedTarget);
  }

  private updateInitials(name: string) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      this.userInitials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      this.userInitials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  // ─── Foto Profil ─────────────────────────────────────
  private async loadProfileImage() {
    const savedImage = localStorage.getItem('profile_image');
    if (savedImage) {
      this.profileImage = savedImage;
    }
  }

  private saveProfileImage(base64Data: string) {
    localStorage.setItem('profile_image', base64Data);
    this.profileImage = base64Data;
  }

  async changeProfilePhoto() {
    const alert = await this.alertCtrl.create({
      header: 'Foto Profil',
      message: 'Pilih sumber gambar',
      buttons: [
        {
          text: 'Kamera',
          handler: () => this.takePhoto(CameraSource.Camera)
        },
        {
          text: 'Galeri',
          handler: () => this.takePhoto(CameraSource.Photos)
        },
        {
          text: 'Hapus Foto',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('profile_image');
            this.profileImage = null;
          }
        },
        {
          text: 'Batal',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  private async takePhoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: true,
        resultType: CameraResultType.Base64, // base64 langsung
        source: source
      });

      if (image && image.base64String) {
        const base64Data = `data:image/jpeg;base64,${image.base64String}`;
        this.saveProfileImage(base64Data);
      }
    } catch (error) {
      console.error('Gagal mengambil foto', error);
    }
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
        { text: 'Batal', role: 'cancel' },
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
        { text: 'Batal', role: 'cancel' },
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
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          role: 'destructive',
          handler: () => {
            this.authService.logout(); // sudah menggunakan logout yang benar
          }
        }
      ]
    });
    await alert.present();
  }

  // ─── Getter untuk level ──────────────────────────────
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
}