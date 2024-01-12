import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth, AuthData } from '../models/auth.model';
import { TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { forEach } from 'lodash';
import AppUtil from '../utilities/app-util';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/auth`;

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    initialAuthenticated = new BehaviorSubject('Initial Authenticated');

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    public setToken(token: string): void {
        localStorage.setItem(AppConstant.STORAGE_KEYS.SESSION, token);
    }

    public get token(): string | null {
        return localStorage.getItem(AppConstant.STORAGE_KEYS.SESSION);
    }

    public deleteToken(): void {
        localStorage.removeItem(AppConstant.STORAGE_KEYS.SESSION);
        localStorage.removeItem(AppConstant.STORAGE_KEYS.USER);
    }

    public clearSession(): void {
        this.deleteToken();
        var current_user = this.getCurrentUser;
        localStorage.clear();
        this.setCurrentUser(current_user);
    }

    public setUser(authUser: AuthData | undefined): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.USER,
            JSON.stringify(authUser),
        );
    }

    public get user(): AuthData | null {
        return JSON.parse(localStorage.getItem(AppConstant.STORAGE_KEYS.USER));
    }

    public deleteUser(): void {
        localStorage.removeItem(AppConstant.STORAGE_KEYS.USER);
    }

    login(params: any): Observable<TypeData<Auth>> {
        return this.http.post<TypeData<Auth>>(`${_prefix}/login`, params).pipe(
            map((result) => {
                return result;
            }),
        );
    }

    changePassword(params: any): Observable<any> {
        return this.http.put<any>(`${_prefix}/change-password`, params).pipe(
            map((result) => {
                return result;
            }),
        );
    }

    resetPassword(params: any): Observable<any> {
        return this.http
            .post<TypeData<Auth>>(`${_prefix}/requestForgotPass`, params)
            .pipe(
                map((result) => {
                    return result;
                }),
            );
    }

    initAuthenticated(): void {
        this.initialAuthenticated.next('initial authenticated');
    }

    public getListRole(): Observable<TypeData<any>> {
        return this.http.get(`${_prefix}/get-list-role`).pipe(
            map((role: TypeData<any>) => {
                return role;
            }),
        );
    }

    public setDbName(dbname: string): void {
        localStorage.setItem(AppConstant.STORAGE_KEYS.DBNAME, dbname);
    }

    public get dbName(): string | null {
        return localStorage.getItem(AppConstant.STORAGE_KEYS.DBNAME) ?? '';
    }

    public setYear(yearFilter: number): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.YEARFILTER,
            yearFilter.toString(),
        );
    }

    public setShowMessageDiffCurrentYear(yearFilter: number): void {
        if (new Date().getFullYear() !== yearFilter) {
            localStorage.setItem(
                AppConstant.STORAGE_KEYS.SHOW_MESSAGE_DIFF_CURRENT_YEAR,
                true.toString(),
            );
        }
    }

    public get yearFilter(): number | null {
        return parseInt(
            localStorage.getItem(AppConstant.STORAGE_KEYS.YEARFILTER),
        );
    }

    public get checkShowMessageDiffCurrentYear() {
        return localStorage.getItem(
            AppConstant.STORAGE_KEYS.SHOW_MESSAGE_DIFF_CURRENT_YEAR,
        )
            ? true
            : false;
    }

    public deleteShowMessageDiffCurrentYear(): void {
        localStorage.removeItem(
            AppConstant.STORAGE_KEYS.SHOW_MESSAGE_DIFF_CURRENT_YEAR,
        );
    }

    public setConfigurationViewTypePay(data: any): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_TYPE_PAY,
            JSON.stringify(data),
        );
    }

    public get getConfigurationViewTypePays(): any[] {
        return JSON.parse(
            localStorage.getItem(
                AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_TYPE_PAY,
            ),
        );
    }

    public setConfigurationViewQuantityBoxNec(data: any): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_QUANTITY_BOX_NEC,
            data,
        );
    }

    public get getConfigurationViewQuantityBoxNec(): boolean {
        return (
            localStorage.getItem(
                AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_QUANTITY_BOX_NEC,
            ) == '1'
        );
    }

    public setConfigurationViewPrint(data: any): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_PRINT,
            data,
        );
    }

    public get getConfigurationViewPrint(): string {
        return localStorage.getItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_PRINT,
        );
    }

    public setConfigurationViewLayout(data: any): void {
        localStorage.setItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_LAYOUT,
            data,
        );
    }

    public get getConfigurationViewLayout(): string {
        return localStorage.getItem(
            AppConstant.STORAGE_KEYS.CONFIGURATION_VIEW_LAYOUT,
        );
    }

    public setCurrentUser(user: any): void {
        AppUtil.setStorage(AppConstant.STORAGE_KEYS.CURRENT_USER, user);
    }
    public get getCurrentUser(): any {
        return AppUtil.getStorage<object>(AppConstant.STORAGE_KEYS.CURRENT_USER)
    }
    // Internal login based on user information stored in local storage when token expired
    public internalLogin() {
        var currentUser = this.getCurrentUser;
        let request = {
            username: currentUser.username,
            password: currentUser.password,
            company_tax: currentUser.companyTax,
            remember:false 
        };

        this.login(request).subscribe((res: any): void => {
            if (res.status === 200 && res.data && res.data.id !== 0) {
                this.setToken(res.data.token);
                const authUser: AuthData = res.data;
                this.setUser(authUser);
            }
        });
    }
}
