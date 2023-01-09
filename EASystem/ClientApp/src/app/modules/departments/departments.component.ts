import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';
import { CreateDepartmentComponent } from './create-department/create-department.component';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  departmentSubscription: Subscription;
  departments = [];
  pagedDepartments = [];
  length: number;
  selectedDepartmentId: number
  activeExam
  constructor(
    private appService: ApplicationService,
    private router: Router,
    private dialog: MatDialog,
    private uiService: UiService) { }

  ngOnInit() {
    this.departmentSubscription = this.appService.$departments.subscribe(res => {
      this.departments = res;
      this.length = this.departments.length;
      const offset = ((this.paginator.pageIndex + 1) - 1) * this.paginator.pageSize;
      this.pagedDepartments = this.departments.slice((offset)).slice(0, this.paginator.pageSize);
    })
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getDepartments().subscribe((res: any[]) => {      
      this.departments = res;
      this.length = this.departments.length;
      const offset = ((this.paginator.pageIndex + 1) - 1) * this.paginator.pageSize;
      this.pagedDepartments = this.departments.slice((offset)).slice(0, this.paginator.pageSize);
      spinner.close();
    }, error => {
      console.log(error);
      spinner.close();
    })
  }
  ngOnDestroy() {
    this.departmentSubscription.unsubscribe();
  }

  onSelectExam(event) {
    this.selectedDepartmentId = +event.currentTarget.id.split("_")[1];
    const activeDepartment = this.departments.filter(i => i.id === this.selectedDepartmentId);
    this.appService.activeExam = activeDepartment;
    this.router.navigate(['admin/departments']);
  }

  onShowDepartmentUsers() {
    this.router.navigate(['admin/departments/users/' + this.selectedDepartmentId]);
  }

  onShowDepartmentExams() {
    this.router.navigate(['admin/departments/exams/' + this.selectedDepartmentId]);
  }

  pageChangeEvent(event) {
    const offset = ((event.pageIndex + 1) - 1) * event.pageSize;
    this.pagedDepartments = this.departments.slice(offset).slice(0, event.pageSize);
  }

  onShowEdit() {
    this.router.navigate(['admin/departments/editdepartment/' + this.selectedDepartmentId]);
  }
  
  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the department?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const spinner = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });

        this.appService.deleteDepartment(this.selectedDepartmentId).subscribe(res => {
          this.appService.$departments.next(res);
          this.uiService.showSnackBarNotification("The department was successfully deleted.", null, 3000, 'top', 'success-notification');
          spinner.close();
        }, error => {
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        });
      } else {
        //Do nothing
      }
    });
  }

  onAddDepartment() {
    this.dialog.open(CreateDepartmentComponent, {
      width: '400px',
    })
  }  
}
