import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';


@Component({
  selector: 'app-assigned-users',
  templateUrl: './assigned-users.component.html',
  styleUrls: ['./assigned-users.component.scss']
})
export class AssignedUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  url: string;
  selectedRowIndex = -1;
  @Input() currentRole: any;
  @Input() selectedRoleName: string;
  index = 0;
  subscription: Subscription;
  assignedUsernames = [];
  displayedColumns = [
    'index',
    'userName',
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private appService: ApplicationService, private dialog: MatDialog) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {        
    this.subscription = this.appService.$assignRoleNameChanged.subscribe(res => {
      this.selectedRoleName = res;
      const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.assignedUsernames = [];     
      this.appService.getRoleAndUser(this.selectedRoleName).subscribe((res: any) => {
        for (const val in res.userNames) {
          this.assignedUsernames.push({
            id: val,
            userName: res.userNames[val]
          })
        }
        this.dataSource.data = this.assignedUsernames;
        dialogRef.close();
      }, error => {
        console.log(error);
        dialogRef.close();
      })
    })    
  }

  onRefresh() {
    this.assignedUsernames = [];
    this.selectedRoleName = this.currentRole[0].role.name;

    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });    
    this.appService.getRoleAndUser(this.selectedRoleName).subscribe((res: any) => {
      for (const val in res.userNames) {
        this.assignedUsernames.push({
          id: val,
          userName: res.userNames[val]
        })
      }
      this.dataSource.data = this.assignedUsernames;
      dialogRef.close();
    }, error => {
      console.log(error);
      dialogRef.close();
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onExportExcell() {

  }

  highlight(row) {
    this.selectedRowIndex = row.id;
  }
}
