import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';



@Component({
  selector: 'app-pending-exams',
  templateUrl: './pending-exams.component.html',
  styleUrls: ['./pending-exams.component.scss']
})
export class PendingExamsComponent implements OnInit, OnDestroy{
  subscription: Subscription;
  constructor(
    private appService: ApplicationService,
    private uiService: UiService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  

  exams = [];
  ngOnInit() {
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getClientUserPendingExams().subscribe((res: any) => {
      this.exams = res.sort((a: any, b: any) => { return b.id - a.id });
      spinner.close();
    }, error => {
        
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        spinner.close();
    });


    history.pushState(null, null, location.href);
    this.subscription = fromEvent(window, 'popstate').subscribe(_ => {
      history.pushState(null, null, location.href);
      this.uiService.showSnackBarNotification("You can not go back, exam is in process.", null, 3000, 'top', 'error-notification');
    })
  }

  onCancel() {
    this.router.navigate(['clients']);
  }  

  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    const examdata = localStorage.getItem('exam_data');
    if (examdata) {
      if (confirm("An examination session is in process! If you leave, your examination answers will be lost.")) {
        alert("You have refreshed the browser");
        return true;
      } else {
        return false;
      }
    }else {
      return true;
    }
  }
}
