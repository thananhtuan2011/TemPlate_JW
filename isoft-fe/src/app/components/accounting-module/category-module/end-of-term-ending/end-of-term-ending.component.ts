import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BranchFormComponent } from 'src/app/components/employee-module/branch/components/branch-form/branch-form.component';
import { Branch } from 'src/app/models/branch.model';
import { TypeData } from 'src/app/models/common.model';
import { EndOfTermEnding } from 'src/app/models/end-of-term-ending';
import {
    PageFilterBranch,
    BranchService,
} from 'src/app/service/branch.service';
import { DecideService } from 'src/app/service/decide.service';
import { EndOfTermEndingService } from 'src/app/service/end-of-term-ending.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { EndOfTermEndingFormComponent } from './end-of-term-ending-form/end-of-term-ending-form.component';
import AppConstants from '../../../../utilities/app-constants';
import AppConstant from '../../../../utilities/app-constants';
@Component({
    selector: 'app-end-of-term-ending',
    templateUrl: './end-of-term-ending.component.html',
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
    providers: [MessageService, ConfirmationService],
})
export class EndOfTermEndingComponent implements OnInit {
    appConstant = AppConstants;
    @ViewChild('endOfTermEndingFormComponent') endOfTermEndingFormComponent:
        | EndOfTermEndingFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterBranch = {
        page: 1,
        pageSize: 10,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;
    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;
    listEndOfTermEnding: EndOfTermEnding[] = [];

    constructor(
        private messageService: MessageService,
        private readonly branchService: BranchService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private endOfTermEndingService: EndOfTermEndingService,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getEndOfTermEnding();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getEndOfTermEnding();
    }

    getEndOfTermEnding(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        // if (isExport) {
        //     this.branchService
        //         .getExcelReport(this.getParams)
        //         .subscribe((res: any) => {
        //             AppUtil.scrollToTop();
        //             this.openDownloadFile(res.data, 'excel');
        //         });
        // }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.endOfTermEndingService
            .getListEndOfTermEnding(this.getParams)
            .subscribe((response: TypeData<EndOfTermEnding>) => {
                AppUtil.scrollToTop();
                this.listEndOfTermEnding = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(id) {
        this.isEdit = true;
        this.endOfTermEndingFormComponent.getDetail(id);
        this.display = true;
    }

    onDelete(id) {
        let message;
        let header;
        this.translateService
            .get('question.delete_end_of_term_ending_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.delete_end_of_term_ending_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                this.endOfTermEndingService
                    .deleteEndOfTermEnding(id)
                    .subscribe((response: any) => {
                        this.getEndOfTermEnding();
                    });
            },
        });
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.branchService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    onAddEndOfTermEnding() {
        this.endOfTermEndingFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddEndOfTermEnding();
                break;
        }
    }

    protected readonly AppConstant = AppConstant;
}
