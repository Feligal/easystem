import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ApplicationService {
  //Admin Functionality
  $clientUser = new Subject<any>();
  $assignRoleNameChanged = new Subject<any>();
  $assignedRoles = new Subject<any>();
  $assignRoleIdChanged = new Subject<any>();
  $clientUsers = new Subject<any>();
  $userRoles = new Subject<any>();
  $pendingExams = new Subject<any>();
  $writtenExams = new Subject<any>();
  $clientApplications = new Subject<any>();
  $applications = new Subject<any>();
  $exams = new Subject<any>();
  $questions = new Subject<any>();
  activeExam;
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') private baseUrl) {
  }

  getExams() {
    const url = this.baseUrl + 'api/allexams';
    return this.httpClient.get(url);
  }

  createExam(data) {
    const url = this.baseUrl + 'api/createexam';
    return this.httpClient.post(url, data);
  }

  createQuestion(data) {
    const url = this.baseUrl + 'api/createquestion';
    return this.httpClient.post(url, data);
  }

  getQuestionsByExamId(examId) {
    const url = this.baseUrl + 'api/getquestions/' + examId;
    return this.httpClient.get(url);
  }
  getShuffledQuestionsByExamId(examId, numberOfQuestions) {
    const url = this.baseUrl + `api/getshufflequestions/${examId}/${numberOfQuestions}`;
    return this.httpClient.get(url);
  }

  getQuestionById(questionId) {
    const url = this.baseUrl + 'api/getquestion/' + questionId;
    return this.httpClient.get(url);
  }

  editQuestion(questionId, data) {
    const url = this.baseUrl + 'api/editquestion/' + questionId;
    return this.httpClient.put(url,data);
  }

  deleteQuestion(questionId) {
    const url = this.baseUrl + 'api/deletequestion/' + questionId;
    return this.httpClient.delete(url);
  }

  getExam(examId) {
    const url = this.baseUrl + 'api/getexam/' + examId;
    return this.httpClient.get(url);
  }



  //Administrative Functions
  createAdminUser(data) {
    const url = this.baseUrl + 'api/admin';
    return this.httpClient.post(url, data);
  }
  getAdminUsers() {
    const url = this.baseUrl + 'api/admins';
    return this.httpClient.get(url);
  }
  getAdminUser(userId) {
    const url = this.baseUrl + 'api/admin/' + userId;
    return this.httpClient.get(url);
  }

  editAdminUser(userId, data) {
    const url = this.baseUrl + 'api/admin/' + userId;
    return this.httpClient.put(url, data);
  }

  deleteAdminUser(userId) {
    const url = this.baseUrl + 'api/admin/' + userId;
    return this.httpClient.delete(url);
  }

  getRoleAndUser(selectedRoleName) {
    const url = this.baseUrl + 'api/getrolebyname/' + selectedRoleName;
    return this.httpClient.get(url);
  }
  getUserAdminAssignedRoles(roleId) {
    const url = this.baseUrl + 'api/assignrole/' + roleId;
    return this.httpClient.get(url);
  }

  assignUserRole(data) {
   const url = this.baseUrl + 'api/userroles';
    return this.httpClient.post(url, data);
  }
  editClientUser(userId, data) {
    const url = this.baseUrl + 'api/client/' + userId;
    return this.httpClient.put(url, data);
  }

  getClientUsers() {
    const url = this.baseUrl + 'api/clients';
    return this.httpClient.get(url);
  }
  getClientUser(userId) {
    const url = this.baseUrl + 'api/client/' + userId;
    return this.httpClient.get(url);
  }
  deleteOperatorUser(userId) {
    const url = this.baseUrl + 'api/deleteOperatorUser/' + userId;
    return this.httpClient.delete(url);
  }

  getOperatorUser(userId) {
    const url = this.baseUrl + 'api/getOperatorUser/' + userId;
    return this.httpClient.get(url);
  }

  editUserRole(roleId,data) {
    const url = this.baseUrl + 'api/editrole/' + roleId;
    return this.httpClient.put(url, data);
  }
  getRoles() {
    const url = this.baseUrl + 'api/getroles';
    return this.httpClient.get(url);
  }
  createUserRole(data) {
    const url = this.baseUrl + 'api/createrole';
    return this.httpClient.post(url, data);
  }

  deleteUserRole(selectedRoleId) {
    const url = this.baseUrl + 'api/deleterole/' + selectedRoleId;
    return this.httpClient.delete(url);
  }

  getAllLogs() {
    const url = this.baseUrl + 'api/logactions';
    return this.httpClient.get(url);
    
  }
  deleteLog(id) {
    const url = this.baseUrl + 'api/deletelog/' + id;
    return this.httpClient.delete(url);
  }

  confirmAccountRegistration(data) {
    const url = this.baseUrl + 'api/confirmEmail/';   
    return this.httpClient.post(url, data);
  }

  createClientUser(data) {
    const url = this.baseUrl + 'api/clientUser';
    return this.httpClient.post(url, data);
  }

  deleteClientUser(userId) {
    const url = this.baseUrl + 'api/deleteclient/' + userId;
    return this.httpClient.delete(url);
  }
  assignExam(examId, userId,data) {
    const url = this.baseUrl + 'api/assignexam/' + examId + "/" + userId;
    return this.httpClient.post(url, data);
  }

  getClientUserPendingExams() {
    const url = this.baseUrl + 'api/pendingexams';
    return this.httpClient.get(url);
  }

  getClientUserTakenExams() {
    const url = this.baseUrl + 'api/gettakenexams';
    return this.httpClient.get(url);
  }


  getClientUserExams(userId) {
    const url = this.baseUrl + 'api/clientexams/' + userId;
    return this.httpClient.get(url);
  }

  getAdminTakenExams(userId) {
    const url = this.baseUrl + 'api/clienttakenexams/' + userId;
    return this.httpClient.get(url);
  }

  submitExam(id, data) {
    const url = this.baseUrl + `api/submitanswers/${id}`;
    return this.httpClient.post(url, data);
  }


  adminSubmitExam(id, data) {
    const url = this.baseUrl + `api/adminsubmitanswers/${id}`;
    return this.httpClient.post(url, data);
  }

 getRecoveredExam( data) {
    const url = this.baseUrl + 'api/recoveredanswers';
    return this.httpClient.post(url, data);
  }

  getExamReview(id) {
    const url = this.baseUrl + `api/getexamreview/${id}`;
    return this.httpClient.get(url);
  }


  getExamRecords(examId) {
    const url = this.baseUrl + `api/examRecords/${examId}`;
    return this.httpClient.get(url);
  }

  getAllExamRecords() {
    const url = this.baseUrl + `api/allexamrecords/`;
    return this.httpClient.get(url);
  }

  deleteCancelExam(id) {
    const url = this.baseUrl + `api/cancelexam/${id}`;
    return this.httpClient.delete(url);
  }
  createExamApplication(data) {
    const url = this.baseUrl + `api/createapplication`;
    return this.httpClient.post(url,data);
  }
  getClientApplications() {
    const url = this.baseUrl + `api/clientapplications`;
    return this.httpClient.get(url);
  }

  getApplications() {
    const url = this.baseUrl + `api/applications`;
    return this.httpClient.get(url);
  }

  deleteApplication(id) {
    const url = this.baseUrl + `api/deleteapplication/${id}`;
    return this.httpClient.delete(url);
  }

  deleteClientApplication(id) {
    const url = this.baseUrl + `api/deleteclientapplication/${id}`;
    return this.httpClient.delete(url);
  }
  getApplication(id) {
    const url = this.baseUrl + `api/getapplication/${id}`;
    return this.httpClient.get(url);
  }

  deleteExam(id) {
    const url = this.baseUrl + `api/deleteexam/${id}`;
    return this.httpClient.delete(url);
  }

  deleteExamRecord(id) {
    const url = this.baseUrl + `api/deleteexamrecord/${id}`;
    return this.httpClient.delete(url);
  }

  deleteRecordByExamId(id,examId) {
    const url = this.baseUrl + `api/deleterecordbyexamid/${id}/${examId}`;
    return this.httpClient.delete(url);
  } 
}
