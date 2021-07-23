import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { ExamScoreComponent } from '../exam-score/exam-score.component';

@Component({
  selector: 'app-active-exam',
  templateUrl: './active-exam.component.html',
  styleUrls: ['./active-exam.component.scss']
})
export class ActiveExamComponent implements OnInit {
  @ViewChild('examForm', { static: true }) form: NgForm;
  questionAnswers = [];
  step = 0;
  timer;
  timerDisplayer;
  finished = false;  
  examId: number;
  id: number;
  questions = [];
  constructor(
    private appService: ApplicationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private uiService: UiService,
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<ActiveExamComponent>)
  { }

  //Shuffling Function for the answers
  shuffle(a) {
    for (let i = a.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  startLogoutTimer = function () {
    const _this = this;
    this.time = this.data.duration;    
    //Call the timer every second
    const timer = setInterval(function () {
      const min = String(Math.trunc(_this.time / 60)).padStart(2, '0');
      const sec = String(_this.time % 60).padStart(2, '0');
      _this.timerDisplayer = `${min} : ${sec}`;
      _this.time--;
      //When 0 seconds , stop timer and close the exam     
      if (_this.time === 0) {
        //clear the time
        _this.dialogRef.close();
        clearInterval(timer);
        //Finish the exam and submit for marking
        if (!_this.finished) {
          _this.onFinish();
        }        
      }
    }, 1000)
  }

  localStorageDataTimer = function () {
    const _this = this;    
    const timer = setInterval(function () {
      _this.getFormValues();
      const data = { id: _this.data.id, answers: _this.questionAnswers }
      console.log(data);
      localStorage.setItem('exam_data', JSON.stringify(data));
      if (_this.time === 0 ) {
        //clear the time
        clearInterval(timer);
        //Finish the exam and submit for marking
      }
    }, 20000)
  }

  ngOnInit() {
    this.localStorageDataTimer();
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    
    this.examId = this.data.examId;
    this.id = this.data.id;
    const numberOfQuestions = this.data.numberOfQuestions;   
    this.appService.getShuffledQuestionsByExamId(this.examId, numberOfQuestions).subscribe((res: any) => {
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
      this.startLogoutTimer();
      spinner.close();
    }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    });    
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

  getFormValues() {
    const tempArray = [];
    this.questionAnswers = [];
    const formValues = this.form.value;
    for (const item in formValues) {
      const values = this.form.value[item];
      tempArray.push(values);
    }
    const questionNumbers = [];
    const selectedAnswers = [];
    for (let i = 0; i < tempArray.length; i++) {
      if (i % 2 === 0) {
        questionNumbers.push(tempArray[i]);
      } else {
        selectedAnswers.push(tempArray[i]);
      }
    }
    for (let i = 0; i < questionNumbers.length; i++) {
      this.questionAnswers.push({
        questionNumber: questionNumbers[i],
        selectedAnswer: selectedAnswers[i]
      })
    }
  }

  onFinish() {
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.finished = true;
    this.getFormValues();
    this.appService.submitExam(this.id, this.questionAnswers).subscribe((res: any) => {
      const examdata = localStorage.getItem('exam_data');
      if (examdata) { localStorage.removeItem('exam_data') }
      this.dialogRef.close();
      const correctAnswer = res.correct;
      const total = res.total;            
      const percentageScore = Math.round((correctAnswer / total) * 100);
      spinner.close();
      this.dialog.open(ExamScoreComponent, {
        data: { percentage: percentageScore}
      })
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later or contact the system adminstrator.", null, 3000, 'top', 'errror-notification');
    })
  }
}

