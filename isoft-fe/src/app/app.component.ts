import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { AppConfigComponent } from './configs/app.config.component';
import { ConfigService } from './service/system-setting/app.config.service';
import AppUtil from "./utilities/app-util";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [AppConfigComponent],
    styles: [
        `
            @keyframes custom-progress-spinner-color {
                100%,
                0% {
                    stroke: var(--primary-color);
                }
                40% {
                    stroke: var(--primary-color);
                }
                66% {
                    stroke: var(--primary-color);
                }
                80%,
                90% {
                    stroke: var(--primary-color);
                }
            }

            @keyframes custom-progress-spinner-dash {
                0% {
                    stroke-dasharray: 1, 200;
                    stroke-dashoffset: 0;
                }
                50% {
                    stroke-dasharray: 89, 200;
                    stroke-dashoffset: -35px;
                }
                100% {
                    stroke-dasharray: 89, 200;
                    stroke-dashoffset: -124px;
                }
            }

            :host ::ng-deep {
                .custom-spinner .p-progress-spinner-circle {
                    animation:
                        custom-progress-spinner-dash 1.5s ease-in-out infinite,
                        custom-progress-spinner-color 6s ease-in-out infinite;
                }

                @media screen and (max-width: 768px) {
                    .custom-spinner {
                        top: 44%;
                        left: 44%;
                    }
                }

                @media screen and (min-width: 769px) {
                    .custom-spinner {
                        top: 45%;
                        left: 48%;
                    }
                }
            }
        `,
    ],
})
export class AppComponent implements OnInit {
    menuMode = 'static';
    latestEvent = 'randomLast';
    historicalEvent = 'randomHistory';
    isShowContent: boolean = false;
    id: any;

    constructor(
        private primengConfig: PrimeNGConfig,
        private translateService: TranslateService,
        private appConfig: AppConfigComponent,
        private configService: ConfigService,
        private renderer: Renderer2,
    ) {}

    ngOnInit() {
        setTimeout(() => {
            this.isShowContent = true;
        }, 2000);
        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = localStorage.getItem('scale') ?  localStorage.getItem('scale') + 'px' : '14px';
        this.translateService
            .get('primeng')
            .subscribe((res) => this.primengConfig.setTranslation(res));
        if (localStorage.getItem('isCustomTheme') === 'false') {
            let themeLocal = this.configService.getConfig();
            this.appConfig.changeTheme(themeLocal.theme, themeLocal.dark);
        } else {
            this.configService.getThemeConfig().subscribe((res: any) => {
                this.initTheme(res);
            });
        }
    }

    initTheme(theme) {
        AppUtil.initTheme({
            '--text-color': theme.textColor ? theme.textColor : 'rgb(56,91,220)',
            '--text-color-secondary': theme.textColor ? theme.textColorSecondary : 'rgba(0, 0, 0, 255)',
            '--primary-color': theme.textColor ? theme.primaryColor : 'rgb(42,80,210)',
            '--light-primary-color': theme.textColor ? theme.lightPrimaryColor : 'rgb(156,170,224)',
            '--invalid-primary-color': theme.textColor ? theme.invalidPrimaryColor : 'rgb(253,55,106)',
            '--primary-color-text': theme.textColor ? theme.primaryColorText : 'rgb(185,241,255)',
        }, true);
    }
}
