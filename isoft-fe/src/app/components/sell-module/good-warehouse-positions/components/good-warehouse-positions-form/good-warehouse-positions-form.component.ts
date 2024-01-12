import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseFloorsService } from '../../../../../service/warehouse-floors.service';
import { WarehousePositionsService } from '../../../../../service/warehouse-positions.service';

@Component({
    selector: 'app-good-warehouse-positions-form',
    templateUrl: './good-warehouse-positions-form.component.html',
    styles: [``],
})
export class GoodWarehousePositionsFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    floorsForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private warehousePositionsService: WarehousePositionsService,
    ) {
        this.floorsForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            note: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_branch',
            );
            this.floorsForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                note: this.formData.note,
            });
            console.log('this.branchForm', this.floorsForm);
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_branch',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.floorsForm.reset();
    }

    ngOnInit() {
        // const param = this.route.snapshot.paramMap.get('id');
        // switch (param) {
        //     case 'create':
        //         this.isEdit = false;
        //         break;
        //     default:
        //         this.isEdit = true;
        //         this.getBranchDetail(param);
        //         break;
        // }
    }

    checkValidValidator(fieldName: string) {
        return ((this.floorsForm.controls[fieldName].dirty ||
            this.floorsForm.controls[fieldName].touched) &&
            this.floorsForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.floorsForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.floorsForm.controls[fieldNames[i]].dirty ||
                    this.floorsForm.controls[fieldNames[i]].touched) &&
                    this.floorsForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.floorsForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.floorsForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isInvalidForm = true;
            this.isSubmitted = false;
            return;
        }

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.floorsForm.value),
        );
        // this.onCancel.emit({});
        if (this.isEdit) {
            this.warehousePositionsService
                .updateWareHousePositions(newData, this.floorsForm.value.id)
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                    }
                });
        } else {
            this.warehousePositionsService
                .createPositions(newData)
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Thêm mới thành công',
                        });
                    }
                });
        }
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
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
