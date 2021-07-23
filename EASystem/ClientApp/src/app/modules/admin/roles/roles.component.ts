import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

import { CreateRoleComponent } from '../create-role/create-role.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, OnDestroy {
  onShowUserAssign = false;
  onShowUserAssigned = false;
  displayedColumns = [
    'index',
    'name',
    'action'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  selectedRowIndex = -1;
  id: number;
  url: string;
  selectedRoleId: string;
  selectedRole: any;
  selectedRoleName: string;
  
  subscription: Subscription;
  roles = [];
  constructor(    
    private appService: ApplicationService,
    private dialog: MatDialog,
    private uiService: UiService) {
    this.subscription = this.appService.$userRoles.subscribe((res: any) => {
      this.roles = res;
      this.dataSource.data = res;
    })
  }

  ngOnInit() {
    this.getUserRoles();
  }

  getUserRoles() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });    
    this.appService.getRoles().subscribe((res: any) => {
      this.roles = res;      
      this.dataSource.data = res;
      this.appService.$userRoles.next(res);
      dialogRef.close();
    }, (error: any) => {
      console.log(error);
      dialogRef.close();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  onCreateRole() {
    this.dialog.open(CreateRoleComponent,
    {
      minWidth: 350,
      width: '500px',
      height: 'auto',
      minHeight: '700',
      data: {
        //currentRole: this.selectedRole
      }
    });
  }

  onEditRole(event ) {
    const id = event.currentTarget.id.split("_")[1];
    const name = event.currentTarget.id.split("_")[2];
    this.dialog.open(CreateRoleComponent,
      {
        minWidth: 350,
        width: '500px',
        height: 'auto',
        minHeight: '700',
        data: {
          roleId: id,
          name: name
        }
    });
  }

  onViewAssignedUsers(event) {
    this.onShowUserAssign = false;
    this.onShowUserAssigned = true;
    this.selectedRoleName = event.currentTarget.name.split("_")[1];
    this.selectedRole = this.roles.filter(x => x.role.name === this.selectedRoleName);
    this.appService.$assignRoleNameChanged.next(this.selectedRoleName);
  }

  onAssignUsers(event) {    
    this.onShowUserAssign = true;
    this.onShowUserAssigned = false;
    this.selectedRoleId = event.currentTarget.id.split("_")[1];
    this.selectedRole = this.roles.filter(x => x.role.id === this.selectedRoleId);
    this.appService.$assignRoleIdChanged.next(this.selectedRoleId);
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  onDeleteRole(event) {
    this.selectedRoleId = event.currentTarget.id.split("_")[1];
    const dialogRef = this.dialog.open(ConfirmationMessageComponent,
      {
        data: {
          message: "Are you sure you want to delete the user role?"
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
        this.appService.deleteUserRole(this.selectedRoleId).subscribe(res => {          
          this.appService.getRoles().subscribe((res: any[]) => {
            this.appService.$userRoles.next(res);
            this.uiService.showSnackBarNotification("The user role was successfully deleted.", null, 3000, 'top', 'success-notification');
            dialogRef.close();
          }, error => {
            console.log(error);
            dialogRef.close();
          });
        }, error => {
          console.log(error);
          dialogRef.close();
        });
      } else {
        //Disagree to delete
      }
    });
  }
}
