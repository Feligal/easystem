import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-exam-edit',
  templateUrl: './exam-edit.component.html',
  styleUrls: ['./exam-edit.component.scss']
})
export class ExamEditComponent implements OnInit {
  examPassMarkList = [50, 60,70, 80, 90]
  exam: any;
  examId: number;
  examData = {
    departmentId: 0,
    name: '',
    passMarkPercentage: 0
  }
  exams = [];
  departments = [];
  myForm: FormGroup;
  constructor(
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.myForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      department: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      passMarkPercentage: new FormControl('', [Validators.required, Validators.maxLength(2)]),
    });

    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    
    this.appService.getDepartments().subscribe((res: any) => {
      this.departments = res;
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    });
    this.route.params.subscribe((params: Params) => {
      this.examId = +params['examId'];
      this.appService.getExam(this.examId).subscribe((res: any) => {
        this.exam = res;
        spinner.close();
        this.myForm.patchValue({
          name: res.name,
          department: res.departmentId,
          passMarkPercentage: res.passMarkPercentage
        });
      }, error => {
        spinner.close();
      });
    })
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }
  onClear() {
    this.myForm.reset();
  }


  onSave() {
    this.examData.name = this.myForm.value.name;
    this.examData.departmentId = this.myForm.value.department
    this.examData.passMarkPercentage = this.myForm.value.passMarkPercentage;
    let duplicateExams = [];
    duplicateExams = this.exams.filter(x => x.name.toLowerCase() === this.examData.name.toLowerCase());
    if (duplicateExams.length === 0) {
      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.appService.editExam(this.examId, this.examData).subscribe(res => {
        this.appService.$exams.next(res);
        spinner.close();        
        this.uiService.showSnackBarNotification("The Exam was successfully updated.", null, 3000, 'top', 'success-notification');
      }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing ther request, try again later.", null, 3000, 'top', 'error-notification');
      })
    } else {
      this.uiService.showSnackBarNotification("The name already exist, use a different name.", null, 3000, 'top', 'error-notification');
    }
  }
}
