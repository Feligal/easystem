import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExpandCollapseStatusEnum, ExpandedLTR, ExpandedRTL, MultilevelMenuService, SlideInOut } from 'ng-material-multilevel-menu';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';
import { FileUploadModel } from '../../../interface/file-upload-model';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    SlideInOut,
    ExpandedLTR,
    ExpandedRTL,

    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit{
  userSubscription: Subscription;
  portraitImage: string;
  client: any = {};
  subscription: Subscription;
  clientSubject = new Subject<any>();
  currentUser: any;
  url: string;
  attachmentName: string;
  readonly maxSize = (2 * 1024 * 1024);
  @Input() param = 'file';
  /** Target URL for file uploading. */
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();
  private files: Array<FileUploadModel> = [];
  config = {
    //paddingAtStart: true,
    //interfaceWithRoute: true,
    //classname: 'side-nav-menu',
    ////listBackgroundColor: `rgb(208, 241, 239)`,
    ////FOR DARK THEME
    ////fontColor: `rgb(8, 54, 71)`,
    ////fontColor: `rgb(255, 244, 244)`,

    //fontColor: '#404040',
    //backgroundColor: '#f2f2f2',

    ////backgroundColor: `rgb(208, 241, 239)`,
    ////selectedListFontColor: `red`,
    //highlightOnSelect: true,
    //collapseOnSelect: true,
    //useDividers: true,
    //rtlLayout: false,


    paddingAtStart: true,
    interfaceWithRoute: true,
    classname: 'side-nav-menu',
    //listBackgroundColor: `rgb(208, 241, 239)`,
    //FOR DARK THEME
    //fontColor: `rgb(8, 54, 71)`,
    //fontColor: `rgb(255, 244, 244)`,

    fontColor: '#404040',
    backgroundColor: '#f2f2f2',

    //backgroundColor: `rgb(208, 241, 239)`,
    //selectedListFontColor: `red`,
    highlightOnSelect: true,
    collapseOnSelect: true,
    useDividers: true,
    rtlLayout: false,
    
  };

  homeMenuItem = [
    {
      label: 'Home',
      icon: 'home',
      link: '/home',
    }
  ];

  appitems_loggedIn = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: 'dashboard',
      hidden: false
    },    
    {
      label: 'Examinations',
      link: '/examinations',
      icon: 'library_books',
      hidden: false,
    },
    {
      label: 'Scheduled Exams',
      link: '/scheduledexams',
      icon: 'pending_actions',
      hidden: false,
    },
    {
      label: 'Exam Records',
      link: '/examrecords',
      icon: 'grading',
      hidden: false,      
    },
    {      
      label: 'Client Profiles',
      link: '/clients',
      icon: 'groups',
      hidden: false,         
    },        
  ];

  adminMenuItems = [
    {
      label: 'Admin Area',
      icon: 'manage_accounts',
      items: [
        {
          label: 'User Roles',
          link: '/admin/roles',
          icon: 'tunes',
        },
        {
          label: 'Admin Users',
          link: '/admin/adminUsers',
          icon: 'people_alt',
          disabled: false,
        },
        {
          label: 'Client Users',
          link: '/admin/clientUsers',
          icon: 'supervised_user_circle',
          disabled: false,
        },
        {
          label: 'Departments',
          link: '/admin/departments',
          icon: 'corporate_fare',
          disabled: false,
        },

        {
          label: 'System Logs',
          link: '/admin/systemlogs',
          icon: 'description',
          disabled: false,
        },
        {
          label: 'Company Info',
          link: '/admin/company',
          icon: 'business',
          disabled: false,
        },

        {
          label: 'CAA Website',
          link: 'http://www.caa.co.zm',
          icon: 'public',
          disabled: false,
          externalRedirect: true
        },
      ]
    },
  ]
  clientUserMenuItems = [
    {
      label: 'Scheduled Exams',
      link: '/client/scheduledexams',
      icon: 'assignment',
    },
    {
      label: 'Written Exams',
      link: '/client/writtenexams',
      icon: 'assignment_turned_in',
      disabled: false,
    },        
    {
      label: 'Applications',
      link: '/client/applications',
      icon: 'email',
      disabled: false,
    },
    {
      label: 'Uploaded Docs',
      link: '/client/documents',
      icon: 'drive_folder_upload',
      disabled: false,
    }
  ];

  adminUserRole = "AdminUserRole";
  clientUserRole = "ClientUserRole";

  constructor(
    private multilevelMenuService: MultilevelMenuService,
    private authService: AuthService,
    private dialog: MatDialog,
    private _http: HttpClient,
    @Inject('BASE_URL') private baseUrl,
    private appService: ApplicationService,
    private uiService: UiService,

  ) {
   
  }

  setExpandCollapseStatus(type: ExpandCollapseStatusEnum) {
    this.multilevelMenuService.setMenuExapandCollpaseStatus(type);
  }

  ngOnInit() {
    
    this.userSubscription = this.authService.$currentUser.subscribe(
      res => {        
        this.currentUser = res;        
        this.appService.getClientUserByUsername(this.currentUser).subscribe((res: any) => {          
          this.client = res;
          this.clientSubject.next(res);          
          this.portraitImage = res.portraitImage          
        });
    });

    this.subscription = this.clientSubject
      .subscribe((res => {        
        this.client = res;
        this.portraitImage = res.portraitImage;        
      }))
  }

  getClass(item) {
    return {
      [item.faIcon]: true
    }
  }

  selectedItem($event) {
    console.log($event);
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
          this.appService.getClientUserByUsername(this.currentUser).subscribe((res: any) => {
            this.clientSubject.next(res);
            this.portraitImage = res.clientUserProfile.portraitImage
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
