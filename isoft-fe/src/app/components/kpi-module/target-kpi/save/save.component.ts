import {
    AfterContentChecked,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnInit,
} from '@angular/core';
import { BaseTableKPI } from '../../../../utilities/app-base-table-kpi';
import { TargetKpi } from '../../../../models/kpi/target-kpi';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { KpiService } from '../../../../service/kpi.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import AppUtil from '../../../../utilities/app-util';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-save',
    templateUrl: './save.component.html',
    styles: [
        `
            :host ::ng-deep .dropdown-table {
                .p-dropdown {
                    width: 100%;
                    height: 40px;
                }
            }
        `,
    ],
})
export class SaveComponent
    extends BaseTableKPI<TargetKpi>
    implements OnInit, AfterContentChecked
{
    targetUser = [];
    departments;
    users;
    constructor(
        private _kpiService: KpiService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private messageService: MessageService,
        private translateService: TranslateService,
        public breakpointObserver: BreakpointObserver,
    ) {
        super(breakpointObserver, activatedRoute, fb);
    }

    ngOnInit(): void {
        this.loadHeader();
        this.departments = this.result['departments'] || [];
        this.users = this.result['users'] || [];
        this.initFormKPI();
    }

    fetchData(): void {}

    initFormKPI() {
        this.saveForm = this.fb.group({
            name: ['', Validators.required],
            departmentId: [
                this.departments.length ? this.departments[0]?.id : null,
            ],
            procedureNumber: ['', Validators.required],
            items: this.fb.array([]),
        });
        if (this.result.id) {
            this.patchValueForm();
        } else {
            this.addTargetUser();
        }
        this.targetUser.push(this.targetArrayForm.value);
    }

    initItems() {
        return this.fb.group({
            userId: [null, Validators.required],
            userName: [null, Validators.required],
            point: [0, Validators.pattern('^[0-9]*$')],
        });
    }

    loadHeader() {
        this.cols = [
            {
                header: 'label.kpi_no',
                field: 'userCode',
                classHeader: 'py-4 w-4',
                classBody: 'py-4 w-15rem',
            },
            {
                header: 'label.kpi_name_staff',
                field: 'userName',
                classHeader: 'py-4 w-4',
                classBody: 'py-4 w-15rem',
            },
            {
                header: 'label.kpi_score',
                field: 'point',
                classHeader: 'py-4 w-3',
                classBody: 'py-4 w-15rem',
            },
        ];
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    onSubmitForm() {
        super.submitForm();

        if (this.saveForm.invalid) {
            return;
        }

        const value = this.saveForm.value;
        value.items = value.items.map((_item) => {
            return this.parseArray(_item, ['point', 'userId']);
        });
        const api = this.result.id
            ? this._kpiService.updateTargetKPI(this.result.id, {
                  ...this.result,
                  ...value,
              })
            : this._kpiService.createKPI({
                  ...value,
              });

        api.pipe(
            catchError((err: HttpErrorResponse) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.1'),
                });
                return throwError(err);
            }),
        ).subscribe((_) => {
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    this.result.id ? 'success.update' : 'success.create',
                ),
            });
            this.router.navigate(['/uikit/kpi/target']);
        });
    }

    get targetArrayForm() {
        return this.saveForm.get('items') as FormArray;
    }

    addTargetUser() {
        this.targetArrayForm.push(this.initItems());
    }

    deleteTargetUser(index: number) {
        this.targetArrayForm.removeAt(index);
    }

    changeUser(
        index: number,
        event: any,
        fieldChoose: string,
        fieldControlChange: any,
    ) {
        if (!event.value) {
            this.field(`items.${index}.${fieldControlChange}`)?.patchValue('');
        } else {
            const user = this.users.find((i) => i[fieldChoose] === event.value);

            this.field(`items.${index}.${fieldControlChange}`)?.patchValue(
                user[fieldControlChange === 'userName' ? 'username' : 'id'],
            );
        }
    }

    parseArray(arr, keyNumber = []) {
        let item = {};
        Object.keys(arr).forEach((key) => {
            item = {
                ...item,
                [key]: keyNumber.includes(key)
                    ? Number(arr[key])
                    : arr[key].toString(),
            };
        });
        return item;
    }

    patchValueForm() {
        this.result.items.forEach((data) => {
            const user = this.users.find((i) => i.id === data.userId);
            data.userId = user.id;
            data.userName = user.username;
            this.addTargetUser();
        });
        this.saveForm.patchValue(this.result);
    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                this.onSubmitForm();
                this.router.navigate(['/uikit/kpi/target']);
                break;
            case 'F6':
                event.preventDefault();
                this.router.navigate(['/uikit/kpi/target']);
                break;
        }
    }
}
