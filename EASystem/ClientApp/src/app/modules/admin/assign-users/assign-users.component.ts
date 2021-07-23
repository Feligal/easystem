import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-assign-users',
  templateUrl: './assign-users.component.html',
  styleUrls: ['./assign-users.component.scss']
})
export class AssignUsersComponent implements OnInit, AfterViewInit{  
  @ViewChild('f', { static: true }) roleForm: NgForm;
  @Input() currentRole: any;
  @Input() selectedRoleId;
  subscription: Subscription;
  url: string;
  roleId = "";

  members = [];
  selectedRowIndex = -1;
  selectedRowIndex2 = -1;
  nonMembers = [];
  displayedColumns = [
    'index',
    'userName',
    'selection'
  ];

  displayedColumns2 = [
    'index2',
    'userName2',
    'selection2'
  ];
  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  selection2 = new SelectionModel<any>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort, { static: true }) sort2: MatSort;

  //@ViewChild(MatPaginator, { static: true }) paginator1: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;

  constructor(    
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog)
  {
    
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource1.data.length;
    return numSelected === numRows;
  }

  isAllSelected2() {
    const numSelected = this.selection2.selected.length;
    const numRows = this.dataSource2.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource1.data.forEach(row => this.selection.select(row));
  }

  masterToggle2() {
    this.isAllSelected2() ?
      this.selection2.clear() :
      this.dataSource2.data.forEach(row => this.selection2.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  checkboxLabel2(row?: any): string {
    if (!row) {
      return `${this.isAllSelected2() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection2.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {   
    this.subscription = this.appService.$assignedRoles.subscribe((res: any) => {
      this.members = res.members;
      this.dataSource2.data = this.members;

      this.nonMembers = res.nonMembers;
      this.dataSource1.data = this.nonMembers;
    });    
    this.appService.$assignRoleIdChanged.subscribe(res => {      
      this.roleId = res;
      this.getUserAssignedRole();
    });
  }

  getUserAssignedRole() {    
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    //this.roleId = this.currentRole[0].role.id;

    this.appService.getUserAdminAssignedRoles(this.roleId).subscribe((res: any) => {
      this.members = res.members;
      this.dataSource2.data = this.members;

      this.nonMembers = res.nonMembers;
      this.dataSource1.data = this.nonMembers;

      this.roleForm.form.patchValue({
        roleName: res.role.name,
        roleId: res.role.id
      });
      dialogRef.close();
    }, error => {
      dialogRef.close();
      console.log(error);
    });
  }


  onRefresh() {
    if (this.roleId) {      
      this.appService.getUserAdminAssignedRoles(this.roleId).subscribe((res: any) => {
          this.members = res.members;
          this.dataSource2.data = this.members;
          this.nonMembers = res.nonMembers;
          this.dataSource1.data = this.nonMembers;
        }, error => {
          console.log(error);
        });
    }
   
  }

  ngAfterViewInit(): void {
    this.dataSource1.sort = this.sort;    
    this.dataSource2.sort = this.sort2;
    this.dataSource2.paginator = this.paginator2;
  }

  doFilter(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }


  doFilter2(filterValue: string) {
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  onExportExcell() {
  }
  onExportExcell2() {
  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  highlight2(row) {
    this.selectedRowIndex2 = row.id;
  }
  onSave() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    const roleData = {
      roleName: '',
      roleId: '',
      idsToAdd: [],
      idsToDelete: []
    }
    for (let v in this.roleForm.value) {
      roleData.roleId = this.roleForm.value['roleId'];
      roleData.roleName = this.roleForm.value['roleName'];
      if (this.roleForm.value[v] === true && v.startsWith('IdsToAdd')) {
        const id = v.split('_')[1];
        roleData.idsToAdd.push(id);
      }
      if (this.roleForm.value[v] === true && v.startsWith('IdsToDelete')) {
        const id = v.split('_')[1];
        roleData.idsToDelete.push(id);
      }
    }
    
    this.appService.assignUserRole(roleData).subscribe((res) => {      
      this.appService.getUserAdminAssignedRoles(this.roleId).subscribe((res: any) => {
        this.appService.$assignedRoles.next(res);
        this.uiService.showSnackBarNotification("The role was successfully updated.", null, 3000, 'top', 'success-notification');
        dialogRef.close();
      }, error => {
        dialogRef.close();
        console.log(error);
      });
    }, error => {
      console.log(error);
      dialogRef.close();
    });
  }

}
