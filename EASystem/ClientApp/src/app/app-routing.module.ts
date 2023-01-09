import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { ExaminationsComponent } from './modules/examinations/examinations.component';
import { ViewQuestionsComponent } from './modules/examinations/view-questions/view-questions.component';
import { ChangePasswordComponent } from './modules/change-password/change-password.component';
import { ForgotPasswordComponent } from './modules/forgot-password/forgot-password.component';
import { PasswordResetConfirmationComponent } from './modules/password-reset-confirmation/password-reset-confirmation.component';
import { ClientEmailConfirmationComponent } from './modules/client-email-confirmation/client-email-confirmation.component';
import { PasswordResetComponent } from './modules/password-reset/password-reset.component';
import { AdminUsersComponent } from './modules/admin/admin-users/admin-users.component';
import { ClientUsersComponent } from './modules/admin/client-users/client-users.component';
import { SystemlogsComponent } from './modules/admin/systemlogs/systemlogs.component';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { AdministratorAuthGuardService } from './services/administrator-auth-guard.service';
import { AuthGuardService } from './services/auth-guard.service';
import { ClientsComponent } from './modules/clients/clients.component';
import { ClientDetailContainerComponent } from './modules/clients/client-detail-container/client-detail-container.component';
import { PendingExamsComponent } from './modules/clients/pending-exams/pending-exams.component';
import { WrittenExamsComponent } from './modules/clients/written-exams/written-exams.component';
import { ReportsComponent } from './modules/clients/reports/reports.component';
import { ClientAuthGuardService } from './services/client-auth-guard.service';
import { ExamReportsComponent } from './modules/examinations/exam-reports/exam-reports.component';
import { AdminExamRecordsComponent } from './modules/examinations/admin-exam-records/admin-exam-records.component';
import { ApplicationsComponent } from './modules/applications/applications.component';
import { ClientApplicationsComponent } from './modules/clients/client-applications/client-applications.component';
import { ApplicationDetailsComponent } from './modules/clients/application-details/application-details.component';
import { TwoStepVerificationComponent } from './modules/two-step-verification/two-step-verification.component';
import { ScheduledPendingExaminationsComponent } from './modules/examinations/scheduled-pending-examinations/scheduled-pending-examinations.component';
import { ScheduleExamManyComponent } from './modules/examinations/schedule-exam-many/schedule-exam-many.component';
import { EnableTwofactorComponent } from './modules/enable-twofactor/enable-twofactor.component';
import { CompanyInformationComponent } from './modules/company-information/company-information.component';
import { RegiterClientComponent } from './modules/clients/regiter-client/regiter-client.component';
import { SuccessClientRegistrationComponent } from './modules/clients/success-client-registration/success-client-registration.component';
import { DepartmentsComponent } from './modules/departments/departments.component';
import { DepartmentUserComponent } from './modules/departments/department-user/department-user.component';
import { DepartmentExamsComponent } from './modules/departments/department-exams/department-exams.component';
import { ExamEditComponent } from './modules/examinations/exam-edit/exam-edit.component';
import { DepartmentEditComponent } from './modules/departments/department-edit/department-edit.component';
import { ApplicationClientDetailsComponent } from './modules/clients/application-client-details/application-client-details.component';
import { ClientsUploadComponent } from './modules/clients/clients-upload/clients-upload.component';



const routes: Routes = [
  {
    path: '', component: DefaultComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'register', component: RegiterClientComponent },
      { path: 'clients', component: ClientsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'scheduledexams', component: ScheduledPendingExaminationsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'applications', component: ApplicationsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'examrecords', component: AdminExamRecordsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'enableverification', component: EnableTwofactorComponent, canActivate: [AuthGuardService] },
      { path: 'successregistration', component: SuccessClientRegistrationComponent },
      {
        path: 'examinations', component: ExaminationsComponent, canActivate: [AdministratorAuthGuardService], children: [
          { path: 'viewquestions/:examId', component: ViewQuestionsComponent },
          { path: 'reports/:examId', component: ExamReportsComponent },
          { path: 'scheduleformany/:examId', component: ScheduleExamManyComponent },
          { path: 'editexam/:examId', component: ExamEditComponent }
        ]
      },      
      { path: 'client/details/:id', component: ClientDetailContainerComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuardService] },
      { path: 'forgotpassword', component: ForgotPasswordComponent },
      { path: 'confirmpassreset/:tag', component: PasswordResetConfirmationComponent },
      { path: 'login/ConfirmEmail', component: ClientEmailConfirmationComponent },
      { path: 'login/ResetPassword', component: PasswordResetComponent },
      { path: 'login/twostepverification', component: TwoStepVerificationComponent },
      {
        path: 'admin/departments', component: DepartmentsComponent, canActivate: [AdministratorAuthGuardService], children: [
          { path: 'users/:departmentId', component: DepartmentUserComponent },
          { path: 'exams/:departmentId', component: DepartmentExamsComponent },
          { path: 'editdepartment/:departmentId', component: DepartmentEditComponent }
        ]
      },
      { path: 'admin/roles', component: RolesComponent, canActivate: [AdministratorAuthGuardService] },      
      { path: 'admin/adminUsers', component: AdminUsersComponent, canActivate: [AdministratorAuthGuardService]},
      { path: 'admin/clientUsers', component: ClientUsersComponent, canActivate: [AdministratorAuthGuardService]},
      { path: 'admin/systemlogs', component: SystemlogsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'admin/applications/details/:id', component: ApplicationDetailsComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'admin/company', component: CompanyInformationComponent, canActivate: [AdministratorAuthGuardService] },
      { path: 'client/scheduledexams', component: PendingExamsComponent, canActivate: [ClientAuthGuardService] },
      { path: 'client/writtenexams', component: WrittenExamsComponent, canActivate: [ClientAuthGuardService]},
      { path: 'client/reports', component: ReportsComponent, canActivate: [ClientAuthGuardService] },
      { path: 'client/documents', component: ClientsUploadComponent, canActivate: [ClientAuthGuardService] },
      { path: 'client/applications', component: ClientApplicationsComponent, canActivate: [ClientAuthGuardService] },
      { path: 'client/applications/details/:id', component: ApplicationClientDetailsComponent, canActivate: [ClientAuthGuardService] },
      { path: '**', redirectTo: 'home' }
    ]
  },
        
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
