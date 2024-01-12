import { Component, HostListener, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IncomingTextService } from '../../../service/incoming-text.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/auth.service';
import AppUtil from '../../../utilities/app-util';
import { WorkTypeService } from '../../../service/work-type.service';
import AppConstants from '../../../utilities/app-constants';
import {AppMainComponent} from "../../../layouts/app.main.component";

@Component({
    selector: 'app-workflow-type',
    templateUrl: './workflow-type.component.html',
    styles: [``],
})
export class WorkflowTypeComponent implements OnInit {
    appConstant = AppConstants;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };
    param: Page = {
        page: 1,
        pageSize: 20,
    };

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly workTypeService: WorkTypeService,
        public appMain: AppMainComponent,
    ) {}

    ngOnInit(): void {}

    getWorkTypes(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.workTypeService.getPagingWorkTYpe(this.param).subscribe(
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

    onAddWorkType() {
        this.display = true;
        this.formData = {};
    }

    onEditWorkType(item) {
        this.formData = item;
        this.display = true;
    }

    onDeleteWorkType(id) {
        this.confirmationService.confirm({
            message: AppUtil.translate(
                this.translateService,
                'question.delete_work_type_content',
            ),
            header: AppUtil.translate(
                this.translateService,
                'question.delete_work_type_header',
            ),
            accept: () => {
                this.workTypeService.deleteWorkTYpe(id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
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
        this.formData = {};
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddWorkType();
                break;
        }
    }
}
