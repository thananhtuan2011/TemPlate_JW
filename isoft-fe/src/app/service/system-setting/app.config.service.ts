import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import AppConstant from 'src/app/utilities/app-constants';
import { AppConfig } from '../../configs/appconfig';
import { TypeData } from '../../models/common.model';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService {
    prefix: string = `${AppConstant.DEFAULT_URLS.API}/configuration`;

    constructor(private readonly httpClient: HttpClient) {}

    configDefault: AppConfig = {
        theme: 'jwk-main',
        dark: false,
        inputStyle: 'outlined',
        ripple: true,
    };

    private configUpdate = new Subject<AppConfig>();

    configUpdate$ = this.configUpdate.asObservable();

    updateConfig(config: AppConfig) {
        if (!config) {
            config = this.configDefault;
        }
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.CONFIG,
            JSON.stringify(config),
        );
        this.configUpdate.next(config);
    }

    getConfig() {
        return JSON.parse(localStorage.getItem('config')) || this.configDefault;
    }

    isMenuMobile = new BehaviorSubject<boolean>(false);

    public getThemeConfig(): Observable<TypeData<any>> {
        return this.httpClient.get(`${this.prefix}/default_theme`).pipe(
            map((Salary: TypeData<any>) => {
                return Salary;
            }),
        );
    }

    public setThemeConfig(payload: any): Observable<TypeData<any>> {
        return this.httpClient
            .post(`${this.prefix}/default_theme`, payload)
            .pipe(
                map((Salary: TypeData<any>) => {
                    return Salary;
                }),
            );
    }
}
