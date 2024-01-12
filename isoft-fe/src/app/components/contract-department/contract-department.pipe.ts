import { Pipe, PipeTransform } from '@angular/core';
import AppUtil from 'src/app/utilities/app-util';

@Pipe({ name: 'contractDepartmentType' })
export class ContractDepartmentTypePipe implements PipeTransform {
    transform(value: number): string {
        return AppUtil?.contractTypes().find((f: any) => f.id == value)?.name;
    }
}
