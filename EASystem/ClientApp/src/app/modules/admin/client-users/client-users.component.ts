import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';
import { CreateClientUserComponent } from '../create-client-user/create-client-user.component';

@Component({
  selector: 'app-client-users',
  templateUrl: './client-users.component.html',
  styleUrls: ['./client-users.component.scss']
})
export class ClientUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRowIndex = -1;
  adminUserRole = "AdminUserRole";
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

  constructor(private dialog: MatDialog,    
    private appService: ApplicationService,
    private auth: AuthService,
    private uiService: UiService)
  { }

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
      console.log(res);
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

  onCreateClientUser() {
    this.dialog.open(CreateClientUserComponent,
      {
        minWidth: 350,
        width: '500px',
        height: 'auto',
        minHeight: '700',
        data: {
          //If any data is nedded, inject it here
        }
      })
  }
  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onEditUser(event) {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    const userId = event.currentTarget.id.split("_")[1];    
    this.appService.getClientUser(userId).subscribe((res) => {      
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
    }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //If accepted to delete
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });                
        this.appService.deleteOperatorUser(userId).subscribe((res: any) => {          
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
  highlight(row) {
    this.selectedRowIndex = row.id;
  }
}
