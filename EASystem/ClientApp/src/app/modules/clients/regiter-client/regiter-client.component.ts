import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-regiter-client',
  templateUrl: './regiter-client.component.html',
  styleUrls: ['./regiter-client.component.scss']
})
export class RegiterClientComponent implements OnInit {
  genders = ['Male', 'Female'];
  myForm: FormGroup;
  url: string;
  title: string;
  userRegistrationData = {
    id: 0,
    firstName: '',
    lastName: '',
    gender:'',
    userName: '',
    nrc: '',
    phoneNumber: '',
    email: '',
    password: '',
    passwordConfirm: '',
  }
  constructor(
    private appService: ApplicationService,
    private dialog: MatDialog,
    private uiService: UiService,
    private fb: FormBuilder,
    private router: Router
    ) {
    this.createForm();
  }

  ngOnInit() {    
      this.title = "Client Registration";   
  }

  onCancel() {
    this.router.navigate(['login']);
  }
 
  populateClientInfo(data) {    
    this.myForm.patchValue({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      gender:data.gender,
      nrc: data.nrc,
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: "",
      passwordConfirm: ""
    })
  }


  createForm() {
    this.myForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.maxLength(32)]],
      lastName: ['', [Validators.required, Validators.maxLength(32)]],
      userName: ['', [Validators.required, Validators.maxLength(32)]],
      gender: ['', [Validators.required, Validators.maxLength(32)]],
      nrc: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(13)]],
      email: ['', [Validators.email, Validators.required, Validators.maxLength(40)]],
      password: ['', [Validators.required, Validators.maxLength(40)]],
      passwordConfirm: ['', Validators.required],
    },
      { validator: this.passwordConfirmValidator }
    )
  }
  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }
  hasMismatchError(name: string) {
    let e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  passwordConfirmValidator(control: FormControl) {
    let p = control.root.get('password');
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
    this.userRegistrationData.firstName = this.myForm.value.firstName;
    this.userRegistrationData.lastName = this.myForm.value.lastName;
    this.userRegistrationData.userName = this.myForm.value.userName;
    this.userRegistrationData.gender = this.myForm.value.gender;
    this.userRegistrationData.nrc = this.myForm.value.nrc;
    this.userRegistrationData.email = this.myForm.value.email;
    this.userRegistrationData.password = this.myForm.value.password;
    this.userRegistrationData.passwordConfirm = this.myForm.value.passwordConfirm;
    this.userRegistrationData.phoneNumber = this.myForm.value.phoneNumber;
    this.appService.registerClientUser(this.userRegistrationData).subscribe(res => {
      dialogRef.close();
      this.uiService.showSnackBarNotification("Client was successfully registered", null, 3000, 'top', 'success-notification');
      this.router.navigate(['successregistration']);
    }, error => {
      console.log(error.error);
      dialogRef.close();
      this.uiService.showSnackBarNotification(error.error[""][0], null, 3000, 'top', 'error-notification');
    });
  }

}
