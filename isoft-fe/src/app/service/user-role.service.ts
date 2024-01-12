import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { UserRole } from '../models/user-role.model';
import { MenuRoleModel } from '../models/role.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/UserRoles`;

@Injectable({
    providedIn: 'root',
})
export class UserRoleService {
    constructor(private readonly httpClient: HttpClient) {}

    public getAllUserRole(): Observable<TypeData<UserRole>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((userRole: TypeData<UserRole>) => {
                return userRole;
            }),
        );
    }

    public getPagingUserRole(params: any): Observable<TypeData<UserRole>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((userRole: TypeData<UserRole>) => {
                return userRole;
            }),
        );
    }

    public createUserRole(role: UserRole): Observable<UserRole> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, role).pipe(
            map((role: UserRole) => {
                return role;
            }),
        );
    }

    public updateUserRole(role: UserRole, id: number): Observable<UserRole> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, role).pipe(
            map((role: UserRole) => {
                return role;
            }),
        );
    }

    public deleteUserRole(id: number): Observable<UserRole> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((role: UserRole) => {
                return role;
            }),
        );
    }
}
