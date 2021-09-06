import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';
import { CreateClientUserComponent } from '../admin/create-client-user/create-client-user.component';
import { ImportUsersComponent } from './import-users/import-users.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedRowIndex = -1;
  id: number;
  url: string;
  subscription: Subscription;
  clientUsers = [];
  displayedColumns = [
    'index',
    'firstName',
    'lastName',
    'email',
    'action'
  ];

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });


    this.appService.getClientUsers().subscribe((res: any) => {      
      this.clientUsers = res;
      this.dataSource.data = this.clientUsers;
      dialogRef.close();
    }, error => {
      dialogRef.close();
      console.log(error);
    });
    this.subscription = this.appService.$clientUsers.subscribe(res => {
      this.clientUsers = res;
      this.dataSource.data = this.clientUsers;
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }


  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onEditUser(event) {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    const id = event.currentTarget.id.split("_")[1];
    this.appService.getClientUser(id).subscribe((res) => {
      dialogRef.close();
      this.dialog.open(CreateClientUserComponent,
        {
          minWidth: 350,
          width: '500px',
          height: 'auto',
          minHeight: '700',
          data: {
            clientUser: res
          }
        });
    }, error => {
      dialogRef.close();
      console.log(error);
    });
  }
  onDeleteUser(event) {
    const userId = event.currentTarget.id.split("_")[1];    
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the user?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //If accepted to delete
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        this.appService.deleteClientUser(userId).subscribe((res: any) => {
          this.appService.getClientUsers().subscribe((res: any[]) => {
            this.appService.$clientUsers.next(res);
            this.uiService.showSnackBarNotification("The user account was successfully deleted.", null, 3000, 'top', 'success-notification');
            dialogRef.close();
          }, error => {
            console.log(error);
            dialogRef.close();
            this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'errror-notification');
          });
        }, error => {
          dialogRef.close();
          console.log(error);
          this.uiService.showSnackBarNotification("Delete operation failed.", null, 3000, 'top', 'errror-notification');
        });
      } else {
        //Disagree to delete
      }
    });
  }
  onExportExcell() {
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }
  onCreateAdminUser() {
    this.dialog.open(CreateClientUserComponent,
      {
        minWidth: 350,
        width: '500px',
        height: 'auto',
        minHeight: '700',
        data: {
          //If any data is nedded, inject it here
        }
      }
    )
  }

  onAddBulkUser() {
    this.dialog.open(ImportUsersComponent,
      {
        minWidth: 300,
        width: '400px',        
      }
    );
  }

  onDetailUser(event) {
    const id = event.currentTarget.id.split("_")[1];
    
    console.log(id);
    this.router.navigate(['client/details',id])
  }
}
