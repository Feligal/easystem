import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TokenResponse } from '../interface/token.response';
import * as jwt_decode from 'jwt-decode';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class AuthService {
  private returnUrl: string;

  $currentUser = new Subject<string>();
  userAccessRole = [];
  roles = [];
  loggedIn = false;
  authKey = "auth";
  clientId = "eyJzdWIiOiI1MzVmZDI1YS04NDlkLTQwZWYtOTAxOS0xZjZkM2M5NWEyOTMiLCJqdGkiOiJlMmMzNTE5Yy0wNGMwLTQ1N2UtO";
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject('BASE_URL') private baseUrl: string
  ) { }

  login(username: string, password: string): Observable<boolean> {
    const url = this.baseUrl + 'api/token/auth';
    const data = {
      username: username,
      password: password,
      clientId: this.clientId,
      //required when signing up with username/password
      grantType: 'password',
      //space-separated list of scope for which the token is issued
      scope: 'offline_access profile email'
    }
    return this.getAuthFromServer(url, data);
  }

  logout(): boolean {
    this.setAuth(null);
    return true;
  }

  refreshToken(): Observable<boolean> {
    const url = this.baseUrl + 'api/token/auth';
    const data = {
      clientId: this.clientId,
      //Required when  signing up with username/password
      grantType: 'refreshToken',
      refreshToken: this.getAuth()!.refreshToken,
      scope: 'offline_access profile email'
    }
    return this.getAuthFromServer(url, data);
  }
  //Retrieve the access and refresh tokens from the server
  getAuthFromServer(url: string, data): Observable<boolean> {
    return this.httpClient.post<TokenResponse>(url, data).pipe(map((res:any) => {
      //check if the returned object has is2StepVerificationRequired
      if (res.is2StepVerificationRequired) {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';        
        this.router.navigate(['/login/twostepverification'],
          { queryParams: { returnUrl: this.returnUrl, provider: res.provider, email: data.username } });
      }

      const token = res && res.token;
      //If the token  is there , login  has been successful
      if (token) {
        //store username and jwt  token
        this.setAuth(res);
        //successful login        
        const tokenPayLoad = jwt_decode(token);
        const user = tokenPayLoad['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        this.$currentUser.next(user);
        return true;
      } else {
        Observable.throw('Unauthorized');
        return false
      }
    }), tap(null, (err: HttpErrorResponse) => {
      console.log(err.status);
    }));
  }

  //Persist auth in localStorage or remove it if a NULL argument is given
  setAuth(auth: TokenResponse | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (auth) {
        localStorage.setItem(this.authKey, JSON.stringify(auth))
      } else {
        localStorage.removeItem(this.authKey);        
      }
    }
    return true;
  }
  //Retrieves the auth JSON object(or NULL if none)
  getAuth(): TokenResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const i = localStorage.getItem(this.authKey);
      if (i) {
        return JSON.parse(i);
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.authKey) !== null;
    }
    return false;
  }
  getAccessUserRole() {
    if (this.isLoggedIn()) {
      const token = localStorage.getItem("auth");
      const tokenPayLoad = jwt_decode(token);
      this.userAccessRole = tokenPayLoad['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return this.userAccessRole;
    } else {
      return [];
    }
  }

  isInRole(roleName: string) {
    const currentToken = localStorage.getItem("auth");
    if (currentToken) {
      const tokenPayLoad = jwt_decode(currentToken);
      this.roles = tokenPayLoad['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return this.roles.indexOf(roleName) > -1;
    }
    return false;
  }


  changeUserPassword(userId, data) {
    const url = this.baseUrl + 'api/changePassword/' + userId;
    return this.httpClient.put(url, data);
  }

  resetPassword(data) {
    const url = this.baseUrl + "api/forgotPassword/"
    return this.httpClient.put(url, data);
  }

  twoStepLogin(data) {
    const url = this.baseUrl + "api/twostepverification"
    return this.httpClient.post(url, data);
  }

  enableTwoFactorAuthentication(data: any) {
    const url = this.baseUrl + "api/enable2Factorverification/";
    return this.httpClient.post(url, data);
  }

  adminEnableTwoFactorAuthentication(userId , data: any) {
    const url = this.baseUrl + "api/enable2Factorverification/" + userId;
    return this.httpClient.post(url, data);
  }

  getTwoFactorAuthentication() {
    const url = this.baseUrl + "api/twofactorverification/";
    return this.httpClient.get(url);
  }
}
