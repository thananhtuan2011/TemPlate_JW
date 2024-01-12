import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import {
    IConfigAriseDocumentBehaviourDto,
    IConfigAriseDocumentBehaviourInputDto,
} from '../models/config-arise.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/config-arise-behaviour`;

@Injectable({
    providedIn: 'root',
})
export class ConfiAriseService {
    constructor(private readonly httpClient: HttpClient) {}

    public preparationDocuments(documentId: number): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/preparation-documents/${documentId}`, null)
            .pipe(
                map((data: IConfigAriseDocumentBehaviourDto[]) => {
                    return data;
                }),
            );
    }

    public documentNokeepValue(
        ariseBehaviourId: number,
        body: IConfigAriseDocumentBehaviourInputDto,
    ) {
        return this.httpClient.put(
            `${_prefix}/${ariseBehaviourId}/document-no-keep-value`,
            body,
        );
    }

    public updateFocusValueAsync(
        ariseBehaviourId: number,
        body: IConfigAriseDocumentBehaviourInputDto,
    ) {
        return this.httpClient.put(
            `${_prefix}/${ariseBehaviourId}/document-focus-value`,
            body,
        );
    }
}
