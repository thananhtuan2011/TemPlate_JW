import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ContractDeparmentService } from 'src/app/service/contract-department';
import { environment } from 'src/environments/environment';
import * as saveFile from 'file-saver';
@Component({
    selector: 'app-print-contract',
    templateUrl: './print-contract.component.html',
    styleUrls: ['./print-contract.component.scss'],
})
export class PrintContractComponent implements OnInit {
    scrolHeight = '50vh';
    contractDepartmentList: any[];
    data;

    constructor(
        private dynamicDialogConfig: DynamicDialogConfig,
        private contractDeparmentService: ContractDeparmentService,

    ) {}

    ngOnInit(): void {
        this.data = this.dynamicDialogConfig?.data;
        this.getList();
    }

    private getList() {
        return this.contractDeparmentService.getList(this.data.contractType.id).subscribe((res: any) => {
            this.contractDepartmentList = _.filter(res?.data, (item) => {
                return (!item.departmentId ? true : item.departmentId === this.data.employee.departmentId
                );
            });
        });
    }

    downloadContract(row) {
        this.contractDeparmentService
            .downloadContact(this.data.employee.id, row.id)
            .subscribe((res: any) => {
                const fileName = res.data;
                window.open(
                    `${environment.serverURL}/api/ReportDownload/DownloadReportFromFile?filename=${fileName}&fileType=CONTRACT`,
                );
            });
    }
}
