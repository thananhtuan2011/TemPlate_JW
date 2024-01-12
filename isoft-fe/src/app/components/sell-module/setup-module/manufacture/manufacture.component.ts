import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Branch } from 'src/app/models/branch.model';

import { Page, TypeData } from 'src/app/models/common.model';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { ManufactureService } from 'src/app/service/manufacture.service';

import AppUtil from 'src/app/utilities/app-util';

export interface PageManufacture extends Page {
  goodType?: string;
}


@Component({
  selector: 'app-manufacture',
  templateUrl: './manufacture.component.html',
  styleUrls: ['./manufacture.component.scss']
})

export class ManufactureComponent implements OnInit {
  constructor(
    private manufactureService: ManufactureService,
    private readonly translateService: TranslateService,
    private chartOfAccount: ChartOfAccountService,
  ) {

  }
  loading: boolean = true;
  sortFields: any[] = [];
  sortTypes: any[] = [];
  public getParams: PageManufacture = {
    page: 1,
    pageSize: 10,
    searchText: '',
    goodType: 'SANXUAT',
  };
  public totalRecords = 0;
  public totalPages = 0;
  public isLoading: boolean = false;
  listManufacure: any[] = [];
  display: boolean = false;
  isMobile = screen.width <= 1199;
  formData: any = {};
  isEdit: boolean = false;
  isReset: boolean = false;
  pendingRequest: any;
  types: any = {};
  creditAccounts: any[] = [];
  dataParent: any;
  first = 0;
  ngOnInit(): void {
    AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
      this.sortFields = res;
    });
    AppUtil.getSortTypes(this.translateService).subscribe((res) => {
      this.sortTypes = res;
    });
    this.getListCreditAccount();
  }
  getManufacure(event?: any): void {
    if (this.pendingRequest) {
      this.pendingRequest.unsubscribe();
    }
    this.loading = true;
    if (event) {
      this.getParams.page = event.first / event.rows + 1;
      this.getParams.pageSize = event.rows;
    }
    Object.keys(this.getParams).forEach(
      (k) => this.getParams[k] == null && delete this.getParams[k],
    );
    this.pendingRequest = this.manufactureService.getList(this.getParams)
      .subscribe((response: TypeData<Branch>) => {
        AppUtil.scrollToTop();
        this.listManufacure = response.data;
        this.totalRecords = response.totalItems || 0;
        this.totalPages = response.totalItems / response.pageSize + 1;
        this.loading = false;
      });
  }

  getCode(item) {
    let dataDisplay = '';
    if (item?.account) {
      dataDisplay = item.account;
    }
    if (item?.detail1) {
      dataDisplay = item.detail1;
    }
    if (item?.detail2) {
      dataDisplay = item.detail2;
    }
    return dataDisplay;
  }

  getDetail(data) {
    this.manufactureService.getByID(data?.id).subscribe((response) => {
      this.formData = response.data;
      this.isEdit = true;
      this.dataParent = data;
      this.display = true;
    });
  }

  getName(item) {
    let dataDisplay;
    if (item.accountName) {
      dataDisplay = item.accountName;
    }
    if (item?.detailName1) {
      dataDisplay = item.detailName1;
    }
    if (item?.detailName2) {
      dataDisplay = item.detailName2;
    }
    return dataDisplay;
  }
  onSearch(event) {
    if (event.key === 'Enter') {
      this.getManufacure();
    }
  }
  getListCreditAccount() {
    this.chartOfAccount
      .getAllClassification({ classification: [2, 3] })
      .subscribe((res: any) => {
        this.creditAccounts = res;
      });
  }

}
