import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IncomingTextService } from 'src/app/service/incoming-text.service';
import { IncomingTextModel } from '../../../../models/incoming-text.model';
import { DocumentTypeModel } from '../../../../models/document-type.model';
import { User } from '../../../../models/user.model';
import { Department } from '../../../../models/department.model';
import { DocumentTypeService } from '../../../../service/document-type.service';
import { UserService } from '../../../../service/user.service';
import { DepartmentService } from '../../../../service/department.service';
import { Page } from '../../../../models/common.model';
import { debounceTime, Subject } from 'rxjs';
import AppUtil from '../../../../utilities/app-util';
import { Branch } from 'src/app/models/branch.model';
import { BranchService } from 'src/app/service/branch.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import AppConstant from 'src/app/utilities/app-constants';

@Component({
    selector: 'app-incoming-text-form',
    providers: [MessageService, ConfirmationService],
    templateUrl: './incoming-text-form.component.html',
    styles: [],
})
export class IncomingTextFormComponent implements OnInit {
    @Input() display = false;

    @Output() onCancel = new EventEmitter();

    isEdit = false;
    incomingTextModel: IncomingTextModel = {
        toDate: moment(new Date()).format(
            AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
        ),
        dateText: moment(new Date()).format(
            AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
        ),
    };
    param: any = {
        page: 1,
        pageSize: 20,
    };
    documentTypes: DocumentTypeModel[] = [];
    users: User[] = [];
    departments: Department[] = [];
    subjectDept = new Subject<string>();
    subjectUser = new Subject<string>();
    subjectDocumentType = new Subject<string>();
    branches: Branch[] = [];
    selectedFile: any;

    constructor(
        private readonly messageService: MessageService,
        private readonly incomingTextService: IncomingTextService,
        private readonly translateService: TranslateService,
        private readonly documentTypeService: DocumentTypeService,
        private readonly userService: UserService,
        private readonly departmentService: DepartmentService,
        private readonly branchService: BranchService,
    ) {}

    ngOnInit(): void {
        this.getUsers();
        this.getBranches();
        this.getDepartments();
        this.getDocumentTypes();
        this.subjectDept.pipe(debounceTime(500)).subscribe((value) => {
            this.getDepartments(value);
        });
        this.subjectUser.pipe(debounceTime(500)).subscribe((value) => {
            this.getUsers(value);
        });
        this.subjectDocumentType.pipe(debounceTime(500)).subscribe((value) => {
            this.getDocumentTypes(value);
        });
    }

    getDetail(value) {
        if (value?.id) {
            this.isEdit = true;
            this.incomingTextModel = {
                id: value?.id,
                documentTypeId: value?.documentTypeId,
                toDate: moment(value?.toDate).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                unitName: value?.unitName,
                textSymbol: value?.textSymbol,
                dateText: moment(value?.dateText).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                content: value?.content,
                signer: value?.signer,
                branchId: value?.branchId,
                departmentId: value?.departmentId,
                receiverId: value?.receiverId,
                file: value?.file,
                fileUrl: value?.fileUrl,
                fileName: value?.fileName,
            };
        } else {
            this.isEdit = false;
            this.incomingTextModel = {};
        }
    }

    getBranches(keyword?: string) {
        this.param.searchText = keyword || '';
        this.branchService.getListBranch(this.param).subscribe((res) => {
            this.branches = res?.data || [];
        });
    }

    getUsers(keyword?: string) {
        this.param.searchText = keyword || '';
        this.userService.getPagingUser(this.param).subscribe(
            (res) => {
                this.users = res?.data || [];
            },
            (error) => {
                this.users = [];
            },
        );
    }

    getDepartments(keyword?: string) {
        this.param.searchText = keyword || '';
        this.departmentService.getList().subscribe((res) => {
            this.departments = res?.data || [];
        });
    }

    getDocumentTypes(keyword?: string) {
        this.param.searchText = keyword || '';
        this.documentTypeService
            .getPagingDocumentType({
                ...this.param,
                page: this.param.page - 1 < 0 ? 0 : this.param.page - 1,
            })
            .subscribe(
                (res) => {
                    this.documentTypes = res?.data || [];
                },
                (error) => {
                    this.documentTypes = [];
                },
            );
    }

    onFilterDepartment(event: any) {
        if (event) this.subjectDept.next(event.filter);
    }

    onFilterDocumentType(event: any) {
        if (event) this.subjectDocumentType.next(event.filter);
    }

    onFilterUser(event: any) {
        if (event) this.subjectUser.next(event.filter);
    }

    onChangeSort(event, type) {}

    onUploadFile(event) {
        let file = event.currentFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        this.incomingTextModel.file = formData;
    }
    doAttachFile(event: any): void {
        if (event) {
            this.selectedFile = event.target?.files[0];
        }
    }
    onSave() {
        let toDate = moment(
            AppUtil.adjustDateOffset(this.incomingTextModel?.toDate),
        ).format('YYYY-MM-DD');
        let dateText = moment(
            AppUtil.adjustDateOffset(this.incomingTextModel?.dateText),
        ).format('YYYY-MM-DD');
        this.incomingTextModel.file = this.selectedFile;
        this.incomingTextModel.toDate =
            toDate == 'Invalid date'
                ? moment(
                      this.incomingTextModel.toDate,
                      AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(AppConstant.FORMAT_DATE.T_DATE)
                : toDate;
        this.incomingTextModel.dateText =
            dateText == 'Invalid date'
                ? moment(
                      this.incomingTextModel.dateText,
                      AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(AppConstant.FORMAT_DATE.T_DATE)
                : dateText;

        var request = this.cleanObject(this.incomingTextModel);
        if (this.isEdit) {
            this.incomingTextService
                .updateIncomingText(request, this.incomingTextModel.id)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.onCancel.emit({});
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
        } else
            this.incomingTextService.createIncomingText(request).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.onCancel.emit({});
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        const formData = new FormData();
        if (data.id) {
            formData.append('id', String(data.id));
        }
        if (this.selectedFile) {
            formData.append('file', this.selectedFile);
        }
        if (data.documentTypeId) {
            formData.append('documentTypeId', data.documentTypeId);
        }
        if (data.toDate && data.toDate != 'Invalid date') {
            formData.append('toDate', data.toDate);
        }
        if (data.unitName) {
            formData.append('unitName', data.unitName);
        }
        if (data.textSymbol) {
            formData.append('textSymbol', data.textSymbol);
        }
        if (data.dateText && data.dateText != 'Invalid date') {
            formData.append('dateText', data.dateText);
        }
        if (data.content) {
            formData.append('content', data.content);
        }
        if (data.signer) {
            formData.append('signer', data.signer);
        }
        if (data.departmentId) {
            formData.append('departmentId', data.departmentId);
        }
        if (data.receiverId) {
            formData.append('receiverId', data.receiverId);
        }
        // remove undefined value
        Object.keys(formData).forEach(
            (k) =>
                (formData[k] == undefined || formData[k] == 'Invalid date') &&
                delete formData[k],
        );
        return formData;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
