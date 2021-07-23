import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  myForm: FormGroup;
  loginCredentials = {
    email: '',
  }
  constructor(
    
    private appService: ApplicationService,
    private uiService: UiService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog) {
    this.createForm();
  }

  ngOnInit() {
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }


  createForm() {
    this.myForm = this.fb.group({
      email: ['', [Validators.email, Validators.required, Validators.maxLength(40)]],
    })
  }



  onSubmit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.loginCredentials.email = this.myForm.value.email;
    
    this.authService.resetPassword(this.loginCredentials).subscribe(res => {
      dialogRef.close();
      this.uiService.showSnackBarNotification("Kindly  open  your email, we have sent an email with instructions to reset your password.", null, 3000, 'top', 'success-notification');
      this.router.navigate(['confirmpassreset', false]);
    }, error => {
      dialogRef.close();
      this.uiService.showSnackBarNotification("Kindly  open  your email, we have sent an email with instructions to reset your password.", null, 3000, 'top', 'success-notification')
      this.router.navigate(['confirmpassreset', false]);
    })
  }

}
