import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TextGoModel } from '../../../../models/text-go.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TextGoService } from '../../../../service/text-go.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentTypeService } from '../../../../service/document-type.service';
import { UserService } from '../../../../service/user.service';
import { DepartmentService } from '../../../../service/department.service';
import { Page } from '../../../../models/common.model';
import { DocumentTypeModel } from '../../../../models/document-type.model';
import { User } from '../../../../models/user.model';
import { Department } from '../../../../models/department.model';
import { debounceTime, Subject } from 'rxjs';
import AppUtil from '../../../../utilities/app-util';
import { DocumentService } from 'src/app/service/document.service';
import * as moment from 'moment';
import AppConstant from 'src/app/utilities/app-constants';
import { BranchService } from 'src/app/service/branch.service';
import { Branch } from 'src/app/models/branch.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-text-go-form',
    providers: [MessageService, ConfirmationService],
    templateUrl: './text-go-form.component.html',
    styleUrls: [],
})
export class TextGoFormComponent implements OnInit {
    public appConstant = AppConstant;

    @Input() display = false;

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    textGoForm: FormGroup = new FormGroup({});
    param: any = {
        page: 1,
        pageSize: 20,
    };
    documentTypes: any = [];
    users: User[] = [];
    departments: Department[] = [];
    drafters: User[] = [];
    subjectDept = new Subject<string>();
    subjectUser = new Subject<string>();
    subjectDocumentType = new Subject<string>();
    subjectDrafter = new Subject<string>();
    selectedFile: any;
    fileName: string = '';
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private readonly messageService: MessageService,
        private readonly textGoService: TextGoService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly documentTypeService: DocumentService,
        private readonly userService: UserService,
        private readonly departmentService: DepartmentService,
        private readonly branchService: BranchService,
    ) {}

    ngOnInit(): void {
        this.textGoForm = this.fb.group({
            id: [''],
            documentId: ['', [Validators.required]],
            textSymbol: [''],
            departmentId: [''],
            dateText: [''],
            draftarId: [''],
            content: [''],
            signerTextId: [''],
            recipient: [''],
        });
        this.getUsers();
        this.getDepartments();
        this.getDocumentTypes();

        this.subjectUser.pipe(debounceTime(500)).subscribe((value) => {
            this.getUsers(value);
        });
        this.subjectDocumentType.pipe(debounceTime(500)).subscribe((value) => {
            this.getDocumentTypes(value);
        });
    }

    getDetail(item) {
        if (item?.id) {
            this.isEdit = true;
            console.log(item);
            this.textGoForm.patchValue({
                id: item.id,
                documentId: item.documentId,
                textSymbol: item.textSymbol,
                departmentId: item.departmentId || 0,
                dateText: moment(item?.dateText).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                content: item.content,
                draftarId: item.draftarId,
                signerTextId: item.signerTextId,
                recipient: item.recipient,
                fileName: item.fileName,
            });
            this.fileName = item.fileName ?? '';
        } else {
            this.textGoForm.reset();
            this.isEdit = false;
            if (item.dateText) {
                this.textGoForm.controls['dateText'].setValue(
                    new Date(
                        moment(item.dateText).format(
                            this.appConstant.FORMAT_DATE.T_DATE,
                        ),
                    ),
                );
            }
        }
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

    getUserName(userId) {
        let user = this.users.find((c) => c.id === userId);
        return user ? user.fullName : '';
    }

    getDepartments() {
        this.departmentService.getAllDepartment().subscribe((res) => {
            this.departments = res?.data || [];
        });
    }

    getDepartmentName(departmentId) {
        let document = this.departments.find((c) => c.id === departmentId);
        return document ? document.name : '';
    }

    getDocumentTypes(keyword?: string) {
        this.param.searchText = keyword || '';
        this.documentTypeService.getAllActiveDocument().subscribe(
            (res) => {
                this.documentTypes = res?.data || [];
            },
            (error) => {
                this.documentTypes = [];
            },
        );
    }

    getDocumentName(documentId) {
        let document = this.documentTypes.find((c) => c.id === documentId);
        return document ? document.name : '';
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

    onUploadFile(event) {
        this.textGoForm.controls['file'].setValue(event.target?.files[0]);
    }

    onSave() {
        let dateText = moment(
            AppUtil.adjustDateOffset(this.textGoForm.value.dateText),
        ).format('YYYY-MM-DD');
        this.textGoForm.value.dateText =
            dateText == 'Invalid date'
                ? moment(
                      this.textGoForm.value.dateText,
                      AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(AppConstant.FORMAT_DATE.T_DATE)
                : dateText;

        if (this.isEdit)
            this.textGoService
                .updateTextGo(
                    this.cleanObject(this.textGoForm.value),
                    this.textGoForm.value.id,
                )
                .subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                    this.onCancel.emit({});
                });
        else {
            this.textGoService
                .createTextGo(this.cleanObject(this.textGoForm.value))
                .subscribe(
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
    }

    cleanObject(data) {
        const formData = new FormData();
        if (data.id) {
            formData.append('id', String(data.id));
        }
        if (data.dateText && data.dateText != 'Invalid date') {
            formData.append('dateText', data.dateText);
        }
        if (data.documentId) {
            formData.append('documentId', data.documentId);
        }
        if (data.textSymbol) {
            formData.append('textSymbol', data.textSymbol);
        }
        if (data.departmentId) {
            formData.append('departmentId', data.departmentId);
        }
        if (data.draftarId) {
            formData.append('draftarId', data.draftarId);
        }
        if (data.content) {
            formData.append('content', String(data.content));
        }
        if (data.recipient) {
            formData.append('recipient', String(data.recipient));
        }
        if (data.signerTextId) {
            formData.append('signerTextId', data.signerTextId);
        }

        if (this.selectedFile) {
            formData.append('file', this.selectedFile);
        }
        return formData;
    }

    onBack() {
        this.onCancel.emit({});
    }

    doAttachFile(event: any): void {
        if (event) {
            this.selectedFile = event.target?.files[0];
        }
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
