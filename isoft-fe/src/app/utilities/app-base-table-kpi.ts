import { TypeData } from '../models/common.model';
import * as moment from 'moment/moment';
import { EMPTY, merge, Observable, tap } from 'rxjs';
import { AfterViewInit, Directive, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Column } from '../models/table/column';
import { LazyLoadEvent } from 'primeng/api';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

interface Param {
    Page?: number;
    PageSize?: number;
    Month?: number;
    searchText?: string;
}

@Directive()
export abstract class BaseTableKPI<T> implements AfterViewInit {
    saveForm!: FormGroup;
    isMobile = false;
    @ViewChild('dt', { static: true }) table?: Table;
    formFilter: FormGroup;
    procedureNumberKPI = '';
    protected _watcher: any[] = [];
    months = [
        { name: 'Tháng 1', value: 1 },
        { name: 'Tháng 2', value: 2 },
        { name: 'Tháng 3', value: 3 },
        { name: 'Tháng 4', value: 4 },
        { name: 'Tháng 5', value: 5 },
        { name: 'Tháng 6', value: 6 },
        { name: 'Tháng 7', value: 7 },
        { name: 'Tháng 8', value: 8 },
        { name: 'Tháng 9', value: 9 },
        { name: 'Tháng 10', value: 10 },
        { name: 'Tháng 11', value: 11 },
        { name: 'Tháng 12', value: 12 },
    ];

    loading: boolean = false;

    result: any = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };

    defaultParam: Param = {
        Page: 1,
        PageSize: 10,
        Month: moment(Date.now()).month() + 1,
        searchText: '',
    };

    cols: Column[];

    protected constructor(
        public breakpointObserverBase: BreakpointObserver,
        protected activatedRouteBase: ActivatedRoute,
        protected fbBase?: FormBuilder,
    ) {
        this.result = this.activatedRouteBase?.snapshot?.data?.resolveData;
        this.procedureNumberKPI = this.result['procedureNumberKPI'];
    }

    /*TODO: Config Table*/
    abstract loadHeader();

    field(name: string) {
        return this.saveForm.get(name);
    }

    /*TODO: Get Data*/
    abstract fetchData();

    processData(request: Observable<TypeData<T>>): any {
        this.loading = true;
        request.subscribe((res) => {
            this.result = res;
            this.loading = false;
        });
    }

    resetFormFilter() {
        this.defaultParam = {
            ...this.defaultParam,
            Month: moment(Date.now()).month() + 1,
            searchText: '',
        };
    }

    ngAfterViewInit(): void {
        this.breakpointObserverBase
            .observe(['(max-width: 1199px)'])
            .subscribe((state: BreakpointState) => {
                this.isMobile = state.matches;
            });
        if (this.table) {
            const onLazy = this.table?.onLazyLoad?.pipe(
                filter(({ first, rows }: LazyLoadEvent) => {
                    return (
                        this.defaultParam.Page !== first / rows + 1 ||
                        this.defaultParam.PageSize !== rows
                    );
                }),
                tap(({ first, rows }) => {
                    this.defaultParam.Page = first / rows + 1;
                    this.defaultParam.PageSize = rows;
                }),
            );
            this._watcher = [onLazy];

            merge(...this._watcher)
                .pipe(
                    tap(() => (this.loading = true)),
                    catchError((error) => {
                        return EMPTY;
                    }),
                    finalize(() => (this.loading = false)),
                )
                .subscribe((res: TypeData<T>) => {
                    this.fetchData();
                    this.loading = false;
                });
        }
    }

    trackByFn(index) {
        return index;
    }

    submitForm() {
        // tslint:disable-next-line:forin
        for (const i in this.saveForm.controls) {
            this.saveForm.controls[i].markAsDirty();
            this.saveForm.controls[i].markAllAsTouched();
            this.saveForm.controls[i].updateValueAndValidity();
        }
    }

    inValid(name: string): boolean {
        return (
            this.field(name).invalid &&
            (this.field(name).dirty || this.field(name).touched)
        );
    }
}
