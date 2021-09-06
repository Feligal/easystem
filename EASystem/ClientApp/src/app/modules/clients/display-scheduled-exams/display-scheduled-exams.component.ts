import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmationMessageComponent } from '../../../confirmation-message/confirmation-message.component';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-display-scheduled-exams',
  templateUrl: './display-scheduled-exams.component.html',
  styleUrls: ['./display-scheduled-exams.component.scss']
})
export class DisplayScheduledExamsComponent implements OnInit {
  @Input() examData: any;
  clientUserRole = "ClientUserRole";
  constructor(
    private authService: AuthService,
    private appService: ApplicationService,
    private dialog: MatDialog,
    private uiService: UiService
  ) { }

  ngOnInit() {

  }

  onCancel(event) {
    const id = +event.currentTarget.id.split("_")[1];
    const dialogRef = this.dialog.open(ConfirmationMessageComponent, {
      data: {
        message: "Are you sure you want to delete the exam?"
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
          panelClass: 'custom-class',
          disableClose: true
        });
        this.appService.deleteCancelExam(id).subscribe((res: any) => {
          this.appService.getClientUserExams(this.examData.userId).subscribe(res => {
            this.appService.$pendingExams.next(res);
            dialogRef.close();
            this.uiService.showSnackBarNotification("The exam was successfully cancelled.", null, 3000, 'top', 'success-notification');
          })
        }, error => {
          dialogRef.close();
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        });
      } else {
        //Do nothing
      }
    })    
  }
}
