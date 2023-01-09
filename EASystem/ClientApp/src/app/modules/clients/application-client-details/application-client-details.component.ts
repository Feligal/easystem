import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-application-client-details',
  templateUrl: './application-client-details.component.html',
  styleUrls: ['./application-client-details.component.scss']
})
export class ApplicationClientDetailsComponent implements OnInit {

  myForm: FormGroup;
  constructor(
    private appService: ApplicationService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder) {
    this.createForm();
  }
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const id = +params['id'];
      this.appService.getClientApplication(id).subscribe((res: any) => {
        this.myForm.patchValue({
          id: res.id,
          subject: res.subject,
          applicationText: res.applicationText
        })
      })
    })
  }
  createForm() {
    this.myForm = this.fb.group({
      id: [''],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      applicationText: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

  onBack() {
    this.router.navigate(['client/applications']);
  }
}
