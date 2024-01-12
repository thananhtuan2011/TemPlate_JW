import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AriseCrudStockComponent } from './arise-crud-stock.component';

describe('AriseCrudStockComponent', () => {
    let component: AriseCrudStockComponent;
    let fixture: ComponentFixture<AriseCrudStockComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AriseCrudStockComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AriseCrudStockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
