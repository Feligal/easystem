import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-message',
  template:
    `<mat-dialog-content fxLayoutAlign="center">
    <h3>{{data.message}}</h3>
    </mat-dialog-content>
    <mat-dialog-actions fxLayoutAlign="center" fxLayoutGap="4px">
    <button mat-raised-button matTooltip="Yes" color="primary" [mat-dialog-close]="true"><mat-icon>thumb_up</mat-icon></button>
    <button mat-raised-button matTooltip="No" color="accent" [mat-dialog-close]="false"><mat-icon>thumb_down</mat-icon></button>    
  </mat-dialog-actions><br/>`
})
export class ConfirmationMessageComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) { }
  ngOnInit() {
  }
}
