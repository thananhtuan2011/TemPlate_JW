import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AriseCrudTaxComponent } from './arise-crud-tax.component';

describe('AriseCrudTaxComponent', () => {
    let component: AriseCrudTaxComponent;
    let fixture: ComponentFixture<AriseCrudTaxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AriseCrudTaxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AriseCrudTaxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
