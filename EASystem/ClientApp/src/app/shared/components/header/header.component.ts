import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  adminUserRole = "AdminUserRole";
  clientUserRole = "ClientUserRole";
  currentUser: any;
  userSubscription: Subscription;
  constructor(private router: Router, private auth: AuthService) {
    this.userSubscription = this.auth.$currentUser.subscribe(res => {
      this.currentUser = res;
      //if (this.auth.isLoggedIn() && this.auth.isInRole(this.aerodromeClientRole)) {
      //  this.url = this.baseUrl + 'api/getAerodromeClient/' + this.currentUser;
      //  this.appService.getAerodromeClientByUsername(this.url).subscribe((res: any) => {
      //    this.appService.$aerodromeOperatorId.next(res.aerodromeOperatorId);
      //  });
      //}
    }); 
  }

  ngOnInit() {
    const token = localStorage.getItem("auth");
    //if (token) {
    //  const tokenPayLoad = jwt_decode(token);
    //  const user = tokenPayLoad['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    //  if (this.auth.isLoggedIn()) {
    //    //const url = this.baseUrl + 'api/getAerodromeClient/' + user;
    //    //this.appService.getAerodromeClientByUsername(url).subscribe((res: any) => {
    //    //  this.aerodromeOperatorId = res.aerodromeOperatorId;
    //    //});
    //  }
    //}
    this.getAuthenticatedUser();
  }

  getAuthenticatedUser() {
    const token = localStorage.getItem("auth");
    if (token) {
      const tokenPayLoad = jwt_decode(token);
      const user = tokenPayLoad['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      this.auth.$currentUser.next(user);
    }
  }

  toggleSideBar() {
    this.toggleSideBarForMe.emit();
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();   
  }

  logout(): boolean {
    //logs out the user ,then redirects him to Home view page
    if (this.auth.logout()) {
      this.auth.$currentUser.next(null);      
      //Redirections
      this.router.navigate([""]);      
    }
    return false;
  }
}
