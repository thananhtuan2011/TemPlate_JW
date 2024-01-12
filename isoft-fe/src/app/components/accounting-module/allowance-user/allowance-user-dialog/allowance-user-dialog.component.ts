import { Component, HostListener, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { AllowanceModel } from '../../../../models/allowance.model';
import { AllowanceService } from '../../../../service/allowance.service';
import { AllowanceUserService } from '../../../../service/allowance-user.service';
import AppUtil from '../../../../utilities/app-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-allowance-user-dialog',
    templateUrl: './allowance-user-dialog.component.html',
    styleUrls: [],
})
export class AllowanceUserDialogComponent implements OnInit {
    items!: FormArray;
    data: any = {};
    allowanceForm: FormGroup;
    allowances: AllowanceModel[] = [];

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private allowanceService: AllowanceService,
        private allowanceUserService: AllowanceUserService,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
    ) {}

    async ngOnInit() {
        this.allowanceForm = new FormGroup({
            userId: new FormControl(),
            userName: new FormControl(),
            items: new FormArray([]),
        });
        this.items = this.allowanceForm.get('items') as FormArray;
        this.data = this.config.data;
        if (this.data.listItem?.length) {
            await this.getAllowances({ page: 0, pageSize: 100 });
            this.data.listItem?.map((item) => {
                this.items.push(
                    new FormGroup({
                        allowanceId: new FormControl(item.allowanceId),
                        allowanceValue: new FormControl(item.value),
                        allowanceNote: new FormControl(item.note),
                    }),
                );
            });
        } else
            this.items.push(
                new FormGroup({
                    allowanceId: new FormControl(),
                    allowanceValue: new FormControl(),
                    allowanceNote: new FormControl(),
                }),
            );
    }

    async getAllowances(param?: any) {
        const response = await this.allowanceService.getPagingAllowances({
            page: param?.page || 0,
            pageSize: param?.pageSize || 20,
            searchText: param?.searchText || '',
        });
        this.allowances = response?.data || [];
    }

    onSearchAllowance(event): void {
        this.getAllowances({ searchText: event?.filter || '' });
    }

    onAddAllowance(): void {
        this.items.push(
            new FormGroup({
                allowanceId: new FormControl(null),
                allowanceValue: new FormControl(null),
                allowanceNote: new FormControl(null),
            }),
        );
    }

    onRemoveAllowance(i): void {
        this.items.removeAt(i);
    }

    onSave(): void {
        const allowances =
            this.items.value?.reduce((arr, curr) => {
                arr.push({
                    id: 0,
                    userId: this.config.data?.userId || 0,
                    allowanceId: curr.allowanceId,
                    value: curr.allowanceValue,
                    note: curr.allowanceNote,
                });
                return arr;
            }, []) || [];
        const request = {
            userId: this.config.data?.userId,
            userName: this.config.data?.userName,
            listItem: allowances,
        };
        this.allowanceUserService.createAllowanceUser(request).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                this.ref.close();
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onClose(): void {
        this.ref.close();
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
                this.onClose();
                break;
        }
    }
}
