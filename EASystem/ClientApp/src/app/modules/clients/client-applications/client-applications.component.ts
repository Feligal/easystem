import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { CreateApplicationsComponent } from '../create-applications/create-applications.component';

@Component({
  selector: 'app-client-applications',
  templateUrl: './client-applications.component.html',
  styleUrls: ['./client-applications.component.scss']
})
export class ClientApplicationsComponent implements OnInit, OnDestroy, AfterViewInit {
  applications = [];
  applicationsCopy = [];
  subscription: Subscription;
  subscription1: Subscription;
  firstDate: any;
  secondDate: any;
  selection = new SelectionModel<any>(true, []);
  selectedRowIndex = -1;
  $applicationSubject = new Subject<any[]>();
  displayedColumns = [
    'index',
    'isOpened',    
    'subject',    
    'applicationDate',        
    'select',
    'action'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  myForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService,
    private router: Router
  ) { }
  ngOnInit() {
    this.subscription = this.appService.$clientApplications.subscribe(res => {
      this.applications = res.sort((a: any, b: any) => {return  (b.id - a.id) });
      this.applicationsCopy = this.applications;
      this.dataSource.data = this.applications;
    });

    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.getClientApplications().subscribe((res: any) => {
      this.applications = res.sort((a: any, b: any) => {return  b.id - a.id });
      this.applicationsCopy = this.applications;
      this.dataSource.data = this.applications;
      dialogRef.close();
    }, error => {
      dialogRef.close();
      this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    });
  }
  onCreateApplication() {
    this.dialog.open(CreateApplicationsComponent,
      {
        minWidth: 350,
        width: '500px',
        height: 'auto',
        minHeight: '700',
        disableClose: true
      }
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  changeStartDate(event: any) {
    this.firstDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterApplicationsByDate(this.firstDate, this.secondDate);
  }

  changeSecondDate(event: any) {
    this.secondDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterApplicationsByDate(this.firstDate, this.secondDate);
  }

  filterApplicationsByDate(firstDate: string, secondDate: string) {
    if (this.applications) {
      const filteredApplications = this.applicationsCopy
        .filter(item => new Date(item.applicationDate) >= new Date(firstDate) && new Date(item.applicationDate) <= new Date(secondDate));
      this.$applicationSubject.next(filteredApplications);
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

  onDeleteApplication(event) {
    const id = +event.currentTarget.id.split("_")[1];
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the application?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        this.appService.deleteClientApplication(id).subscribe((res: any) => {
          this.appService.$clientApplications.next(res);
          dialogRef.close();
          this.uiService.showSnackBarNotification("The application was successfully deleted.", null, 3000, 'top', 'success-notification');
        }, error => {
            dialogRef.close();
            this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        });
      } else {

        //Do nothing
      }
    })   
  }

  onDeleteAllSelected() {
    const dialog = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the selected applications?"
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
          this.appService.deleteApplication(id).subscribe((res:any) => {
            this.uiService.showSnackBarNotification("Applications were successfully deleted.", null, 3000, 'top', 'success-notification');
            dialog.close();
            this.appService.$clientApplications.next(res);
          }, error => {
              console.log(error);
              dialog.close();
          });
        }
        this.selection.clear();
      } else {
        this.selection.clear();
      }
    })
  }

 

  onViewApplication(event) {
    const id = +event.currentTarget.id.split("_")[1];
    this.router.navigate(['/client/applications/details', id]);
  }
}
