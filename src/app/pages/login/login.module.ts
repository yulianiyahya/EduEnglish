import { NgModule } from '@angular/core';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

@NgModule({
  imports: [
    LoginPage,           // ✅ standalone component → masuk ke imports, BUKAN declarations
    LoginPageRoutingModule
  ]
  // ✅ HAPUS: CommonModule, FormsModule, IonicModule
  //    karena sudah di-import langsung di LoginPage (standalone)
})
export class LoginPageModule {}