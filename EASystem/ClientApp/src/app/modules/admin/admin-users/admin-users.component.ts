import { OnDestroy, ViewChild } from '@angular/core';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

import { CreateAdminUserComponent } from '../create-admin-user/create-admin-user.component';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRowIndex = -1;
  id: number;
  url: string;
  subscription: Subscription;
  adminUsers = [];
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

    
    this.appService.getAdminUsers().subscribe((res: any) => {      
      this.adminUsers = res;
      this.dataSource.data = this.adminUsers;
      dialogRef.close();
    }, error => {
      dialogRef.close();
      console.log(error);
    });
    this.subscription = this.appService.$clientUser.subscribe(res => {
      this.adminUsers = res;
      this.dataSource.data = this.adminUsers;
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
    this.appService.getAdminUser(id).subscribe((res) => {
      dialogRef.close();
      this.dialog.open(CreateAdminUserComponent,
        {
          minWidth: 350,
          width: '500px',
          height: 'auto',
          minHeight: '700',
          data: {
            adminUser: res
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
        this.appService.deleteAdminUser(userId).subscribe((res: any) => {          
          this.appService.getAdminUsers().subscribe((res: any[]) => {
            this.appService.$clientUser.next(res);
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
    this.dialog.open(CreateAdminUserComponent,
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
}
