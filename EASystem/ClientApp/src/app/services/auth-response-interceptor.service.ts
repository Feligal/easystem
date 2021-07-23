import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
@Injectable()
export class AuthResponseInterceptorService implements HttpInterceptor {
  currentRequest: HttpRequest<any>;
  auth: AuthService;
  constructor(
    private injector: Injector,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {
    this.auth = this.injector.get(AuthService);
    const token = (this.auth.isLoggedIn()) ? this.auth.getAuth()!.token : null;
    if (token) {
      //Save current request
      this.currentRequest = request;
      return next.handle(request).do((event: HttpEvent<any>) => {
        if ((event instanceof HttpResponse)) {
          //Do nothing
        }
      }).catch(error => {
        return this.handleError(error);
      });
    } else {
      return next.handle(request);
    }
  }

  handleError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        //JWT token might be expired
        //try to get a new one using refresh token
        console.log("Token expired. Attempting refresh...");
        this.auth.refreshToken().subscribe(res => {
          if (res) {
            //Refresh token successfull
            console.log("Refresh token successful")
            //re-submit the failed request
            const http = this.injector.get(HttpClient);
            http.request(this.currentRequest).subscribe((result) => {
              //do something
            }, error => {
              console.error(error);
            })
          } else {
            //refresh token failed
            console.log("Refresh token failed");
            //Erase current token
            this.auth.logout();
            //Redirect to login page
            this.router.navigate(['login']);
          }
        }, error => console.log(error));
      }
    }
    return Observable.throw(error);
  }
}
