import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrintItemGoods } from '../../../../models/print-item.goods.model';
import { Goods } from '../../../../models/goods.model';

@Component({
    selector: 'app-goods-print-form',
    templateUrl: './goods-print-form.component.html',
    styleUrls: ['./goods-print-form.component.scss'],
})
export class GoodsPrintFormComponent implements OnInit {
    @Input() public isVisiblePopupDetail = false;
    @Output() public onOk: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onCancel: EventEmitter<any> = new EventEmitter<any>();

    @Input() public listBarCodeItems: Goods[] = [];

    public isVisiblePrintPopup: boolean = false;
    public printDisplayOption = 1;

    constructor() {}

    ngOnInit(): void {}

    onFormOk() {
        this.isVisiblePrintPopup = true;
    }
}
