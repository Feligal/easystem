import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})
export class CreateQuestionComponent implements OnInit {
  myForm: FormGroup;
  questionData = {
    text: '',
    answerA: '',
    answerB: '',
    answerC: '',
    answerD: '',
    image: '',
    correctAnswer:'',
    examId: 0
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<CreateQuestionComponent>,
    private dialog: MatDialog,
    private uiService: UiService,
    private appService: ApplicationService
  )
  { }

  ngOnInit() {    
    this.myForm = new FormGroup({
      text: new FormControl('', [Validators.required, Validators.maxLength(400)]),
      answerA: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      answerB: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      answerC: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      answerD: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      correctAnswer: new FormControl('', [Validators.required, Validators.maxLength(100)]),      
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }
  onClear() {
    this.myForm.reset();
  }

  onCancel() {    
    this.dialogRef.close();    
  }

  onSave() {
    this.questionData.text = this.myForm.value.text;
    this.questionData.answerA = this.myForm.value.answerA;
    this.questionData.answerB = this.myForm.value.answerB;
    this.questionData.answerC = this.myForm.value.answerC;
    this.questionData.answerD = this.myForm.value.answerD;
    this.questionData.correctAnswer = this.myForm.value.correctAnswer;
    this.questionData.image = '';
    this.questionData.examId = this.data.examId;    
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.createQuestion(this.questionData).subscribe(res => {
      this.myForm.reset();
      dialogRef.close();
      this.appService.getQuestionsByExamId(this.data.examId).subscribe((res: any) => {
        this.appService.$questions.next(res);
        this.uiService.showSnackBarNotification("The Question was successfully created.", null, 3000, 'top', 'success-notification');      
      }, error => {
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      })      
    }, error => {
        dialogRef.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }
}
