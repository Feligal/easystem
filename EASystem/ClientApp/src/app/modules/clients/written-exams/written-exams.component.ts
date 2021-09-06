import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-written-exams',
  templateUrl: './written-exams.component.html',
  styleUrls: ['./written-exams.component.scss']
})
export class WrittenExamsComponent implements OnInit {
  constructor(private router: Router, private appService: ApplicationService, private dialog: MatDialog, private uiService: UiService) { }
  exams = [];  
  ngOnInit() {    
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.getClientUserTakenExams().subscribe((res: any) => {      
      this.exams = res;
      spinner.close();
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
        spinner.close();
    });
  } 
}
