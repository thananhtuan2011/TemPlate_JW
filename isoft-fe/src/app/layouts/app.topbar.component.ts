import { User } from 'src/app/models/user.model';
import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import AppUtil from '../utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../service/company.service';
import { Company } from '../models/company.model';
import { LayoutService } from '../service/system-setting/app.layout.service';
import { environment } from 'src/environments/environment';
import { BillService } from '../service/bill.service';
import { NotificationResult } from '../models/cashier.model';
import * as signalR from '@microsoft/signalr';
import { MainColorService } from '../service/main-color.service';
import { Config } from 'codelyzer';
import { ConfigService } from '../service/system-setting/app.config.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-button.p-button-sm {
                    padding: 0.45rem;
                }
                .menu-toggle {
                    margin-top: 40%;
                    left: 0;
                    position: fixed;
                    z-index: 9999999;
                }

                .p-password,
                #oldPassword div .p-inputtext,
                #confirmPassword div .p-inputtext,
                #password div .p-inputtext {
                    width: 100% !important;
                }

                strong {
                    color: var(--primary-color);
                }
            }
        `,
    ],
})
export class AppTopBarComponent implements OnInit {
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    items: MenuItem[];
    authUser: User | undefined;
    registFrm: FormGroup = new FormGroup({});

    company: Company;

    displayChangePassword: boolean = false;
    displayChangeTheme: boolean = false;

    themes = [
        { value: 'saigon-nio-main', label: 'Sai gon nio' },
        { value: 'jwk-main', label: 'JWK' },
        { value: 'bootstrap4-light-blue', label: 'Bootstrap 4 light blue' },
    ];

    themeConfig: any = {
        primaryColor: '',
        textColor: '',
        textColorSecondary: '',
        lightPrimaryColor: '',
        invalidPrimaryColor: '',
        primaryColorText: '',
        scale: '14'
    };

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService,
        private translateService: TranslateService,
        public layoutService: LayoutService,
        public appMain: AppMainComponent,
        private companyService: CompanyService,
        private billService: BillService,
        private mainColorService: MainColorService,
        private confirmationService: ConfirmationService,
        private configService: ConfigService,
    ) {
        this.registFrm = this.fb.group({
            id: [''],
            oldPassword: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.initNotificationRealtime();
        this.authUser = this.authService.user;
        this.reloadMessCount();
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });

        this.configService.getThemeConfig().subscribe((res: any) => {
            if (res !== null) {
                this.themeConfig = res;
                this.applyScale(false);
            };
        });
    }

    doLogout(): void {
        this.authService.clearSession();
        this.router.navigate(['']);
    }

    onTheme() {
        this.displayChangeTheme = true;
    }

    onChangeTheme(showMessage) {
        const params = Object.assign({}, this.themeConfig);
        params.scale = params.scale.toString();
        this.configService.setThemeConfig(params).subscribe((res: any) => {
            this.initTheme();
            if (showMessage) {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.change_theme_successfully',
                    ),
                });
            }
            this.displayChangeTheme = false;
        });
    }

    initTheme() {
        AppUtil.setStorage('isCustomTheme', true);
        AppUtil.initTheme({
            '--text-color': this.themeConfig.textColor,
            '--text-color-secondary': this.themeConfig.textColorSecondary,
            '--primary-color': this.themeConfig.primaryColor,
            '--light-primary-color': this.themeConfig.lightPrimaryColor,
            '--invalid-primary-color': this.themeConfig.invalidPrimaryColor,
            '--primary-color-text': this.themeConfig.primaryColorText,
        }, !!localStorage.getItem('isCustomTheme'));
    }

    onChangePass() {
        this.registFrm.markAllAsTouched();
        if (this.registFrm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            return;
        }
        if (
            this.registFrm.value.oldPassword === this.registFrm.value.password
        ) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.new_password_do_not_matching_old_password',
                ),
            });
            return;
        }
        if (
            this.registFrm.value.password !==
            this.registFrm.value.confirmPassword
        ) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.new_password_do_matching_confirm_password',
                ),
            });
            return;
        }
        const params: any = {
            id: this.authService.user.id,
            oldPassword: this.registFrm.value.oldPassword,
            password: this.registFrm.value.password,
        };
        this.authService.changePassword(params).subscribe((res) => {
            if (res.status === 200) {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.change_pass_successfully',
                    ),
                });
                this.displayChangePassword = false;
            }
        });
    }

    checkValidValidator(fieldName: string) {
        return (
            (this.registFrm.controls[fieldName].dirty ||
                this.registFrm.controls[fieldName].touched) &&
            this.registFrm.controls[fieldName].invalid
        );
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    onChangeOldPass(event) {
        // alert(event);
    }

    private hubConnection: signalR.HubConnection;

    initNotificationRealtime() {
        this.getNotificationCount();
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Information)
            .withUrl(`${environment.serverURL}/notify`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .build();

        this.hubConnection
            .start()
            .then(function () {
                console.log('SignalR Connected!');
            })
            .catch(function (err) {
                return console.error(err.toString());
            });

        this.hubConnection.on('BroadcastMessage', () => {
            this.getNotificationCount();
            this.getNotificationMessage();
            this.reloadMessCount();
        });
    }

    notification: any[] = [];
    getNotificationCount() {
        this.billService
            .getNotificationToStaffCount()
            .subscribe((notification: any) => {
                this.existedNumMessage = notification.count;
            });
    }

    getNotificationMessage() {
        this.billService
            .getNotificationToStaffMessage()
            .subscribe((messages) => {
                this.reloadMessCount(messages);
            });
    }

    messages: any[] = [];
    existedNumMessage: number = 0;
    reloadMessCount(messages?: NotificationResult[]) {
        if (messages && messages.length > 0) {
            this.messages = messages;
        }
    }

    displayNotification: boolean = false;
    openDialog() {
        this.displayNotification = true;
        this.getNotificationMessage();
    }

    seenNotify(message: any) {
        this.billService.readMessage(message.id).subscribe((res) => {
            this.messages = this.messages.filter(
                (ele) => ele.id !== message.id,
            );
            this.existedNumMessage = this.existedNumMessage - 1;
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.seen_notification',
                ),
            });
            this.router.navigate(['/uikit/workflow']);
            this.displayNotification = false;
        });
    }

    deleteNotifications(): void {
        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn xóa tất cả thông báo?',
            header: 'Xóa tất cả thông báo?',
            accept: () => {
                this.billService.deleteNotificationsWork().subscribe(() => {
                    this.getNotificationMessage();
                    this.existedNumMessage = 0;
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.delete_all_notification',
                        ),
                    });
                });
            },
        });
    }

    applyScale(showMessage = true) {
        document.documentElement.style.fontSize = this.themeConfig.scale + 'px';
        this.onChangeTheme(showMessage);
    }
}
