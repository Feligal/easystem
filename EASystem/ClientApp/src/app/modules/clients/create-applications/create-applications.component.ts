import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-applications',
  templateUrl: './create-applications.component.html',
  styleUrls: ['./create-applications.component.scss']
})
export class CreateApplicationsComponent implements OnInit {
  myForm: FormGroup;
  url: string;
  title: string;
  applications = {
    id: 0,
    subject: '',
    applicationText: '',
    userId: '',
    clientUserProfileId: 0,
    applicationDate: new Date(),
    userName: '',
    readStatus: false,
    readDate: new Date(),
    isOpened:false
  }
  constructor(@Inject('BASE_URL') private baseUrl: string,
    private appService: ApplicationService,
    private dialog: MatDialog,
    private uiService: UiService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateApplicationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.createForm();
  }

  ngOnInit() {

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
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      applicationText: ['', [Validators.required, Validators.maxLength(1000)]]
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
    this.applications.subject = this.myForm.value.subject;
    this.applications.applicationText = this.myForm.value.applicationText;
    
    this.appService.createExamApplication(this.applications).subscribe(res => {      
      this.appService.$clientApplications.next(res);
      dialogRef.close();
      this.dialogRef.close();
      this.uiService.showSnackBarNotification("The application was  successfully added.", null, 3000, 'top', 'success-notification');
    }, error => {
        dialogRef.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    });    
    //If data.adminUser is undefined ,then we are creating an admin user else we are editng the adminUser   
  }

}
