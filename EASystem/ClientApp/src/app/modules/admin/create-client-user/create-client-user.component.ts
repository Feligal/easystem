import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';


@Component({
  selector: 'app-create-client-user',
  templateUrl: './create-client-user.component.html',
  styleUrls: ['./create-client-user.component.scss']
})
export class CreateClientUserComponent implements OnInit {
  myForm: FormGroup;
  url: string;
  title: string;
  clientUser = {
    id: 0,
    firstName: '',
    lastName: '',
    userName: '',
    nrc:'',
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
    private dialogRef: MatDialogRef<CreateClientUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data)
  {
    this.createForm();
  }

  ngOnInit() {
    if (this.data.clientUser !== undefined) {
      this.title = "Editing Client User Information";
      this.populateClientInfo(this.data.clientUser);
    } else if (this.data.clientUser === undefined) {
      this.title = "Create New Client User";
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onReset() {
    this.title = "Create New Client User";
    this.myForm.reset();
    this.data = {}
  }
  populateClientInfo(data) {
    console.log(data);
    this.myForm.patchValue({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      nrc : data.nrc,
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
    
    this.clientUser.firstName = this.myForm.value.firstName;
    this.clientUser.lastName = this.myForm.value.lastName;
    this.clientUser.userName = this.myForm.value.userName;
    this.clientUser.nrc = this.myForm.value.nrc;
    this.clientUser.email = this.myForm.value.email;
    this.clientUser.password = this.myForm.value.password;
    this.clientUser.passwordConfirm = this.myForm.value.passwordConfirm;
    this.clientUser.phoneNumber = this.myForm.value.phoneNumber;
    //If data.adminUser is undefined ,then we are creating an admin user 
    if (this.data.clientUser !== undefined) {
      this.clientUser.id = this.myForm.value.id;
      this.appService.editClientUser(this.data.clientUser.id, this.clientUser).subscribe((res) => {
        this.appService.getClientUsers().subscribe((res: any[]) => {
          this.appService.$clientUsers.next(res);
          this.uiService.showSnackBarNotification("The user account was successfully updated.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
          dialogRef.close();
        }, error => {
          dialogRef.close();
          console.log(error);
        });
      }, error => {
        this.uiService.showSnackBarNotification(error.error, null, 3000, 'top', 'error-notification');
      });
    } else {
      //Create the user
      this.appService.createClientUser(this.clientUser).subscribe((res: any) => {
        this.appService.getClientUsers().subscribe((res: any[]) => {
          this.appService.$clientUsers.next(res);
          this.uiService.showSnackBarNotification("The user account was successfully created.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
          dialogRef.close();
        }, error => {
          dialogRef.close();
          console.log(error);
        });
      })
    }
  }
}
