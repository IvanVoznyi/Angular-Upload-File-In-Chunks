import { Component } from '@angular/core';
import { UploadFileService } from './services/upload-file.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  uploadFileService: UploadFileService

  constructor(private uploadFileServices: UploadFileService) {
    this.uploadFileService = uploadFileServices
  }
}
