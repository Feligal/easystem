import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from '../../modules/home/home.component';
import { DashboardComponent } from '../../modules/dashboard/dashboard.component';
import { LoginComponent } from '../../modules/login/login.component';
import { ExaminationsComponent } from '../../modules/examinations/examinations.component';
import { CreateExamComponent } from '../../modules/examinations/create-exam/create-exam.component';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { CreateQuestionComponent } from '../../modules/examinations/create-question/create-question.component';
import { ViewQuestionsComponent } from '../../modules/examinations/view-questions/view-questions.component';
import { EditQuestionComponent } from '../../modules/examinations/edit-question/edit-question.component';
import { ConfirmationMessageComponent } from '../../confirmation-message/confirmation-message.component';
import { ImportQuestionsComponent } from '../../modules/examinations/import-questions/import-questions.component';
import { AdminUsersComponent } from '../../modules/admin/admin-users/admin-users.component';
import { AssignedUsersComponent } from '../../modules/admin/assigned-users/assigned-users.component';
import { ClientUsersComponent } from '../../modules/admin/client-users/client-users.component';
import { CreateAdminUserComponent } from '../../modules/admin/create-admin-user/create-admin-user.component';
import { CreateClientUserComponent } from '../../modules/admin/create-client-user/create-client-user.component';
import { CreateRoleComponent } from '../../modules/admin/create-role/create-role.component';
import { RolesComponent } from '../../modules/admin/roles/roles.component';
import { SystemlogsComponent } from '../../modules/admin/systemlogs/systemlogs.component';
import { ChangePasswordComponent } from '../../modules/change-password/change-password.component';
import { ClientEmailConfirmationComponent } from '../../modules/client-email-confirmation/client-email-confirmation.component';
import { ForgotPasswordComponent } from '../../modules/forgot-password/forgot-password.component';
import { PasswordResetComponent } from '../../modules/password-reset/password-reset.component';
import { PasswordResetConfirmationComponent } from '../../modules/password-reset-confirmation/password-reset-confirmation.component';
import { AssignUsersComponent } from '../../modules/admin/assign-users/assign-users.component';
import { ClientsComponent } from '../../modules/clients/clients.component';
import { CreateClientComponent } from '../../modules/clients/create-client/create-client.component';
import { ClientDetailContainerComponent } from '../../modules/clients/client-detail-container/client-detail-container.component';
import { ScheduledExamsComponent } from '../../modules/clients/scheduled-exams/scheduled-exams.component';
import { ScheduleExamsListComponent } from '../../modules/clients/schedule-exams-list/schedule-exams-list.component';
import { PendingExamsComponent } from '../../modules/clients/pending-exams/pending-exams.component';
import { WrittenExamsComponent } from '../../modules/clients/written-exams/written-exams.component';
import { ReportsComponent } from '../../modules/clients/reports/reports.component';
import { DisplayExamsComponent } from '../../modules/clients/display-exams/display-exams.component';
import { ActiveExamComponent } from '../../modules/clients/active-exam/active-exam.component';
import { ExamScoreComponent } from '../../modules/clients/exam-score/exam-score.component';
import { AdminWrittenExamsComponent } from '../../modules/clients/admin-written-exams/admin-written-exams.component';
import { ExamRecoveryComponent } from '../../modules/clients/exam-recovery/exam-recovery.component';
import { ExamReportsComponent } from '../../modules/examinations/exam-reports/exam-reports.component';
import { AdminExamRecordsComponent } from '../../modules/examinations/admin-exam-records/admin-exam-records.component';
import { ClientInformationComponent } from '../../modules/clients/client-information/client-information.component';
import { DisplayScheduledExamsComponent } from '../../modules/clients/display-scheduled-exams/display-scheduled-exams.component';
import { DisplayWrittenExamsComponent } from '../../modules/clients/display-written-exams/display-written-exams.component';
import { ApplicationsComponent } from '../../modules/applications/applications.component';
import { ClientApplicationsComponent } from '../../modules/clients/client-applications/client-applications.component';
import { CreateApplicationsComponent } from '../../modules/clients/create-applications/create-applications.component';
import { ApplicationDetailsComponent } from '../../modules/clients/application-details/application-details.component';
import { ExamReviewComponent } from '../../modules/clients/exam-review/exam-review.component';
import { ImportUsersComponent } from '../../modules/clients/import-users/import-users.component';
import { ImportClientErrorComponent } from '../../modules/clients/import-client-error/import-client-error.component';
import { TwoStepVerificationComponent } from '../../modules/two-step-verification/two-step-verification.component';




@NgModule({
  declarations: [
    DefaultComponent,
    HomeComponent,
    DashboardComponent,
    LoginComponent,
    ExaminationsComponent,
    CreateExamComponent,
    LoadingSpinnerComponent,
    CreateQuestionComponent,
    ViewQuestionsComponent,
    EditQuestionComponent,
    ConfirmationMessageComponent,
    ImportQuestionsComponent,
    AdminUsersComponent,
    AssignedUsersComponent,
    AssignUsersComponent,
    ClientUsersComponent,
    CreateAdminUserComponent,
    CreateClientUserComponent,
    CreateRoleComponent,
    RolesComponent,
    SystemlogsComponent,
    ChangePasswordComponent,
    ClientEmailConfirmationComponent,
    ForgotPasswordComponent,
    LoginComponent,
    PasswordResetComponent,
    PasswordResetConfirmationComponent,
    ClientsComponent,
    CreateClientComponent,
    ClientDetailContainerComponent,
    ScheduledExamsComponent,
    ScheduleExamsListComponent,
    PendingExamsComponent,
    WrittenExamsComponent,
    ReportsComponent,
    DisplayExamsComponent,
    ActiveExamComponent,
    ExamScoreComponent,
    AdminWrittenExamsComponent,
    ExamRecoveryComponent,
    ExamReportsComponent,
    AdminExamRecordsComponent,
    ClientInformationComponent,
    DisplayScheduledExamsComponent,
    DisplayWrittenExamsComponent,
    ApplicationsComponent,
    ClientApplicationsComponent,
    CreateApplicationsComponent,
    ApplicationDetailsComponent,
    ExamReviewComponent,
    ImportUsersComponent,
    ImportClientErrorComponent,
    TwoStepVerificationComponent
    
  ],
  imports: [
    CommonModule,
    RouterModule,   
    SharedModule,
    MaterialModule,
    
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class DefaultModule { }
