import { Component, HostListener, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { DocumentTypeModel } from '../../../models/document-type.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentTypeService } from '../../../service/document-type.service';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../utilities/app-util';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-document-type',
    providers: [MessageService, ConfirmationService],
    templateUrl: './document-type.component.html',
    styleUrls: [],
})
export class DocumentTypeComponent implements OnInit {
    appConstant = AppConstants;
    display: boolean = false;
    loading: boolean = false;
    result: TypeData<DocumentTypeModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };
    param: Page = {
        page: 0,
        pageSize: 10,
        searchText: '',
    };
    formData = {};
    isMobile = screen.width <= 1199;
    constructor(
        private messageService: MessageService,
        private readonly documentTypeService: DocumentTypeService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.getDocumentTypes();
    }

    getDocumentTypes(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.documentTypeService.getPagingDocumentType(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddDocumentType() {
        this.display = true;
    }

    getDocumentTypeDetail(item) {
        this.formData = item;
        this.display = true;
    }

    onDeleteDocumentType(id) {
        let message;
        this.translateService
            .get('question.delete_document_type_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.documentTypeService.deleteDocumentType(id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getDocumentTypes();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
            },
        });
    }

    onCancelForm(event) {
        this.display = false;
        this.getDocumentTypes();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddDocumentType();
                break;
        }
    }
}
