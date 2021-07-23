import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-pending-exams',
  templateUrl: './pending-exams.component.html',
  styleUrls: ['./pending-exams.component.scss']
})
export class PendingExamsComponent implements OnInit {
  constructor(
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
  ) { }
  exams = [];
  ngOnInit() {
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getClientUserPendingExams().subscribe((res: any) => {
      this.exams = res;
      spinner.close();
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        spinner.close();
    });
  }
}
