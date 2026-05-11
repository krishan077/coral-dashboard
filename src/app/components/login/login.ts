import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isHovered = false;
  loginForm !: FormGroup

  constructor(private router: Router, private authService: Auth, private _fb: FormBuilder, private _api: Api) {
    this.validation();
  }

  onSubmit() {
    if(this.loginForm?.valid){
      ////console.log(this.loginForm.value);
      
      this._api.postDataNodeApi('login', this.loginForm.value).subscribe((response: any)=>{
        if(!response.error){
          this.authService.login(response.data.token);
          localStorage.setItem('comp_id', response.data.comp_id)
          this.router.navigate(['/dashboard']);
        }else{
          ////console.log(response.message);
          
        }
      })
    }
  }

  validation(){
    this.loginForm = this._fb.group({
    company_email: ['', Validators.compose([Validators.email, Validators.required])],
    company_password: ['', Validators.required]
    })
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
