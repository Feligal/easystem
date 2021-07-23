import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { NgMaterialMultilevelMenuModule } from 'ng-material-multilevel-menu';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent],
  imports: [
    CommonModule,
    NgMaterialMultilevelMenuModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
  ]
})
export class SharedModule { }
