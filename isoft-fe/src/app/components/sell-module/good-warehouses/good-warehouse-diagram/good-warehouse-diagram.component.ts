import { Component, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { GoodWarehouseService } from '../../../../service/good-warehouse.service';
import { WarehouseService } from '../../../../service/warehouse.service';
import { ActivatedRoute } from '@angular/router';
import { WarehouseFloorsService } from '../../../../service/warehouse-floors.service';
import { WarehouseShelvesService } from '../../../../service/warehouse-shelves.service';

@Component({
    selector: 'app-good-warehouse-diagram',
    templateUrl: './good-warehouse-diagram.component.html',
    styleUrls: ['./good-warehouse-diagram.component.scss'],
})
export class GoodWarehouseDiagramComponent implements OnInit {
    tabs: MenuItem[] = [
        {
            id: 'diagram',
            label: 'Sơ đồ',
            icon: 'pi pi-fw pi-sitemap',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: 'report',
            label: 'Báo cáo',
            icon: 'pi pi-fw pi-chart-bar',
            command: (event) => this.onTabSelected(event),
        },
    ];

    tabSelected: MenuItem = this.tabs[0];
    warehouses: any[] = [];
    warehouseId: any;
    shelveId: any;
    floorId: any;
    goodWarehouses: any = [];

    currentType: string = 'warehouse';
    nextType: string = 'shelve';
    prevType: string = '';

    shelve: any = {};
    floor: any = {};
    isInitialFirstTime = true;

    constructor(
        private readonly goodWarehouseService: GoodWarehouseService,
        private readonly warehouseService: WarehouseService,
        private readonly warehouseFloorsService: WarehouseFloorsService,
        private readonly warehouseShelvesService: WarehouseShelvesService,
        private readonly route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.warehouseService.getAll().subscribe((res) => {
            this.warehouses = res.data;

            if (this.warehouses.length <= 0) {
                return;
            }

            this.route.queryParams.subscribe((params) => {
                let type = this.route.snapshot.queryParamMap.get('type');
                this.warehouseId = parseInt(
                    this.route.snapshot.queryParamMap.get('warehouseId'),
                );
                this.shelveId =
                    this.route.snapshot.queryParamMap.get('shelveId');
                this.floorId = this.route.snapshot.queryParamMap.get('floorId');

                if (type != null && type.length > 0) {
                    this.currentType = type;
                    this.getNextType();
                    this.getPrevType();
                }

                if (this.isInitialFirstTime) {
                    this.isInitialFirstTime = false;
                    this.warehouseId = this.warehouses[0].id;
                }

                this.getFloorDetail();
                this.getShelveDetail();
                this.getDiagramData();
            });
        });
    }

    onTabSelected(event: any) {
        this.tabSelected = event.item;
    }

    getFloorDetail() {
        this.floor = null;
        if (this.floorId == null) {
            return;
        }
        this.warehouseFloorsService
            .getWareHouseFloorsDetail(this.floorId)
            .subscribe((response: any) => {
                this.floor = response;
            });
    }

    getShelveDetail() {
        this.shelve = null;
        if (this.shelveId == null) {
            return;
        }
        this.warehouseShelvesService
            .getWareHouseShelvesDetail(this.shelveId)
            .subscribe((response: any) => {
                this.shelve = response;
            });
    }

    getDiagramData() {
        if (this.warehouseId == null) {
            return;
        }

        let warehouse = this.warehouses.find((x) => x.id == this.warehouseId);
        if (warehouse != null) {
            this.goodWarehouseService
                .getGoodWarehouseDiagram(
                    this.warehouseId,
                    this.shelveId,
                    this.floorId,
                    this.currentType,
                )
                .subscribe((res) => {
                    this.goodWarehouses = res.data.items;
                    if (
                        this.currentType != 'warehouse' &&
                        this.goodWarehouses.length > 0
                    ) {
                        this.goodWarehouses = this.goodWarehouses[0].map(
                            (item) => [item],
                        );
                    }
                });
        }
    }

    prepareDiagramTree(data) {
        const { items } = data;

        if (items == null || items.length == 0) {
            return null;
        }

        let nodes: TreeNode[] = [];
        items.forEach((item) => {
            let node: TreeNode = {
                label: item.name,
                expanded: true,
                type: 'person',
                data: {
                    quantity: item.quantity,
                },
            };
            node.children = this.prepareDiagramTree(item);
            nodes.push(node);
        });
        return nodes;
    }

    getNextType() {
        switch (this.currentType) {
            case 'warehouse':
                this.nextType = 'shelve';
                break;
            case 'shelve':
                this.nextType = 'floor';
                break;
        }
    }

    getPrevType() {
        this.prevType = '';
        switch (this.currentType) {
            case 'floor':
                this.prevType = 'shelve';
                break;
            case 'shelve':
                this.prevType = 'warehouse';
                break;
        }
    }

    getQueryParam(id) {
        let params = {
            type: this.nextType,
            warehouseId: this.warehouseId,
            shelveId: this.shelveId,
            floorId: this.floorId,
        };

        if (this.currentType == 'floor') {
            params.type = this.currentType;
            return params;
        }

        switch (this.currentType) {
            case 'warehouse':
                params.shelveId = id;
                break;
            case 'shelve':
                params.floorId = id;
                break;
        }
        return params;
    }

    getBackQueryParam() {
        let params: any = {
            type: this.prevType,
            warehouseId: this.warehouseId,
        };
        switch (this.prevType) {
            case 'shelve':
                params.shelveId = this.shelveId;
                break;
        }
        return params;
    }

    getColorClass(item): string {
        if (item?.quantity > 0) {
            return 'border-green-500';
        }
        // Default color class
        return 'border-orange-500';
    }
}
