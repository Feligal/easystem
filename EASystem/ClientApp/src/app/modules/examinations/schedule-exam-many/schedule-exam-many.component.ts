import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-schedule-exam-many',
  templateUrl: './schedule-exam-many.component.html',
  styleUrls: ['./schedule-exam-many.component.scss']
})
export class ScheduleExamManyComponent implements OnInit {
  selection = new SelectionModel<any>(true, []);  
  minDate;
  userId: string;
  examId: number;
  data: any;
  //myForm: FormGroup;
  durationList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 180, 200, 300, 400, 500];
  questionNumbers = [];
  scheduleDate: any;
  dataColumns = ['index', 'image', 'firstName', 'lastName','gender', 'email', 'select'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('f', { static: true }) myForm: NgForm;
  selectedRowIndex = -1;
  subscription: Subscription;
  $exams = new Subject<any>();
  clientUsers = [];
  exams = [];
  exam: any;
  dataSource = new MatTableDataSource<any>();
  constructor(
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {

  }
 

  onSubmit() {
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    const duration = this.myForm.value.duration;
    const numberQuestions = this.myForm.value.numberQuestions;
    const examTime = this.myForm.value.examTime;
    const scheduleDate = new Date(this.scheduleDate);
    if (this.selection.selected.length > 0) {              
      const selectedItems = this.selection.selected;        
      const selectedDataItems = [];
      for (const item of selectedItems) {
        const id = item.id;
        const data = {
          id: 0,
          userId:id,
          examId: this.examId,
          duration: duration,
          numberOfQuestions: numberQuestions,
          name: this.exam.name,
          clientUserProfileId: null,
          dateTaken: new Date(),
          score: 0,
          passStatus: '',
          hasBeenTaken: false,
          scheduledDate: scheduleDate,
          examTime: examTime
        }        
        selectedDataItems.push(data);
      }
      
      this.appService.assignExamToMany(this.examId, selectedDataItems).subscribe((res: any) => {
        spinner.close();
        this.uiService.showSnackBarNotification("Examination schedule successfully completed.", null, 3000, 'top', 'success-notification');        
      },
        error => {
          spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      });
      //clear the selection
      this.selection.clear();      
    } else {
      spinner.close();
      this.uiService.showSnackBarNotification("No user selected, please select user to schedule exam for.", null, 3000, 'top', 'error-notification');
    }        
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.examId = +params['examId'];

      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.appService.getExam(this.examId).subscribe((res: any) => {
        this.exam = res;
        this.myForm.form.patchValue({
          name : res.name
        })
        spinner.close();
      }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        spinner.close();
      });
    })
    //Setting today's date a min value for the date picker
    this.minDate = new Date();

    for (let i = 0; i < 100; i++) {
      this.questionNumbers.push(i + 1);
    }
    //These are for administrative use to test all the questions
    this.questionNumbers.push(200, 400, 500, 1000);

    this.subscription = this.$exams.subscribe((res: any) => {
      this.clientUsers = res;
      this.dataSource.data = this.clientUsers.sort((a, b) => { return b.name - a.name });
    });



    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.getClientUsers().subscribe((res: any) => {
      this.clientUsers = res;      
      this.dataSource.data = this.clientUsers.sort((a, b) => { return a.firstName - b.firstName });
      dialogRef.close();
    }, () => {
      this.uiService.showSnackBarNotification("An unexpected error occured while processing, try again.", null, 3000, 'top', 'error-notification');
      dialogRef.close();
    }, () => {
      dialogRef.close();
    });

    this.appService.getExams().subscribe((res: any) => {
      this.exams = res;      
      dialogRef.close();
    }, () => {
      this.uiService.showSnackBarNotification("An unexpected error occured while processing, try again.", null, 3000, 'top', 'error-notification');
      dialogRef.close();
    }, () => {
      dialogRef.close();
    });
  }

  changeScheduleDate(event: any) {
    this.scheduleDate = event.target.value;
    console.log(this.scheduleDate);
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

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  onCancel() {
    this.myForm.reset();
  }

}
