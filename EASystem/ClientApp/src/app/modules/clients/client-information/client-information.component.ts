import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-client-information',
  templateUrl: './client-information.component.html',
  styleUrls: ['./client-information.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ClientInformationComponent implements OnInit {
  createClientForm: FormGroup;
  portraitImage: string;
  clientData = {
    id: 0,
    firstName: '',
    lastName: '',
    otherName: '',
    userName: '',
    email: '',
    password: '',
    gender: '',
    dob: new Date,
    nrc: '',
    maritalStatus: '',
    noc: 0,
    phone: '',
    address: '',
    city: ''
  }
  subscription: Subscription;
  url: string;
  userId: string;
  client: any = {};
  clientSubject = new Subject<any>();
  @Input() text = 'Portrait';
  attachmentName: string;
  readonly maxSize = (2 * 1024 * 1024);
  //url: string;

  /** Link text */
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();

  adminUserRole = "AdminUserRole";
  private files: Array<FileUploadModel> = [];

  constructor(
    private route: ActivatedRoute,
    private appService: ApplicationService,
    private uiService: UiService,
    private router: Router,
    private dialog: MatDialog,
    private _http: HttpClient,
    @Inject('BASE_URL') private baseUrl,
  ) { }

  ngOnInit() {
    this.createClientForm = new FormGroup({
      itemId: new FormControl(''),
      firstName: new FormControl('', { validators: [Validators.required, Validators.maxLength(32)] }),
      lastName: new FormControl('', { validators: [Validators.required, Validators.maxLength(32)] }),      
      userName: new FormControl('', { validators: [Validators.required, Validators.maxLength(32)] }),            
      nrc: new FormControl('', { validators: [Validators.required, Validators.maxLength(11)] }),            
      phone: new FormControl('', { validators: [Validators.required, Validators.maxLength(30)] }),
      email: new FormControl('', { validators: [Validators.email, Validators.required, Validators.email, Validators.maxLength(40)] }),            
    })

    this.subscription = this.clientSubject
      .subscribe((res => {
        this.client = res;        
        this.portraitImage = res.portraitImage;
        this.createClientForm.patchValue({
          itemId: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          otherName: res.otherName,
          userName: res.userName,
          nrc: res.nrc,
          phone: res.phoneNumber,
          email: res.email,
        });
      }))     

    this.route.params.subscribe((params: Params) => {
      this.userId = params['id'];
      this.appService.getClientUser(this.userId).subscribe((res: any) => {
        this.client = res;        
        this.portraitImage = res.portraitImage;
        this.createClientForm.patchValue({
          itemId: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          otherName: res.otherName,
          userName: res.userName,
          nrc: res.nrc,
          phone: res.phoneNumber,
          email: res.email,
        });
      }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later or contact the system adminstrator.", null, 3000, 'top', 'errror-notification');
      })
    })
  }

  public errorHandling = (control: string, error: string) => {
    return this.createClientForm.controls[control].hasError(error);
  }
  onBack() {
    this.router.navigate(['clients']);
  }

  onClick() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file, state: 'in',
          inProgress: false, progress: 0, canRetry: false, canCancel: true
        });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

  onViewFullImage(event) {
    this.attachmentName = event.target.id.split('_')[1];
  }

  onCloseAttachment() {
    this.attachmentName = '';
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    //Show the spinner as the upload process is running
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.url = this.baseUrl + 'api/uploadPotrait/' + this.client.id;
    const fd = new FormData();
    fd.append(this.param, file.data);
    const req = new HttpRequest('POST', this.url, fd, {
      reportProgress: true
    });
    file.inProgress = true;
    file.sub = this._http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      tap(message => { }),
      last(),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        dialogRef.close();
        file.canRetry = true;
        return of(`${file.data.name} upload failed.`);
      })
    ).subscribe(
      (event: any) => {
        if (typeof (event) === 'object') {
          this.removeFileFromArray(file);
          this.complete.emit(event.body);
          this.url = this.baseUrl + 'api/getclient/' + this.client.id;
          this.appService.getClientUser(this.userId).subscribe((res: any) => {
            this.clientSubject.next(res);
            this.uiService.showSnackBarNotification("Portrait successfully uploaded.", null, 3000, 'top', 'success-notification');
            dialogRef.close();
          });
          dialogRef.close();
        }
      }, error => {
        dialogRef.close();
        console.log(error);
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later", null, 3000, 'top', 'error-notification');
      });
  }

  private uploadFiles() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
      //this.url = this.baseUrl + 'api/plotUploadAttachments/' + this.plotId;
    });
  }

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }
}
