import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-department-user',
  templateUrl: './department-user.component.html',
  styleUrls: ['./department-user.component.scss']
})
export class DepartmentUserComponent implements OnInit {
  departmentId: number;
  departmentName: string;
  selection = new SelectionModel<any>(true, []);
  selection2 = new SelectionModel<any>(true, []);
  selectedRowIndex = -1;
  id: number;
  url: string;
  subscription: Subscription;
  subscription2: Subscription;
  adminUsers = [];
  adminUsers2 = [];
  displayedColumns = [
    'index',
    'firstName',
    'lastName',
    'email',
    'select'    
  ];

  dataSource = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
  ngOnInit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.route.params.subscribe((params: Params) => {
      this.departmentId = +params['departmentId'];
      this.appService.getDepartmentById(this.departmentId).subscribe((res: any) => {
        this.departmentName = res.name;
      })
      this.appService.getDepartmentUsers(this.departmentId).subscribe((res: any) => {
        this.adminUsers = res;
        this.dataSource.data = this.adminUsers;
        dialogRef.close();
      }, error => {
        dialogRef.close();
        console.log(error);
      });
      this.subscription = this.appService.$clientUsers.subscribe(res => {
        this.adminUsers = res;
        this.dataSource.data = this.adminUsers;      
      })
    });



    this.appService.getNoDepartmentUsers().subscribe((res: any) => {
      this.adminUsers2 = res;
      this.dataSource2.data = this.adminUsers2;
      dialogRef.close();
    }, error => {
      dialogRef.close();
      console.log(error);
    });
    this.subscription2 = this.appService.$adminUsers.subscribe(res => {
      this.adminUsers2 = res;
      this.dataSource2.data = this.adminUsers2;
    })
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



  checkboxLabel2(row?: any): string {
    if (!row) {
      return `${this.isAllSelected2() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection2.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  masterToggle2() {
    this.isAllSelected2() ?
      this.selection2.clear() : this.dataSource2.data.forEach(row => this.selection2.select(row));
  }
  isAllSelected2() {
    const numSelected = this.selection2.selected.length;
    const numRows = this.dataSource2.data.length;
    return numSelected === numRows;
  }





  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
  }


  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //onEditUser(event) {
  //  const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
  //    panelClass: 'custom-class',
  //    disableClose: true
  //  });
  //  const id = event.currentTarget.id.split("_")[1];
  //  this.appService.getClientUser(id).subscribe((res) => {
  //    dialogRef.close();
  //    this.dialog.open(CreateClientUserComponent,
  //      {
  //        minWidth: 350,
  //        width: '500px',
  //        height: 'auto',
  //        minHeight: '700',
  //        data: {
  //          clientUser: res
  //        }
  //      });
  //  }, error => {
  //    dialogRef.close();
  //    console.log(error);
  //  });
  //}
  //onDeleteUser(event) {
  //  const userId = event.currentTarget.id.split("_")[1];
  //  const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
  //    data: {
  //      message: "Are you sure you want to delete the user?"
  //    }
  //  });
  //  dialogRef.afterClosed().subscribe(result => {
  //    if (result) {
  //      //If accepted to delete
  //      const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
  //        panelClass: 'custom-class',
  //        disableClose: true
  //      });
  //      this.appService.deleteClientUser(userId).subscribe((res: any) => {
  //        this.appService.getClientUsers().subscribe((res: any[]) => {
  //          this.appService.$clientUsers.next(res);
  //          this.uiService.showSnackBarNotification("The user account was successfully deleted.", null, 3000, 'top', 'success-notification');
  //          dialogRef.close();
  //        }, error => {
  //          console.log(error);
  //          dialogRef.close();
  //          this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'errror-notification');
  //        });
  //      }, error => {
  //        dialogRef.close();
  //        console.log(error);
  //        this.uiService.showSnackBarNotification("Delete operation failed.", null, 3000, 'top', 'errror-notification');
  //      });
  //    } else {
  //      //Disagree to delete
  //    }
  //  });
  //}
  //onExportExcell() {
  //}

  onRemoveAllSelected() {
    const selectedItems = this.selection.selected;
    let selectedIds = []
    for (const item of selectedItems) {
      const id = item.id;
      selectedIds.push(id);
    }
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.RemoveAdminsFromDepartment(this.departmentId, selectedIds).subscribe((res: any) => {      
      this.appService.$clientUsers.next(res.users1)
      this.appService.$adminUsers.next(res.users2)
      this.selection.clear();
      dialogRef.close();
      this.uiService.showSnackBarNotification("Successfully removed user's access privaledge from department", null, 3000, 'top', 'success-notification');
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing,try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  onAddAllSelected() {
    const selectedItems = this.selection2.selected;
    let selectedIds = []
    for (const item of selectedItems) {
      const id = item.id;
      selectedIds.push(id);
    }
    this.appService.AddAdminsToDepartment(this.departmentId, selectedIds).subscribe((res:any) => {
      this.appService.$clientUsers.next(res.users1)
      this.appService.$adminUsers.next(res.users2)
      this.selection2.clear();
      this.uiService.showSnackBarNotification("Successfully added user's access privaledge to department", null, 3000, 'top', 'success-notification');
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing,try again later.", null, 3000, 'top', 'error-notification');
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }
  //onCreateAdminUser() {
  //  this.dialog.open(CreateClientUserComponent,
  //    {
  //      minWidth: 350,
  //      width: '500px',
  //      height: 'auto',
  //      minHeight: '700',
  //      data: {
  //        //If any data is nedded, inject it here
  //      }
  //    }
  //  )
  //}

  //onAddBulkUser() {
  //  this.dialog.open(ImportUsersComponent,
  //    {
  //      minWidth: 300,
  //      width: '400px',
  //    }
  //  );
  //}

  //onDetailUser(event) {
  //  const id = event.currentTarget.id.split("_")[1];
  //  this.router.navigate(['client/details', id])
  //}

}
