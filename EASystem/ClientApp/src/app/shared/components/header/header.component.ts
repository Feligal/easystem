import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isActive = false;
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  adminUserRole = "AdminUserRole";
  clientUserRole = "ClientUserRole";
  applicationCounter;
  currentUser: any;
  isTwoFactor: any;
  userSubscription: Subscription;
  counterSubscription: Subscription;
  $counterSubject = new Subject<any>();
  constructor(
    private router: Router,
    private auth: AuthService,
    private appService: ApplicationService, private authService: AuthService) {    
  }

  ngOnInit() {    
    this.userSubscription = this.auth.$currentUser.subscribe(res => {
      this.currentUser = res;
    }); 

    this.getAuthenticatedUser();
    if (this.auth.isLoggedIn() && this.auth.isInRole(this.adminUserRole)) {
      this.counterSubscription = this.$counterSubject.subscribe(res => {
        this.applicationCounter = res;
      });
      const _this = this;
      setInterval(function () {
        if (_this.auth.isLoggedIn() && _this.auth.isInRole(_this.adminUserRole)) {
          _this.appService.getApplications().subscribe((res:any[]) => {
            const applications = res.filter(x => x.isOpened === false)
            _this.$counterSubject.next(applications.length);
          });
        }
      }, 20000);
    }
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
