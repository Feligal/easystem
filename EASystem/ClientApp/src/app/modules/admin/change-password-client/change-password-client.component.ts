import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-change-password-client',
  templateUrl: './change-password-client.component.html',
  styleUrls: ['./change-password-client.component.scss']
})
export class ChangePasswordClientComponent implements OnInit {

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
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ChangePasswordClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.userId = this.data.userId;    
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

  onCancel() {
    this.dialogRef.close();
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
    this.loginCredentials.id = this.userId;
    this.loginCredentials.currentPassword = this.myForm.value.currentPassword;
    this.loginCredentials.newPassword = this.myForm.value.newPassword;
    this.loginCredentials.passwordConfirm = this.myForm.value.passwordConfirm;   

    this.authService.changeUserPassword(this.userId, this.loginCredentials).subscribe(res => {
      spinner.close();      
      this.uiService.showSnackBarNotification("Password was successfully changed.", null, 3000, 'top', 'success-notification');      
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
