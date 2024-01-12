/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IsDropdownComponent } from './is-dropdown.component';

describe('IsDropdownComponent', () => {
    let component: IsDropdownComponent;
    let fixture: ComponentFixture<IsDropdownComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IsDropdownComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IsDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
