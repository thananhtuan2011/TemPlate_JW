import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BillsComponent } from './components/accounting-module/category-module/bills/bills.component';
import { EndOfTermEndingComponent } from './components/accounting-module/category-module/end-of-term-ending/end-of-term-ending.component';
import { TypeOfDocumentComponent } from './components/accounting-module/category-module/type-of-document/type-of-document.component';
import { ToolsFixedAssetsComponent } from './components/accounting-module/tools-fixed-assets/tools-fixed-assets.component';
import { CustomerTypeComponent } from './components/customer-module/customer-type/customer-type.component';
import { CustomersComponent } from './components/customer-module/customers/customers.component';
import { IncomingTextFormComponent } from './components/document-module/incoming-text/component/incoming-text-form.component';
import { IncomingTextComponent } from './components/document-module/incoming-text/incoming-text.component';
import { TextGoFormComponent } from './components/document-module/text-go/component/text-go-form.component';
import { TextGoComponent } from './components/document-module/text-go/text-go.component';
import { BranchComponent } from './components/employee-module/branch/branch.component';
import { DepartmentFormComponent } from './components/employee-module/department/components/department-form/department-form.component';
import { DepartmentComponent } from './components/employee-module/department/department.component';
import { EmployeeTypeFormComponent } from './components/employee-module/employee-type/employee-type-form/employee-type-form.component';
import { EmployeeTypeComponent } from './components/employee-module/employee-type/employee-type.component';
import { JobTitleDetailsComponent } from './components/employee-module/job-title-details/job-title-details.component';
import { ShiftComponent } from './components/employee-module/shift/shift.component';
import { SpecializedComponent } from './components/employee-module/specialized/specialized.component';
import { StoreComponent } from './components/employee-module/store/store.component';
import { TimekeepingPositionComponent } from './components/employee-module/timekeeping-position/timekeeping-position.component';
import { TitleComponent } from './components/employee-module/title/title.component';
import { UserComponent } from './components/employee-module/user/user.component';
import { BeginDeclareComponent } from './components/main-module/begin-declare/begin-declare.component';
import { CompanyComponent } from './components/main-module/company/company.component';
import { DashboardComponent } from './components/main-module/dashboard/dashboard.component';
import { AccessComponent } from './components/others-module/access/access.component';
import { CrudComponent } from './components/others-module/crud/crud.component';
import { EmptyComponent } from './components/others-module/empty/empty.component';
import { ErrorComponent } from './components/others-module/error/error.component';
import { LandingComponent } from './components/others-module/landing/landing.component';
import { NotfoundComponent } from './components/others-module/notfound/notfound.component';
import { TimelineComponent } from './components/others-module/timeline/timeline.component';
import { RelationComponent } from './components/relationship-module/relation/relation.component';
import { RelativesComponent } from './components/relationship-module/relatives/relatives.component';
import { CashierComponent } from './components/sell-module/cashier/cashier.component';
import { ListOfGoodsComponent } from './components/sell-module/list-of-goods/list-of-goods.component';
import { PaymentHistoryComponent } from './components/sell-module/sell-report-module/payment-history/payment-history.component';
import { ProfitAfterTaxComponent } from './components/sell-module/sell-report-module/profit-after-tax/profit-after-tax.component';
import { ProfitBeforeTaxComponent } from './components/sell-module/sell-report-module/profit-before-tax/profit-before-tax.component';
import { SellDetailsBookComponent } from './components/sell-module/sell-report-module/sell-details-book/sell-details-book.component';
import { SellerComponent } from './components/sell-module/seller/seller.component';
import { AccountingLinkComponent } from './components/sell-module/setup-module/accounting-link/accounting-link.component';
import { ComboComponent } from './components/sell-module/setup-module/combo/combo.component';
import { DefectiveGoodsComponent } from './components/sell-module/setup-module/defective-goods/defective-goods.component';
import { InventoryControlComponent } from './components/sell-module/setup-module/inventory-control/inventory-control.component';
import { MenuOfGoodsComponent } from './components/sell-module/setup-module/menu-of-goods/menu-of-goods.component';
import { QuotaComponent } from './components/sell-module/setup-module/quota/quota.component';
import { RoomTableComponent } from './components/sell-module/setup-module/room-table/room-table.component';
import { WarehouseComponent } from './components/sell-module/warehouse/warehouse.component';
import { WebsiteOrdersComponent } from './components/sell-module/website-orders/website-orders.component';
import { TimekeepingHistoryComponent } from './components/timekeeping-module/timekeeping-history/timekeeping-history.component';
import { TimekeepingReportComponent } from './components/timekeeping-module/timekeeping-report/timekeeping-report.component';
import { TimekeepingComponent } from './components/timekeeping-module/timekeeping/timekeeping.component';
import { ForgotPasswordComponent } from './components/unauthenticate-module/forgot-password/forgot-password.component';
import { LoginComponent } from './components/unauthenticate-module/login/login.component';
import { BranchWebComponent } from './components/website-module/branch-web/branch-web.component';
import { IntroWebComponent } from './components/website-module/intro-web/intro-web.component';
import { NewsWebComponent } from './components/website-module/news-web/news-web.component';
import { ProductWebComponent } from './components/website-module/product-web/product-web.component';
import { RecruitWebComponent } from './components/website-module/recruit-web/recruit-web.component';
import { SliderWebComponent } from './components/website-module/slider-web/slider-web.component';
import { SocialNetworkWebComponent } from './components/website-module/social-network-web/social-network-web.component';
import { WorkflowTypeComponent } from './components/workflow-module/workflow-type/workflow-type.component';
import { WorkflowComponent } from './components/workflow-module/workflow/workflow.component';
import { AppMainComponent } from './layouts/app.main.component';
import { WorkflowFormComponent } from './components/workflow-module/workflow/workflow-form/workflow-form.component';
import { DocumentTypeComponent } from './components/document-module/document-type/document-type.component';
import { CustomerStatusComponent } from './components/customer-module/customer-status/customer-status.component';
import { CustomerJobComponent } from './components/customer-module/customer-job/customer-job.component';
import { DecideComponent } from './components/employee-module/decide/decide.component';
import { AchievementsComponent } from './components/employee-module/achievements/achievements.component';
import { InternalBalanceAccountComponent } from './components/accounting-module/internal-report-module/balance-account/internal-balance-account.component';
import { OverreachBalanceAccountComponent } from './components/accounting-module/overreach-report-module/balance-account/overreach-balance-account.component';
import { OverreachReceiptComponent } from './components/accounting-module/overreach-report-module/receipt/overreach-receipt.component';
import { InternalReceiptComponent } from './components/accounting-module/internal-report-module/receipt/internal-receipt.component';
import { OverreachReceiptListComponent } from './components/accounting-module/overreach-report-module/receipt-list/overreach-receipt-list.component';
import { OverreachLedgerComponent } from './components/accounting-module/overreach-report-module/ledger/overreach-ledger.component';
import { OverreachRegisterReceiptComponent } from './components/accounting-module/overreach-report-module/register-receipt/overreach-register-receipt.component';
import { OverreachRegisterReceiptDetailComponent } from './components/accounting-module/overreach-report-module/register-receipt-detail/overreach-register-receipt-detail.component';
import { OverreachBalanceAccountantComponent } from './components/accounting-module/overreach-report-module/balance-accountant/overreach-balance-accountant.component';
import { OverreachSavedCurrencyComponent } from './components/accounting-module/overreach-report-module/saved-currency/overreach-saved-currency.component';
import { InternalReceiptListComponent } from './components/accounting-module/internal-report-module/receipt-list/internal-receipt-list.component';
import { InternalLedgerComponent } from './components/accounting-module/internal-report-module/ledger/internal-ledger.component';
import { InternalRegisterReceiptComponent } from './components/accounting-module/internal-report-module/register-receipt/internal-register-receipt.component';
import { InternalRegisterReceiptDetailComponent } from './components/accounting-module/internal-report-module/register-receipt-detail/internal-register-receipt-detail.component';
import { InternalBalanceAccountantComponent } from './components/accounting-module/internal-report-module/balance-accountant/internal-balance-accountant.component';
import { InternalSavedCurrencyComponent } from './components/accounting-module/internal-report-module/saved-currency/internal-saved-currency.component';
import { InternalPlanMissionCountryTaxComponent } from './components/accounting-module/internal-report-module/plan-mission-country-tax/internal-plan-mission-country-tax.component';
import { OverreachPlanMissionCountryTaxComponent } from './components/accounting-module/overreach-report-module/plan-mission-country-tax/overreach-plan-mission-country-tax.component';
import { MenuWebComponent } from './components/website-module/menu-web/menu-web.component';
import { SalaryComponent } from './components/employee-module/salary/salary.component';
import { GeneralStatisticsComponent } from './components/employee-module/general-statistics/general-statistics.component';
import { SalarySocialComponent } from './components/employee-module/salary-social/salary-social.component';
import { RoleComponent } from './components/unauthenticate-module/role/role.component';
import { ComparePriceListComponent } from './components/sell-module/setup-module/compare-price-list/compare-price-list.component';
import { TaxVatComponent } from './components/accounting-module/overreach-report-module/tax-vat/tax-vat.component';
import { UserRoleComponent } from './components/unauthenticate-module/user-role/user-role.component';
import { InventoryComponent } from './components/sell-module/setup-module/inventory/inventory.component';
import { AuthGuard } from './interceptor/auth-guard.service';
import { PriceListComponent } from './components/sell-module/price-list/price-list.component';
import { InstanceBillComponent } from './components/accounting-module/category-module/instance-bill/instance-bill.component';
import { ValueAddTaxComponent } from './components/accounting-module/overreach-report-module/value-add-tax/value-add-tax.component';
import { IsoftHistoryComponent } from './components/website-module/isoft-history/isoft-history.component';
import { AllowanceComponent } from './components/accounting-module/category-module/allowance/allowance.component';
import { AllowanceUserComponent } from './components/accounting-module/allowance-user/allowance-user.component';
import { ToolsFixedAssetsUserComponent } from './components/employee-module/tools-fixed-assets-user/tools-fixed-assets-user.component';
import { TimekeepingScoreComponent } from './components/kpi-module/timekeeping-score/timekeeping-score.component';
import { RevenueScoreComponent } from './components/kpi-module/revenue-score/revenue-score.component';
import { SalaryAdvanceComponent } from './components/employee-module/salary-advance/salary-advance.component';
import { TargetKpiComponent } from './components/kpi-module/target-kpi/target-kpi.component';
import { ReportKpiComponent } from './components/kpi-module/report-kpi/report-kpi.component';
import { GoodsComponent } from './components/sell-module/goods/goods.component';
import { GoodWarehousesComponent } from './components/sell-module/good-warehouses/good-warehouses.component';
import { TargetKpiResolver } from './components/kpi-module/target-kpi/target-kpi.resolver';
import { SaveComponent } from './components/kpi-module/target-kpi/save/save.component';
import { SaveResolver } from './components/kpi-module/target-kpi/save/save.resolver';
import { FurloughComponent } from './components/employee-module/furlough/furlough.component';
import { ReportKpiResolver } from './components/kpi-module/report-kpi/report-kpi.resolver';
import { GoodWarehouseExportComponent } from './components/sell-module/good-warehouse-export/good-warehouse-export.component';
import { PxkComponent } from './components/sell-module/components/pxk/pxk.component';
import { ViewPdfFileOnTabComponent } from './components/sell-module/components/bill-table/view-pdf-file-on-tab/view-pdf-file-on-tab.component';
import { CustomerQuoteHistoryComponent } from './components/customer-module/customers/components/customer-quote-history/customer-quote-history.component';
import { GeneralDiaryReportComponent } from './components/accounting-module/general-diary-report/general-diary-report.component';
import { SaleByGoodCustomerReportComponent } from './components/sell-module/sell-report-module/sale-by-good-customer-report/sale-by-good-customer-report.component';
import { SaleByGoodReportComponent } from './components/sell-module/sell-report-module/sale-by-good-report/sale-by-good-report.component';
import { SaleByGoodEmployeeReportComponent } from './components/sell-module/sell-report-module/sale-by-good-employee-report/sale-by-good-employee-report.component';
import { BillHistoryCollectionsComponent } from './components/customer-module/bill-history-collections/bill-history-collections.component';
import { CustomerWarningComponent } from './components/customer-module/customer-warning/customer-warning.component';
import { DebtCollectionComponent } from './components/sell-module/debt-collection/debt-collection.component';
import { DebtCollectionResolver } from './components/sell-module/debt-collection/debt-collection.resolver';
import { PrinterParametersComponent } from './components/sell-module/printer-parameters/printer-parameters.component';
import { ConfigAriseComponent } from './components/accounting-module/config-arise/config-arise.component';
import { SendMailComponent } from './components/send-mail/send-mail.component';
import { SendMailResolver } from './components/send-mail/send-mail.resolver';
import { SaveSendMailComponent } from './components/send-mail/save-send-mail/save-send-mail.component';
import { SaveSendMailResolver } from './components/send-mail/save-send-mail/save-send-mail.resolver';
import { PrinterParametersResolver } from './components/sell-module/printer-parameters/printer-parameters.resolver';
import { SurchargesComponent } from './components/sell-module/setup-module/surcharges/surcharges.component';
import { PromotionComponent } from './components/website-module/promotion/inventory.component';
import { TillComponent } from './components/sell-module/till/till.component';
import { AccountV2Component } from './components/accounting-module/account-v2/account-v2.component';
import { AccountDetailFirstV2Component } from './components/accounting-module/account-v2/components/account-detail-first-v2/account-detail-first-v2.component';
import { AccountDetailSecondV2Component } from './components/accounting-module/account-v2/components/account-detail-second-v2/account-detail-second-v2.component';
import { AriseV2Component } from './components/accounting-module/arise-v2/arise-v2.component';
import { GoodWarehouseDiagramComponent } from './components/sell-module/good-warehouses/good-warehouse-diagram/good-warehouse-diagram.component';
import { GoodWarehouseShelvesComponent } from './components/sell-module/good-warehouse-shelves/good-warehouse-shelves.component';
import { GoodWarehouseFloorsComponent } from './components/sell-module/good-warehouse-floors/good-warehouse-floors.component';
import { WarehousePositionsComponent } from './components/sell-module/good-warehouse-positions/good-warehouse-positions.component';
import { TypeOfDocumentFormComponent } from './components/accounting-module/category-module/type-of-document/type-of-document-form/type-of-document-form.component';
import { AriseV3Component } from './components/accounting-module/arise-v3/arise-v3.component';
import { BillsFormComponent } from './components/accounting-module/category-module/bills/bills-form/bills-form.component';
import { SalarySocailFormComponent } from './components/employee-module/salary-social/compomemts/salary-socail-form/salary-socail-form.component';
import { ToolsFixedAssetsUserFormComponent } from './components/employee-module/tools-fixed-assets-user/tools-fixed-assets-user-form/tools-fixed-assets-user-form.component';
import { ContractDepartmentComponent } from './components/contract-department/contract-department.component';
import { SalaryLevelComponent } from './components/employee-module/salary-level/salary-level.component';
import { SalaryAdvanceRequestComponent } from './components/employee-module/salary-advance-request/salary-advance-request.component';
import { PeriodOverreachRegisterReceiptDetailComponent } from './components/accounting-module/overreach-report-module/period-register-receipt-detail/period-overreach-register-receipt-detail.component';
import { ImportStockComponent } from './components/sell-module/import-stock/import-stock.component';
import { InternalRegisterReceiptDetailNewReportComponent } from './components/accounting-module/internal-report-module/register-receipt-detail-new-report/internal-register-receipt-detail-new-report.component';
import { ImportGoodsComponent } from './components/sell-module/import-goods/import-goods.component';
import { ChartOfAccountFiltersComponent } from './components/sell-module/setup-module/chart-of-account-filters/chart-of-account-filters.component';
import { AriseV4Component } from './components/accounting-module/arise-v4/arise-v4.component';
import { ManufactureComponent } from './components/sell-module/setup-module/manufacture/manufacture.component';
@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                { path: '', component: LoginComponent },
                { path: 'forgot-password', component: ForgotPasswordComponent },
                {
                    path: 'view-file/:quoteId/:customerId',
                    component: ViewPdfFileOnTabComponent,
                },
                {
                    path: 'uikit',
                    canActivate: [AuthGuard],
                    component: AppMainComponent,
                    children: [
                        { path: '', component: DashboardComponent },
                        {
                            path: 'contract-department',
                            component: ContractDepartmentComponent,
                        },
                        // main module
                        {
                            path: 'company-info',
                            component: CompanyComponent,
                        },
                        {
                            path: 'role',
                            component: RoleComponent,
                        },
                        {
                            path: 'user-role',
                            component: UserRoleComponent,
                        },
                        {
                            path: 'odd-decimal',
                            component: BeginDeclareComponent,
                        },
                        // employee module
                        {
                            path: 'employee',
                            component: UserComponent,
                        },
                        {
                            path: 'decide',
                            component: DecideComponent,
                        },
                        {
                            path: 'salary',
                            component: SalaryComponent,
                        },
                        {
                            path: 'salary-advance',
                            component: SalaryAdvanceComponent,
                        },
                        {
                            path: 'salary-advance-request',
                            component: SalaryAdvanceRequestComponent,
                        },
                        {
                            path: 'furlough',
                            component: FurloughComponent,
                        },
                        {
                            path: 'achievements',
                            component: AchievementsComponent,
                        },
                        {
                            path: 'branch',
                            component: BranchComponent,
                        },
                        {
                            path: 'store',
                            component: StoreComponent,
                        },
                        {
                            path: 'employee-type',
                            component: EmployeeTypeComponent,
                        },
                        {
                            path: 'employee-type/:id',
                            component: EmployeeTypeFormComponent,
                        },
                        {
                            path: 'specialized',
                            component: SpecializedComponent,
                        },
                        {
                            path: 'department',
                            component: DepartmentComponent,
                        },
                        {
                            path: 'department/:id',
                            component: DepartmentFormComponent,
                        },
                        {
                            path: 'good-warehouse-shelves',
                            component: GoodWarehouseShelvesComponent,
                        },
                        {
                            path: 'good-warehouse-floors',
                            component: GoodWarehouseFloorsComponent,
                        },
                        {
                            path: 'good-warehouse-positions',
                            component: WarehousePositionsComponent,
                        },
                        {
                            path: 'title',
                            component: TitleComponent,
                        },
                        {
                            path: 'job-title-details',
                            component: JobTitleDetailsComponent,
                        },
                        {
                            path: 'timekeeping-position',
                            component: TimekeepingPositionComponent,
                        },
                        {
                            path: 'shift',
                            component: ShiftComponent,
                        },
                        {
                            path: 'generalStatistics',
                            component: GeneralStatisticsComponent,
                        },
                        {
                            path: 'salaryLevel',
                            component: SalaryLevelComponent,
                        },
                        {
                            path: 'salarySocial',
                            component: SalarySocialComponent,
                        },
                        {
                            path: 'salarySocial/:id',
                            component: SalarySocailFormComponent,
                        },
                        {
                            path: 'allowance-user',
                            component: AllowanceUserComponent,
                        },
                        {
                            path: 'fixed-assets-user',
                            component: ToolsFixedAssetsUserComponent,
                        },
                        {
                            path: 'fixed-assets-user/:id',
                            component: ToolsFixedAssetsUserFormComponent,
                        },
                        {
                            path: 'allowance',
                            component: AllowanceComponent,
                        },

                        // relationship module
                        {
                            path: 'relatives',
                            component: RelativesComponent,
                        },
                        {
                            path: 'relation',
                            component: RelationComponent,
                        },

                        // customer module
                        {
                            path: 'customers',
                            component: CustomersComponent,
                        },
                        {
                            path: 'suppliers',
                            component: CustomersComponent,
                        },
                        {
                            path: 'web-customers',
                            component: CustomersComponent,
                        },
                        {
                            path: 'customer-quote-history/:id',
                            component: CustomerQuoteHistoryComponent,
                        },
                        {
                            path: 'customer-type',
                            component: CustomerTypeComponent,
                        },
                        {
                            path: 'customer-status',
                            component: CustomerStatusComponent,
                        },
                        {
                            path: 'customer-job',
                            component: CustomerJobComponent,
                        },
                        {
                            path: 'status-job',
                            component: CustomerStatusComponent,
                        },
                        {
                            path: 'customer-warning',
                            component: CustomerWarningComponent,
                        },
                        {
                            path: 'send-mail',
                            component: SendMailComponent,
                            resolve: {
                                resolveData: SendMailResolver,
                            },
                        },
                        {
                            path: 'send-mail/create',
                            component: SaveSendMailComponent,
                            resolve: {
                                resolveData: SaveSendMailResolver,
                            },
                        },
                        {
                            path: 'send-mail/:id',
                            component: SaveSendMailComponent,
                            resolve: {
                                resolveData: SaveSendMailResolver,
                            },
                        },

                        // timekeeping module
                        {
                            path: 'timekeeping',
                            component: TimekeepingComponent,
                        },
                        {
                            path: 'timekeeping-history',
                            component: TimekeepingHistoryComponent,
                        },
                        {
                            path: 'timekeeping-report',
                            component: TimekeepingReportComponent,
                        },

                        // workflow module
                        {
                            path: 'workflow',
                            component: WorkflowComponent,
                        },
                        {
                            path: 'workflow/:id',
                            component: WorkflowFormComponent,
                        },
                        {
                            path: 'workflow-type',
                            component: WorkflowTypeComponent,
                        },
                        // sell module
                        {
                            path: 'cashier',
                            component: CashierComponent,
                        },
                        {
                            path: 'import-stock',
                            component: ImportGoodsComponent,
                        },
                        // {
                        //     path: 'import-stock',
                        //     component: ImportStockComponent,
                        // },
                        {
                            path: 'seller',
                            component: SellerComponent,
                        },
                        {
                            path: 'warehouse',
                            component: WarehouseComponent,
                        },
                        {
                            path: 'warehouse-diagram',
                            component: GoodWarehouseDiagramComponent,
                        },
                        {
                            path: 'warehouse-diagram/:type/:id',
                            component: GoodWarehouseDiagramComponent,
                        },
                        {
                            path: 'till',
                            component: TillComponent,
                        },
                        {
                            path: 'good-warehouses',
                            component: GoodWarehousesComponent,
                        },
                        {
                            path: 'website-orders',
                            component: WebsiteOrdersComponent,
                        },
                        {
                            path: 'printer-parameters',
                            component: PrinterParametersComponent,
                            resolve: {
                                data: PrinterParametersResolver,
                            },
                        },
                        {
                            path: 'chart-of-account-filters',
                            component: ChartOfAccountFiltersComponent,
                        },
                        {
                            path: 'list-of-goods',
                            component: ListOfGoodsComponent,
                        },
                        {
                            path: 'good-warehouse-export',
                            component: GoodWarehouseExportComponent,
                        },
                        {
                            path: 'price-list',
                            component: PriceListComponent,
                        },
                        {
                            path: 'goods',
                            component: GoodsComponent,
                        },

                        // setup module
                        {
                            path: 'setup',
                            children: [
                                {
                                    path: 'room-table',
                                    component: RoomTableComponent,
                                },
                                {
                                    path: 'room-status',
                                    component: CustomerStatusComponent,
                                },
                                {
                                    path: 'quota',
                                    component: QuotaComponent,
                                },
                                {
                                    path: 'manufacture',
                                    component: ManufactureComponent,
                                },
                                {
                                    path: 'combo',
                                    component: ComboComponent,
                                },
                                {
                                    path: 'menu-of-goods',
                                    component: MenuOfGoodsComponent,
                                },
                                {
                                    path: 'inventory-control',
                                    component: InventoryControlComponent,
                                },
                                {
                                    path: 'defective-goods',
                                    component: DefectiveGoodsComponent,
                                },
                                {
                                    path: 'accounting-link',
                                    component: AccountingLinkComponent,
                                },
                                {
                                    path: 'surcharge',
                                    component: SurchargesComponent,
                                },
                                {
                                    path: 'compare-price-list',
                                    component: ComparePriceListComponent,
                                },
                                {
                                    path: 'inventory',
                                    component: InventoryComponent,
                                },
                            ],
                        },

                        // sell report module
                        {
                            path: 'sell-report',
                            children: [
                                {
                                    path: 'payment-history',
                                    component: PaymentHistoryComponent,
                                },
                                {
                                    path: 'profit-before-tax',
                                    component: ProfitBeforeTaxComponent,
                                },
                                {
                                    path: 'profit-after-tax',
                                    component: ProfitAfterTaxComponent,
                                },
                                {
                                    path: 'sell-details-book',
                                    component: SellDetailsBookComponent,
                                },
                                {
                                    path: 'sale-by-good-customer-report',
                                    component:
                                        SaleByGoodCustomerReportComponent,
                                },
                                {
                                    path: 'sale-by-good-report',
                                    component: SaleByGoodReportComponent,
                                },
                                {
                                    path: 'sale-by-good-employee-report',
                                    component:
                                        SaleByGoodEmployeeReportComponent,
                                },
                            ],
                        },

                        // accounting module
                        {
                            path: 'arise-v2',
                            component: AriseV2Component,
                        },
                        {
                            path: 'arise-v3',
                            component: AriseV3Component,
                        },
                        {
                            path: 'arise-v4',
                            component: AriseV4Component,
                        },
                        {
                            path: 'account-v2',
                            component: AccountV2Component,
                        },
                        {
                            path: 'account-detail-first-v2',
                            component: AccountDetailFirstV2Component,
                        },
                        {
                            path: 'account-detail-second-v2',
                            component: AccountDetailSecondV2Component,
                        },
                        {
                            path: 'list-of-goods',
                            component: ListOfGoodsComponent,
                        },

                        {
                            path: 'debt-collection',
                            component: DebtCollectionComponent,
                            resolve: {
                                resolveData: DebtCollectionResolver,
                            },
                        },

                        // category module
                        {
                            path: 'category',
                            children: [
                                {
                                    path: 'type-of-document',
                                    component: TypeOfDocumentComponent,
                                },
                                {
                                    path: 'type-of-document/:id',
                                    component: TypeOfDocumentFormComponent,
                                },
                                {
                                    path: 'bills',
                                    component: BillsComponent,
                                },
                                {
                                    path: 'bills/:id',
                                    component: BillsFormComponent,
                                },
                                {
                                    path: 'end-of-term-ending',
                                    component: EndOfTermEndingComponent,
                                },
                                {
                                    path: 'config-arise',
                                    component: ConfigAriseComponent,
                                },
                            ],
                        },

                        // overreach Report module
                        {
                            path: 'overreach',
                            children: [
                                {
                                    path: 'balance-account',
                                    component: OverreachBalanceAccountComponent,
                                },
                                {
                                    path: 'receipt',
                                    component: OverreachReceiptComponent,
                                },
                                {
                                    path: 'receipt-list',
                                    component: OverreachReceiptListComponent,
                                },
                                {
                                    path: 'ledger',
                                    component: OverreachLedgerComponent,
                                },
                                {
                                    path: 'register-receipt',
                                    component:
                                        OverreachRegisterReceiptComponent,
                                },
                                {
                                    path: 'register-receipt-detail',
                                    component:
                                        OverreachRegisterReceiptDetailComponent,
                                },
                                {
                                    path: 'period-register-receipt-detail',
                                    component:
                                        PeriodOverreachRegisterReceiptDetailComponent,
                                },
                                {
                                    path: 'register-receipt-detail-new-report',
                                    component:
                                        InternalRegisterReceiptDetailNewReportComponent,
                                },
                                {
                                    path: 'general-diary-report',
                                    component: GeneralDiaryReportComponent,
                                },
                                {
                                    path: 'balance-accountant',
                                    component:
                                        OverreachBalanceAccountantComponent,
                                },
                                {
                                    path: 'saved-currency',
                                    component: OverreachSavedCurrencyComponent,
                                },
                                {
                                    path: 'plan-mission-country-tax',
                                    component:
                                        OverreachPlanMissionCountryTaxComponent,
                                },
                                {
                                    path: 'vat-tax',
                                    component: TaxVatComponent,
                                },
                                {
                                    path: 'value-add-tax',
                                    component: ValueAddTaxComponent,
                                },
                                {
                                    path: 'instance-bill',
                                    component: InstanceBillComponent,
                                },
                            ],
                        },

                        // internal report module
                        {
                            path: 'internal',
                            children: [
                                {
                                    path: 'balance-account',
                                    component: InternalBalanceAccountComponent,
                                },
                                {
                                    path: 'receipt',
                                    component: InternalReceiptComponent,
                                },
                                {
                                    path: 'receipt-list',
                                    component: InternalReceiptListComponent,
                                },
                                {
                                    path: 'ledger',
                                    component: InternalLedgerComponent,
                                },
                                {
                                    path: 'register-receipt',
                                    component: InternalRegisterReceiptComponent,
                                },
                                {
                                    path: 'register-receipt-detail',
                                    component:
                                        InternalRegisterReceiptDetailComponent,
                                },
                                {
                                    path: 'balance-accountant',
                                    component:
                                        InternalBalanceAccountantComponent,
                                },
                                {
                                    path: 'saved-currency',
                                    component: InternalSavedCurrencyComponent,
                                },
                                {
                                    path: 'plan-mission-country-tax',
                                    component:
                                        InternalPlanMissionCountryTaxComponent,
                                },
                            ],
                        },
                        {
                            path: 'tools-fixed-assets-warehouse',
                            component: ToolsFixedAssetsComponent,
                        },
                        {
                            path: 'tools-fixed-assets-use',
                            component: ToolsFixedAssetsComponent,
                            data: { isPageUse: true },
                        },

                        // document module
                        {
                            path: 'incoming-text',
                            component: IncomingTextComponent,
                        },
                        {
                            path: 'incoming-text/:id',
                            component: IncomingTextFormComponent,
                        },
                        {
                            path: 'text-go',
                            component: TextGoComponent,
                        },
                        {
                            path: 'text-go/:id',
                            component: TextGoFormComponent,
                        },
                        {
                            path: 'document-type',
                            component: DocumentTypeComponent,
                        },

                        // website module
                        {
                            path: 'slider-web',
                            component: SliderWebComponent,
                        },
                        {
                            path: 'intro-web',
                            component: IntroWebComponent,
                        },
                        {
                            path: 'product-web',
                            component: ProductWebComponent,
                        },
                        {
                            path: 'branch-web',
                            component: BranchWebComponent,
                        },
                        {
                            path: 'recruit-web',
                            component: RecruitWebComponent,
                        },
                        {
                            path: 'news-web',
                            component: NewsWebComponent,
                        },
                        {
                            path: 'social-network-web',
                            component: SocialNetworkWebComponent,
                        },
                        {
                            path: 'menu-web',
                            component: MenuWebComponent,
                        },
                        {
                            path: 'isoft-history',
                            component: IsoftHistoryComponent,
                        },
                        {
                            path: 'promotion',
                            component: PromotionComponent,
                        },
                        //kpi module
                        {
                            path: 'kpi',
                            children: [
                                {
                                    path: 'timekeeping-score',
                                    component: TimekeepingScoreComponent,
                                },
                                {
                                    path: 'revenue-score',
                                    component: RevenueScoreComponent,
                                },
                                {
                                    path: 'target',
                                    component: TargetKpiComponent,
                                    resolve: {
                                        resolveData: TargetKpiResolver,
                                    },
                                },
                                {
                                    path: 'target/create',
                                    component: SaveComponent,
                                    resolve: {
                                        resolveData: SaveResolver,
                                    },
                                },
                                {
                                    path: 'target/:id',
                                    component: SaveComponent,
                                    resolve: {
                                        resolveData: SaveResolver,
                                    },
                                },
                                {
                                    path: 'reports',
                                    component: ReportKpiComponent,
                                    resolve: {
                                        resolveData: ReportKpiResolver,
                                    },
                                },
                            ],
                        },

                        // others module
                        { path: 'pages/crud', component: CrudComponent },
                        {
                            path: 'pages/timeline',
                            component: TimelineComponent,
                        },
                        { path: 'pages/empty', component: EmptyComponent },
                    ],
                },
                { path: 'pages/landing', component: LandingComponent },
                { path: 'pages/error', component: ErrorComponent },
                { path: 'pages/notfound', component: NotfoundComponent },
                { path: 'pages/access', component: AccessComponent },
                { path: '**', redirectTo: 'pages/notfound' },
            ],
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            },
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
