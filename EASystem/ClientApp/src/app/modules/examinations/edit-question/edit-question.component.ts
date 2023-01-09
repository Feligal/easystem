import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {
  private files: Array<FileUploadModel> = [];
  myForm: FormGroup;
  question: any;
  exam: any;
  questionData = {
    id:0,
    text: '',
    answerA: '',
    answerB: '',
    answerC: '',
    answerD: '',
    image: '',
    correctAnswer: '',
    examId: 0
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<EditQuestionComponent>,
    private dialog: MatDialog,
    private uiService: UiService,
    private appService: ApplicationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {    
    this.myForm = new FormGroup({
      itemId: new FormControl(''),
      text: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      answerA: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      answerB: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      answerC: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      answerD: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      correctAnswer: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    });
    this.appService.getExam(this.data.examId).subscribe((res) => {
      this.exam = res;
    })
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getQuestionById(this.data.questionId).subscribe((res:any) => {      
      this.myForm.patchValue({
        itemId : res.id,
        text: res.text,
        answerA: res.answerA,
        answerB: res.answerB,
        answerC: res.answerC,
        answerD: res.answerD,
        correctAnswer: res.correctAnswer
      })
      this.question = res;
      dialogRef.close();
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'error-notification');
    })
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
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    for (let index = 0; index < fileUpload.files.length; index++) {
      const file = fileUpload.files[index];
      this.files.push({
        data: file,
        state: 'in',
        inProgress: false, progress: 0, canRetry: false, canCancel: true
      });
    };

    this.questionData.id = this.myForm.value.itemId;
    this.questionData.text = this.myForm.value.text;
    this.questionData.answerA = this.myForm.value.answerA;
    this.questionData.answerB = this.myForm.value.answerB;
    this.questionData.answerC = this.myForm.value.answerC;
    this.questionData.answerD = this.myForm.value.answerD;
    this.questionData.correctAnswer = this.myForm.value.correctAnswer;
    this.questionData.image = '';
    this.questionData.examId = this.data.examId;        
    if (this.myForm.value.itemId && this.myForm.value.itemId !== 0) {

      const dialog = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      if (this.files.length > 0) {        
        this.files.forEach(file => {
          this.appService.editQuestion(this.data.questionId, this.questionData, file).subscribe(res => {
            this.uiService.showSnackBarNotification("The question was successfully updated.", null, 3000, 'top', 'success-notification');
            dialog.close();
            fileUpload.value = '';
            this.dialogRef.close();
            this.appService.getQuestionsByExamId(this.data.examId).subscribe((res: any) => {
              this.appService.$questions.next(res);
            });
          })
        })
      } else {
        this.appService.editQuestion(this.data.questionId, this.questionData, null).subscribe(res => {
          this.uiService.showSnackBarNotification("The question was successfully updated.", null, 3000, 'top', 'success-notification');
          dialog.close();
          this.dialogRef.close();
          this.appService.getQuestionsByExamId(this.data.examId).subscribe((res: any) => {
            this.appService.$questions.next(res);
          });
        })
      }      
    }    
  }
}
