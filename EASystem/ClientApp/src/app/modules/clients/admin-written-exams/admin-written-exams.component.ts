import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-admin-written-exams',
  templateUrl: './admin-written-exams.component.html',
  styleUrls: ['./admin-written-exams.component.scss']
})
export class AdminWrittenExamsComponent implements OnInit {
  exams = [];
  userId;
  constructor(
    private appService: ApplicationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private uiService: UiService
  ) { }      
  ngOnInit() {
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.route.params.subscribe((params: Params) => {
      this.userId = params['id'];
      this.appService.getAdminTakenExams(this.userId).subscribe((res: any) => {
        this.exams = res;
        spinner.close();
      }, error => {
          this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'errror-notification');
        }
      )
    })
  }
}
