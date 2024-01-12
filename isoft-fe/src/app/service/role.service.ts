import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, TypeData } from '../models/common.model';
import { map } from 'rxjs/operators';
import { MenuRoleModel, MenuViewModel } from '../models/role.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Menus`;

export interface PageFilterRole extends Page {
    isParent: boolean;
    codeParent: string;
}

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    constructor(private readonly httpClient: HttpClient) {}
    public getPagingRole(params: any): Observable<TypeData<MenuRoleModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((role: TypeData<MenuRoleModel>) => {
                return role;
            }),
        );
    }
    public getRoles(params: any): Observable<TypeData<MenuViewModel>> {
        return this.httpClient.get(`${_prefix}/list`, { params }).pipe(
            map((role: TypeData<MenuViewModel>) => {
                return role;
            }),
        );
    }

    public createRole(role: MenuRoleModel): Observable<MenuRoleModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, role).pipe(
            map((role: MenuRoleModel) => {
                return role;
            }),
        );
    }

    public updateRole(
        role: MenuRoleModel,
        id: number,
    ): Observable<MenuRoleModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, role).pipe(
            map((role: MenuRoleModel) => {
                return role;
            }),
        );
    }
    public deleteRole(id: number): Observable<MenuRoleModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((role: MenuRoleModel) => {
                return role;
            }),
        );
    }
    public getDetail(id: number): Observable<MenuViewModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url).pipe(
            map((role: MenuViewModel) => {
                return role;
            }),
        );
    }
}
