import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-scheduled-pending-examinations',
  templateUrl: './scheduled-pending-examinations.component.html',
  styleUrls: ['./scheduled-pending-examinations.component.scss']
})
export class ScheduledPendingExaminationsComponent implements OnInit, AfterViewInit {
  all='All'
  selection = new SelectionModel<any>(true, []);
  examName: string;
  examinations = [];
  pendingExams = [];
  filteredExaminations = [];
  selectedRowIndex = -1;
  id: number;
  url: string;
  subscription: Subscription;
  examsActivatedSubject = new Subject<any>();
  clientUsers = [];
  displayedColumns = [
    'index',
    'userName',
    'name',
    'duration', 
    'passStatus',    
    'numberOfQuestions',
    'passMarkPercentage',
    'scheduledDate',
    'select',
    'action'
  ];

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.subscription = this.examsActivatedSubject.subscribe(res => {      
      this.filteredExaminations = res;
      this.dataSource.data = res;
    });

    const dialog = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.getExams().subscribe((res: any) => {
      this.examinations = res;
    });
    this.appService.getAllPendingExams().subscribe((res: any) => {
      this.pendingExams = res;
      this.dataSource.data = res;      
      dialog.close();
    }, error => {
        dialog.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');            
    });   
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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

  onDeleteExamSchedule(event) {
    const id = +event.currentTarget.id.split("_")[1];
    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to cancel the selected exam?"
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        const dialog = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });       
        this.appService.deleteCancelExam(id).subscribe((res: any) => {
          this.uiService.showSnackBarNotification("Exam was successfully canceled.", null, 3000, 'top', 'success-notification');
          this.appService.getAllPendingExams().subscribe((res: any) => {
            this.examsActivatedSubject.next(res);
            dialog.close();
          }, error => {
            dialog.close();
            this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
          });
        }, error => {
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        })
        dialog.close();
        this.selection.clear();
      } else {
        this.selection.clear();
      }
    })
  }



  onChangeExam(event) {
    const dialog = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.examName = event.value;
    if (this.examName === 'All') {
      this.dataSource.data = this.pendingExams;
      dialog.close();
    } else {
      this.appService.getScheduledActiveExams(this.examName).subscribe((res: any) => {
        this.filteredExaminations = res;
        this.dataSource.data = res;
        dialog.close();
      }, error => {
        dialog.close();
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      });
    }    
  }
  

  onDeleteAllSelected() {
    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the selected exam?"
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        const dialog = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        const selectedItems = this.selection.selected;
        let selectedIds = []
        for (const item of selectedItems) {
          const id = item.id;
          selectedIds.push(id);
        }
        this.appService.deleteSelectedScheduledExam(selectedIds).subscribe((res: any) => {
          this.appService.getAllPendingExams().subscribe((res: any) => {
            this.examsActivatedSubject.next(res);
            dialog.close();
            this.uiService.showSnackBarNotification("Selected Schedule exam(s) successfully deleted.", null, 3000, 'top', 'success-notification');
          }, error => {
            dialog.close();
            this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
          });
        })
        dialog.close();
        this.selection.clear();
      } else {
        this.selection.clear();
      }
    })
  }

  onActivateAllSelected() {
    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to activate the selected exam?"
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        const dialog = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        const selectedItems = this.selection.selected;
        let selectedIds = []
        for (const item of selectedItems) {
          const id = item.id;
          selectedIds.push(id);          
        }
        this.appService.activateSelectedScheduledExam(selectedIds).subscribe((res: any) => {
          this.appService.getAllPendingExams().subscribe((res: any) => {
            this.examsActivatedSubject.next(res);
            dialog.close();
            this.uiService.showSnackBarNotification("Selected Schedule exam(s) successfully activated.", null, 3000, 'top', 'success-notification');
          }, error => {
            dialog.close();
            this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
          });
        })
        dialog.close();
        this.selection.clear();
      } else {
        this.selection.clear();
      }
    })
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }
}
