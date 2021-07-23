import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../loading-spinner/loading-spinner.component';
import { ApplicationService } from '../../../services/application.service';
import { UiService } from '../../../services/ui.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-exam-reports',
  templateUrl: './exam-reports.component.html',
  styleUrls: ['./exam-reports.component.scss']
})
export class ExamReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  logoImageBlob = [];
  examRecords = [];
  firstDate: any;
  secondDate: any;
  selection = new SelectionModel<any>(true, []);
  selectedRowIndex = -1;
  id: number;
  url: string;
  examName: string;
  subscription: Subscription;  
  examRecordsCopy = [];
  $examRecordSubject = new Subject<any[]>();
  displayedColumns = [
    'index',
    'examName',
    'clientName',
    'dateTaken',
    'score',
    'passStatus',
    'select',
    'action'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private httpClient: HttpClient,
    private dialog: MatDialog,
    private router: Router, private appService: ApplicationService,
    private route: ActivatedRoute,
    private uiService: UiService, private datepipe: DatePipe,
    @Inject('BASE_URL') private baseUrl
  ) { }

  ngOnInit() {    
    this.changeCAALogFileToBase64(); 
    const spinner = this.dialog.open(LoadingSpinnerComponent, {
      panelClass: 'custom-class',
      disableClose: true
    });
    this.route.params.subscribe((param: Params) => {
      const examId = +param['examId'];
      this.appService.getExamRecords(examId).subscribe((res: any[]) => {
        if (res.length > 0) {
          this.examRecords = res;
          this.examName = res[0].examName;
          this.examRecordsCopy = res;
          this.dataSource.data = this.examRecords;
        }        
        spinner.close();
      }, error => {
          spinner.close();
          this.uiService.showSnackBarNotification("An error occured while processing, try again later.", null, 3000, 'top', 'error-notification');
      })

      this.subscription = this.$examRecordSubject.subscribe((res: any) => {
        this.examRecords = res;
        this.dataSource.data = res;
      });
    })
  }


  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    if (this.examRecords) {
      const filteredExamReport = this.examRecordsCopy
        .filter(item => new Date(item.dateTaken) >= new Date(firstDate) && new Date(item.dateTaken) <= new Date(secondDate));
      this.$examRecordSubject.next(filteredExamReport);
    }
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
          text: `${this.examName} Exam Records`,
          style: 'header',
          margin: [0, 10, 0, 30],
          alignment: 'center',
        },
        this.getExaminationStatement(this.examRecordsCopy),
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
        widths: ['*','*', '*', '*', '*','*'],
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
              text: 'Client',
              style: 'tableHeader'
            },
            {
              text: 'Date Taken',
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
          ],
          ...data.map((statement: any) => {
            let i = 0;
            return [
              i + 1,
              statement.examName,
              statement.clientName,
              this.datepipe.transform(statement.dateTaken, 'MMM d, y'),
              `${statement.score}%`,
              statement.passStatus,                           
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
