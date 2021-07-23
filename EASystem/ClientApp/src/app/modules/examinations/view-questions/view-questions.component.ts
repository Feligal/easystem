import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { EditQuestionComponent } from '../edit-question/edit-question.component';

@Component({
  selector: 'app-view-questions',
  templateUrl: './view-questions.component.html',
  styleUrls: ['./view-questions.component.scss']
})
export class ViewQuestionsComponent implements OnInit, AfterViewInit {
  constructor(private route: ActivatedRoute,
    private appService: ApplicationService,
    private dialog: MatDialog,
    private uiService: UiService
  ) { }
  examId: number;
  totalQuestions: number;
  exam: any;
  questions = [];
  questionSubscription: Subscription;
  displayedColumns = [
    'index',
    'text',    
    'action'
  ];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  questionDataSource = new MatTableDataSource<any>();  
  selectedRowIndex = -1;
  ngOnInit() {
    this.questionSubscription = this.appService.$questions.subscribe((res: any) => {
      this.questions = res;
      this.questionDataSource.data = this.questions;
    });

    this.route.params.subscribe((params: Params) => {
      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.examId = +params['examId'];
      this.appService.getExam(this.examId).subscribe((res: any) => {
        this.exam = res;        
      })
      this.appService.getQuestionsByExamId(this.examId).subscribe((res: any) => {        
        this.questions = res;
        this.totalQuestions = this.questions.length;
        this.questionDataSource.data = this.questions;
        spinner.close();
      });
    })
  }

  doFilter(filterValue: string) {
    this.questionDataSource.filter = filterValue.trim().toLowerCase();
  }


  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  ngAfterViewInit(): void {
    this.questionDataSource.sort = this.sort;
    this.questionDataSource.paginator = this.paginator;
  }

  onEditQuestion(event) {
    const id = event.currentTarget.id.split("_")[1];
    this.dialog.open(EditQuestionComponent, {
      data: {
        questionId: id,
        examId: this.examId
      },
      width: '400px',
    })
  }

  onDeleteQuestion(event) {
    const id = event.currentTarget.id.split("_")[1];
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the question?"
      }
    }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const spinner = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        //If accepted to delete        
        this.appService.deleteQuestion(id).subscribe((res: any) => {
          spinner.close();
          this.uiService.showSnackBarNotification("The question was successfully deleted.", null, 3000, 'top', 'success-notification');
          this.appService.getQuestionsByExamId(this.examId).subscribe((res: any) => {
            this.appService.$questions.next(res);
          })
        }, error => {
          this.uiService.showSnackBarNotification("Delete operation failed.", null, 3000, 'top', 'error-notification');
          spinner.close();
        });
      } else {
        //Disagree to delete
      }
    });    
  }
}
