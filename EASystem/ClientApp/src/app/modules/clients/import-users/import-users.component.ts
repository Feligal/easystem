import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { ImportClientErrorComponent } from '../import-client-error/import-client-error.component';

@Component({
  selector: 'app-import-users',
  templateUrl: './import-users.component.html',
  styleUrls: ['./import-users.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ImportUsersComponent implements OnInit {

  /** Link text */
  @Input() text = 'Upload';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() url;
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = ".xlsx,.xls";
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();
  private files: Array<FileUploadModel> = [];
  plot = {}

  @ViewChild('f', { static: false }) form: NgForm;
  locationId: number;
  locationName: string;
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    private appService: ApplicationService,
    private uiService: UiService,
    private _http: HttpClient,
    private router: Router,
    private dialogRef: MatDialogRef<ImportUsersComponent>,
    private dialog: MatDialog,   
  ) { }

  ngOnInit() {

  }

  private uploadFiles() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
      this.url = this.baseUrl + 'api/uploadBulkyClients/';
    });
  }


  private uploadFile(file: FileUploadModel) {
    //Show the spinner as the upload process is running
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.url = this.baseUrl + 'api/uploadBulkyClients/';
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
        spinner.close();
        file.inProgress = false;
        file.canRetry = true;
        return of(`${file.data.name} upload failed.`);
      })
    ).subscribe(
      (event: any) => {
        if (typeof (event) === 'object') {
          this.removeFileFromArray(file);
          this.complete.emit(event.body);
          if (event.body["unsuccessfulAdd"].length > 0) {
            this.dialog.open(ImportClientErrorComponent,
              {
                minWidth: 300,
                width: '500px',
                minHeight: 200,
                disableClose:true,
                data: {
                  unsuccessful: event.body["unsuccessfulAdd"]
                }
              }
            );
          } else {
            this.uiService.showSnackBarNotification("Client upload operation successfully completed.", null, 3000, 'top', 'success-notification');
          }

          this.appService.getClientUsers().subscribe((res: any) => {
            this.appService.$clientUsers.next(res);            
            spinner.close();
            this.dialogRef.close();
          }, error => {
            spinner.close();
            this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'error-notification');
          });
        }
      }, error => {
        spinner.close();
        console.log(error);
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later", null, 3000, 'top', 'error-notification');
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

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

}
