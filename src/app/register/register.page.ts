import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class RegisterPage implements OnInit {

  nama            = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  showPassword        = false;
  showConfirmPassword = false;

  namaError            = '';
  emailError           = '';
  passwordError        = '';
  confirmPasswordError = '';

  constructor(
    private authService:  AuthService,
    private router:       Router,
    private toastCtrl:    ToastController,
    private loadingCtrl:  LoadingController,
  ) {}

  ngOnInit() {
    // Debug: lihat isi storage saat halaman register dibuka
    console.log('=== [RegisterPage] ngOnInit ===');
    this.authService.debugListUsers();

    if (this.authService.isLoggedIn()) {
      console.log('[RegisterPage] Session aktif, redirect ke dashboard');
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }
  }

  togglePassword()        { this.showPassword        = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onNamaChange()    { this.namaError    = this.authService.validateNama(this.nama)   ?? ''; }
  onEmailChange()   { this.emailError   = this.authService.validateEmail(this.email) ?? ''; }
  onPasswordChange() {
    this.passwordError = this.authService.validatePassword(this.password) ?? '';
    if (this.confirmPassword) {
      this.confirmPasswordError = this.password !== this.confirmPassword ? 'Password tidak cocok.' : '';
    }
  }
  onConfirmPasswordChange() {
    this.confirmPasswordError = this.password !== this.confirmPassword ? 'Password tidak cocok.' : '';
  }

  async register() {
    // Reset error
    this.namaError = this.emailError = this.passwordError = this.confirmPasswordError = '';

    // Validasi
    const namaErr     = this.authService.validateNama(this.nama);
    const emailErr    = this.authService.validateEmail(this.email);
    const passwordErr = this.authService.validatePassword(this.password);

    if (namaErr)     { this.namaError     = namaErr;     return; }
    if (emailErr)    { this.emailError    = emailErr;    return; }
    if (passwordErr) { this.passwordError = passwordErr; return; }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Password tidak cocok.';
      return;
    }

    // Debug sebelum register: tampilkan semua user yang ada
    console.log('=== [RegisterPage] Sebelum register ===');
    this.authService.debugListUsers();

    const loading = await this.loadingCtrl.create({
      message: 'Membuat akun...',
      spinner:  'crescent',
      cssClass: 'custom-loading',
    });
    await loading.present();

    await new Promise(r => setTimeout(r, 800));

    const result = this.authService.register(this.nama, this.email, this.password);

    await loading.dismiss();

    // Debug setelah register: lihat apakah user baru tersimpan
    console.log('=== [RegisterPage] Setelah register ===');
    this.authService.debugListUsers();
    // Cetak semua isi localStorage untuk investigasi lebih lanjut
    this.authService.debugPrintAllStorage();

    if (result.success) {
      await this.showToast(result.message, 'success');
      console.log('[RegisterPage] Register sukses, pindah ke login');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } else {
      await this.showToast(result.message, 'danger');
      if (result.message.toLowerCase().includes('email')) {
        this.emailError = result.message;
      }
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      cssClass:  'custom-toast',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }
}