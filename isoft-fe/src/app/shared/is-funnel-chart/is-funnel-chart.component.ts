import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { IsFunnelChartModel } from './is-funnel-chart.model';

@Component({
    selector: 'is-funnel-chart',
    templateUrl: './is-funnel-chart.component.html',
    styles: [
        `
            :host {
                width: 70%;
            }

            .is-funnel-chart {
                padding-top: 10px;

                .labels {
                    padding-top: 2px;
                    max-height: 30%;
                    overflow-y: auto;

                    .label {
                        &__box-color {
                            width: 10px;
                            height: 10px;
                        }

                        &__text {
                            padding-left: 2px;
                            width: calc(100% - 12px);
                            line-height: 15px;
                            font-size: 13px;
                        }
                    }
                }

                .list {
                    height: 70%;
                    &__item {
                        height: 15px;
                        margin-bottom: 5px;
                        border-radius: 20px;
                        color: white;
                        font-size: 1rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }
            }
        `,
    ],
})
export class IsFunnelChartComponent implements OnInit, OnChanges {
    @Input() data: IsFunnelChartModel;
    @Input() height: string;

    widthPerItem: string;
    marginBottomPerItem: string;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.data) {
            this.widthPerItem = (100 / this.data.data.length) * 0.7 + '%';
            this.marginBottomPerItem =
                (100 / (this.data.data.length - 1)) * 0.12 + '%';
        }
    }
    ngOnInit() {}
}
