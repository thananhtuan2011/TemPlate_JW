import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { PageFilterDepartment } from 'src/app/service/department.service';
import { TypeOfDocumentFormComponent } from './type-of-document-form/type-of-document-form.component';
import { DocumentService } from 'src/app/service/document.service';
import { UserService } from 'src/app/service/user.service';
import AppConstants from '../../../../utilities/app-constants';
@Component({
    selector: 'app-type-of-document',
    templateUrl: './type-of-document.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }
        `,
    ],
})
export class TypeOfDocumentComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('typeOfDocumentForm') typeOfDocumentFormComponent:
        | TypeOfDocumentFormComponent
        | undefined;

    loading: boolean = true;

    first = 0;

    public getParams: PageFilterDepartment = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;
    documents: Document[] = [];

    display: boolean = false;
    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    users: any[] = [];

    constructor(
        private readonly documentService: DocumentService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly userService: UserService,
    ) {}

    ngOnInit() {
        // this.getAllUserActive();
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
    }

    getUserText(code) {
        let user = this.users.find((x) => x.code === code);
        return user ? `${user.code} - ${user.fullName}` : '';
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getDocuments();
        }
    }

    getDocuments(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.documentService
            .getDocuments(this.getParams)
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                this.documents = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    onAdd() {
        this.isEdit = false;
        this.display = true;
    }

    onDelete(documentId) {
        let message;
        this.translateService
            .get('question.delete_type_of_document_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.documentService
                    .deleteDocument(documentId)
                    .subscribe((response: any) => {
                        this.getDocuments();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAdd();
                break;
        }
    }

    protected readonly AppConstants = AppConstants;
}
