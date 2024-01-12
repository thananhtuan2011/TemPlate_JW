import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { BaseTableKPI } from '../../../utilities/app-base-table-kpi';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { KpiService } from 'src/app/service/kpi.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-report-kpi',
    templateUrl: './report-kpi.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            :host ::ng-deep .p-organizationchart {
                .p-person {
                    padding: 0;
                    border: 0 none;
                }

                .node-header,
                .node-content {
                    padding: 0.5em 0.7rem;
                }

                .node-header {
                    background-color: #495ebb;
                    color: #ffffff;
                }

                .node-content {
                    text-align: center;
                    border: 1px solid #495ebb;
                }

                .node-content img {
                    border-radius: 50%;
                }

                .department-cfo {
                    background-color: #7247bc;
                    color: #ffffff;
                }

                .department-coo {
                    background-color: #a534b6;
                    color: #ffffff;
                }

                .department-cto {
                    background-color: #e9286f;
                    color: #ffffff;
                }
            }
        `,
    ],
})
export class ReportKpiComponent extends BaseTableKPI<any> implements OnInit {
    data1: TreeNode[];
    dataMChart: object = {};
    selectedNode: TreeNode;

    month = new FormControl(this.defaultParam.Month);
    month2 = new FormControl(this.defaultParam.Month);

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private activatedRoute: ActivatedRoute,
        private _kpiService: KpiService,
        public breakpointObserver: BreakpointObserver,
    ) {
        super(breakpointObserver, activatedRoute);
    }
    isMobile = screen.width <= 1199;
    ngOnInit(): void {
        this.loadChart();
        this.loadHeader();
    }

    getChildData(data) {
        let output = [];
        if (data.items.length > 0) {
            data.items.forEach((item) => {
                output.push({
                    label: item.name || 'No name',
                    type: 'person',
                    styleClass: 'p-person',
                    expanded: true,
                    data: {
                        name:
                            item.point && item.pointKpi
                                ? `${item.point}/${item.pointKpi}${item.percent
                                    ? ' (' + item.percent + ')'
                                    : ``
                                }`
                                : '0/0 (0%)',
                    },
                    children: item.items ? this.getChildData(item) : [],
                });
            });
        }
        return output;
    }

    loadChart() {
        let params = {
            month: this.month2.value,
        };
        this._kpiService
            .getReportKPIFullByMonth(params)
            .subscribe((res: any) => {
                let result = {
                    label: res.data?.name || 'No name',
                    type: 'person',
                    styleClass: 'p-person',
                    expanded: true,
                    data: {
                        name:
                            res.data?.point && res.data?.pointKpi
                                ? `${res.data?.point}/${res.data
                                    ?.pointKpi}${res.data?.percent
                                        ? ' (' + res.data?.percent + ')'
                                        : ''
                                }`
                                : '0/0 (0%)',
                    },
                    children: this.getChildData(res.data),
                };
                this.data1 = [
                    result
                ];
                this.dataMChart = result;
                console.log(this.dataMChart)
            });

    }

    // onNodeSelect(event) {
    //     this.messageService.add({severity: 'success', summary: 'Node Selected', detail: event.node.label});
    // }

    loadHeader() {
        this.cols = [
            {
                header: 'label.kpi_no',
                field: 'userId',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
            {
                header: 'label.kpi_name',
                field: 'fullName',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
            {
                header: 'label.kpi_score_kpi',
                field: 'pointKpi',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
                slot: 'number',
            },
            {
                header: 'label.kpi_score_achieved',
                field: 'point',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
                slot: 'number',
            },
            {
                header: 'label.kpi_percent',
                field: 'percent',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
                slot: 'number',
            },
        ];
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.month.valueChanges.subscribe((_) => {
            this.defaultParam.Page = 1;
            this.fetchData();
        });
        this.month2.valueChanges.subscribe((_) => {
            this.defaultParam.Page = 1;
            this.loadChart();
        });
    }

    fetchData() {
        let request = this._kpiService.getReportKPI({
            Month: this.month.value,
        });
        this.processData(request);
    }

    getkpi() {
        this._kpiService.exportExcel().subscribe((res) => {
            this.openDownloadFile(res, 'excel');
        });
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this._kpiService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) { }
    }
}
