import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { CompanyService } from 'src/app/service/company.service';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styles: [
        `
            :host ::ng-deep .p-inputtext {
                width: 100%;
                padding: 1rem;
            }

            :host ::ng-deep .pi-eye {
                transform: scale(1.6);
                cursor: pointer;
                color: var(--primary-color) !important;
            }

            :host ::ng-deep .pi-eye-slash {
                transform: scale(1.6);
                cursor: pointer;
                color: var(--primary-color) !important;
            }

            :host ::ng-deep .p-dropdown {
                width: auto !important;
            }
        `,
    ],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
    appUtil = AppUtil;
    valCheck: string[] = ['remember'];

    password: string;

    config: AppConfig;

    subscription: Subscription;

    forgotFrm: FormGroup = new FormGroup({});

    isSubmitting: boolean = false;

    invalidUsername: boolean = false;

    languages: any[];

    selectedLanguage: any;

    serverURLImage = environment.serverURLImage;

    constructor(
        public configService: ConfigService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private companyService: CompanyService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.getLastInfo();
        this.config = this.configService.getConfig();
        this.subscription = this.configService.configUpdate$.subscribe(
            (config) => {
                this.config = config;
            },
        );
        this.forgotFrm = this.fb.group({
            username: ['', [Validators.required]],
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    company: any = {};
    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    doLogin() {
        this.invalidUsername = false;
        this.forgotFrm.markAllAsTouched();
        if (!this.forgotFrm.value.username.trim()) {
            return;
        }
        this.isSubmitting = true;
        const req = {
            username: this.forgotFrm.value.username,
        };
        this.authService.resetPassword(req).subscribe((res: any): void => {
            if (!res) {
                this.invalidUsername = true;
                return;
            }
            this.router.navigate(['']);
        });
    }

    onChangeLanguage(event: any) {
        localStorage.setItem(AppConstant.STORAGE_KEYS.LANGUAGE, event.value);
        this.translateService.use(
            localStorage.getItem(AppConstant.STORAGE_KEYS.LANGUAGE),
        );
    }
}
