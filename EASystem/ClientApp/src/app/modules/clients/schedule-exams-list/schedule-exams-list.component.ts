import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-schedule-exams-list',
  templateUrl: './schedule-exams-list.component.html',
  styleUrls: ['./schedule-exams-list.component.scss']
})
export class ScheduleExamsListComponent implements OnInit {
  userId: string;
  examId: number;
  data: any;
  myForm: FormGroup;
  dulationList = [30, 60, 90, 120, 180];
  questionNumbers = [];
  
  dataColumns = ['index', 'name', 'action'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  selectedRowIndex = -1;
  subscription: Subscription;
  $exams = new Subject<any>();
  exams = [];
  dataSource = new MatTableDataSource<any>();
  constructor(
    private dialogRef: MatDialogRef<ScheduleExamsListComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData,
    private appService: ApplicationService,    
    private uiService: UiService,
    private dialog: MatDialog,
  ) {

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    for (let i = 0; i < 100; i++) {
      this.questionNumbers.push(i + 1);
    }
    this.myForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      duration: new FormControl('', [Validators.required, Validators.maxLength(3)]),
      numberQuestions: new FormControl('', [Validators.required, Validators.maxLength(3)]),      
    });

    this.userId = this.dialogData.userId;
    this.subscription = this.$exams.subscribe((res:any) => {
      this.exams = res;
      this.dataSource.data = this.exams.sort((a, b) => { return b.name - a.name });      
    });

    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });    
    
    this.appService.getExams().subscribe((res: any) => {
      this.exams = res;
      this.dataSource.data = this.exams.sort((a, b) => { return b.name - a.name });       
      dialogRef.close();
    }, () => {
      this.uiService.showSnackBarNotification("An unexpected error occured while processing, try again.", null, 3000, 'top', 'error-notification');
      dialogRef.close();
    }, () => {
      dialogRef.close();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  onClose() {
    this.dialogRef.close();
  }

  onScheduleExam(event) {    
    
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

  onSubmit() {    
    this.examId = this.myForm.value.name;
    const duration = this.myForm.value.duration;
    const numberQuestions = this.myForm.value.numberQuestions;        
    this.appService.getExam(this.examId).subscribe((res: any) => {
      this.data = {
        id: 0,
        examId: this.examId,
        duration: duration,
        numberOfQuestions: numberQuestions,
        name: res.name,
        clientUserProfileId: '',
        dateTaken: new Date(),
        score: 0,
        passStatus: '',
        hasBeenTake: false
      }
    });

    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: { message: 'Are you sure you want to schedule the exam?' }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        const dialog = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        this.appService.assignExam(this.examId, this.userId, this.data).subscribe(res => {
          this.uiService.showSnackBarNotification("Exam was allocated successfully", null, 3000, 'top', 'success-notification');
          dialog.close();
          this.dialogRef.close();
          this.appService.getClientUserExams(this.userId).subscribe((res: any) => {
            this.appService.$pendingExams.next(res);
          });
        }, () => { }, () => { dialog.close(); });
      }
    });


  }
}
