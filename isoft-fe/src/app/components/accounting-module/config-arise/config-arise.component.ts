import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import {
    ConfigAriseEnum,
    ConfigButtonAriseEnum,
    IConfigAriseDocumentBehaviourInputDto,
    IFormConfigAriseDto,
} from 'src/app/models/config-arise.model';
import { ConfiAriseService } from 'src/app/service/config-arise.service';
import { DocumentService } from 'src/app/service/document.service';

@Component({
    selector: 'app-config-arise',
    templateUrl: './config-arise.component.html',
    styleUrls: ['./config-arise.component.scss'],
})
export class ConfigAriseComponent implements OnInit, OnDestroy {
    listDocument = [];
    listConfigDocument = [];
    listButton = [
        {
            id: ConfigButtonAriseEnum[
                ConfigButtonAriseEnum.nokeepDataChartOfAccount
            ],
            name: 'F2. Thêm định khoản',
        },
        {
            id: ConfigButtonAriseEnum[ConfigButtonAriseEnum.nokeepDataTax],
            name: 'F8. Lưu',
        },
        {
            id: ConfigButtonAriseEnum[ConfigButtonAriseEnum.nokeepDataBill],
            name: 'F4. Thêm hóa đơn',
        },
    ];

    filterParam = {
        documentId: null,
        button: this.listButton[0].id,
        focus: null,
    };
    orginalCompanyNameLabel = 'Người nộp';
    configAriseEnum = ConfigAriseEnum;
    configButtonAriseEnum = ConfigButtonAriseEnum;
    form: any;

    $updateFocus: Subscription;
    $updateNoKeepValue: Subscription;
    $document: Subscription;
    $config: Subscription;

    constructor(
        private readonly confiAriseService: ConfiAriseService,
        private readonly documentService: DocumentService,
    ) {}

    ngOnInit(): void {
        this.preparationDocument();
    }

    getProperty(key: ConfigAriseEnum): string {
        return ConfigAriseEnum[key];
    }

    onSelectDocument() {
        let item = _.find(this.listDocument, (item) => {
            return item.id == this.filterParam.documentId;
        });
        this.orginalCompanyNameLabel = item?.title || 'Người nộp';
        this.preparationConfigDocuments(this.filterParam.documentId);
    }

    onSelectFocus() {
        const body = {
            key: '',
            ariseBehaviourId: this.filterParam.focus,
            documentId: this.filterParam.documentId,
            value: false,
        } as IConfigAriseDocumentBehaviourInputDto;
        this.$updateFocus = this.confiAriseService
            .updateFocusValueAsync(this.filterParam.focus, body)
            .subscribe((res) => {});
    }

    onSelectButton() {
        this.onSelectDocument();
    }

    onSelectCheckBox(data: IFormConfigAriseDto) {
        const body = {
            key: this.filterParam.button,
            ariseBehaviourId: data.ariseBehaviourId,
            documentId: this.filterParam.documentId,
            value: data.value,
        } as IConfigAriseDocumentBehaviourInputDto;

        const code = data.code + '.';
        const listChildrenKeys = _.filter(
            this.listConfigDocument,
            (item: any) => {
                return item.code.startsWith(code);
            },
        ).map((m) => m.codeData);

        _.each(listChildrenKeys, (codeData) => {
            this.form[codeData].value = data.value;
        });

        this.$updateNoKeepValue = this.confiAriseService
            .documentNokeepValue(data.ariseBehaviourId, body)
            .subscribe((res) => {});
    }

    showPhieuNhap() {
        return _.find(this.listDocument, (item) => {
            return item.code === 'PC' && item.id == this.filterParam.documentId;
        })
            ? true
            : false;
    }

    private preparationDocument() {
        this.$document = this.documentService
            .getAllActiveDocument()
            .subscribe((res) => {
                this.listDocument = res.data.sort((a, b) => a.stt - b.stt);
                if (this.listDocument.length > 0) {
                    this.filterParam.documentId = this.listDocument[0].id;
                    this.preparationConfigDocuments(
                        this.filterParam.documentId,
                    );
                }
            });
    }

    private preparationConfigDocuments(documentId) {
        this.$config = this.confiAriseService
            .preparationDocuments(documentId)
            .subscribe((res) => {
                this.listConfigDocument = res.map((m) => {
                    return {
                        id: m.configAriseBehaviour.id,
                        name: m.configAriseBehaviour.name,
                        code: m.configAriseBehaviour.code,
                        ariseBehaviourId: m.ariseBehaviourId,
                        codeData: m.configAriseBehaviour.codeData,
                        focusLedger: m.focusLedger,
                    };
                });
                if (this.listConfigDocument.length) {
                    let item = _.find(res, (item) => {
                        return item.focusLedger;
                    });
                    this.filterParam.focus = item
                        ? item.ariseBehaviourId
                        : this.listConfigDocument[0].ariseBehaviourId;
                }
                this.buildForm(res);
            });
    }

    private buildForm(listConfigDocument) {
        this.form = {};
        _.each(listConfigDocument, (config) => {
            this.form[config.configAriseBehaviour.codeData] = {
                codeData: config.configAriseBehaviour.codeData,
                code: config.configAriseBehaviour.code,
                ariseBehaviourId: config.ariseBehaviourId,
                value: config[this.filterParam.button],
            } as IFormConfigAriseDto;
        });
    }

    ngOnDestroy(): void {
        if (this.$updateFocus) this.$updateFocus.unsubscribe();
        if (this.$updateNoKeepValue) this.$updateNoKeepValue.unsubscribe();
        if (this.$document) this.$document.unsubscribe();
        if (this.$config) this.$config.unsubscribe();
    }
}
