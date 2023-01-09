import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})
export class CreateQuestionComponent implements OnInit {
  //url: string;

  /** Link text */
  @Input() text = 'Upload Diagram';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() url;
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();
  questionExistMessage: any;
  
  private files: Array<FileUploadModel> = [];


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

  //onClick() {
  //  const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
  //  fileUpload.onchange = () => {
  //    for (let index = 0; index < fileUpload.files.length; index++) {
  //      const file = fileUpload.files[index];
  //      this.files.push({
  //        data: file, state: 'in',
  //        inProgress: false, progress: 0, canRetry: false, canCancel: true
  //      });
  //    }
  //    //this.uploadFiles();
  //  };
  //  fileUpload.click();
  //}

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
    this.questionData.text = this.myForm.value.text;
    this.questionData.answerA = this.myForm.value.answerA;
    this.questionData.answerB = this.myForm.value.answerB;
    this.questionData.answerC = this.myForm.value.answerC;
    this.questionData.answerD = this.myForm.value.answerD;
    this.questionData.correctAnswer = this.myForm.value.correctAnswer;
    this.questionData.image = '';
    this.questionData.examId = this.data.examId;


    if (this.files.length > 0) {      
      this.files.forEach(file => {        
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        this.appService.createQuestion(this.questionData, file).subscribe((res: any) => {
          if (res.error === 'questionExist') {
            dialogRef.close();
            this.uiService.showSnackBarNotification("The question already exists in the database.", null, 3000, 'top', 'error-notification');
          } else {
            this.myForm.reset();
            fileUpload.value = '';
            dialogRef.close();
            this.appService.getQuestionsByExamId(this.data.examId).subscribe((res: any) => {
              this.appService.$questions.next(res);
              this.uiService.showSnackBarNotification("The Question was successfully created.", null, 3000, 'top', 'success-notification');
            }, error => {
              this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
            })
          }
        }, error => {
          dialogRef.close();
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        })

      });
    } else {     
      const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.appService.createQuestion(this.questionData, null).subscribe((res: any) => {
        if (res.error === 'questionExist') {
          this.uiService.showSnackBarNotification("The question already exists in the database.", null, 3000, 'top', 'error-notification');
          dialogRef.close();
        } else {
          this.myForm.reset();          
          dialogRef.close();
          this.appService.getQuestionsByExamId(this.data.examId).subscribe((res: any) => {
            this.appService.$questions.next(res);
            this.uiService.showSnackBarNotification("The Question was successfully created.", null, 3000, 'top', 'success-notification');
          }, error => {
            this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
          })
        }
      }, error => {
        dialogRef.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      })
    }
  }
}
