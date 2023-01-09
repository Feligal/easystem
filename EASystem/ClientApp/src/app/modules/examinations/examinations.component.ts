import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';
import { CreateExamComponent } from './create-exam/create-exam.component';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { ImportQuestionsComponent } from './import-questions/import-questions.component';

@Component({
  selector: 'app-examinations',
  templateUrl: './examinations.component.html',
  styleUrls: ['./examinations.component.scss']
})
export class ExaminationsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  examSubscription: Subscription;
  exams = [];
  pagedExams = [];
  length: number;
  selectedExamId: number
  activeExam
  constructor(private appService: ApplicationService, private router: Router, private dialog: MatDialog, private uiService: UiService) { }

  ngOnInit() {
    this.examSubscription =  this.appService.$exams.subscribe(res => {
      this.exams = res;
      this.length = this.exams.length;
      const offset = ((this.paginator.pageIndex + 1) - 1) * this.paginator.pageSize;
      this.pagedExams = this.exams.slice((offset)).slice(0, this.paginator.pageSize);
    })
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getExams().subscribe((res: any[]) => {
      this.exams = res;
      this.length = this.exams.length;
      const offset = ((this.paginator.pageIndex + 1) - 1) * this.paginator.pageSize;
      this.pagedExams = this.exams.slice((offset)).slice(0, this.paginator.pageSize);
      spinner.close();
    }, error => {
        console.log(error);
        spinner.close();
    })
  }
  ngOnDestroy() {
    this.examSubscription.unsubscribe();
  }

  onSelectExam(event) {
    this.selectedExamId = +event.currentTarget.id.split("_")[1];
    const activeExam = this.exams.filter(i => i.id === this.selectedExamId);    
    this.appService.activeExam = activeExam;
    this.router.navigate(['examinations/']);
  }

  onShowQuestions() {
    this.router.navigate(['examinations/viewquestions/' + this.selectedExamId]);   
  }

  onShowAddQuestion() {
    this.dialog.open(CreateQuestionComponent, {
      data: { examId: this.selectedExamId },
      width: '400px',
      disableClose: true
    })
  }

  pageChangeEvent(event) {
    const offset = ((event.pageIndex + 1) - 1) * event.pageSize;
    this.pagedExams = this.exams.slice(offset).slice(0, event.pageSize);    
  }

  onShowAddBulkyQuestions() {
    this.router.navigate(['examinations/addbulkyquestions/' + this.selectedExamId]); 
  }
  onShowEdit() {
    this.router.navigate(['examinations/editexam/' + this.selectedExamId]); 
  }

  onShowScheduleForMany() {
    this.router.navigate(['examinations/scheduleformany/' + this.selectedExamId]);
  }

  onViewReports() {
    this.router.navigate(['examinations/reports/' + this.selectedExamId]); 
  }
  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the exam?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const spinner = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });

        this.appService.deleteExam(this.selectedExamId).subscribe(res => {
          this.appService.$exams.next(res);
          this.uiService.showSnackBarNotification("The exam was successfully deleted.", null, 3000, 'top', 'success-notification');
          spinner.close();
        }, error => {
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        });
      } else {
        //Do nothing
      }
    });   
  }

  onAddExam() {
    this.dialog.open(CreateExamComponent, {
      width: '500px',
      disableClose: true
    })
  }

  onImportQuestions() {
    this.dialog.open(ImportQuestionsComponent,
      {
        minWidth: 300,
        width: '400px',
        //minHeight: 300,
        data: { examId: this.selectedExamId },
      });
  }
}
