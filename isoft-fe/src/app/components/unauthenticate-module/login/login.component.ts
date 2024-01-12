import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import AppUtil from 'src/app/utilities/app-util';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { AuthData } from 'src/app/models/auth.model';
import { ConfigService } from 'src/app/service/system-setting/app.config.service';
import { AppConfig } from 'src/app/configs/appconfig';
import { AppMenuComponent } from 'src/app/layouts/app.menu.component';
import { CompanyService } from 'src/app/service/company.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [
        `
            .background-all {
                width: 200vh;
                height: 200vh;
                background-color: white;
                display: block;
                z-index: -1;
                position: fixed;
            }
            :host ::ng-deep .p-inputtext {
                width: 100%;
                padding: 1rem;
                position: relative;
            }

            :host ::ng-deep .pi-eye,
            :host ::ng-deep .pi-eye-slash {
                transform: scale(1.6);
                cursor: pointer;
                color: var(--primary-color) !important;
                position: absolute;
                margin-left: -32px;
                margin-top: 16px;
            }

            :host ::ng-deep #language .p-dropdown {
                width: auto !important;
            }

            .container {
                background-color: white;
                height: 100vh !important;
            }

            @media screen and (max-width: 768px) {
                .pt-200px {
                    padding-top: 200px;
                }
            }
        `,
    ],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('appMenu') appMenu: AppMenuComponent;
    appUtil = AppUtil;

    password: string;

    config: AppConfig;

    subscription: Subscription;

    loginFrm: FormGroup = new FormGroup({});

    isSubmitting: boolean = false;

    languages: any[];

    selectedLanguage: any;

    serverURLImage = environment.serverURLImage;
    companyTaxs = [];
    disableLogin: boolean = false;

    constructor(
        public configService: ConfigService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private translateService: TranslateService,
        private companyService: CompanyService,
        private messageService: MessageService,
    ) {
        this.loginFrm = this.fb.group({
            username: [null, [Validators.required]],
            password: [null, [Validators.required]],
            companyTax: [null, [Validators.required]],
            remember: [true],
        });
    }

    ngOnInit(): void {
        this.getCompanyDataSeller();

        if (!this.authService.user || this.appUtil.isEmpty(this.authService.user)) {
            this.config = this.configService.getConfig();
            this.subscription = this.configService.configUpdate$.subscribe(
                (config) => {
                    this.config = config;
                },
            );
            this.languages = [
                {
                    code: 'vn',
                    name: 'Viet Nam',
                    path: 'assets/flag-country/vietnam.svg',
                },
                {
                    code: 'en',
                    name: 'United Kingdom',
                    path: 'assets/flag-country/united-kingdom.svg',
                },
                {
                    code: 'ko',
                    name: 'South Korea',
                    path: 'assets/flag-country/south-korea.svg',
                },
            ];
            let language = localStorage.getItem(AppConstant.STORAGE_KEYS.LANGUAGE);
            if (!language) {
                language = 'vn';
            }
            this.translateService.use(language);
            this.selectedLanguage = language;
        }

        this.getCurrentUser();
    }

    getCurrentUser(): void {
        console.log(this.authService.getCurrentUser)
        let remember = this.authService.getCurrentUser?.remember ?? false;
        if ((remember = true)) {

            this.loginFrm = this.fb.group({
                username: [this.authService.getCurrentUser?.username, [Validators.required]],
                password: [this.authService.getCurrentUser?.password, [Validators.required]],
                companyTax: [this.authService.getCurrentUser?.companyTax, [Validators.required]],
                remember: remember,
            });
        }
    }
    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getCompanyDataSeller() {
        this.companyService
            .getCompanyDataSeller()
            .subscribe((response: any) => {
                this.companyTaxs = response.data;
            this.setDbName();
            });
    }

    async doLogin() {
        this.loginFrm.markAllAsTouched();
        if (
            this.loginFrm.invalid ||
            !this.loginFrm.value.username.trim() ||
            !this.loginFrm.value.password.trim()
        ) {
            this.messageService.add({
                severity: 'error',
                detail: this.appUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            return;
        }

        // Verify db name before login
        let isDbNameValid = await this.verifyDbNameBeforeLogin()
        if(!isDbNameValid) {
            return;
        }
        

        this.isSubmitting = true;
        const params = this.loginFrm.value;
        this.authService
            .login(this.appUtil.toSnakeCaseKey(params))
            .subscribe((res: any): void => {
                if (res.status === 601 || res.status === 602) {
                    return;
                }
                if (res.data && res.data.id !== 0) {
                    this.authService.setCurrentUser(this.loginFrm.value);
                    this.authService.setToken(res.data.token);
                    const authUser: AuthData = res.data;
                    this.authService.setUser(authUser);
                    this.authService.setYear(res.data.yearCurrent);
                    this.authService.setShowMessageDiffCurrentYear(
                        res.data.yearCurrent,
                    );
                    this.authService.setConfigurationViewTypePay(
                        res.data.configurationViewTypePay,
                    );
                    this.authService.setConfigurationViewQuantityBoxNec(
                        res.data.configurationViewQuantityBoxNec,
                    );
                    this.authService.setConfigurationViewPrint(
                        res.data.configurationViewPrint,
                    );
                    this.authService.setConfigurationViewLayout(
                        res.data.configurationViewLayout,
                    );
                    this.router.navigate(['/uikit']).then(() => { });
                }
            });
    }

    async verifyDbNameBeforeLogin() {
        const response = await this.companyService.verifyCompanyDbName(this.loginFrm.value.companyTax)
        let isDbNameValid = response.data;

        if(!isDbNameValid) {
            this.messageService.add({
                severity: 'error',
                detail: this.appUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
        }
        this.setDbName();
        return isDbNameValid;
    }

    onChangeLanguage(event: any) {
        localStorage.setItem(AppConstant.STORAGE_KEYS.LANGUAGE, event.value);
        this.translateService.use(
            localStorage.getItem(AppConstant.STORAGE_KEYS.LANGUAGE),
        );
    }

    setDbName() {
        var companyTax = this.companyTaxs.find(x => x.name.toLowerCase() == this.loginFrm.value.companyTax.toLowerCase());
        if (companyTax) {
            this.authService.setDbName(companyTax.id);
            this.disableLogin = true;
        }
    }

    ngAfterViewInit(): void {
        if (!(!this.authService.user || this.appUtil.isEmpty(this.authService.user))) {
            this.router.navigate(['/uikit']).then(() => { });
        }
    }
}
