import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  company: any;
  year: number;
  date = new Date();
  constructor(private appService: ApplicationService) { }

  ngOnInit() {
    this.year = this.date.getFullYear();
    this.appService.getCompanyInformation().subscribe((res: any) => {
      this.company = res[0];      
    })    
  }
}
