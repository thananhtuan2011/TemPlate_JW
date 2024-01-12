import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-qr-scanner',
    templateUrl: './qr-scanner.component.html',
})
export class QrScannerComponent implements OnInit {
    @Output() onScanSuccess = new EventEmitter();
    @Output() onHide = new EventEmitter();
    @Input() isVisible: boolean;
    constructor() {}

    ngOnInit(): void {}
}
