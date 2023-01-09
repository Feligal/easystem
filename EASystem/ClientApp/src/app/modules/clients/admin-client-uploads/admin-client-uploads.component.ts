import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-admin-client-uploads',
  templateUrl: './admin-client-uploads.component.html',
  styleUrls: ['./admin-client-uploads.component.scss']
})
export class AdminClientUploadsComponent implements OnInit {
  userId: string;
  thumbNails: any[] = [];
  attachmentName: string;
  constructor(private appService: ApplicationService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.userId = params.id;
      this.appService.getClientAttachmentByUserId(this.userId).subscribe((res: any) => {
        this.thumbNails = res;
      })
    })
  }

  onViewFullImage(event) {
    this.attachmentName = event.target.id.split('_')[1];
  }

  onCloseAttachment() {
    this.attachmentName = '';
  }

}
