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
    departmentId:0,    
    name: '',
    passMarkPercentage: 0
  }
  examPassMarkList = [50,60,70,80,90,100]
  exams = [];
  departments = [];
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
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      department: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      passMarkPercentage: new FormControl('', [Validators.required, Validators.maxLength(2)]),
    });
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.getDepartments().subscribe((res:any) => {
      this.departments = res;
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })

    this.appService.getAllExams().subscribe((res: any) => {
      this.exams = res;
      spinner.close();
    }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  onSave() {
    this.examData.name = this.myForm.value.name;
    this.examData.departmentId = this.myForm.value.department;
    this.examData.passMarkPercentage = this.myForm.value.passMarkPercentage;
    console.log(this.examData);
    let duplicateExams = [];
    duplicateExams = this.exams.filter(x => x.name.toLowerCase() === this.examData.name.toLowerCase());    
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
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing ther request, try again later.", null, 3000, 'top', 'error-notification');
      })
    } else {
      this.uiService.showSnackBarNotification("The name already exist, use a different name.", null, 3000, 'top', 'error-notification');
    }    
  }
}
