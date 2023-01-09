import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { Observable, Subject, Subscription } from 'rxjs';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../services/application.service';
import { UiService } from '../../services/ui.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  logoImageBlob = [];
  companyInfo: any;
  $examRecordSubject = new Subject<any>();
  subscription: Subscription;
  firstDate: any;
  secondDate: any;
  statsDataCopy: any;
  statsData: any;
  Highcharts = Highcharts;
  categories = [];
  data: any = [];
  url: string;
  locations = [];
  chartOptions: any;
  constructor(
    private datepipe: DatePipe,
    private httpClient: HttpClient,
    private uiService: UiService,
    private appService: ApplicationService,
    private dialog: MatDialog,
    @Inject('BASE_URL') private baseUrl
  ) { }

  ngOnInit() {

    this.categories = ['Passed', 'Failed'];
    const dialogRef = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });

    this.appService.getCompanyInformation().subscribe(res => {
      this.companyInfo = res[0];
    });

    this.changeCAALogFileToBase64();

    this.subscription = this.$examRecordSubject.subscribe(res => {
      this.data = [];
      for (const item in res) {
        this.data.push({
          name: res[item].name,
          data: [res[item].passedExams, res[item].failedExams]
        });
      }
      dialogRef.close();
      this.updateData(this.data, this.categories)
    });    
    this.appService.getDashboardStats().subscribe(res => {
      this.data = [];
      for (const item in res) {
        this.data.push({
          name: res[item].name,
          data: [res[item].passedExams, res[item].failedExams]
        });
      }
      dialogRef.close();
      console.log(this.data)
      this.updateData(this.data, this.categories);
    },
      error => {
        dialogRef.close();
        console.log(error);
        this.uiService.showSnackBarNotification("An error occured while processing the request, try again later.", null, 3000, 'top', 'error-notification');
      }
    )
  }


  updateData(data, categories) {
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      credits: {
        enabled: false
      },
      exporting: {
        enable: true
      },
      title: {
        text: 'Bar chart stats for Exams'
      },
      xAxis: {
        categories: categories,
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of Candidates'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: data
    };

    HC_exporting(Highcharts);
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      )
    }, 300);
  }

  changeStartDate(event: any) {
    this.firstDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterRecordsByDate(this.firstDate, this.secondDate);
  }

  changeSecondDate(event: any) {
    this.secondDate = event.target.value;
    if (this.firstDate && this.secondDate)
      this.filterRecordsByDate(this.firstDate, this.secondDate);
  }

  filterRecordsByDate(firstDate: string, secondDate: string) {
    const dateData = {
      startDate: firstDate,
      endDate: secondDate
    }
    if (firstDate < secondDate) {
      this.appService.getFilteredDashboardStats(dateData).subscribe(res => {
        this.$examRecordSubject.next(res)
      });
    } else {      
      this.uiService.showSnackBarNotification("The first date value must be less than the second date value.", null, 3000, 'top', 'error-notification');
    }    
  }


  generatePdf() {
    const documentDefinition = {
      content: [
        {
          columns: [
            [
              this.getCompanyLogoPicObject()
            ],
            [
              {
                text: this.companyInfo.name,
                style: 'name'
              },
              {
                text: this.companyInfo.address,
                italics: true
              },

              {
                text: this.companyInfo.city + ', ' + this.companyInfo.country,
                italics: true
              },
              {
                text: 'Contact: ' + this.companyInfo.contact,
                italics: true
              },
              {
                text: 'Fax: ' + this.companyInfo.fax,
                italics: true
              },
              {
                text: 'Email: ' + this.companyInfo.email,
                italics: true
              },
              {
                text: 'Website: ' + this.companyInfo.website,
                italics: true
              },
            ]
          ],
        },
        {
          text: (this.firstDate && this.secondDate) ? `Examination Statistics between ${this.datepipe.transform(this.firstDate, 'MMM d, y')}  -  ${this.datepipe.transform(this.secondDate, 'MMM d, y')}` : 'Examination Statistics',
          style: 'header',
          margin: [0, 10, 0, 30],
          alignment: 'center',
        },
        this.getExaminationStatistics(this.data),
      ],
      styles: {
        name: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        header: {
          fontSize: 13,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        checkListTitle: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        tableHeader: {
          bold: true,
        }
      }
    };
    pdfMake.createPdf(documentDefinition).open();
  }
  getExaminationStatistics(data: any) {
    return {
      table: {
        widths: ['*', '*', '*', '*','*'],
        body: [
          [
            {
              text: 'No.',
              style: 'tableHeader'
            },
            {
              text: 'Exam',
              style: 'tableHeader'
            },
            {
              text: 'Passed',
              style: 'tableHeader'
            },
            {
              text: 'Failed',
              style: 'tableHeader'
            },
            {
              text: 'Total',
              style: 'tableHeader'
            },

          ],
          ...data.map((item: any, index) => {                        
            return [
              index + 1,
              item.name,
              item.data[0],
              item.data[1],
              (item.data[0] + item.data[1])
            ];
          }),
        ]
      }
    }
  }

  getImage(filePath: string): Observable<Blob> {
    return this.httpClient.get(filePath, { responseType: 'blob' });
  }
  changeCAALogFileToBase64() {
    const fileUrl = this.baseUrl + 'logo.png';
    this.getImage(fileUrl).subscribe(data => {
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = () => {
        this.logoImageBlob.push(
          reader.result as string,
          //alignment: 'right',          
        )
      }, reader.onerror = (error) => {
        console.log("Error", error);
      }
    }, error => {
      console.log("Error", error);
    });
  }
  getCompanyLogoPicObject() {
    return {
      image: this.logoImageBlob[0],
      width: 75
    };
  }

}
