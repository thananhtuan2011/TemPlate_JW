import { Component, OnInit } from '@angular/core';
import AppUtil from '../../../utilities/app-util';
import { ActivatedRoute } from '@angular/router';
import { BillHistoryCollectionsService } from '../../../service/bill-history-collections.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
    selector: 'app-debt-collection',
    templateUrl: './debt-collection.component.html',
    styles: [``],
})
export class DebtCollectionComponent implements OnInit {
    result: any;
    users: any;
    record: any;
    appUtil = AppUtil;
    status = [
        {
            id: 0,
            label: 'Đi lấy tiền',
        },
        {
            id: 1,
            label: 'Hoàn thành',
            inactive: true,
        },
    ];
    constructor(
        public activatedRoute: ActivatedRoute,
        public billHistoryCollectionsService: BillHistoryCollectionsService,
        public messageService: MessageService,
        public translateService: TranslateService,
    ) {
        this.result = this.activatedRoute?.snapshot?.data?.resolveData;
        this.getData();
    }

    ngOnInit(): void {}

    getData() {
        this.users = this.result.users;
        this.record = this.result.collection;
    }

    getUser(id) {
        return this.users.find((u) => {
            return u.id === id;
        })['fullName'];
    }

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
    }

    updateStatus(body, value) {
        this.billHistoryCollectionsService
            .updateStatus({
                ...body,
                ...value,
            })
            .pipe(
                catchError((err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                    return throwError(err);
                }),
            )
            .subscribe(() => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            });
    }
}
