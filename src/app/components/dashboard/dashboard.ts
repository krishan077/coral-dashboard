import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  coral_user = localStorage.getItem('coral_user') ? JSON.parse(localStorage.getItem('coral_user')!) : null;

  collapsed = signal(false);
  constructor(private _auth: Auth, private _router: Router){

  }

  showUserMenu = signal(false);
  
  logout() {
    localStorage.removeItem('token');
    this._router.navigate(['/'])

  }
}
