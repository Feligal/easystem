import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-company-information',
  templateUrl: './company-information.component.html',
  styleUrls: ['./company-information.component.scss']
})
export class CompanyInformationComponent implements OnInit {
  myForm: FormGroup;
  url: string;
  objectData = {
    name: '',
    aliase: '',
    address: '',
    city: '',
    country: '',
    contact: '',
    fax: '',
    email: '',
    website: '',
  }
  companyInfo: any;
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
    private fb: FormBuilder, ) { }

  ngOnInit() {
    this.createForm();
    this.getCompanyInformation();
  }

  getCompanyInformation() {

    this.appService.getCompanyInformation().subscribe((res: any[]) => {
      if (res.length > 0) {
        this.companyInfo = res[0];
        this.myForm.patchValue({
          name: this.companyInfo.name,
          aliase: this.companyInfo.aliase,
          address: this.companyInfo.address,
          city: this.companyInfo.city,
          country: this.companyInfo.country,
          contact: this.companyInfo.contact,
          fax: this.companyInfo.fax,
          email: this.companyInfo.email,
          website: this.companyInfo.website,
        })
      }
    });
  }


  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  createForm() {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      aliase: ['', [Validators.required, Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      contact: ['', [Validators.required, Validators.maxLength(100)]],
      fax: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.maxLength(100)]],
      website: ['', [Validators.maxLength(100)]],
    });
  }

  getFormControl(name: string) {
    return this.myForm.get(name);
  }

  onSubmit() {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.objectData.name = this.myForm.value.name;
    this.objectData.aliase = this.myForm.value.aliase;
    this.objectData.address = this.myForm.value.address;
    this.objectData.city = this.myForm.value.city;
    this.objectData.country = this.myForm.value.country;
    this.objectData.contact = this.myForm.value.contact;
    this.objectData.fax = this.myForm.value.fax;
    this.objectData.email = this.myForm.value.email;
    this.objectData.website = this.myForm.value.website;

    if (this.companyInfo) {
      //Edit
      this.url = this.baseUrl + 'api/editcompanyinfo/';
      this.appService.updateCompanyInfo(this.objectData).subscribe(res => {
        this.uiService.showSnackBarNotification("Information updated successfully.", null, 3000, 'top', 'success-notification');
        dialogRef.close();
      }, error => {
        //An error occured
        dialogRef.close();
        console.log(error);
        this.uiService.showSnackBarNotification("An error occured while processing.", null, 3000, 'top', 'error-notification');
      })
    } else {
      //Create New
      this.url = this.baseUrl + 'api/createcompanyinfo/';
      this.appService.createCompanyInfo(this.objectData).subscribe(res => {
        this.uiService.showSnackBarNotification("Information added successfully.", null, 3000, 'top', 'success-notification');
        dialogRef.close();
      }, error => {
        //An error occured
        dialogRef.close();
        console.log(error);
        this.uiService.showSnackBarNotification("An error occured while processing.", null, 3000, 'top', 'error-notification');
      });
    }
  }

}
