import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { TextGoModel } from '../../../models/text-go.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IncomingTextService } from '../../../service/incoming-text.service';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../utilities/app-util';
import { TextGoService } from '../../../service/text-go.service';
import { Router } from '@angular/router';
import { IncomingTextModel } from '../../../models/incoming-text.model';
import { AuthService } from '../../../service/auth.service';
import { TextGoFormComponent } from './component/text-go-form.component';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-text-go',
    providers: [MessageService, ConfirmationService],
    templateUrl: './text-go.component.html',
    styles: [``],
})
export class TextGoComponent implements OnInit {
    appConstant = AppConstants;
    @ViewChild('textGoForm') textGoForm: TextGoFormComponent;
    display: boolean = false;
    formData = {};
    displayWorkflowForm = false;
    formDataWorkflow = {};
    loading: boolean = false;
    sortFields: any[] = [];
    sortTypes: any[] = [];
    result: TypeData<TextGoModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 0,
        pageSize: 20,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly textGoService: TextGoService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly authService: AuthService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.getTextGo();
    }

    getTextGo(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.textGoService.getPagingTextGo(this.param).subscribe(
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

    onAddTextGo() {
        this.textGoForm.getDetail({});
        this.display = true;
    }

    getTextGoDetail(item) {
        this.textGoService.getTextGoDetail(item.id).subscribe(
            (res) => {
                this.textGoForm.getDetail(res);
                this.display = true;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onDeleteTextGo(id) {
        let message;
        this.translateService
            .get('question.delete_text_go_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.textGoService.deleteTextGo(id).subscribe(
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

    onChangeSort(event, type) {}

    onCreateWorkflow(item: TextGoModel) {
        this.formDataWorkflow = {
            name: item.textSymbol,
            description: item.documentName,
            dueDate: null,
            userCreateName: this.authService.user.fullname,
            responsiblePerson: [],
            joinedPersons: [],
            viewedPersons: [],
            fileLink: [
                {
                    fileId: '',
                    fileName: item.fileUrl,
                },
            ],
        };
        this.displayWorkflowForm = true;
    }

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
        this.displayWorkflowForm = false;
        this.formDataWorkflow = {};
        this.getTextGo();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getTextGo();
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddTextGo();
                break;
        }
    }
}
