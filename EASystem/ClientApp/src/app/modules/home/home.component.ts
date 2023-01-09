import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import * as jwt_decode from 'jwt-decode';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  company: any;
  currentUser: any;
  userSubscription: Subscription;
  constructor(
    private appService: ApplicationService,
    private authService: AuthService) {
    this.userSubscription = this.authService.$currentUser.subscribe(res => {
      this.currentUser = res;
    });
  }

  ngOnInit() {
    this.appService.getCompanyInformation().subscribe((res: any) => {
      this.company = res[0];
    })
    if (this.authService.isLoggedIn()) {
      const token = localStorage.getItem("auth");
      const tokenPayLoad = jwt_decode(token);
      const user = tokenPayLoad['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      this.authService.$currentUser.next(user);
    }
  }

}
