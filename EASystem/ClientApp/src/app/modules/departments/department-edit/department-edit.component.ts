import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.scss']
})
export class DepartmentEditComponent implements OnInit {

  department: any;
  departmentId: number;
  departmentData = {    
    name: '',
  }  
  departments = [];
  myForm: FormGroup;
  constructor(
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

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
    }, error => {
      this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    });
    this.route.params.subscribe((params: Params) => {
      this.departmentId = +params['departmentId'];
      this.appService.getDepartmentById(this.departmentId).subscribe((res: any) => {
        this.department = res;
        spinner.close();
        this.myForm.patchValue({
          name: res.name,          
        });
      }, error => {
        spinner.close();
      });
    })
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }
  onClear() {
    this.myForm.reset();
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
      this.appService.editDepartment(this.departmentId, this.departmentData).subscribe(res => {
        this.appService.$departments.next(res);
        spinner.close();
        this.uiService.showSnackBarNotification("The department was successfully updated.", null, 3000, 'top', 'success-notification');
      }, error => {
        spinner.close();
        this.uiService.showSnackBarNotification("An error occured while processing ther request, try again later.", null, 3000, 'top', 'error-notification');
      })
    } else {
      this.uiService.showSnackBarNotification("The name already exist, use a different name.", null, 3000, 'top', 'error-notification');
    }
  }

}
