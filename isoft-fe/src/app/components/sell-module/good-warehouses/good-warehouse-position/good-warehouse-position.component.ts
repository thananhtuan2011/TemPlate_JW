import { Component, Input, OnInit } from '@angular/core';
import { WarehouseService } from '../../../../service/warehouse.service';
import { log } from 'console';

@Component({
    selector: 'app-good-warehouse-position',
    templateUrl: './good-warehouse-position.component.html',
})
export class GoodWarehousePositionComponent implements OnInit {
    @Input() goodPositions: any[] = [];
    wareHouseShelves: any = [];
    deskFloors: any = [];
    positions: any = [];
    warehouses: any = [];
    constructor(private readonly warehouseService: WarehouseService) {}

    ngOnInit(): void {
        this.warehouseService.getWareHouseShelves().subscribe((res) => {
            this.wareHouseShelves = res.data;
        });

        this.warehouseService.getDeskFloors().subscribe((res) => {
            this.deskFloors = res.data;
        });

        this.warehouseService.getPositions().subscribe((res) => {
            this.positions = res.data;
        });

        this.warehouseService.getAll().subscribe((res) => {
            this.warehouses = res.data;
        });
    }

    onRemoveRowClick(index) {
        this.goodPositions.splice(index, 1);
    }

    onAddNewRow() {
        this.goodPositions.push({});
    }

    filterShelvesByWarehouse(wareHouseCode: string): [] {
        let warehouse = this.warehouses.find(x => x.code == wareHouseCode);
        let result = this.wareHouseShelves.filter(x => x.wareHouseId == warehouse?.id);
        return result;
    }

    filterDeskFloorsByShelve(wareHouseShelveId: number): [] {
        let result = this.deskFloors.filter(x => x.wareHouseShelveId == wareHouseShelveId);
        return result;
    }

    filterPositionByFloor(floorId: number): [] {
        let result = this.positions.filter(x => x.wareHouseFloorId == floorId);
        return result;
    }
}
