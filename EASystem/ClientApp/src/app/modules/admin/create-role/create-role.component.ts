import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
  myForm: FormGroup;
  url: string;
  title: string;
  userRole = {
    id: 0,
    roleName: '',
  }
  constructor(    
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private uiService: UiService,
    private dialogRef: MatDialogRef<CreateRoleComponent>,
    private appService: ApplicationService,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit() {   
    if (this.data.roleId !== undefined) {
      this.title = "Editing User Role " + this.data.name;      
      this.populateUserRoleInfo(this.data);
    }
    else {
      this.title = "Create  User Role";
    }
  }


  onCancel() {
    this.dialogRef.close();
  }

  onReset() {
    this.title = "Create User Role";

    this.data = {}
  }
  populateUserRoleInfo(data) {
    this.myForm.patchValue({
      id: data.roleId,
      roleName: data.name,
    })
  }


  createForm() {
    this.myForm = new FormGroup({
      id: new FormControl(''),
      roleName: new FormControl('' ,[Validators.required, Validators.maxLength(32)]),
    });
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

  onSubmit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.userRole.id = this.myForm.value.id;
    this.userRole.roleName = this.myForm.value.roleName;
    //If data.current role is undefined ,then we are creating a userRole else we are editng the userRole
    if (this.myForm.value.id && this.myForm.value.id !== 0) {
      const roleId =  this.userRole.id;
      this.appService.editUserRole(roleId, this.userRole).subscribe((res) => {        
        this.appService.getRoles().subscribe((res: any[]) => {
          this.appService.$userRoles.next(res);
          this.uiService.showSnackBarNotification("The user role was successfully updated.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
          dialogRef.close();
        }, error => {
          console.log(error);
          dialogRef.close();
        });
      }, error => {
        dialogRef.close();
        this.uiService.showSnackBarNotification(error.error, null, 3000, 'top', 'error-notification');
      })
    } else {      
      this.appService.createUserRole(this.userRole).subscribe((res: any) => {        
        this.appService.getRoles().subscribe((res: any[]) => {
          this.appService.$userRoles.next(res);
          this.uiService.showSnackBarNotification("The user role was successfully created.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
          dialogRef.close();
        }, error => {
          dialogRef.close();
          console.log(error);
        });
      }, error => {
        console.log(error);
        dialogRef.close();
        this.uiService.showSnackBarNotification(error.error, null, 3000, 'top', 'error-notification');
      }
      );
    }
  }

}
