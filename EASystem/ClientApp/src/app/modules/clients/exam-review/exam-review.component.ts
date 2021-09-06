import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-exam-review',
  templateUrl: './exam-review.component.html',
  styleUrls: ['./exam-review.component.scss']
})
export class ExamReviewComponent implements OnInit {
  questions: any = [];
  @ViewChild('examForm', { static: true }) form: NgForm;
  step = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private appService: ApplicationService,
    private dialogRef: MatDialogRef<ExamReviewComponent>,
    private dialog: MatDialog,
    private uiService: UiService
  )
  {

  }
  ngOnInit() {
    const id = this.data.id;
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getExamReview(id).subscribe(res => {      
      this.questions = res;
      this.questions.forEach(q => {
        q.answers = [
          q.answerA,
          q.answerB,
          q.answerC,
          q.answerD,
        ];
      });
      spinner.close();
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  onClose() {
    this.dialogRef.close();
  }
}
