import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
@Component({
  selector: 'app-systemlogs',
  templateUrl: './systemlogs.component.html',
  styleUrls: ['./systemlogs.component.scss']
})
export class SystemlogsComponent implements OnInit {

  firstDate: any;
  secondDate: any;
  selection = new SelectionModel<any>(true, []);
  selectedRowIndex = -1;
  id: number;
  url: string;
  subscription: Subscription;
  logs = [];
  logsCopy = [];
  $logSubject = new Subject<any[]>();
  displayedColumns = [
    'index',
    'owner',
    'logInformation',
    'dateCreated',
    'select',
    'action'
  ];

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private router: Router, private dialog: MatDialog, private appService: ApplicationService, private uiService: UiService) {

  }

  ngOnInit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });    
    
    this.appService.getAllLogs().subscribe((res: any) => {
      this.logs = res;
      this.logsCopy = res;
      this.dataSource.data = this.logs;
      dialogRef.close();
    }, error => {
      console.log(error);
      dialogRef.close();
    })
    this.subscription = this.$logSubject.subscribe((res: any) => {
      this.logs = res;
      this.dataSource.data = res;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onViewLog(event) {
    const fileName = event.currentTarget.id.split("_")[1];
    this.router.navigate(['logdetails', fileName]);
  }
  onDeleteLog(event) {
    const id = +event.currentTarget.id.split("_")[1];
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the log file?"
      }
    }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        //If accepted to delete        
        this.appService.deleteLog(id).subscribe((res: any) => {          
          this.appService.getAllLogs().subscribe((res: any[]) => {
            this.$logSubject.next(res);
            this.uiService.showSnackBarNotification("The log  was successfully deleted.", null, 3000, 'top', 'success-notification');
            dialogRef.close();
          }, error => {
            console.log(error);
            dialogRef.close();
          });
        }, error => {
          this.uiService.showSnackBarNotification("Delete operation failed.", null, 3000, 'top', 'errror-notification');
          dialogRef.close();
        });
      } else {
        //Disagree to delete
      }
    });
  }
  highlight(row) {
    this.selectedRowIndex = row.id;
  }
  onExportExcell() {
  }

  changeStartDate(event: any) {
    this.firstDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterLogsByDate(this.firstDate, this.secondDate);
  }

  changeSecondDate(event: any) {
    this.secondDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterLogsByDate(this.firstDate, this.secondDate);
  }

  filterLogsByDate(firstDate: string, secondDate: string) {
    if (this.logs) {
      const filteredLogs = this.logsCopy
        .filter(item => new Date(item.dateCreated) >= new Date(firstDate) && new Date(item.dateCreated) <= new Date(secondDate));
      this.$logSubject.next(filteredLogs);
    }
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

  onDeleteAllSelected() {
    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the logs information?"
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        const dialog = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        const selectedItems = this.selection.selected;
        for (const item of selectedItems) {
          const id = item.id;          
          this.appService.deleteLog(id).subscribe(res => {
            this.uiService.showSnackBarNotification("Logs were successfully deleted.", null, 3000, 'top', 'success-notification');            
            this.appService.getAllLogs().subscribe((res: any) => {
              this.$logSubject.next(res);
              dialog.close();
            }, error => {
              dialog.close();
              console.log(error);
            });
          }, error => {
            console.log(error);
          });
        }
        this.selection.clear();
      } else {
        this.selection.clear();
      }
    })
  }

}
