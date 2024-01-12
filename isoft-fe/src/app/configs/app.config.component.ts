import { Component, Input } from '@angular/core';
import { ConfigService } from '../service/system-setting/app.config.service';
import { LayoutService } from '../service/system-setting/app.layout.service';
import { MenuService } from '../service/system-setting/app.menu.service';
import { AppConfig } from './appconfig';
import AppUtil from "../utilities/app-util";

@Component({
    selector: 'app-config',
    templateUrl: './app.config.component.html',
})
export class AppConfigComponent {
    @Input() minimal: boolean = false;

    scales: number[] = [12, 13, 14, 15, 16];

    config: AppConfig;

    constructor(
        public layoutService: LayoutService,
        public menuService: MenuService,
        public configService: ConfigService,
    ) {}

    get visible(): boolean {
        return this.layoutService.state.configSidebarVisible;
    }

    set visible(_val: boolean) {
        this.layoutService.state.configSidebarVisible = _val;
    }

    get scale(): number {
        return this.layoutService.config.scale;
    }

    set scale(_val: number) {
        this.layoutService.config.scale = _val;
    }

    get menuMode(): string {
        return this.layoutService.config.menuMode;
    }

    set menuMode(_val: string) {
        this.layoutService.config.menuMode = _val;
    }

    get inputStyle(): string {
        return this.layoutService.config.inputStyle;
    }

    set inputStyle(_val: string) {
        console.log('inputStyle', _val);
        this.layoutService.config.inputStyle = _val;
    }

    get ripple(): boolean {
        return this.layoutService.config.ripple;
    }

    set ripple(_val: boolean) {
        this.layoutService.config.ripple = _val;
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    // changeTheme(theme: string, colorScheme: string) {
    //     alert(theme + ' ' + colorScheme);
    //     const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    //     const newHref = themeLink
    //         .getAttribute('href')!
    //         .replace(this.layoutService.config.theme, theme);
    //     this.layoutService.config.colorScheme;
    //     this.replaceThemeLink(newHref, () => {
    //         this.layoutService.config.theme = theme;
    //         this.layoutService.config.colorScheme = colorScheme;
    //         this.layoutService.onConfigUpdate();
    //     });
    // }

    // replaceThemeLink(href: string, onComplete: Function) {
    //     const id = 'theme-css';
    //     const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    //     const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

    //     cloneLinkElement.setAttribute('href', href);
    //     cloneLinkElement.setAttribute('id', id + '-clone');

    //     themeLink.parentNode!.insertBefore(
    //         cloneLinkElement,
    //         themeLink.nextSibling
    //     );

    //     cloneLinkElement.addEventListener('load', () => {
    //         themeLink.remove();
    //         cloneLinkElement.setAttribute('id', id);
    //         onComplete();
    //     });
    // }

    changeTheme(theme: string, dark: boolean) {
        let themeElement = document.getElementById('theme-css');
        themeElement.setAttribute(
            'href',
            'assets/theme/' + theme + '/theme.css',
        );
        localStorage.setItem('isCustomTheme', 'false');
        this.configService.updateConfig({ ...this.config, ...{ theme, dark } });
        this.initTheme();
    }

    initTheme() {
        AppUtil.initTheme({
            '--text-color': 'rgb(56,91,220)',
            '--text-color-secondary': 'rgba(0, 0, 0, 255)',
            '--primary-color': 'rgb(42,80,210)',
            '--light-primary-color': 'rgb(156,170,224)',
            '--invalid-primary-color': 'rgb(253,55,106)',
            '--primary-color-text': 'rgb(185,241,255)',
        }, false);
    }

    decrementScale() {
        this.scale--;
        this.applyScale();
    }

    incrementScale() {
        this.scale++;
        this.applyScale();
    }

    applyScale() {
        localStorage.setItem('scale', this.scale.toString());
        document.documentElement.style.fontSize = this.scale + 'px';
    }
}
