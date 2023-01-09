import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-enable-twofactor',
  templateUrl: './enable-twofactor.component.html',
  styleUrls: ['./enable-twofactor.component.scss']
})
export class EnableTwofactorComponent implements OnInit {

  isTwoFactor: any;
  formGroup: FormGroup;
  constructor(
    private dialog: MatDialog,
    private uiService: UiService,
    private authService: AuthService,
    formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      enable2Factor: '',
    });
  }

  ngOnInit() {
    this.authService.getTwoFactorAuthentication().subscribe((res: any) => {
      this.isTwoFactor = res.isTwoFactor;
      this.formGroup.patchValue({
        enable2Factor: res.isTwoFactor
      })
    })
  }

  onSubmit() {
    const data = this.formGroup.value;
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.authService.enableTwoFactorAuthentication(data).subscribe((res: any) => {
      if (res.message === "Success") {
        this.uiService.showSnackBarNotification("2 Factor Authentication was successfully changed.", null, 3000, 'top', 'success-notification');
      }
      if (res.message === "Error") {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      }
      dialogRef.close();
    })
  }

}
