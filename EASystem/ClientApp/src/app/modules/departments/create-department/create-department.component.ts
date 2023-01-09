import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-create-department',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.scss']
})
export class CreateDepartmentComponent implements OnInit {

  departmentData = {
    name: '',
  }
  departments = [];
  myForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<CreateDepartmentComponent>,
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService)
  { }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }
  onClear() {
    this.myForm.reset();
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.myForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
    });
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getDepartments().subscribe((res: any) => {
      this.departments = res;
      spinner.close();
    }, error => {
      spinner.close();
      this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  onSave() {
    this.departmentData.name = this.myForm.value.name;
    let duplicateDepartment = [];
    duplicateDepartment = this.departments.filter(x => x.name === this.departmentData.name);
    if (duplicateDepartment.length === 0) {
      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });
      this.appService.createDepartment(this.departmentData).subscribe(res => {
        this.appService.$departments.next(res);
        spinner.close();
        this.dialogRef.close();
        this.uiService.showSnackBarNotification("The Department was successfully created.", null, 3000, 'top', 'success-notification');
      }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing ther request, try again later.", null, 3000, 'top', 'error-notification');
      })
    } else {
        this.uiService.showSnackBarNotification("The name already exist, use a different name.", null, 3000, 'top', 'error-notification');
    }
  }

}
