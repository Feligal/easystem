import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-client-email-confirmation',
  templateUrl: './client-email-confirmation.component.html',
  styleUrls: ['./client-email-confirmation.component.scss']
})
export class ClientEmailConfirmationComponent implements OnInit {

  url: string;
  constructor(    
    private uiService: UiService,
    private route: ActivatedRoute,
    private router: Router,
    private appService: ApplicationService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      const email = params['email'];
      const token = params['token'];
      const data = {
        email: email,
        token: token
      }
      const spinner = this.dialog.open(LoadingSpinnerComponent, {
        panelClass: 'custom-class',
        disableClose: true
      });

         
      this.appService.confirmAccountRegistration(data).subscribe(res => {
        spinner.close();
        this.uiService.showSnackBarNotification("Email confirmation was successful, you can now login", null, 6000, 'top', 'success-notification');
        this.router.navigate(['login']);
      }, error => {
        console.log(error);
        spinner.close();
      });
    })
  }
}
