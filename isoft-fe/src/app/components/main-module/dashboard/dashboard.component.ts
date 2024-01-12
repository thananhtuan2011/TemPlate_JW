import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import { AuthData } from 'src/app/models/auth.model';
import { Product } from 'src/app/models/product';
import { ConfigService } from 'src/app/service/system-setting/app.config.service';
import { ProductService } from 'src/app/service/productservice';
import MiniSearch from 'minisearch';
import { AppConfig } from 'src/app/configs/appconfig';
import AppConstant from '../../../utilities/app-constants';
import { DashboardService } from '../../../service/dashboard.service';

@Component({
    templateUrl: './dashboard.component.html',
    styles: [
        `
            .card-hover {
                cursor: pointer;
            }

            .card {
                padding: 0.75rem;
            }
        `,
    ],
})
export class DashboardComponent implements OnInit {
    items: MenuItem[];

    products: Product[];

    subscription: Subscription;

    config: AppConfig;

    public loading: boolean = false;
    isMobile = screen.width <= 1199;
    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
    };

    authUser: AuthData;

    basicData: any;

    basicOptions: any;

    multiAxisData: any;

    chartOptions: any;

    multiAxisOptions: any;

    stackedData: any;

    stackedOptions: any;

    horizontalOptions: any;

    doughnutData: any;

    showDashboard = false;

    totalNumberReportHome: any;
    constructor(
        private productService: ProductService,
        private authService: AuthService,
        public configService: ConfigService,
        public dashboardService: DashboardService,
    ) {}

    ngOnInit() {
        this.authUser = this.authService.user;
        this.showDashboard = this.authUser.menus.find(
            (x) => x.menuCode === 'TRANGCHU',
        );
        this.config = this.configService.getConfig();
        this.subscription = this.configService.configUpdate$.subscribe(
            (config) => {
                this.config = config;
                this.updateChartOptions();
            },
        );
        this.productService.getProductsSmall().then((data) => {
            this.products = data;
            // hạn chế của search like
            // Khi không đánh index thì tốc độ tìm kiếm chậm.
            // Kết quả tìm kiếm nhiều nhưng độ nhiễu cao, từ đồng nghĩa nhiều.
            // Gặp vấn đề trong tìm kiếm tiếng việt có dấu và không dấu.

            // https://www.npmjs.com/package/minisearch FTS
            // full index search. Sẽ tăng số lượng kết quả search lên
            // ngoài ra kết quả sẽ hiển thị score điểm giống nhau, và tên trường giống

            // ưu điểm FTS
            // Kết quả search trả về nhiều.
            // Khi đánh index thì tốc độ search Nhanh
            // Tối ưu hơn việc sử dụng LIKE khi thao tác với các trường text lớn.
            // Nếu như người dùng nhập “co be mua dong” thì dùng mệnh đề LIKE sẽ không search ra được “Cô bé mùa Đông”, nhưng FTS có thể giải quyết vấn đề này
            let miniSearch = new MiniSearch({
                fields: ['code', 'name'], // fields to index for full-text search
                storeFields: ['id', 'code', 'name'], // fields to return with search results
            });
            miniSearch.addAll(data);
            // search. Sẽ tìm kiếm minisearch field theo từ khóa
            // prefix = true để tự động gán keyword thiếu thành keyword đủ và tìm kiếm
            let results = miniSearch.search('vbb', { prefix: true });
            // autoSuggest. Sẽ tự động gán keyword thiếu thành keyword đủ và tìm kiếm
            // let results = miniSearch.autoSuggest('Earri');
            console.log(data, results);
            // result FTS
            // code: "vbb124btr"
            // id: "1008"
            // match:
            // vbb124btr: ['code']
            // name: "Game Controller"
            // score: 0.9339516396985341
            // terms: ['vbb124btr']
        });

        // Example FTS(full text search)
        // A collection of documents we want to search among
        const documents = [
            {
                id: 1,
                title: 'Moby Dick',
                text: 'Call me Ishmael. Some years ago...',
            },
            {
                id: 2,
                title: 'Zen and the Art of Motorcycle Maintenance',
                text: 'I can see by my watch...',
            },
            {
                id: 3,
                title: 'Neuromancer',
                text: 'The sky above the port was...',
            },
            {
                id: 4,
                title: 'Zen and the Art of Archery',
                text: 'At first sight it must seem...',
            },
            // ...and more
        ];

        // Create the search engine, and set `title` and `text` as searchable fields
        let miniSearch = new MiniSearch({ fields: ['title', 'text'] });

        // Index all documents (this is fast!)
        miniSearch.addAll(documents);

        // Search with default options. It will return the id of the matching documents,
        // along with a relevance score and match information
        miniSearch.search('zen art motorcycle');
        // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]

        // Search only within specific fields
        miniSearch.search('zen', { fields: ['title'] });

        // Boost some fields to give them more importance (here "title")
        miniSearch.search('zen', { boost: { title: 2 } });

        // Prefix search (so that 'moto' will match 'motorcycle')
        miniSearch.search('moto', { prefix: true });

        // Fuzzy search, in this example, with a max edit distance of 0.2 * term length.
        // The mispelled 'ismael' will match 'ishmael'.
        miniSearch.search('ismael', { fuzzy: 0.2 });

        // Get suggestions for a partial search
        miniSearch.autoSuggest('zen ar');
        // => [ { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
        //      { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 } ]

        this.basicData = {
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
            ],
            datasets: [
                {
                    label: 'My First dataset',
                    backgroundColor: '#42A5F5',
                    data: [65, 59, 80, 81, 56, 55, 40],
                },
                {
                    label: 'My Second dataset',
                    backgroundColor: '#FFA726',
                    data: [28, 48, 40, 19, 86, 27, 90],
                },
            ],
        };

        this.multiAxisData = {
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
            ],
            datasets: [
                {
                    label: 'Dataset 1',
                    backgroundColor: [
                        '#EC407A',
                        '#AB47BC',
                        '#42A5F5',
                        '#7E57C2',
                        '#66BB6A',
                        '#FFCA28',
                        '#26A69A',
                    ],
                    yAxisID: 'y',
                    data: [65, 59, 80, 81, 56, 55, 10],
                },
                {
                    label: 'Dataset 2',
                    backgroundColor: '#78909C',
                    yAxisID: 'y1',
                    data: [28, 48, 40, 19, 86, 27, 90],
                },
            ],
        };

        this.multiAxisOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
                tooltips: {
                    mode: 'index',
                    intersect: true,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                        color: '#ebedef',
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#495057',
                    },
                },
            },
        };

        this.horizontalOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
            },
        };

        this.stackedData = {
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
            ],
            datasets: [
                {
                    type: 'bar',
                    label: 'Dataset 1',
                    backgroundColor: '#42A5F5',
                    data: [50, 25, 12, 48, 90, 76, 42],
                },
                {
                    type: 'bar',
                    label: 'Dataset 2',
                    backgroundColor: '#66BB6A',
                    data: [21, 84, 24, 75, 37, 65, 34],
                },
                {
                    type: 'bar',
                    label: 'Dataset 3',
                    backgroundColor: '#FFA726',
                    data: [41, 52, 24, 74, 23, 21, 32],
                },
            ],
        };

        this.stackedOptions = {
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            responsive: true,
            scales: {
                xAxes: [
                    {
                        stacked: true,
                    },
                ],
                yAxes: [
                    {
                        stacked: true,
                    },
                ],
            },
        };

        this.doughnutData = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [300, 50, 100],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                },
            ],
        };

        this.config = this.configService.getConfig();
        this.updateChartOptions();
        this.subscription = this.configService.configUpdate$.subscribe(
            (config) => {
                this.config = config;
                this.updateChartOptions();
            },
        );

        this.dashboardService.getReportHome().subscribe((res) => {
            this.totalNumberReportHome = res;
        });
    }

    updateChartOptions() {
        if (this.config.dark) this.applyDarkTheme();
        else this.applyLightTheme();
    }

    applyDarkTheme() {
        this.basicOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
                y: {
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
            },
        };

        this.horizontalOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
                y: {
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
            },
        };

        this.multiAxisOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef',
                    },
                },
                tooltips: {
                    mode: 'index',
                    intersect: true,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(255,255,255,0.2)',
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#ebedef',
                    },
                },
            },
        };

        this.stackedOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef',
                    },
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#ebedef',
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.2)',
                    },
                },
            },
        };
    }

    applyLightTheme() {
        this.basicOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
            },
        };

        this.horizontalOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
            },
        };

        this.multiAxisOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
                tooltips: {
                    mode: 'index',
                    intersect: true,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                        color: '#ebedef',
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        color: '#495057',
                    },
                },
            },
        };

        this.stackedOptions = {
            plugins: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
            },
        };
    }

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
    }
}
