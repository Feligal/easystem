import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenResponse } from '../../interface/token.response';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import * as jwt_decode from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.component.html',
  styleUrls: ['./two-step-verification.component.scss']
})
export class TwoStepVerificationComponent implements OnInit {
  myForm: FormGroup;
  $currentUser = new Subject<string>();
  public showError: boolean;
  public errorMessage: string;
  private provider: string;
  private email: string;
  private returnUrl: string;


  twoFactorData = {
    email:'',
    provider:'',
    token: '',
    clientId:''
  }
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject('BASE_URL') private baseUrl: string,
    private appService: ApplicationService,
    private uiService: UiService,    
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.provider = this.route.snapshot.queryParams['provider'];
    this.email = this.route.snapshot.queryParams['email'];
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];    
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  createForm() {
    this.myForm = this.fb.group({
      twoFactorCode: ['', [Validators.required, Validators.maxLength(6)]],      
    })
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }


  onSubmit() {    
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.twoFactorData.email = this.email;
    this.twoFactorData.provider = this.provider;
    this.twoFactorData.token = this.myForm.value.twoFactorCode;
    this.twoFactorData.clientId = this.authService.clientId;    

    this.authService.twoStepLogin(this.twoFactorData).subscribe((res: any) => {
      dialogRef.close();
      const token = res && res.token;
      //If the token  is there , login  has been successful
      if (token) {
        //store username and jwt  token
        this.setAuth(res);
        //successful login        
        const tokenPayLoad = jwt_decode(token);
        const user = tokenPayLoad['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        this.authService.$currentUser.next(user);
        this.router.navigate([this.returnUrl]);
        return true;
      } else {
        Observable.throw('Unauthorized');
        return false
      }
    }, error => {
        dialogRef.close();
        this.myForm.setErrors({
          "authError": "Invalid Token Verification."
      });
    })
  }

  setAuth(auth: TokenResponse | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (auth) {
        localStorage.setItem(this.authService.authKey, JSON.stringify(auth))
      } else {
        localStorage.removeItem(this.authService.authKey);
      }
    }
    return true;
  }

}
