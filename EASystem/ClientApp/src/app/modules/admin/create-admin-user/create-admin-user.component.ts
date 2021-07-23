import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';


@Component({
  selector: 'app-create-admin-user',
  templateUrl: './create-admin-user.component.html',
  styleUrls: ['./create-admin-user.component.scss']
})
export class CreateAdminUserComponent implements OnInit {
  myForm: FormGroup;
  url: string;
  title: string;
  adminUser = {
    id: 0,
    firstName: '',
    lastName: '',
    userName: '',
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
    private dialogRef: MatDialogRef<CreateAdminUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.createForm();
  }

  ngOnInit() {

    if (this.data.adminUser !== undefined) {
      this.title = "Editing Admin User";
      this.populateAdminInfo(this.data.adminUser);
    } else if (this.data.adminUser === undefined) {
      this.title = "Create New Admin User";
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onReset() {
    this.title = "Create New Admin User";
    this.myForm.reset();
    this.data = {}

  }
  populateAdminInfo(data) {
    console.log(data);
    this.myForm.patchValue({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
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

    this.adminUser.id = this.myForm.value.id;
    this.adminUser.firstName = this.myForm.value.firstName;
    this.adminUser.lastName = this.myForm.value.lastName;
    this.adminUser.userName = this.myForm.value.userName;
    this.adminUser.email = this.myForm.value.email;
    this.adminUser.password = this.myForm.value.password;
    this.adminUser.passwordConfirm = this.myForm.value.passwordConfirm;
    this.adminUser.phoneNumber = this.myForm.value.phoneNumber;
    //If data.adminUser is undefined ,then we are creating an admin user else we are editng the adminUser
    if (this.data.adminUser === undefined) {      
      this.appService.createAdminUser(this.adminUser).subscribe((res: any) => {        
        this.appService.getAdminUsers().subscribe((res: any[]) => {
          this.appService.$clientUser.next(res);
          this.uiService.showSnackBarNotification("The user account was successfully created.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
          dialogRef.close();
        }, error => {
          console.log(error);
          dialogRef.close();
        });
      }, error => {
        dialogRef.close();
        this.uiService.showSnackBarNotification(error.error, null, 3000, 'top', 'error-notification');
      });
    } else if (this.data.adminUser !== undefined) {      
      this.appService.editAdminUser(this.data.adminUser.id, this.adminUser).subscribe((res) => {        
        this.appService.getAdminUsers().subscribe((res: any[]) => {
          this.appService.$clientUser.next(res);
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
    }
  }
}
