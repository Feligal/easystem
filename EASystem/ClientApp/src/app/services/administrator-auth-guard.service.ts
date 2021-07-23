import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

@Injectable()
export class AdministratorAuthGuardService extends AuthGuardService{
  adminUserRole = "AdminUserRole";
  constructor(authService: AuthService, router: Router) {
    super(authService, router);
  }
  canActivate() {
    const isAuthentincated = super.canActivate();
    if (isAuthentincated) {
      if (this.authService.getAccessUserRole().indexOf(this.adminUserRole) > -1) {
        return true;
      } else {
        this.router.navigate(['login']);
        return false;
      }
    }
  }
}
