import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import * as jwt_decode from 'jwt-decode';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  myForm: FormGroup;
  userId: string;
  hide = true;
  loginCredentials = {
    id: '',
    currentPassword: '',
    newPassword: '',
    passwordConfirm: ''
  }
  constructor(   
    private appService: ApplicationService,
    private uiService: UiService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit() {
    const token = localStorage.getItem('auth');
    if (token) {
      const tokenPayLoad = jwt_decode(token);
      this.userId = tokenPayLoad['sub'];
      this.myForm.patchValue({
        userId: this.userId
      });
    }
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  createForm() {
    this.myForm = this.fb.group({
      userId: [''],
      currentPassword: ['', [Validators.required, Validators.maxLength(60)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]],
      passwordConfirm: ['', [Validators.required]],
    }, { validators: this.passwordConfirmValidator });
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
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
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.loginCredentials.id = this.myForm.value.userId;
    this.loginCredentials.currentPassword = this.myForm.value.currentPassword;
    this.loginCredentials.newPassword = this.myForm.value.newPassword;
    this.loginCredentials.passwordConfirm = this.myForm.value.passwordConfirm;
    spinner.close();

    this.authService.changeUserPassword(this.userId, this.loginCredentials).subscribe(res => {
      spinner.close();
      this.authService.logout();
      this.uiService.showSnackBarNotification("Password was successfully changed, please login with your new password.", null, 3000, 'top', 'success-notification');
      this.router.navigate(['login']);
    }, error => {
      //Login fails
      spinner.close();
      console.log(error);
      this.myForm.setErrors({
        "authError": "Incorrect username or password."
      });
    });
  }
}
