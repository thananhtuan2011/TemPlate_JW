import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AriseCrudImportProductComponent } from './arise-crud-import-product.component';

describe('AriseCrudImportProductComponent', () => {
    let component: AriseCrudImportProductComponent;
    let fixture: ComponentFixture<AriseCrudImportProductComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AriseCrudImportProductComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AriseCrudImportProductComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
