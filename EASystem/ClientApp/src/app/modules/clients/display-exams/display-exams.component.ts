import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ActiveExamComponent } from '../active-exam/active-exam.component';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-display-exams',
  templateUrl: './display-exams.component.html',
  styleUrls: ['./display-exams.component.scss']
})
export class DisplayExamsComponent implements OnInit {
  clicked: boolean = false;
  companyInfo: any;
  @Input() examData: any;
  clientUserRole = "ClientUserRole";
  logoImageBlob = [];
  client: any;
  constructor(private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private datepipe: DatePipe,
    @Inject('BASE_URL') private baseUrl,
    private uiService: UiService,
    private appService: ApplicationService,
    private httpClient: HttpClient,
  ) { }

  ngOnInit() {
    this.appService.getCompanyInformation().subscribe(res => {
      this.companyInfo = res[0];
    })

    this.changeCAALogFileToBase64(); 
    this.appService.getClientUser(this.examData.userId).subscribe((res: any) => {      
      this.client = res;      
    }, error => {
        this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
    })
  }

  onTakeExam(event) {
    const lastExamQuestions = localStorage.getItem('exam_data');
    if (lastExamQuestions) {
      localStorage.removeItem('exam_data');
    }
    //Disable the button after clicking it avoid clicking multiple times
    this.clicked = true;
    const data = {
      hasStarted : true
    }
    const id = +event.currentTarget.id.split("_")[1];
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.appService.startExam(id, data).subscribe((res: any) => {
      spinner.close()
      this.dialog.open(ActiveExamComponent, {
        disableClose: true,
        closeOnNavigation: false,
        height: '800px',
        data: {
          id: id,
          examId: this.examData.examId,
          examName: this.examData.name,
          duration: this.examData.duration,
          numberOfQuestions: this.examData.numberOfQuestions
        }
      })
    },
      error => {
      spinner.close();
      this.uiService.showSnackBarNotification("An error occured while processing the request, try again later or contact the system adminstrator.", null, 3000, 'top', 'error-notification');
    })
  }

  onPrintPDF(event) {
    const id = +event.currentTarget.id.split("_")[1];    
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
          text: 'Exam Results for ' + this.examData.name,
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, 30, 0, 10]
        },
        {
          text: 'Client Information',
          style: 'header'
        },
        {
          columns: [
            [
              {
                text: "Client Names : " + this.client.firstName + "  " + this.client.lastName,
                style: 'name'
              },
              {
                text: "NRC : " + this.client.nrc,
                style: 'name'
              },              
              {
                text: "Email : " + this.client.email,
                style: 'name'
              },
              {
                text: "Phone Number : " + this.client.phoneNumber,
                style: 'name'
              }
            ],
            [
            ]
          ]
        },
        {
          text: 'Results Statement',
          style: 'header',
          margin: [0, 10, 0, 30],
          alignment: 'center',
        },
        this.getExaminationStatement([this.examData]),
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
  getExaminationStatement(data: any) {
    return {
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto','auto', 'auto', 'auto'],
        body: [
          [
            {
              text: 'Exam',
              style: 'tableHeader'
            },
            {
              text: 'Marks',
              style: 'tableHeader'
            },
            {
              text: 'P/Mark',
              style: 'tableHeader'
            },
            {
              text: 'P/Score',
              style: 'tableHeader'
            },
            {
              text: 'Status',
              style: 'tableHeader'
            },
            {
              text: 'Duration',
              style: 'tableHeader'
            },
            {
              text: '#.Questions',
              style: 'tableHeader'
            },
            {
              text: 'Date',
              style: 'tableHeader'
            },
          ],
          ...data.map((statement: any) => {
            return [
              statement.name,
              `${statement.marksScored}/${statement.numberOfQuestions}`,
              `${statement.passMarkPercentage}%`,
              `${statement.score}%`,
              statement.passStatus,
              `${statement.duration / 60 } Mins`,
              statement.numberOfQuestions,       
              this.datepipe.transform(statement.dateTaken, 'MMM d, y'),              
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
