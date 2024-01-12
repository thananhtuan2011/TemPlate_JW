import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { DocumentTypeService } from '../../../../../service/document-type.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import AppUtil from '../../../../../utilities/app-util';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-document-type-form',
    templateUrl: './document-type-form.component.html',
    styleUrls: [],
})
export class DocumentTypeFormComponent implements OnInit {
    @Input() display: boolean = false;

    @Input() set formData(value) {
        if (value?.id)
            this.documentTypeForm.setValue({
                id: value?.id,
                name: value?.name,
                description: value?.description,
                status: value?.status,
            });
    }

    @Output() onCancel = new EventEmitter();
    documentTypeForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private readonly documentTypeService: DocumentTypeService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.documentTypeForm = new FormGroup({
            id: new FormControl(),
            name: new FormControl(),
            description: new FormControl(),
            status: new FormControl(true),
        });
    }

    checkValidValidator(fieldName: string) {
        return ((this.documentTypeForm.controls[fieldName].dirty ||
            this.documentTypeForm.controls[fieldName].touched) &&
            this.documentTypeForm.controls[fieldName].invalid) ||
            this.documentTypeForm.controls[fieldName].invalid
            ? 'ng-invalid ng-dirty'
            : '';
    }

    onSubmit() {
        if (this.documentTypeForm.valid) {
            const request = {
                id: this.documentTypeForm.value.id || 0,
                name: this.documentTypeForm.value.name,
                description: this.documentTypeForm.value.description,
                status: this.documentTypeForm.value.status,
                isDelete: false,
            };
            if (request.id)
                this.documentTypeService
                    .updateDocumentType(request, request.id)
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
            else
                this.documentTypeService.createDocumentType(request).subscribe(
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
        }
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
