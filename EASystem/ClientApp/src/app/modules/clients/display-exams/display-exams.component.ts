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

@Component({
  selector: 'app-display-exams',
  templateUrl: './display-exams.component.html',
  styleUrls: ['./display-exams.component.scss']
})
export class DisplayExamsComponent implements OnInit {
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
    const examId = +event.currentTarget.id.split("_")[1];        
    this.dialog.open(ActiveExamComponent, {
      disableClose: true,
      height:'800px',
      data: {
        id: this.examData.id,
        examId: examId,
        examName: this.examData.name,
        duration: this.examData.duration,
        numberOfQuestions: this.examData.numberOfQuestions
      }
    }) 
  }

  onPrintPDF(event) {
    const id = +event.currentTarget.id.split("_")[1];
    console.log(this.examData);
    const documentDefinition = {
      content: [
        {
          columns: [
            [
              this.getCompanyLogoPicObject()
            ],
            [
              {
                text: "Zambia Civil Aviation Authority",
                style: 'name'
              },
              {
                text: 'Former Zambia Airways Technical Base, Hangar 38/947M',
                italics: true
              },
              {
                text: 'Kenneth Kaunda Intenational Airport',
                italics: true
              },
              {
                text: 'P.O Box 50137, Lusaka, 15101',
                italics: true
              },
              {
                text: 'Email : civil.aviation@caa.co.zm ',
                italics: true
              },
              {
                text: 'Contant No : +260 211 251677/251861',
                italics: true
              },
              {
                text: 'Fax : +260 211 251841',
                italics: true
              }
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
        widths: ['*', '*', '*', '*', '*', '*'],
        body: [
          [
            {
              text: 'Exam',
              style: 'tableHeader'
            },
            {
              text: 'Score',
              style: 'tableHeader'
            },
            {
              text: 'Pass Status',
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
    const fileUrl = this.baseUrl + 'CAA_Big_Logo.png';
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
