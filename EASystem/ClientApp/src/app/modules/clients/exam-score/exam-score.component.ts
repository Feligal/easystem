import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-exam-score',
  templateUrl: './exam-score.component.html',
  styleUrls: ['./exam-score.component.scss']
})
export class ExamScoreComponent implements OnInit {
  title: string;
  constructor(@Inject(MAT_DIALOG_DATA) private data) { }
  ngOnInit() {
    if (this.data.percentage >= 50) {
      this.title = "Congratulations!!! You have passed."
    } else {
      this.title = "Sorry, failed."
    }
  }
}
