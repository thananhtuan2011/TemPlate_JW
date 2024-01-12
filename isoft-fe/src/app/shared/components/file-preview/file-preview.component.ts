import { Component, Input, OnInit } from '@angular/core';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-file-preview',
    templateUrl: './file-preview.component.html',
    styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent implements OnInit {
    @Input() serverURLImage: string = environment.serverURLImage;
    appUtil = AppUtil;
    @Input() fileName: string = '';

    constructor() {}

    ngOnInit(): void {}

    get isImageExtension(): boolean {
        return this.fileNameIsNotNullOrEmpty && this.appUtil.isImageFile(this.fileName);
    }

    get isOtherFile(): boolean {
        return this.fileNameIsNotNullOrEmpty && !this.appUtil.isImageFile(this.fileName);
    }

    get fileUrl(): string {
        return `${this.serverURLImage}/${this.fileName}`;
    }

    get fileNameIsNotNullOrEmpty() {
        return this.fileName != null && this.fileName.length > 0;
    }

    openFile() {
        window.open(this.fileUrl);
    }
}
