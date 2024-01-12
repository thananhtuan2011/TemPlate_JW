import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintItemComponent } from './print-item.component';

describe('PrintItemComponent', () => {
    let component: PrintItemComponent;
    let fixture: ComponentFixture<PrintItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PrintItemComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PrintItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
