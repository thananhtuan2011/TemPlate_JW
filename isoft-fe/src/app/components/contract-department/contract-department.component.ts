import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ContractDeparmentService } from 'src/app/service/contract-department';
import { CrudContractDepartmentComponent } from './crud-contract-department/crud-contract-department.component';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-contract-department',
    templateUrl: './contract-department.component.html',
    styleUrls: ['./contract-department.component.scss'],
    providers: [DialogService],
})
export class ContractDepartmentComponent implements OnInit {
    templateName = 'Uploads\\Contract\\HopDongThuViec.docx';
    templateKHName = 'Uploads\\Contract\\HopDongKhachHang.docx';
    scrolHeight = '80vh';
    contractDepartmentList: any[];

    constructor(
        private contractDeparmentService: ContractDeparmentService,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private translateService: TranslateService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.getList();
    }

    private getList() {
        let getParams: any = {
            page: 1,
            pageSize: 100,
        };
        return this.contractDeparmentService.getListContractType(getParams).subscribe((res: any) => {
            this.contractDepartmentList = res?.data;
        });
    }

    openFile(fileUrl) {
        window.open(
            `${environment.serverURL}/api/ReportDownload/download-contract-type?linkFile=${fileUrl}`,
        );
    }

    onCrud(data: any | undefined) {
        const isNew = data ? false : true;
        var ref = this.dialogService.open(CrudContractDepartmentComponent, {
            data: {
                id: data?.id || 0,
                contractDepartmentList: _.cloneDeep(
                    this.contractDepartmentList,
                ),
            },
            width: '40%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            header: isNew ? 'Thêm mới mẫu hợp đồng' : 'Sửa mẫu hợp đồng',
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.getList();
            }
        });
    }

    onRemove(data) {
        this.confirmationService.confirm({
            header: 'Xóa dữ liệu',
            message: `Bạn có chắc chắn muốn xóa ${data.code} hay không ?`,
            acceptLabel: AppUtil.translate(this.translateService, 'label.yes'),
            rejectLabel: AppUtil.translate(this.translateService, 'label.no'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.contractDeparmentService.delete(data.id).subscribe((_) => {
                    this.getList();
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                });
            },
        });
    }
}
