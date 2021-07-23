import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {  
  myForm: FormGroup;
  hide = true;
  loginCredentials = {
    email: '',
    password: '',
  }
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
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

  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  createForm() {
    this.myForm = this.fb.group({      
      email: ['', [Validators.required, Validators.maxLength(40)]],
      password: ['', [Validators.required, Validators.maxLength(40)]],
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

    this.loginCredentials.email = this.myForm.value.email;
    this.loginCredentials.password = this.myForm.value.password;
    this.authService.login(this.loginCredentials.email, this.loginCredentials.password).subscribe(res => {
      dialogRef.close();      
      this.router.navigate(['home']);
    }, error => {
      //Login fails
      dialogRef.close();
      console.log(error);
      this.myForm.setErrors({
        "authError": "Incorrect username or password."
      });
    })
  }
}
