import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-exam',
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.scss']
})
export class CreateExamComponent implements OnInit {
  examData = {
    name: '',   
  }
  exams = [];
  myForm: FormGroup;
  constructor(private dialogRef: MatDialogRef<CreateExamComponent>, private dialog: MatDialog, private appService: ApplicationService, private uiService: UiService) { }
  
  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }
  onClear() {
    this.myForm.reset();
  }

  onCancel() {    
    this.dialogRef.close();    
  }

  ngOnInit() {
    this.myForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),     
    });
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getExams().subscribe((res: any) => {
      this.exams = res;
      spinner.close();
    }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  onSave() {
    this.examData.name = this.myForm.value.name;
    let duplicateExams = [];
    duplicateExams = this.exams.filter(x => x.name === this.examData.name);
    if (duplicateExams.length === 0) {
      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.appService.createExam(this.examData).subscribe(res => {
        this.appService.$exams.next(res);
        spinner.close();
        this.dialogRef.close();
        this.uiService.showSnackBarNotification("The Exam was successfully created.", null, 3000, 'top', 'success-notification');
      }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing ther request, try again later.", null, 3000, 'top', 'error-notification');
      })
    } else {
      this.uiService.showSnackBarNotification("The name already exist, use a different name.", null, 3000, 'top', 'error-notification');
    }    
  }
}
