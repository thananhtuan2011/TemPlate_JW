import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { User } from '../models/user.model';

export interface PageFilterUser extends Page {
    keyword?: string;
    warehouseId?: number;
    positionId?: number;
    departmentId?: number;
    degreeId?: number;
    certificateId?: number;
    targetId?: number;
    requestPassword?: boolean;
    quit?: boolean;
    gender?: number;
    birthday?: Date;
    startDate?: string;
    endDate?: string;
    currentPage?: number;
    pagesize?: number;
    typeOfWork?: number;
    month?: number;
    dateTimeKeep?: Date | string;
    toDate?: string;
    fromDate?: string;
    checkCurrentUser?: boolean;
    type?: number | string;
    chooseSearhBirth?: string;
    startAge?: string;
    endAge?: string;
    certificate?: number;
    account?: string | number;
    priceLists?: string[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Users`;
let _prefixUpload = `${AppConstant.DEFAULT_URLS.API}/ReportDownload`;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private readonly httpClient: HttpClient) {}

    public updateCurrentYear(year: any) {
        return this.httpClient.put(
            `${_prefix}/update-current-year?year=${year}`,
            null,
        );
    }

    public getCurrentYearSale() {
        return this.httpClient.get(`${_prefix}/get-year-sale`);
    }

    public getPagingUser(params: any): Observable<TypeData<User>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((user: TypeData<User>) => {
                return user;
            }),
        );
    }

    public getAllUserActive(): Observable<TypeData<User>> {
        return this.httpClient.get(`${_prefix}/getAllUserActive`).pipe(
            map((user: TypeData<User>) => {
                return user;
            }),
        );
    }

    public getTotalRequestPassword(): Observable<TypeData<number>> {
        return this.httpClient.get(`${_prefix}/get-total-reset-pass`).pipe(
            map((user: TypeData<number>) => {
                return user;
            }),
        );
    }

    public getUserDetail(id: number): Observable<User> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((user: User) => {
                return user;
            }),
        );
    }

    public getLastUsername(): Observable<any> {
        const url: string = `${_prefix}/get-user-name`;
        return this.httpClient.get(url, {}).pipe(
            map((username: any) => {
                return username;
            }),
        );
    }

    public createUser(user: User): Observable<User | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, user).pipe(
            map((user: User) => {
                return user;
            }),
        );
    }

    public updateUser(user: User, id: number): Observable<User> {
        console.log(user);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, user).pipe(
            map((user: User) => {
                return user;
            }),
        );
    }

    public deleteUser(id: number): Observable<User | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((user: User) => {
                return user;
            }),
        );
    }

    uploadFiles(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefixUpload}/uploadImage`, formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(catchError(this.errorMgmt));
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    getExcelReport(param: any): Observable<any> {
        let url: string = `${_prefix}/export`;

        return this.httpClient.post(url, param).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcel(formData): Observable<any> {
        return this.httpClient.post(`${_prefix}/savelist`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }

    userStatistics(): Observable<any> {
        return this.httpClient.get(`${_prefix}/UserStatistics`);
    }
}
