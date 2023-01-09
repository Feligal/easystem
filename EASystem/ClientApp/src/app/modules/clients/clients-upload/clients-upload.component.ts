import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { map, tap, last, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-clients-upload',
  templateUrl: './clients-upload.component.html',
  styleUrls: ['./clients-upload.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ClientsUploadComponent implements OnInit {

  attachmentName: string;
  readonly maxSize = (2 * 1024 * 1024);
  //url: string;

  /** Link text */
  @Input() text = 'Upload';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() url;
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();

  clientId: number;
  private files: Array<FileUploadModel> = [];
  thumbNails: any[] = [];
  subscription: Subscription;
  subscrip: Subscription;
  constructor(
    @Inject('BASE_URL') private baseUrl,
    private appService: ApplicationService,
    private uiService: UiService,
    private _http: HttpClient,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.subscription = this.appService.$clientAttachments.subscribe((res: any) => {
      this.thumbNails = res;
    });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscrip.unsubscribe();
  }

  ngOnInit() {
    this.appService.getClientAttachments().subscribe(
      (res: any) => {
        this.thumbNails = res;
      }
    );
    this.subscrip = this.appService.$clientAttachments.subscribe(
      (res: any) => {
        this.thumbNails = res;
    });
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

  onDeleteAttachment(event) {
    const dialogRef = this.dialog.open(ConfirmationMessageComponent,
      {
        data: {
          message: "Are you sure you want to delete the attachment?"
        }
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });        
        this.appService.deleteClientAttachment(this.attachmentName).subscribe((res) => {
          this.uiService.showSnackBarNotification("Attachment successfully deleted", null, 3000, 'top', 'success-notification');          
          this.attachmentName = "";
          this.appService.getClientAttachments().subscribe((res: any) => {
            this.appService.$clientAttachments.next(res);
            dialogRef.close();
          }, error => {
            dialogRef.close();
          });
        }, error => {
          dialogRef.close();
        });
      }
    });
  }

  onCloseAttachment() {
    this.attachmentName = '';
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.url = this.baseUrl + 'api/clientUploadAttachment/';
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
        file.canRetry = true;
        return of(`${file.data.name} upload failed.`);
      })
    ).subscribe(
      (event: any) => {
        if (typeof (event) === 'object') {
          this.removeFileFromArray(file);
          this.complete.emit(event.body);          
          this.appService.getClientAttachments().subscribe((res: any) => {
            this.appService.$clientAttachments.next(res);
            this.uiService.showSnackBarNotification("Attachment successfully uploaded.", null, 3000, 'top', 'success-notification');
          }, error => {
            console.log(error);
            dialogRef.close();
          });
        }
        dialogRef.close();
      });
  }

  private uploadFiles() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
      this.url = this.baseUrl + 'api/clientUploadAttachments/' + this.clientId;
    });
  }

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

}
