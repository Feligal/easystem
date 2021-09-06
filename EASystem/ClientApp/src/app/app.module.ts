import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefaultModule } from './layouts/default/default.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MultilevelMenuService } from 'ng-material-multilevel-menu';
import { ApplicationService } from './services/application.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AdministratorAuthGuardService } from './services/administrator-auth-guard.service';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';
import { CreateExamComponent } from './modules/examinations/create-exam/create-exam.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CreateQuestionComponent } from './modules/examinations/create-question/create-question.component';
import { EditQuestionComponent } from './modules/examinations/edit-question/edit-question.component';
import { ConfirmationMessageComponent } from './confirmation-message/confirmation-message.component';
import { ImportQuestionsComponent } from './modules/examinations/import-questions/import-questions.component';
import { CreateRoleComponent } from './modules/admin/create-role/create-role.component';
import { CreateAdminUserComponent } from './modules/admin/create-admin-user/create-admin-user.component';
import { CreateClientUserComponent } from './modules/admin/create-client-user/create-client-user.component';
import { ScheduleExamsListComponent } from './modules/clients/schedule-exams-list/schedule-exams-list.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthResponseInterceptorService } from './services/auth-response-interceptor.service';
import { ActiveExamComponent } from './modules/clients/active-exam/active-exam.component';
import { ExamScoreComponent } from './modules/clients/exam-score/exam-score.component';
import { ClientAuthGuardService } from './services/client-auth-guard.service';
import { DatePipe } from '@angular/common';
import { CreateApplicationsComponent } from './modules/clients/create-applications/create-applications.component';
import { ExamReviewComponent } from './modules/clients/exam-review/exam-review.component';
import { ImportUsersComponent } from './modules/clients/import-users/import-users.component';
import { ImportClientErrorComponent } from './modules/clients/import-client-error/import-client-error.component';


@NgModule({
  declarations: [
    AppComponent,    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DefaultModule,
  ],
  providers: [
    MultilevelMenuService,
    ApplicationService,
    AuthGuardService,
    AdministratorAuthGuardService,
    ClientAuthGuardService,
    UiService,
    AuthService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthResponseInterceptorService,
      multi: true
    },
    { provide: 'BASE_URL', useFactory: getBaseUrl }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateExamComponent,
    LoadingSpinnerComponent,
    CreateQuestionComponent,
    EditQuestionComponent,
    ConfirmationMessageComponent,
    ImportQuestionsComponent,
    CreateRoleComponent,
    CreateAdminUserComponent,
    CreateClientUserComponent,
    ScheduleExamsListComponent,
    ActiveExamComponent,
    ExamScoreComponent,
    CreateApplicationsComponent,
    ExamReviewComponent,
    ImportUsersComponent,
    ImportClientErrorComponent
  ]
})
export class AppModule { }

export function getBaseUrl(): string {
  return document.getElementsByTagName('base')[0].href;
}
