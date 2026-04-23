import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface UserAccount {
  nama: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthUser {
  nama: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'auth_users';
  private readonly SESSION_KEY = 'auth_session';

  constructor(private router: Router) {
    this.checkStorageIntegrity();
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const salted = `eu_${hash}_${input.length}_salt2025`;
    return btoa(salted);
  }

  private getUsers(): UserAccount[] {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.error('[AuthService] Data auth_users corrupt (bukan array), akan direset');
        return [];
      }
      return parsed;
    } catch (err) {
      console.error('[AuthService] Gagal baca users:', err);
      return [];
    }
  }

  private saveUsers(users: UserAccount[]): void {
    if (!Array.isArray(users)) {
      console.error('[AuthService] saveUsers gagal: parameter bukan array', users);
      return;
    }
    if (users.length === 0) {
      console.warn('[AuthService] Mencoba menyimpan array kosong! Abaikan.');
      return;
    }
    const toStore = JSON.stringify(users);
    localStorage.setItem(this.USERS_KEY, toStore);
    console.log('[AuthService] saveUsers() - menyimpan', users.length, 'user(s)');
    const saved = localStorage.getItem(this.USERS_KEY);
    console.log('[AuthService] Verifikasi setelah simpan:', saved);
  }

  public resetAllUsers(): void {
    console.warn('[AuthService] RESET ALL USERS dipanggil!');
    localStorage.removeItem(this.USERS_KEY);
  }

  register(nama: string, email: string, password: string): { success: boolean; message: string } {
    console.log('[AuthService] Register dipanggil untuk email:', email);
    let users = this.getUsers();

    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email sudah terdaftar. Gunakan email lain.' };
    }

    const newUser: UserAccount = {
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: this.simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Akun berhasil dibuat!' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    console.log('[AuthService] Login dipanggil untuk email:', email);
    const users = this.getUsers();

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      return { success: false, message: 'Email tidak ditemukan/password salah.' };
    }

    const inputHash = this.simpleHash(password);
    if (user.passwordHash !== inputHash) {
      return { success: false, message: 'Password salah. Coba lagi.' };
    }

    const session: AuthUser = { nama: user.nama, email: user.email };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('email', user.email);
    localStorage.setItem('userName', user.nama);
    return { success: true, message: `Selamat datang, ${user.nama}!` };
  }

  // ✅ NEW: Cek apakah email sudah terdaftar (untuk forgot password)
  isEmailRegistered(email: string): boolean {
    const users = this.getUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  // ✅ NEW: Reset password berdasarkan email
  resetPassword(email: string, newPassword: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (idx === -1) {
      return { success: false, message: 'Email tidak ditemukan.' };
    }

    users[idx].passwordHash = this.simpleHash(newPassword);
    this.saveUsers(users);
    console.log('[AuthService] Password berhasil direset untuk:', email);
    return { success: true, message: 'Password berhasil diperbarui.' };
  }

  logout(): void {
    console.log('[AuthService] Logout dipanggil');
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  isLoggedIn(): boolean {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw) as AuthUser;
      return !!session?.email;
    } catch {
      return false;
    }
  }

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  validateEmail(email: string): string | null {
    if (!email.trim()) return 'Email tidak boleh kosong.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Format email tidak valid.';
    return null;
  }

  validatePassword(password: string): string | null {
    if (!password) return 'Password tidak boleh kosong.';
    if (password.length < 6) return 'Password minimal 6 karakter.';
    return null;
  }

  validateNama(nama: string): string | null {
    if (!nama.trim()) return 'Nama tidak boleh kosong.';
    if (nama.trim().length < 2) return 'Nama minimal 2 karakter.';
    return null;
  }

  private checkStorageIntegrity(): void {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (raw && !Array.isArray(JSON.parse(raw))) {
      console.error('[AuthService] Storage corrupt, reset!');
      localStorage.removeItem(this.USERS_KEY);
    }
  }

  debugPrintAllStorage(): void {
    console.log('=== SEMUA ISI localStorage ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) console.log(`${key} =`, localStorage.getItem(key));
    }
  }

  debugListUsers(): void {
    const raw = localStorage.getItem(this.USERS_KEY);
    console.log('[AuthService] Raw storage (auth_users):', raw);
    const users = this.getUsers();
    if (users.length === 0) {
      console.warn('[AuthService] ⚠️ TIDAK ADA USER di storage!');
    } else {
      users.forEach((u, i) => {
        console.log(`[AuthService] User ${i + 1}: email="${u.email}" | hash="${u.passwordHash}"`);
      });
    }
  }

  debugCheckLogin(email: string, password: string): void {
    const users = this.getUsers();
    const trimmedEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    console.log('[AuthService] === debugCheckLogin ===');
    console.log('[AuthService] Mencari email:', trimmedEmail);
    console.log('[AuthService] Total user di storage:', users.length);
    if (!user) { console.warn('[AuthService] ❌ User TIDAK DITEMUKAN'); return; }
    const inputHash = this.simpleHash(password);
    const isMatch = inputHash === user.passwordHash;
    console.log('[AuthService] ✅ User ditemukan:', user.email);
    console.log('[AuthService] Hash input   :', inputHash);
    console.log('[AuthService] Hash storage :', user.passwordHash);
    console.log('[AuthService] Match?', isMatch ? '✅ MATCH' : '❌ TIDAK MATCH');
  }
}