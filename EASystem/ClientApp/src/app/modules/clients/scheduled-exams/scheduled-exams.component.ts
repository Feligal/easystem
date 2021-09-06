import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { ScheduleExamsListComponent } from '../schedule-exams-list/schedule-exams-list.component';

@Component({
  selector: 'app-scheduled-exams',
  templateUrl: './scheduled-exams.component.html',
  styleUrls: ['./scheduled-exams.component.scss']
})
export class ScheduledExamsComponent implements OnInit {
  userId;
  exams = [];
  subscription: Subscription;
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private appService: ApplicationService,
    private uiService: UiService, private router: Router
  ) {
    this.subscription = this.appService.$pendingExams.subscribe((res: any) => {
      this.exams = res.sort((a: any, b: any) => { return b.id - a.id });
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.userId = params['id'];
      this.appService.getClientUserExams(this.userId).subscribe((res: any) => {        
        this.exams = res.sort((a: any, b: any) => { return b.id - a.id });
      }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later or contact the system adminstrator.", null, 3000, 'top', 'errror-notification');
      })
    })
  }
  onScheduleExam() {
    this.dialog.open(ScheduleExamsListComponent, {
      width: "440px",
      data: {
        userId: this.userId
      }
    })  
  }

  onBack() {
    this.router.navigate(['clients']);
  }
}
