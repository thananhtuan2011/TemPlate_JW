import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AriseCrudDeliveryComponent } from './arise-crud-delivery.component';

describe('AriseCrudDeliveryComponent', () => {
    let component: AriseCrudDeliveryComponent;
    let fixture: ComponentFixture<AriseCrudDeliveryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AriseCrudDeliveryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AriseCrudDeliveryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
