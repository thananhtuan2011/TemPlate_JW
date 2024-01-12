/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IsInputComponent } from './is-input.component';

describe('IsInputComponent', () => {
    let component: IsInputComponent;
    let fixture: ComponentFixture<IsInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IsInputComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IsInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
