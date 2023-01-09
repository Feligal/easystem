import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { ExamScoreComponent } from '../exam-score/exam-score.component';

@Component({
  selector: 'app-exam-recovery',
  templateUrl: './exam-recovery.component.html',
  styleUrls: ['./exam-recovery.component.scss']
})
export class ExamRecoveryComponent implements OnInit {
  @ViewChild('examForm', { static: true }) form: NgForm;
  step = 0;
  examData: any;
  questions = [];
  constructor(
    private appService: ApplicationService,
    private uiService: UiService, private dialog: MatDialog, private router: Router) { }
  ngOnInit() {
    
  }
  //Shuffling Function for the answers
  shuffle(a) {
    for (let i = a.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }
  onRecoverExam() {
    this.examData = JSON.parse(localStorage.getItem('exam_data'));    
    if (this.examData) {
      this.appService.getRecoveredExam(this.examData.answers).subscribe((res: any) => {
        this.questions = res;
        this.questions.forEach(q => {
          q.answers = [
            q.answerA,
            q.answerB,
            q.answerC,
            q.answerD,
          ];
          this.shuffle(q.answers);
        })
      })
    } else {
      this.uiService.showSnackBarNotification("No exam found for recovery.", null, 3000, 'top', 'success-notification');
    }
  }

  onSubmit() {
    const questionAnswers = this.examData.answers;
    const id = this.examData.id;
    const examdata = localStorage.getItem('exam_data');
    if (examdata) { localStorage.removeItem('exam_data') }
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.adminSubmitExam(id, questionAnswers).subscribe((res: any) => {
      const examdata = localStorage.getItem('exam_data');
      if (examdata) { localStorage.removeItem('exam_data') }      
      const correctAnswer = res.correct;
      const total = res.total;
      const percentageScore = Math.round((correctAnswer / total) * 100);
      spinner.close();
      this.dialog.open(ExamScoreComponent, {
        data: { percentage: percentageScore }
      })
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'error-notification');
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

  onBack() {
    this.router.navigate(['clients']);
  }
}
