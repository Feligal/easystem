import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-import-client-error',
  templateUrl: './import-client-error.component.html',
  styleUrls: ['./import-client-error.component.scss']
})
export class ImportClientErrorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<ImportClientErrorComponent>) { }

  ngOnInit() {
    const unsuccessful = this.data.unsuccessful;
  }

  onClose() {
    this.dialogRef.close();
  }
}
