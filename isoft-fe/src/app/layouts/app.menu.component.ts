import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { LayoutService } from '../service/system-setting/app.layout.service';
import { AppMainComponent } from './app.main.component';
import { MenuService } from '../service/system-setting/app.menu.service';
import AppConstant from '../utilities/app-constants';
import { UserRole, UserRoleCRUD } from '../models/user-role.model';
import AppUtil from '../utilities/app-util';
import { UserService } from '../service/user.service';
import { ConfirmationService } from 'primeng/api';
import { Router } from "@angular/router";

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    styles: [
        `
            :host ::ng-deep {
                #year .p-calendar {
                    max-width: 100px;
                }

                #year .p-calendar .p-inputtext {
                    text-align: center;
                    min-width: 50px;
                }

                #year .p-calendar .p-datepicker {
                    min-width: 200px;
                    z-index: 100000 !important;
                }

                .p-slidemenu,
                .p-slidemenu .p-menuitem-active > .p-submenu > .p-submenu-list,
                .p-slidemenu .p-slidemenu-rootlist,
                .p-slidemenu .p-slidemenu-wrapper {
                    width: 100% !important;
                    margin: 0 !important;
                }

                .p-slidemenu .p-slidemenu-content,
                .p-slidemenu .p-slidemenu-wrapper,
                .p-slidemenu {
                    height: calc(100vh - 15rem) !important;
                }
            }
        `,
    ],
    providers: [AppMainComponent],
})
export class AppMenuComponent implements OnInit {
    appUtil = AppUtil;
    appConstant = AppConstant;
    model: any[] = [];
    selectedYear: number;
    userRoles: UserRole[] = [];
    menus: UserRoleCRUD[] = [];
    currentYearSales: number[] = [];
    menuNames: any[] = [];

    constructor(
        public appMain: AppMainComponent,
        private authService: AuthService,
        private userService: UserService,
        public layoutService: LayoutService,
        public menuService: MenuService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.selectedYear = this.authService.yearFilter;
        this.checkShowMessageDiffCurrentYear();
        this.getCurrentMenus();
        this.getCurrentYearSale();
    }

    doLogout(): void {
        this.authService.clearSession();
        this.router.navigate(['']);
    }

    checkShowMessageDiffCurrentYear() {
        if (this.authService.checkShowMessageDiffCurrentYear) {
            this.authService.deleteShowMessageDiffCurrentYear();
            setTimeout(() => {
                this.confirmationService.confirm({
                    key: 'confirmMessageDiffCurrentYearTmp',
                    message: `Bạn đang chọn năm ${this.selectedYear
                        } để làm việc. Bạn có muốn về năm hiện tại ${new Date().getFullYear()} để làm việc không?`,
                    accept: () => {
                        this.selectedYear = new Date().getFullYear();
                        this.userService
                            .updateCurrentYear(this.selectedYear)
                            .subscribe((res) => {
                                this.authService.setYear(this.selectedYear);
                                this.menuService.selectedYear.next(
                                    this.selectedYear.toString(),
                                );
                            });
                    },
                    reject: () => { },
                });
            }, 1000);
        }
    }

    getCurrentMenus() {
        this.menus = this.appUtil.getMenus();
        this.menuNames = this.menus.map((x) => {
            return {
                menuCode: x.menuCode,
                name: x.name,
                nameEn: x.nameEn,
                nameKo: x.nameKo,
            };
        });
        let language = localStorage.getItem(AppConstant.STORAGE_KEYS.LANGUAGE);
        switch (language) {
            case 'vn':
                this.menuNames = this.menus.map((x) => {
                    return { menuCode: x.menuCode, name: x.name };
                });
                break;
            case 'en':
                this.menuNames = this.menus.map((x) => {
                    return { menuCode: x.menuCode, name: x.nameEn };
                });
                break;
            case 'ko':
                this.menuNames = this.menus.map((x) => {
                    return { menuCode: x.menuCode, name: x.nameKo };
                });
                break;
        }
        // TRANGCHU
        // console.log('menus ', this.menus.filter(x => x.view === true));
        if (
            this.menus.find(
                (x) =>
                    x.menuCode === this.appConstant.MENU_TYPE.TRANGCHU &&
                    x.view === true,
            )
        ) {
            this.model.push({
                // home
                label: 'left_menu.home',
                items: [
                    {
                        label: 'left_menu.dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/uikit'],
                    },
                ],
            });
        }
        this.model.push({
            // category
            label: 'left_menu.categories',
            items: this.getMenuByRole(),
        });
    }

    private getCurrentYearSale() {
        this.userService.getCurrentYearSale().subscribe((res: any) => {
            this.currentYearSales = res.data;
            if (this.selectedYear == 0 && this.currentYearSales.length) {
                this.selectedYear = this.currentYearSales[0];
            } else if (this.selectedYear == 0) {
                this.selectedYear = new Date().getFullYear();
            }
            this.authService.setYear(this.selectedYear);
            this.menuService.selectedYear.next(this.selectedYear.toString());
        });
    }

    // get menu by role name
    getMenuByRole() {
        let menus: any[] = [];
        menus = menus.concat([
            this.getRoleEmployee(),
            this.getRoleKPI(),
            this.getRoleRelationship(),
            this.getRoleCustomer(),
            this.getRoleTimekeeping(),
            this.getRoleWorkFlow(),
            this.getRoleSell(),
            this.getRoleAccounting(),
            this.getRoleDocument(),
            this.getRoleWebsite(),
            this.getRoleInitDeclare(),
        ]);
        return this.cleanArray(this.reRenderMenu(menus));
    }

    reRenderMenu(menus) {
        let currentMenus = this.authService.user.menus.filter(item => item.order).sort(function(a, b){return a.order - b.order});
        let temp;
        menus.map(menu => {
            temp = currentMenus.find(item => item.menuCode === menu.code);
            menu.order = temp ? temp.order : 0;
            if(menu.items && menu.items.length > 0) {
                menu.items.map(childMenu => {
                    temp = currentMenus.find(item => item.menuCode === childMenu.code);
                    childMenu.order = temp ? temp.order : 0;
                });
                menu.items = menu.items.sort((a, b) => a.order - b.order);
            }
        });
        return menus.sort((a, b) => a.order - b.order);
    }

    getItemMenuOrDefault(menu, menuType) {
        return this.menus.find(
            (x) => x.menuCode === menuType && x.view === true,
        )
            ? menu
            : {};
    }

    getMenuName(menuCode) {
        let menu = this.menuNames.find((x) => x.menuCode === menuCode);
        if (!menu) {
            // console.log('menu code not exists ', menuCode, 'menu name ', this.menuNames);
            return '';
        }
        return menu ? menu.name : '';
    }

    cleanArray(array) {
        return array.filter((x) => !this.appUtil.isEmpty(x) && x.label);
    }

    //#region getRoleEmployee
    getRoleEmployee() {
        //QUANLYNHANSU
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.QUANLYNHANSU,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.QUANLYNHANSU,
                ),
                icon: 'pi pi-fw pi-id-card',
                items: this.cleanArray([
                    //NHANSU
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NHANSU,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NHANSU,
                            ),
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['/uikit/employee'],
                        },
                        this.appConstant.MENU_TYPE.NHANSU,
                    ),
                    //QUYETDINH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.QUYETDINH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.QUYETDINH,
                            ),
                            icon: 'pi pi-fw pi-book',
                            routerLink: ['/uikit/decide'],
                        },
                        this.appConstant.MENU_TYPE.QUYETDINH,
                    ),
                    //THANHTICH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.THANHTICH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.THANHTICH,
                            ),
                            icon: 'pi pi-fw pi-sitemap',
                            routerLink: ['/uikit/achievements'],
                        },
                        this.appConstant.MENU_TYPE.THANHTICH,
                    ),
                    //VITRICHAMCONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.VITRICHAMCONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.VITRICHAMCONG,
                            ),
                            icon: 'pi pi-fw pi-stop-circle',
                            routerLink: ['/uikit/timekeeping-position'],
                        },
                        this.appConstant.MENU_TYPE.VITRICHAMCONG,
                    ),
                    //CALAMVIEC
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CALAMVIEC,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CALAMVIEC,
                            ),
                            icon: 'pi pi-fw pi-tag',
                            routerLink: ['/uikit/shift'],
                        },
                        this.appConstant.MENU_TYPE.CALAMVIEC,
                    ),
                    //BANGLUONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.BANGLUONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BANGLUONG,
                            ),
                            icon: 'pi pi-fw pi-dollar',
                            routerLink: ['/uikit/salary'],
                        },
                        this.appConstant.MENU_TYPE.BANGLUONG,
                    ),
                    //THONGKETONGQUAT
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.THONGKETONGQUAT,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.THONGKETONGQUAT,
                            ),
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/uikit/generalStatistics'],
                        },
                        this.appConstant.MENU_TYPE.THONGKETONGQUAT,
                    ),
                    //BACLUONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.BACLUONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BACLUONG,
                            ),
                            icon: 'pi pi-fw pi-chart-bar',
                            routerLink: ['/uikit/salaryLevel'],
                        },
                        this.appConstant.MENU_TYPE.BACLUONG,
                    ),
                    //LUONGBAOHIEM
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LUONGBAOHIEM,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.LUONGBAOHIEM,
                            ),
                            icon: 'pi pi-fw pi-book',
                            routerLink: ['/uikit/salarySocial'],
                        },
                        this.appConstant.MENU_TYPE.LUONGBAOHIEM,
                    ),
                    //TIENPHUCAP
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TIENPHUCAP,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TIENPHUCAP,
                            ),
                            icon: 'pi pi-fw pi-money-bill',
                            routerLink: ['/uikit/allowance-user'],
                        },
                        this.appConstant.MENU_TYPE.TIENPHUCAP,
                    ),
                    //CCDCTSCDUSER
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CCDCTSCDUSER,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CCDCTSCDUSER,
                            ),
                            icon: 'pi pi-fw pi-compass',
                            routerLink: ['/uikit/fixed-assets-user'],
                        },
                        this.appConstant.MENU_TYPE.CCDCTSCDUSER,
                    ),
                    //TAMUNGLUONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TAMUNGLUONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TAMUNGLUONG,
                            ),
                            icon: 'pi pi-fw pi-eye',
                            routerLink: ['/uikit/salary-advance'],
                        },
                        this.appConstant.MENU_TYPE.TAMUNGLUONG,
                    ),
                    //YEUCAUTAMUNGLUONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.YEUCAUTAMUNGLUONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.YEUCAUTAMUNGLUONG,
                            ),
                            icon: 'pi pi-fw pi-tags',
                            routerLink: ['/uikit/salary-advance-request'],
                        },
                        this.appConstant.MENU_TYPE.YEUCAUTAMUNGLUONG,
                    ),
                    //NGHIPHEP
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NGHIPHEP,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NGHIPHEP,
                            ),
                            icon: 'pi pi-fw pi-calendar',
                            routerLink: ['/uikit/furlough'],
                        },
                        this.appConstant.MENU_TYPE.NGHIPHEP,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.QUANLYNHANSU,
        );
    }

    //#endregion

    //#region getRoleRelationship
    getRoleRelationship() {
        //MOIQUANHE
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.MOIQUANHE,
                label: this.getMenuName(this.appConstant.MENU_TYPE.MOIQUANHE),
                icon: 'pi pi-fw pi-sitemap',
                items: this.cleanArray([
                    //NGUOITHAN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NGUOITHAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NGUOITHAN,
                            ),
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['/uikit/relatives'],
                        },
                        this.appConstant.MENU_TYPE.NGUOITHAN,
                    ),
                    //MOIQUANHECON
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.MOIQUANHECON,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.MOIQUANHECON,
                            ),
                            icon: 'pi pi-fw pi-sitemap',
                            routerLink: ['/uikit/relation'],
                        },
                        this.appConstant.MENU_TYPE.MOIQUANHECON,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.MOIQUANHE,
        );
    }

    //#endregion

    //#region getRoleCustomer
    getRoleCustomer() {
        //KHACHHANG
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.KHACHHANG,
                label: this.getMenuName(this.appConstant.MENU_TYPE.KHACHHANG),
                icon: 'pi pi-fw pi-users',
                items: this.cleanArray([
                    //DANHSACHKHACHHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DANHSACHKHACHHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DANHSACHKHACHHANG,
                            ),
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['/uikit/customers'],
                        },
                        this.appConstant.MENU_TYPE.DANHSACHKHACHHANG,
                    ),
                    //DANHSACHNHACUNGCAP
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DANHSACHNHACUNGCAP,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DANHSACHNHACUNGCAP,
                            ),
                            icon: 'pi pi-fw pi-building',
                            routerLink: ['/uikit/suppliers'],
                        },
                        this.appConstant.MENU_TYPE.DANHSACHNHACUNGCAP,
                    ),
                    //DANHSACHKHACHHANGWEB
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DANHSACHKHACHHANGWEB,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DANHSACHKHACHHANGWEB,
                            ),
                            icon: 'pi pi-fw pi-globe',
                            routerLink: ['/uikit/web-customers'],
                        },
                        this.appConstant.MENU_TYPE.DANHSACHKHACHHANGWEB,
                    ),
                    //PHANLOAIKHACHHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PHANLOAIKHACHHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.PHANLOAIKHACHHANG,
                            ),
                            icon: 'pi pi-fw pi-id-card',
                            routerLink: ['/uikit/customer-type'],
                        },
                        this.appConstant.MENU_TYPE.PHANLOAIKHACHHANG,
                    ),
                    //TRANGTHAIKHACHHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TRANGTHAIKHACHHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TRANGTHAIKHACHHANG,
                            ),
                            icon: 'pi pi-fw pi-comment',
                            routerLink: ['/uikit/customer-status'],
                        },
                        this.appConstant.MENU_TYPE.TRANGTHAIKHACHHANG,
                    ),
                    //CONGVIEC
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CONGVIEC,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CONGVIEC,
                            ),
                            icon: 'pi pi-fw pi-database',
                            routerLink: ['/uikit/customer-job'],
                        },
                        this.appConstant.MENU_TYPE.CONGVIEC,
                    ),
                    //CANHBAOMUAHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CANHBAOMUAHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CANHBAOMUAHANG,
                            ),
                            icon: 'pi pi-fw pi-bell',
                            routerLink: ['/uikit/customer-warning'],
                        },
                        this.appConstant.MENU_TYPE.CANHBAOMUAHANG,
                    ),
                    //LICHSUGUIMAILKHACHHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LICHSUGUIMAILKHACHHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE
                                    .LICHSUGUIMAILKHACHHANG,
                            ),
                            icon: 'pi pi-fw pi-history',
                            routerLink: ['/uikit/send-mail'],
                        },
                        this.appConstant.MENU_TYPE.LICHSUGUIMAILKHACHHANG,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.KHACHHANG,
        );
    }

    //#endregion

    //#region getRoleTimekeeping
    getRoleTimekeeping() {
        //CHAMCONG
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.CHAMCONG,
                label: this.getMenuName(this.appConstant.MENU_TYPE.CHAMCONG),
                icon: 'pi pi-fw pi-eye',
                items: this.cleanArray([
                    //CHAMCONGCON
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHAMCONGCON,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHAMCONGCON,
                            ),
                            icon: 'pi pi-fw pi-eye',
                            routerLink: ['/uikit/timekeeping'],
                        },
                        this.appConstant.MENU_TYPE.CHAMCONGCON,
                    ),
                    //LICHSUCHAMCONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LICHSUCHAMCONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.LICHSUCHAMCONG,
                            ),
                            icon: 'pi pi-fw pi-calendar-times',
                            routerLink: ['/uikit/timekeeping-history'],
                        },
                        this.appConstant.MENU_TYPE.LICHSUCHAMCONG,
                    ),
                    //BAOCAOCHAMCONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.BAOCAOCHAMCONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BAOCAOCHAMCONG,
                            ),
                            icon: 'pi pi-fw pi-chart-pie',
                            routerLink: ['/uikit/timekeeping-report'],
                        },
                        this.appConstant.MENU_TYPE.BAOCAOCHAMCONG,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.CHAMCONG,
        );
    }

    //#endregion

    //#region getRoleWorkFlow
    getRoleWorkFlow() {
        //QUANLYCONGVIEC
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.QUANLYCONGVIEC,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.QUANLYCONGVIEC,
                ),
                icon: 'pi pi-fw pi-th-large',
                items: this.cleanArray([
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DANHSACHCONGVIEC,
                            label: 'left_menu.workflow_list',
                            icon: 'pi pi-fw pi-server',
                            routerLink: ['/uikit/workflow'],
                        },
                        this.appConstant.MENU_TYPE.DANHSACHCONGVIEC,
                    ),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LOAICONGVIEC,
                            label: 'left_menu.workflow_type',
                            icon: 'pi pi-fw pi-share-alt',
                            routerLink: ['/uikit/workflow-type'],
                        },
                        this.appConstant.MENU_TYPE.LOAICONGVIEC,
                    ),
                    //TRANGTHAICONGVIEC
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TRANGTHAICONGVIEC,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TRANGTHAICONGVIEC,
                            ),
                            icon: 'pi pi-fw pi-compass',
                            routerLink: ['/uikit/status-job'],
                        },
                        this.appConstant.MENU_TYPE.TRANGTHAICONGVIEC,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.QUANLYCONGVIEC,
        );
    }

    //#endregion

    //#region getRoleSell
    getRoleSell() {
        //BANHANG
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.BANHANG,
                label: this.getMenuName(this.appConstant.MENU_TYPE.BANHANG),
                icon: 'pi pi-fw pi-wallet',
                items: this.cleanArray([
                    //THUNGANBANHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.THUNGANBANHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.THUNGANBANHANG,
                            ),
                            icon: 'pi pi-fw pi-plus-circle',
                            routerLink: ['/uikit/cashier'],
                        },
                        this.appConstant.MENU_TYPE.THUNGANBANHANG,
                    ),
                    //NHAPHANGHOA
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NHAPHANGHOA,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NHAPHANGHOA,
                            ),
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/uikit/import-stock'],
                        },
                        this.appConstant.MENU_TYPE.NHAPHANGHOA,
                    ),
                    //NHANVIENBANHANG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NHANVIENBANHANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NHANVIENBANHANG,
                            ),
                            icon: 'pi pi-fw pi-github',
                            routerLink: ['/uikit/seller'],
                        },
                        this.appConstant.MENU_TYPE.NHANVIENBANHANG,
                    ),
                    //KET
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.KET,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.KET,
                            ),
                            icon: 'pi pi-fw pi-briefcase',
                            routerLink: ['/uikit/till'],
                        },
                        this.appConstant.MENU_TYPE.KET,
                    ),
                    //QUANLYKHO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.QUANLYKHO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.QUANLYKHO,
                            ),
                            icon: 'pi pi-fw pi-inbox',
                            routerLink: ['/uikit/warehouse'],
                        },
                        this.appConstant.MENU_TYPE.QUANLYKHO,
                    ),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.SODOQUANLYKHO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.SODOQUANLYKHO,
                            ),
                            icon: 'pi pi-fw pi-sitemap',
                            routerLink: ['/uikit/warehouse-diagram'],
                        },
                        this.appConstant.MENU_TYPE.SODOQUANLYKHO,
                    ),
                    //DANHSACHHANGHOA
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DANHSACHHANGHOA,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DANHSACHHANGHOA,
                            ),
                            icon: 'pi pi-fw pi-box',
                            routerLink: ['/uikit/goods'],
                        },
                        this.appConstant.MENU_TYPE.DANHSACHHANGHOA,
                    ),
                    //THUTIENCONGNO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.THUTIENCONGNO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.THUTIENCONGNO,
                            ),
                            icon: 'pi pi-fw pi-dollar',
                            routerLink: ['/uikit/debt-collection'],
                        },
                        this.appConstant.MENU_TYPE.THUTIENCONGNO,
                    ),
                    //DONHANGWEBSITE
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DONHANGWEBSITE,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DONHANGWEBSITE,
                            ),
                            icon: 'pi pi-fw pi-phone',
                            routerLink: ['/uikit/website-orders'],
                        },
                        this.appConstant.MENU_TYPE.DONHANGWEBSITE,
                    ),
                    this.getRoleGoodManagement(),
                    //BAOCAO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.BAOCAO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BAOCAO,
                            ),
                            icon: 'pi pi-fw pi-filter-fill',
                            items: this.cleanArray([
                                //LICHSUTHANHTOAN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LICHSUTHANHTOAN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LICHSUTHANHTOAN,
                                        ),
                                        icon: 'pi pi-fw pi-filter-fill',
                                        routerLink: [
                                            '/uikit/sell-report/payment-history',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.LICHSUTHANHTOAN,
                                ),
                                //LOINHUANTRUOCTHUE
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LOINHUANTRUOCTHUE,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LOINHUANTRUOCTHUE,
                                        ),
                                        icon: 'pi pi-fw pi-filter',
                                        routerLink: [
                                            '/uikit/sell-report/profit-before-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .LOINHUANTRUOCTHUE,
                                ),
                                //LOINHUANSAUTHUE
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LOINHUANSAUTHUE,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LOINHUANSAUTHUE,
                                        ),
                                        icon: 'pi pi-fw pi-filter-slash',
                                        routerLink: [
                                            '/uikit/sell-report/profit-after-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.LOINHUANSAUTHUE,
                                ),
                                //SOCHITIET
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCHITIET,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .SOCHITIET,
                                        ),
                                        icon: 'pi pi-fw pi-hashtag',
                                        routerLink: [
                                            '/uikit/sell-report/sell-details-book',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.SOCHITIET,
                                ),
                                //BANHANGTHEOMATHANGVAKHACHHANG
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANHANGTHEOMATHANGVAKHACHHANG,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANHANGTHEOMATHANGVAKHACHHANG,
                                        ),
                                        icon: 'pi pi-fw pi-book',
                                        routerLink: [
                                            '/uikit/sell-report/sale-by-good-customer-report',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANHANGTHEOMATHANGVAKHACHHANG,
                                ),
                                //BANHANGTHEOMATHANG
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANHANGTHEOMATHANG,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANHANGTHEOMATHANG,
                                        ),
                                        icon: 'pi pi-fw pi-save',
                                        routerLink: [
                                            '/uikit/sell-report/sale-by-good-report',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANHANGTHEOMATHANG,
                                ),
                                //BANHANGTHEOMATHANGVANHANVIEN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANHANGTHEOMATHANGVANHANVIEN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANHANGTHEOMATHANGVANHANVIEN,
                                        ),
                                        icon: 'pi pi-fw pi-box',
                                        routerLink: [
                                            '/uikit/sell-report/sale-by-good-employee-report',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANHANGTHEOMATHANGVANHANVIEN,
                                ),
                            ]),
                        },
                        this.appConstant.MENU_TYPE.BAOCAO,
                    ),
                    //CAIDAT
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CAIDAT,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CAIDAT,
                            ),
                            icon: 'pi pi-fw pi-cog',
                            items: this.cleanArray([
                                //LAUBANPHONG
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LAUBANPHONG,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LAUBANPHONG,
                                        ),
                                        icon: 'pi pi-fw pi-desktop',
                                        routerLink: ['/uikit/setup/room-table'],
                                    },
                                    this.appConstant.MENU_TYPE.LAUBANPHONG,
                                ),
                                //TRANGTHAIPHONGBAN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.TRANGTHAIPHONGBAN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .TRANGTHAIPHONGBAN,
                                        ),
                                        icon: 'pi pi-fw pi-building',
                                        routerLink: ['/uikit/setup/room-status'],
                                    },
                                    this.appConstant.MENU_TYPE.TRANGTHAIPHONGBAN,
                                ),
                                //DINHMUC
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.DINHMUC,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.DINHMUC,
                                        ),
                                        icon: 'pi pi-fw pi-compass',
                                        routerLink: ['/uikit/setup/quota'],
                                    },
                                    this.appConstant.MENU_TYPE.DINHMUC,
                                ),
                                //SANXUAT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SANXUAT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.SANXUAT,
                                        ),
                                        icon: 'pi pi-fw pi-book',
                                        routerLink: ['/uikit/setup/manufacture'],
                                    },
                                    this.appConstant.MENU_TYPE.SANXUAT,
                                ),
                                //COMBO
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.COMBO,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.COMBO,
                                        ),
                                        icon: 'pi pi-fw pi-shopping-cart',
                                        routerLink: ['/uikit/setup/combo'],
                                    },
                                    this.appConstant.MENU_TYPE.COMBO,
                                ),
                                //DANHMUCHANGHOA
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.DANHMUCHANGHOA,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .DANHMUCHANGHOA,
                                        ),
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: [
                                            '/uikit/setup/menu-of-goods',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.DANHMUCHANGHOA,
                                ),
                                //LIENKETKETOAN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LIENKETKETOAN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LIENKETKETOAN,
                                        ),
                                        icon: 'pi pi-fw pi-share-alt',
                                        routerLink: [
                                            '/uikit/setup/accounting-link',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.LIENKETKETOAN,
                                ),
                                //PHUTHU
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.PHUTHU,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.PHUTHU,
                                        ),
                                        icon: 'pi pi-fw pi-minus-circle',
                                        routerLink: ['/uikit/setup/surcharge'],
                                    },
                                    this.appConstant.MENU_TYPE.PHUTHU,
                                ),
                                //THONGSOMAYIN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.THONGSOMAYIN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .THONGSOMAYIN,
                                        ),
                                        icon: 'pi pi-fw pi-print',
                                        routerLink: [
                                            '/uikit/printer-parameters',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.THONGSOMAYIN,
                                ),
                                //THONGSONHAPHANG
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.THONGSONHAPHANG,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .THONGSONHAPHANG,
                                        ),
                                        icon: 'pi pi-fw pi-cog',
                                        routerLink: [
                                            '/uikit/chart-of-account-filters',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.THONGSONHAPHANG,
                                ),
                            ]),
                        },
                        this.appConstant.MENU_TYPE.CAIDAT,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.BANHANG,
        );
    }

    //#endregion

    //#region getRoleAccounting
    getRoleAccounting() {
        //KETOAN
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.KETOAN,
                label: this.getMenuName(this.appConstant.MENU_TYPE.KETOAN),
                icon: 'pi pi-fw pi-sort-amount-up',
                items: this.cleanArray([
                    //PHATSINH
                    // this.getItemMenuOrDefault({
                    //   label: this.getMenuName(this.appConstant.MENU_TYPE.PHATSINH),
                    //   icon: 'pi pi-fw pi-upload',
                    //   routerLink: ['/uikit/arise'],
                    // }, this.appConstant.MENU_TYPE.PHATSINH),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PHATSINH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.PHATSINH,
                            ),
                            icon: 'pi pi-fw pi-flag',
                            routerLink: ['/uikit/arise-v2'],
                        },
                        this.appConstant.MENU_TYPE.PHATSINH,
                    ),
                    // this.getItemMenuOrDefault(
                    //     {
                    //         label:
                    //             this.getMenuName(
                    //                 this.appConstant.MENU_TYPE.PHATSINH,
                    //             ) + ' v3',
                    //         icon: 'pi pi-fw pi-upload',
                    //         routerLink: ['/uikit/arise-v3'],
                    //     },
                    //     this.appConstant.MENU_TYPE.PHATSINH,
                    // ),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PHATSINHV4,
                            label:
                                this.getMenuName(
                                    this.appConstant.MENU_TYPE.PHATSINHV4,
                                ) + ' v4',
                            icon: 'pi pi-fw pi-flag-fill',
                            routerLink: ['/uikit/arise-v4'],
                        },
                        this.appConstant.MENU_TYPE.PHATSINHV4,
                    ),
                    //TAIKHOAN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TAIKHOAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TAIKHOAN,
                            ),
                            icon: 'pi pi-fw pi-sort-alpha-down',
                            routerLink: ['/uikit/account-v2'],
                        },
                        this.appConstant.MENU_TYPE.TAIKHOAN,
                    ),
                    //DANHMUC
                    this.getItemMenuOrDefault(
                        {
                            // category
                            code: this.appConstant.MENU_TYPE.DANHMUC,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DANHMUC,
                            ),
                            icon: 'pi pi-fw pi-sort-amount-down',
                            items: this.cleanArray([
                                //LOAICHUNGTU
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LOAICHUNGTU,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LOAICHUNGTU,
                                        ),
                                        icon: 'pi pi-fw pi-send',
                                        routerLink: [
                                            '/uikit/category/type-of-document',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.LOAICHUNGTU,
                                ),
                                //LOAIHOADON
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.LOAIHOADON,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .LOAIHOADON,
                                        ),
                                        icon: 'pi pi-fw pi-clone',
                                        routerLink: ['/uikit/category/bills'],
                                    },
                                    this.appConstant.MENU_TYPE.LOAIHOADON,
                                ),
                                //KETCHUYENCUOIKY
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.KETCHUYENCUOIKY,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .KETCHUYENCUOIKY,
                                        ),
                                        icon: 'pi pi-fw pi-cloud-upload',
                                        routerLink: [
                                            '/uikit/category/end-of-term-ending',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.KETCHUYENCUOIKY,
                                ),

                                //CAUHINH_PHATSINH
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.CAUHINH_PHATSINH,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .CAUHINH_PHATSINH,
                                        ),
                                        icon: 'pi pi-fw pi-cog',
                                        routerLink: [
                                            '/uikit/category/config-arise',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.CAUHINH_PHATSINH,
                                ),
                            ]),
                        },
                        this.appConstant.MENU_TYPE.DANHMUC,
                    ),
                    //BAOCAOHACHTOAN
                    this.getItemMenuOrDefault(
                        {
                            // overreach report
                            code: this.appConstant.MENU_TYPE.BAOCAOHACHTOAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BAOCAOHACHTOAN,
                            ),
                            icon: 'pi pi-fw pi-database',
                            items: this.cleanArray([
                                //BANGCANDOITKHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGCANDOITKHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGCANDOITKHT,
                                        ),
                                        icon: 'pi pi-fw pi-comment',
                                        routerLink: [
                                            '/uikit/overreach/balance-account',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.BANGCANDOITKHT,
                                ),
                                //CHUNGTUHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.CHUNGTUHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .CHUNGTUHT,
                                        ),
                                        icon: 'pi pi-fw pi-compass',
                                        routerLink: [
                                            '/uikit/overreach/receipt',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.CHUNGTUHT,
                                ),
                                //BANGKECHUNGTUHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGKECHUNGTUHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGKECHUNGTUHT,
                                        ),
                                        icon: 'pi pi-fw pi-flag',
                                        routerLink: [
                                            '/uikit/overreach/receipt-list',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.BANGKECHUNGTUHT,
                                ),
                                //SOCAIHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCAIHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.SOCAIHT,
                                        ),
                                        icon: 'pi pi-fw pi-external-link',
                                        routerLink: ['/uikit/overreach/ledger'],
                                    },
                                    this.appConstant.MENU_TYPE.SOCAIHT,
                                ),
                                //DANGKYCHUNGTUHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.DANGKYCHUNGTUHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .DANGKYCHUNGTUHT,
                                        ),
                                        icon: 'pi pi-fw pi-info-circle',
                                        routerLink: [
                                            '/uikit/overreach/register-receipt',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.DANGKYCHUNGTUHT,
                                ),
                                //SOCHITIETHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCHITIETHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .SOCHITIETHT,
                                        ),
                                        icon: 'pi pi-fw pi-book',
                                        routerLink: [
                                            '/uikit/overreach/register-receipt-detail',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.SOCHITIETHT,
                                ),
                                //SOCHITIETNEW
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCHITIETHTNEW,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .SOCHITIETHTNEW,
                                        ),
                                        icon: 'pi pi-fw pi-file',
                                        routerLink: [
                                            '/uikit/overreach/register-receipt-detail-new-report',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.SOCHITIETHTNEW,
                                ),
                                //SOCHITIETGIAIDOAN
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCHITIETGIAIDOAN,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .SOCHITIETGIAIDOAN,
                                        ),
                                        icon: 'pi pi-fw pi-file-pdf',
                                        routerLink: [
                                            '/uikit/overreach/period-register-receipt-detail',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .SOCHITIETGIAIDOAN,
                                ),
                                //BAOCAONHATKYCHUNG
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BAOCAONHATKYCHUNG,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BAOCAONHATKYCHUNG,
                                        ),
                                        icon: 'pi pi-fw pi-history',
                                        routerLink: [
                                            '/uikit/overreach/general-diary-report',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.SOCHITIETHT,
                                ),
                                //BANGCANDOIKETOANHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGCANDOIKETOANHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGCANDOIKETOANHT,
                                        ),
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: [
                                            '/uikit/overreach/balance-accountant',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANGCANDOIKETOANHT,
                                ),
                                //BANGLUUCHUYENTIENTEHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGLUUCHUYENTIENTEHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGLUUCHUYENTIENTEHT,
                                        ),
                                        icon: 'pi pi-fw pi-mobile',
                                        routerLink: [
                                            '/uikit/overreach/saved-currency',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANGLUUCHUYENTIENTEHT,
                                ),
                                //NGHIAVUNHANUOCHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.NGHIAVUNHANUOCHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .NGHIAVUNHANUOCHT,
                                        ),
                                        icon: 'pi pi-fw pi-star',
                                        routerLink: [
                                            '/uikit/overreach/plan-mission-country-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.NGHIAVUNHANUOCHT,
                                ),
                                //THUEGTGTHT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.THUEGTGTHT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .THUEGTGTHT,
                                        ),
                                        icon: 'pi pi-fw pi-percentage',
                                        routerLink: [
                                            '/uikit/overreach/vat-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.THUEGTGTHT,
                                ),
                                //BAOCAOTHUEGTGT
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BAOCAOTHUEGTGT,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BAOCAOTHUEGTGT,
                                        ),
                                        icon: 'pi pi-fw pi-sort-numeric-up',
                                        routerLink: [
                                            '/uikit/overreach/value-add-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.BAOCAOTHUEGTGT,
                                ),
                                //KHAIBAOHOADON
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.KHAIBAOHOADON,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .KHAIBAOHOADON,
                                        ),
                                        icon: 'pi pi-fw pi-clone',
                                        routerLink: [
                                            '/uikit/overreach/instance-bill',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.KHAIBAOHOADON,
                                ),
                            ]),
                        },
                        this.appConstant.MENU_TYPE.BAOCAOHACHTOAN,
                    ),
                    //BAOCAONOIBO
                    this.getItemMenuOrDefault(
                        {
                            // internal report
                            code: this.appConstant.MENU_TYPE.BAOCAONOIBO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BAOCAONOIBO,
                            ),
                            icon: 'pi pi-fw pi-desktop',
                            items: this.cleanArray([
                                //BANGCANDOITKNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGCANDOITKNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGCANDOITKNB,
                                        ),
                                        icon: 'pi pi-fw pi-comment',
                                        routerLink: [
                                            '/uikit/internal/balance-account',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.BANGCANDOITKNB,
                                ),
                                //CHUNGTUNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.CHUNGTUNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .CHUNGTUNB,
                                        ),
                                        icon: 'pi pi-fw pi-compass',
                                        routerLink: ['/uikit/internal/receipt'],
                                    },
                                    this.appConstant.MENU_TYPE.CHUNGTUNB,
                                ),
                                //BANGKECHUNGTUNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGKECHUNGTUNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGKECHUNGTUNB,
                                        ),
                                        icon: 'pi pi-fw pi-flag',
                                        routerLink: [
                                            '/uikit/internal/receipt-list',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.BANGKECHUNGTUNB,
                                ),
                                //SOCAINB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCAINB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE.SOCAINB,
                                        ),
                                        icon: 'pi pi-fw pi-external-link',
                                        routerLink: ['/uikit/internal/ledger'],
                                    },
                                    this.appConstant.MENU_TYPE.SOCAINB,
                                ),
                                //DANGKYCHUNGTUNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.DANGKYCHUNGTUNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .DANGKYCHUNGTUNB,
                                        ),
                                        icon: 'pi pi-fw pi-info-circle',
                                        routerLink: [
                                            '/uikit/internal/register-receipt',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.DANGKYCHUNGTUNB,
                                ),
                                //SOCHITIETNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.SOCHITIETNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .SOCHITIETNB,
                                        ),
                                        icon: 'pi pi-fw pi-book',
                                        routerLink: [
                                            '/uikit/internal/register-receipt-detail',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.SOCHITIETNB,
                                ),
                                //BANGCANDOIKETOANNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGCANDOIKETOANNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGCANDOIKETOANNB,
                                        ),
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: [
                                            '/uikit/internal/balance-accountant',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANGCANDOIKETOANNB,
                                ),
                                //BANGLUUCHUYENTIENTENB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.BANGLUUCHUYENTIENTENB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .BANGLUUCHUYENTIENTENB,
                                        ),
                                        icon: 'pi pi-fw pi-mobile',
                                        routerLink: [
                                            '/uikit/internal/saved-currency',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE
                                        .BANGLUUCHUYENTIENTENB,
                                ),
                                //NGHIAVUNHANUOCNB
                                this.getItemMenuOrDefault(
                                    {
                                        code: this.appConstant.MENU_TYPE.NGHIAVUNHANUOCNB,
                                        label: this.getMenuName(
                                            this.appConstant.MENU_TYPE
                                                .NGHIAVUNHANUOCNB,
                                        ),
                                        icon: 'pi pi-fw pi-star',
                                        routerLink: [
                                            '/uikit/internal/plan-mission-country-tax',
                                        ],
                                    },
                                    this.appConstant.MENU_TYPE.NGHIAVUNHANUOCNB,
                                ),
                            ]),
                        },
                        this.appConstant.MENU_TYPE.BAOCAONOIBO,
                    ),
                    //QUANLYCCDCTSCDTRONGKHO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.QUANLYCCDCTSCDTRONGKHO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE
                                    .QUANLYCCDCTSCDTRONGKHO,
                            ),
                            icon: 'pi pi-fw pi-stop-circle',
                            routerLink: ['/uikit/tools-fixed-assets-warehouse'],
                        },
                        this.appConstant.MENU_TYPE.QUANLYCCDCTSCDTRONGKHO,
                    ),
                    //QUANLYCCDCTSCDSUDUNG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.QUANLYCCDCTSCDSUDUNG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.QUANLYCCDCTSCDSUDUNG,
                            ),
                            icon: 'pi pi-fw pi-video',
                            routerLink: ['/uikit/tools-fixed-assets-use'],
                        },
                        this.appConstant.MENU_TYPE.QUANLYCCDCTSCDSUDUNG,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.KETOAN,
        );
    }

    //#endregion

    //#region getRoleDocument
    getRoleDocument() {
        //CONGVANDENDI
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.CONGVANDENDI,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.CONGVANDENDI,
                ),
                icon: 'pi pi-fw pi-sign-out',
                items: this.cleanArray([
                    //CONGVANDEN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CONGVANDEN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CONGVANDEN,
                            ),
                            icon: 'pi pi-fw pi-arrow-right',
                            routerLink: ['/uikit/incoming-text'],
                        },
                        this.appConstant.MENU_TYPE.CONGVANDEN,
                    ),
                    //CONGVANDI
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CONGVANDI,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CONGVANDI,
                            ),
                            icon: 'pi pi-fw pi-arrow-left',
                            routerLink: ['/uikit/text-go'],
                        },
                        this.appConstant.MENU_TYPE.CONGVANDI,
                    ),
                    //LOAITAILIEU
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LOAITAILIEU,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.LOAITAILIEU,
                            ),
                            icon: 'pi pi-file',
                            routerLink: ['/uikit/document-type'],
                        },
                        this.appConstant.MENU_TYPE.LOAITAILIEU,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.CONGVANDENDI,
        );
    }

    //#endregion

    //#region getRoleWebsite
    getRoleWebsite() {
        //QUANLYWEBSITE
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.QUANLYWEBSITE,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.QUANLYWEBSITE,
                ),
                icon: 'pi pi-fw pi-globe',
                items: this.cleanArray([
                    //SLIDER
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.SLIDER,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.SLIDER,
                            ),
                            icon: 'pi pi-fw pi-camera',
                            routerLink: ['/uikit/slider-web'],
                        },
                        this.appConstant.MENU_TYPE.SLIDER,
                    ),
                    //GIOITHIEU
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.GIOITHIEU,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.GIOITHIEU,
                            ),
                            icon: 'pi pi-fw pi-github',
                            routerLink: ['/uikit/intro-web'],
                        },
                        this.appConstant.MENU_TYPE.GIOITHIEU,
                    ),
                    //SANPHAM
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.SANPHAM,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.SANPHAM,
                            ),
                            icon: 'pi pi-fw pi-palette',
                            routerLink: ['/uikit/product-web'],
                        },
                        this.appConstant.MENU_TYPE.SANPHAM,
                    ),
                    //CHINHANH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHINHANH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHINHANH,
                            ),
                            icon: 'pi pi-fw pi-qrcode',
                            routerLink: ['/uikit/branch-web'],
                        },
                        this.appConstant.MENU_TYPE.CHINHANH,
                    ),
                    //TUYENDUNG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TUYENDUNG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TUYENDUNG,
                            ),
                            icon: 'pi pi-fw pi-send',
                            routerLink: ['/uikit/recruit-web'],
                        },
                        this.appConstant.MENU_TYPE.TUYENDUNG,
                    ),
                    //TINTUC
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.TINTUC,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.TINTUC,
                            ),
                            icon: 'pi pi-fw pi-slack',
                            routerLink: ['/uikit/news-web'],
                        },
                        this.appConstant.MENU_TYPE.TINTUC,
                    ),
                    //CACMANGXAHOI
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CACMANGXAHOI,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CACMANGXAHOI,
                            ),
                            icon: 'pi pi-fw pi-star-fill',
                            routerLink: ['/uikit/social-network-web'],
                        },
                        this.appConstant.MENU_TYPE.CACMANGXAHOI,
                    ),
                    //MENUWEBSITE
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.MENUWEBSITE,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.MENUWEBSITE,
                            ),
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/uikit/menu-web'],
                        },
                        this.appConstant.MENU_TYPE.MENUWEBSITE,
                    ),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PROMOTION,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.PROMOTION,
                            ),
                            icon: 'pi pi-fw pi-percentage',
                            routerLink: ['/uikit/promotion'],
                        },
                        this.appConstant.MENU_TYPE.PROMOTION,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.QUANLYWEBSITE,
        );
    }

    //#endregion

    //#region getRoleInitDeclare
    getRoleInitDeclare() {
        //KHAIBAOBANDAU
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.KHAIBAOBANDAU,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.KHAIBAOBANDAU,
                ),
                icon: 'pi pi-fw pi-check-square',
                items: this.cleanArray([
                    //THONGTINCONGTY
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.THONGTINCONGTY,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.THONGTINCONGTY,
                            ),
                            icon: 'pi pi-fw pi-book',
                            routerLink: ['/uikit/company-info'],
                        },
                        this.appConstant.MENU_TYPE.THONGTINCONGTY,
                    ),
                    //SOLETHAPPHAN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.SOLETHAPPHAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.SOLETHAPPHAN,
                            ),
                            icon: 'pi pi-fw pi-circle-on',
                            routerLink: ['/uikit/odd-decimal'],
                        },
                        this.appConstant.MENU_TYPE.SOLETHAPPHAN,
                    ),
                    //CHINHANH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHINHANH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHINHANH,
                            ),
                            icon: 'pi pi-fw pi-sitemap',
                            routerLink: ['/uikit/branch'],
                        },
                        this.appConstant.MENU_TYPE.CHINHANH,
                    ),
                    //KHO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.KHO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.KHO,
                            ),
                            icon: 'pi pi-fw pi-sun',
                            routerLink: ['/uikit/store'],
                        },
                        this.appConstant.MENU_TYPE.KHO,
                    ),
                    //LOAIHDNHANSU
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LOAIHDNHANSU,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.LOAIHDNHANSU,
                            ),
                            icon: 'pi pi-fw pi-reddit',
                            routerLink: ['/uikit/employee-type'],
                        },
                        this.appConstant.MENU_TYPE.LOAIHDNHANSU,
                    ),
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.HOP_DONG_BO_PHAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.HOP_DONG_BO_PHAN,
                            ),
                            icon: 'pi pi-fw pi-file',
                            routerLink: ['/uikit/contract-department'],
                        },
                        this.appConstant.MENU_TYPE.HOP_DONG_BO_PHAN,
                    ),
                    //LOAIPHUCAP
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.LOAIPHUCAP,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.LOAIPHUCAP,
                            ),
                            icon: 'pi pi-fw pi-euro',
                            routerLink: ['/uikit/allowance'],
                        },
                        this.appConstant.MENU_TYPE.LOAIPHUCAP,
                    ),
                    //CHUYENNGANHDAOTAO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHUYENNGANHDAOTAO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHUYENNGANHDAOTAO,
                            ),
                            icon: 'pi pi-fw pi-user-edit',
                            routerLink: ['/uikit/specialized'],
                        },
                        this.appConstant.MENU_TYPE.CHUYENNGANHDAOTAO,
                    ),
                    //PHONGBAN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PHONGBAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.PHONGBAN,
                            ),
                            icon: 'pi pi-fw pi-building',
                            routerLink: ['/uikit/department'],
                        },
                        this.appConstant.MENU_TYPE.PHONGBAN,
                    ),
                    //CHUCDANH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHUCDANH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHUCDANH,
                            ),
                            icon: 'pi pi-fw pi-sort',
                            routerLink: ['/uikit/title'],
                        },
                        this.appConstant.MENU_TYPE.CHUCDANH,
                    ),
                    //CHITIETCHUCDANH
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.CHITIETCHUCDANH,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.CHITIETCHUCDANH,
                            ),
                            icon: 'pi pi-fw pi-user-minus',
                            routerLink: ['/uikit/job-title-details'],
                        },
                        this.appConstant.MENU_TYPE.CHITIETCHUCDANH,
                    ),
                    // DMKE
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DMKE,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DMKE,
                            ),
                            icon: 'pi pi-server',
                            routerLink: ['/uikit/good-warehouse-shelves'],
                        },
                        this.appConstant.MENU_TYPE.DMKE,
                    ),
                    // DMKE
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DMTANG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DMTANG,
                            ),
                            icon: 'pi pi-fw pi-building',
                            routerLink: ['/uikit/good-warehouse-floors'],
                        },
                        this.appConstant.MENU_TYPE.DMTANG,
                    ),
                    // DMVITRI
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DMVITRI,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DMVITRI,
                            ),
                            icon: 'pi pi-fw pi-map-marker',
                            routerLink: ['/uikit/good-warehouse-positions'],
                        },
                        this.appConstant.MENU_TYPE.DMVITRI,
                    ),
                    //PHANQUYEN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.PHANQUYEN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.PHANQUYEN,
                            ),
                            icon: 'pi pi-fw pi-prime',
                            routerLink: ['/uikit/role'],
                        },
                        this.appConstant.MENU_TYPE.PHANQUYEN,
                    ),
                    //NHOMQUYEN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.NHOMQUYEN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.NHOMQUYEN,
                            ),
                            icon: 'pi pi-fw pi-ticket',
                            routerLink: ['/uikit/user-role'],
                        },
                        this.appConstant.MENU_TYPE.NHOMQUYEN,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.KHAIBAOBANDAU,
        );
    }

    //#endregion

    //#region getRoleGoodManagement
    getRoleGoodManagement() {
        //QUANLYHANGHOA
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.QUANLYHANGHOA,
                label: this.getMenuName(
                    this.appConstant.MENU_TYPE.QUANLYHANGHOA,
                ),
                icon: 'pi pi-fw pi-database',
                items: this.cleanArray([
                    //BANGGIA
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.BANGGIA,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.BANGGIA,
                            ),
                            icon: 'pi pi-fw pi-print',
                            routerLink: ['/uikit/price-list'],
                        },
                        this.appConstant.MENU_TYPE.BANGGIA,
                    ),
                    //INTEMHANGHOA
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.INTEMHANGHOA,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.INTEMHANGHOA,
                            ),
                            icon: 'pi pi-fw pi-money-bill',
                            routerLink: ['/uikit/good-warehouses'],
                        },
                        this.appConstant.MENU_TYPE.INTEMHANGHOA,
                    ),
                    //HANGHOADABAN
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.HANGHOADABAN,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.HANGHOADABAN,
                            ),
                            icon: 'pi pi-fw pi-check-square',
                            routerLink: ['/uikit/good-warehouse-export'],
                        },
                        this.appConstant.MENU_TYPE.HANGHOADABAN,
                    ),
                    //KIEMKHO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.KIEMKHO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.KIEMKHO,
                            ),
                            icon: 'pi pi-fw pi-send',
                            routerLink: ['/uikit/setup/inventory'],
                        },
                        this.appConstant.MENU_TYPE.KIEMKHO,
                    ),
                    //HANGHOALOI
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.HANGHOALOI,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.HANGHOALOI,
                            ),
                            icon: 'pi pi-fw pi-ticket',
                            routerLink: ['/uikit/setup/defective-goods'],
                        },
                        this.appConstant.MENU_TYPE.HANGHOALOI,
                    ),
                    //SOSANHCACBANGGIA
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.SOSANHCACBANGGIA,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.SOSANHCACBANGGIA,
                            ),
                            icon: 'pi pi-fw pi-share-alt',
                            routerLink: ['/uikit/setup/compare-price-list'],
                        },
                        this.appConstant.MENU_TYPE.SOSANHCACBANGGIA,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.BANHANG,
        );
    }

    //#endregion

    //#region getRoleWebsite
    getRoleKPI() {
        //QUANLYWEBSITE
        return this.getItemMenuOrDefault(
            {
                code: this.appConstant.MENU_TYPE.KPI,
                label: this.getMenuName(this.appConstant.MENU_TYPE.KPI),
                icon: 'pi pi-fw pi-sliders-v',
                items: this.cleanArray([
                    //DIEMCHAMCONG
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DIEMCHAMCONG,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DIEMCHAMCONG,
                            ),
                            icon: 'pi pi-fw pi-print',
                            routerLink: ['/uikit/kpi/timekeeping-score'],
                        },
                        this.appConstant.MENU_TYPE.DIEMCHAMCONG,
                    ),
                    //DIEMDOANHSO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.DIEMDOANHSO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.DIEMDOANHSO,
                            ),
                            icon: 'pi pi-fw pi-server',
                            routerLink: ['/uikit/kpi/revenue-score'],
                        },
                        this.appConstant.MENU_TYPE.DIEMDOANHSO,
                    ),
                    //KPIMUCTIEU
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.KPIMUCTIEU,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.KPIMUCTIEU,
                            ),
                            icon: 'pi pi-fw pi-check-circle',
                            routerLink: ['/uikit/kpi/target'],
                        },
                        this.appConstant.MENU_TYPE.KPIMUCTIEU,
                    ),
                    //KPIBAOCAO
                    this.getItemMenuOrDefault(
                        {
                            code: this.appConstant.MENU_TYPE.KPIBAOCAO,
                            label: this.getMenuName(
                                this.appConstant.MENU_TYPE.KPIBAOCAO,
                            ),
                            icon: 'pi pi-fw pi-pencil',
                            routerLink: ['/uikit/kpi/reports'],
                        },
                        this.appConstant.MENU_TYPE.KPIBAOCAO,
                    ),
                ]),
            },
            this.appConstant.MENU_TYPE.KPI,
        );
    }

    //#endregion

    onKeydown(event: KeyboardEvent) {
        const nodeElement = <HTMLDivElement>event.target;
        if (event.code === 'Enter' || event.code === 'Space') {
            nodeElement.click();
            event.preventDefault();
        }
    }

    onChangeYear(e) {
        this.confirmationService.confirm({
            key: 'confirmUpdateNienDoTmp',
            message: 'Bạn có chắc muốn thay đổi niên độ làm việc không?',
            accept: () => {
                this.userService
                    .updateCurrentYear(this.selectedYear)
                    .subscribe((res) => {
                        this.authService.setYear(e.value);
                        this.menuService.selectedYear.next(e.value);
                    });
            },
            reject: () => {
                this.selectedYear = this.authService.yearFilter;
            },
        });
    }
}
