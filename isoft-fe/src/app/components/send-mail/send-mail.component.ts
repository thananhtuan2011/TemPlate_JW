import {
    AfterViewInit,
    Component,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { catchError, filter, finalize } from 'rxjs/operators';
import {
    ConfirmationService,
    LazyLoadEvent,
    MessageService,
} from 'primeng/api';
import { EMPTY, merge, tap, throwError } from 'rxjs';
import { SendMailService } from '../../service/send-mail.service';
import AppUtil from '../../utilities/app-util';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import AppConstants from '../../utilities/app-constants';

@Component({
    selector: 'app-send-mail',
    templateUrl: './send-mail.component.html',
})
export class SendMailComponent implements OnInit, AfterViewInit {
    appConstant = AppConstants;
    @ViewChild('dt', { static: true }) table?: Table;
    loading: boolean = false;
    isMobile = screen.width <= 1199;
    userList = [];
    customerList = [];
    searchForm = new FormControl();
    protected _watcher: any[] = [];
    result: any = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };

    public defaultParam: any = {
        page: 1,
        pageSize: 10,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private sendMailService: SendMailService,
        private confirmationService: ConfirmationService,
        private translateService: TranslateService,
        private messageService: MessageService,
        private router: Router,
    ) {
        const resolveData = this.activatedRoute?.snapshot?.data?.resolveData;
        this.result = resolveData;
        this.customerList = resolveData.customerList;
        this.userList = resolveData.userList;
    }

    ngAfterViewInit(): void {
        console.log(this.result)
        const onLazy = this.table?.onLazyLoad?.pipe(
            filter(({ first, rows }: LazyLoadEvent) => {
                return (
                    this.defaultParam.page !== first / rows + 1 ||
                    this.defaultParam.pageSize !== rows
                );
            }),
            tap(({ first, rows }) => {
                this.defaultParam.page = first / rows + 1;
                this.defaultParam.pageSize = rows;
            }),
        );
        this._watcher = [onLazy];

        merge(...this._watcher)
            .pipe(
                tap(() => (this.loading = true)),
                catchError((error) => {
                    return EMPTY;
                }),
                finalize(() => (this.loading = false)),
            )
            .subscribe((res: any) => {
                this.getList();
                this.loading = false;
            });
    }

    ngOnInit(): void {}

    getNameUser(id, data) {
        return (
            (data == 'user' ? this.userList : this.customerList)?.find(
                (item) => item?.id,
            )?.name || ''
        );
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getList();
        }
    }

    getList() {
        this.sendMailService
            .getList({ ...this.defaultParam })
            .subscribe((res) => {
                console.log(res)
                this.result = {
                    ...this.result,
                    ...res,
                };
            });
    }

    onDelete(id) {
        this.confirmationService.confirm({
            header: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            message: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            accept: () => {
                this.sendMailService
                    .delete(id)
                    .pipe(
                        catchError((err: HttpErrorResponse) => {
                            this.messageService.add({
                                severity: 'error',
                                detail: AppUtil.translate(
                                    this.translateService,
                                    'error.1',
                                ),
                            });
                            return throwError(err);
                        }),
                    )
                    .subscribe((_) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getList();
                    });
            },
        });
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                this.router.navigate(['/uikit/send-mail/create']);
                break;
        }
    }
}
