import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable()
export class UiService {

  constructor(private snackBar: MatSnackBar) { }
  showSnackBarNotification(message: string, action, duration, position, panelClass) {
    const config = new MatSnackBarConfig();
    config.panelClass = [panelClass];
    config.verticalPosition = position;
    config.duration = duration;
    this.snackBar.open(message, action, config)
  }
}
