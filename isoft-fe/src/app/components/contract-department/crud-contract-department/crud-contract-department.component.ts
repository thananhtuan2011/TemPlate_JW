import { Component, Input, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ContractType } from 'src/app/models/contract-type.model';
import { ContractDeparmentService } from 'src/app/service/contract-department';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { DepartmentService } from 'src/app/service/department.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';

export function validateDuplicateCode(
    contractDepartmentList: any[],
    id: number,
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control?.value) {
            const isDuplicate =
                _.findIndex(contractDepartmentList, (item) => {
                    return item.code == control.value && item.id != id;
                }) != -1;
            return isDuplicate ? { duplidateCde: true } : null;
        }
        return null;
    };
}

@Component({
    selector: 'app-crud-contract-department',
    templateUrl: './crud-contract-department.component.html',
    styleUrls: ['./crud-contract-department.component.scss'],
})
export class CrudContractDepartmentComponent implements OnInit {
    contractDepartmentList: any[] = [];
    contractTypes = [{ id: null, name: "Chọn hợp đồng" }];
    listCode = [
        { id: null, name: "Chọn mã code" },
        { id: "HDNS", name: "HDNS" },
        { id: "HDKH", name: "HDKH" },
     ];
    departments = []
    form: FormGroup;

    constructor(
        private translateService: TranslateService,
        private messageService: MessageService,
        private dynamicDialogRef: DynamicDialogRef,
        private dynamicDialogConfig: DynamicDialogConfig,
        private contractTypeService: ContractTypeService,
        private contractDeparmentService: ContractDeparmentService,
        private departmentService: DepartmentService,
        private fb: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.contractDepartmentList =
            this.dynamicDialogConfig?.data?.contractDepartmentList;
        this.getDepartments();
        this.getDetail(this.dynamicDialogConfig?.data?.id || 0, (res) => {
            this.form = this.fb.group({
                id: this.fb.control(res?.id || 0),
                code: this.fb.control(res?.code),
                name: this.fb.control(res?.name, [Validators.required]),
                departmentId: this.fb.control(res?.departmentId || null),
                contractTypeId: this.fb.control(res?.contractTypeId || null),
                linkFile: this.fb.control(res?.linkFile),
            });     
        });
        this.getList()

    }

    get fcFile() {
        return this.form.get('linkFile');
    }

    get isNew() {
        return this.form.get('id').value === 0;
    }

    get isFormValid() {
        return this.form?.valid;
    }

    getList(event? : any) {
        let contracType = 0;
        if(this.form?.value?.code && this.form?.value?.code == "HDKH"){
            contracType = 1;
        }
        return this.contractTypeService.getAllContractType(contracType).subscribe((res: any) => {
            this.contractTypes = [
                { id: null, name: 'Chọn hợp đồng' },
                ...res?.data
            ]
        });
    }

    private getDepartments() {
        this.departmentService.getList().subscribe((res: any) => {
            this.departments = [
                {
                    id: null,
                    name: 'Áp dụng cho tất cả phòng ban'
                },
                ...res?.data,
            ];
        });
    }

    private getDetail(id, callBack) {
        if (!id) {
            callBack();
            return;
        }
        this.contractDeparmentService.get(id).subscribe((res) => {
            callBack(res);
        });
    }

    onSave() {
        if (!this.isFormValid) {
            return;
        }
        let input = this.form.value;
        const $api = this.isNew
            ? this.contractDeparmentService.create(input)
            : this.contractDeparmentService.update(input.id, input);
        $api.subscribe((res) => {
            this.dynamicDialogRef.close(true);
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.update',
                ),
            });
        });
    }

    doAttachFile(event: any): void {
        if (!event || !event.target?.files[0]) {
            return;
        }
        const formData = new FormData();
        formData.append('file', event.target?.files[0]);
        this.contractDeparmentService
            .uploadFiles(formData)
            .subscribe((response: any) => {
                if (response.body && response.body.imageUrl) {
                    this.fcFile.setValue(response.body.imageUrl);
                }
            });
    }

    openFile() {
        window.open(
            `${environment.serverURL}/api/ReportDownload/download-contract-type?linkFile=${this.fcFile.value}`,
        );
    }
}
