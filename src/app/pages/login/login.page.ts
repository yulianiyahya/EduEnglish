import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.email && this.password) {
      localStorage.setItem('email', this.email);
      this.router.navigate(['/dashboard']);
    } else {
      alert('Email dan password tidak boleh kosong!');
    }
  }

}