import { Component, OnInit } from '@angular/core';
import { ExpandCollapseStatusEnum, ExpandedLTR, ExpandedRTL, MultilevelMenuService, SlideInOut } from 'ng-material-multilevel-menu';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    SlideInOut,
    ExpandedLTR,
    ExpandedRTL,
  ]
})
export class SidebarComponent implements OnInit{    
  config = {
    paddingAtStart: true,
    interfaceWithRoute: true,
    classname: 'side-nav-menu',
    //listBackgroundColor: `rgb(208, 241, 239)`,
    //fontColor: `rgb(8, 54, 71)`,
    fontColor: `rgb(255, 244, 244)`,
    //backgroundColor: `rgb(208, 241, 239)`,
    //selectedListFontColor: `red`,
    highlightOnSelect: true,
    collapseOnSelect: true,
    useDividers: true,
    rtlLayout: false,
  };

  homeMenuItem = [
    {
      label: 'Home',
      icon: 'home',
      link: '/home',
    }
  ];

  appitems_loggedIn = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: 'dashboard',
      hidden: false
    },    
    {
      label: 'Examinations',
      link: '/examinations',
      icon: 'groups',
      hidden: false,
    },
    {
      label: 'Exam Records',
      link: '/examrecords',
      icon: 'grading',
      hidden: false,      
    },
    {      
      label: 'Clients',
      link: '/clients',
      icon: 'groups',
      hidden: false,         
    },        
  ];

  adminMenuItems = [
    {
      label: 'Settings',
      icon: 'settings',
      items: [
        {
          label: 'User Roles',
          link: '/admin/roles',
          icon: 'tunes',

        },
        {
          label: 'Admin Users',
          link: '/admin/adminUsers',
          icon: 'people_alt',
          disabled: false,

        },
        {
          label: 'Client User',
          link: '/admin/clientUsers',
          icon: 'groups',
          disabled: false,
        },

        {
          label: 'System Logs',
          link: '/admin/systemlogs',
          icon: 'description',
          disabled: false,
        },
      ]
    },
  ]
  clientUserMenuItems = [
    {
      label: 'Schedule Exams',
      link: '/client/scheduledexams',
      icon: 'assignment',
    },
    {
      label: 'Written Exams',
      link: '/client/writtenexams',
      icon: 'assignment_turned_in',
      disabled: false,
    },        
    {
      label: 'Applications',
      link: '/client/applications',
      icon: 'email',
      disabled: false,
    }      
  ];

  adminUserRole = "AdminUserRole";
  clientUserRole = "ClientUserRole";

  constructor(private multilevelMenuService: MultilevelMenuService, private authService: AuthService) {
   
  }

  setExpandCollapseStatus(type: ExpandCollapseStatusEnum) {
    this.multilevelMenuService.setMenuExapandCollpaseStatus(type);
  }

  ngOnInit() {    
  }

  getClass(item) {
    return {
      [item.faIcon]: true
    }
  }

  selectedItem($event) {
    console.log($event);
  }
}
