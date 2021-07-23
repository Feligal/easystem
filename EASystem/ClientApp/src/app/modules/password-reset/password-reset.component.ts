import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';


@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  myForm: FormGroup;
  hide = true;

  resetCredentials = {
    token: '',
    email: '',
    newPassword: '',
    passwordConfirm: ''
  }
  constructor(    
    private appService: ApplicationService,
    private uiService: UiService,
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog) {
    this.createForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((res: Params) => {
      this.myForm.patchValue({
        email: res['email'],
        token: res['token']
      })
    })
  }

  createForm() {
    this.myForm = this.fb.group({
      token: ['', [Validators.required]],
      email: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]],
      passwordConfirm: ['', [Validators.required]],
    }, { validators: this.passwordConfirmValidator });


  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  hasMismatchError(name: string) {
    let e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  passwordConfirmValidator(control: FormControl) {
    let p = control.root.get('newPassword');
    let pc = control.root.get('passwordConfirm');
    if (p && pc) {
      if (p.value !== pc.value) {
        pc.setErrors({
          'PasswordwordMismatch': true
        })
      } else {
        pc.setErrors(null);
      }
    }
    return null;
  }


  onSubmit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.resetCredentials.email = this.myForm.value.email;
    this.resetCredentials.token = this.myForm.value.token;
    this.resetCredentials.newPassword = this.myForm.value.newPassword;
    this.resetCredentials.passwordConfirm = this.myForm.value.passwordConfirm;    
    this.authService.resetPassword(this.resetCredentials).subscribe(res => {
      dialogRef.close();
      this.authService.logout();
      this.uiService.showSnackBarNotification("Password was successfully updated, please login with your new password.", null, 3000, 'top', 'success-notification');
      this.router.navigate(['confirmpassreset', true]);
    }, error => {
      //Login fails
      dialogRef.close();
      console.log(error);
      this.myForm.setErrors({
        "authError": "Reset failed, try again later."
      });
    });
  }
}
