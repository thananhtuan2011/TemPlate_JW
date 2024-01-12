import { Component, OnInit } from '@angular/core';
import { GeneralStatisticsService } from 'src/app/service/general-statistics.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-general-statistics',
    templateUrl: './general-statistics.component.html',
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }

            :host ::ng-deep {
                .p-datatable.p-datatable-gridlines
                    .p-datatable-thead
                    > tr
                    > th {
                    background: #dbebfb;
                    border-color: #707070;
                }

                .p-datatable.p-datatable-gridlines
                    .p-datatable-tbody
                    > tr
                    > td {
                    border-color: #707070;
                }
            }
        `,
    ],
})
export class GeneralStatisticsComponent implements OnInit {
    pendingRequest;
    loading: boolean = false;
    cols: any[] = [];
    lst: any[] = [];
    display: boolean = false;
    isMobile = screen.width <= 1199;
    // dialog
    displayHistories: boolean = false;
    detail = [];

    constructor(private generalStatisticsService: GeneralStatisticsService) {}

    ngOnInit(): void {
        this.getGeneralStatistics();
        
    }

    getInfoDetail(item) {
        this.detail = item;
        console.log(this.detail);

        this.displayHistories = true;
    }
    getGeneralStatistics(): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        this.pendingRequest = this.generalStatisticsService
            .getHeaderGeneralStatistics()
            .subscribe((data) => {
                AppUtil.scrollToTop();
                this.cols = data.data;
            });
        this.generalStatisticsService
            .getListGeneralStatistics()
            .subscribe((res) => {
                this.lst = res.data;
                console.log(this.lst);

                this.loading = false;
            });
    }

    exportGeneralStatistis() {
        this.generalStatisticsService
            .exportGeneralStatistis()
            .subscribe((res) => {
                console.log(res);
            });
    }
}
