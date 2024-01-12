import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AriseCrudVatComponent } from './arise-crud-vat.component';

describe('AriseCrudVatComponent', () => {
    let component: AriseCrudVatComponent;
    let fixture: ComponentFixture<AriseCrudVatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AriseCrudVatComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AriseCrudVatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
