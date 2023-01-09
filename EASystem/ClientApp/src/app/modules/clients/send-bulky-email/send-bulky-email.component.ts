import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-send-bulky-email',
  templateUrl: './send-bulky-email.component.html',
  styleUrls: ['./send-bulky-email.component.scss']
})
export class SendBulkyEmailComponent implements OnInit {
  myForm: FormGroup;
  emailsNotSent: any;
  url: string;
  objectData = {
    subject: '',
    message: '',
  }
  constructor(    
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private dialogRef: MatDialogRef<SendBulkyEmailComponent>,    
    private appService: ApplicationService,
    private uiService: UiService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog) {
    this.createForm();
  }

  ngOnInit() {    
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  createForm() {
    this.myForm = this.fb.group({
      subject: ['', [Validators.required, Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.maxLength(1000)]],
    })
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.objectData.subject = this.myForm.value.subject;
    this.objectData.message = this.myForm.value.message;
    for (const id of this.dialogData.selectedIds) {
      this.appService.sendBulkyEmail(id, this.objectData).subscribe((res:any) => {
        if (res.success === "success") {
          this.uiService.showSnackBarNotification("Emails sent successfully.", null, 3000, 'top', 'success-notification');
          this.dialogRef.close();
        } else {
          this.emailsNotSent = res.failedEmails
          this.dialogRef.close();
        }
        dialogRef.close();
      }, error => {
      //Sending  fails
        dialogRef.close();
        console.log(error);      
      })      
    }
    
  }

}
