import {
    AfterViewInit,
    Component,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TypeData } from '../../../models/common.model';
import {
    ExpiredModel,
    KanbanModel,
    UserTaskModeList,
    UserTaskRequestModel,
} from '../../../models/workflow.model';
import { Router } from '@angular/router';
import {
    Calendar,
    CalendarOptions,
    FullCalendarComponent,
} from '@fullcalendar/angular';
import {
    addDays,
    addHours,
    addWeeks,
    compareAsc,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek, startOfYear,
} from 'date-fns';
import { WorkflowService } from '../../../service/workflow.service';
import { DepartmentService } from '../../../service/department.service';
import { UserService } from '../../../service/user.service';
import { Department } from '../../../models/department.model';
import { debounceTime, Subject } from 'rxjs';
import { UserTaskRole, UserTaskStatus } from '../../../utilities/app-enum';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { User } from '../../../models/user.model';
import AppConstants from '../../../utilities/app-constants';
import { UserTaskCommentService } from 'src/app/service/user-task-comment.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../../service/auth.service';
import { CustomerStatusService } from 'src/app/service/customer-status.service';
import {CustomerService} from "../../../service/customer.service";
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styles: [
        `
            .style_prev_kit {
                display: inline-block;
                border: 0;
                position: relative;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(1);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(1);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(1);
                transition: all 200ms ease-in;
                transform: scale(1);
            }

            .style_prev_kit:hover {
                box-shadow: 0 0 40px #000000;
                z-index: 999;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(2);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(2);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(2);
                transition: all 200ms ease-in;
                transform: scale(2);
                cursor: pointer;
            }

            img {
                width: 80px;
                height: 40px;
                border-radius: 4px;
                border: 3px solid var(--primary-color);
            }

            img:hover {
                cursor: pointer;
            }

            .item-panel:hover {
                background-color: var(--surface-100);
            }

            :host ::ng-deep {
                .p-autocomplete .p-autocomplete-input {
                    height: 43px !important;
                }
                .p-tabview .p-tabview-nav {
                    display: none;
                }
                .p-disabled, .p-component:disabled, input[readonly] {
                    opacity: 0.7;
                }
                .p-dialog .p-dialog-header .p-dialog-header-icon {
                    right: 8px;
                    position: absolute;
                }
                .p-avatar.p-avatar-circle img {
                    display: block !important;
                }
                .p-accordion .p-accordion-header .p-accordion-header-link img {
                    display: none;
                }
                .p-dialog .p-dialog-header {
                    background-color: var(--blue-400);
                    justify-content: flex-start;
                }
                @media screen and (max-width: 768px) {
                    .fc .fc-toolbar-title {
                        font-size: 1em;
                    }

                    .fc.fc-theme-standard .fc-toolbar .fc-today-button {
                        display: none;
                    }

                    .p-dialog .p-dialog-header, .p-dialog .p-dialog-content {
                        padding: 6px 8px;
                    }

                    .p-panel.p-panel-toggleable .p-panel-header {
                        min-height: auto;
                    }

                    img {
                        max-width: 100% !important;
                    }

                    .p-tabmenu .p-tabmenu-nav .p-tabmenuitem {
                        width: 50px;
                    }
                    .ql-editor {
                        padding: 0 !important;
                    }

                    .p-editor-container .p-editor-content.ql-snow {
                        height: 80px !important;
                    }

                    .p-buttonset .p-button {
                        padding: 4px !important;
                    }
                }

                .p-accordion .p-accordion-header .p-accordion-header-link {
                    padding: 0.25rem;
                }

                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 0;
                }

                .p-calendar {
                    width: 100%;
                }

                .p-tabview .p-tabview-panels {
                    height: 500px;
                    padding: 2px;
                }

                .p-dialog {
                    max-width: 98%;
                }
            }
        `,
    ],
    providers: [ConfirmationService],
})
export class WorkflowComponent implements OnInit, AfterViewInit {
    appUtil = AppUtil;
    appConstant = AppConstants;
    display: boolean = false;
    showFormDialog: boolean = false;
    activeDialog = 0;
    formData: any = {};
    @ViewChild('op', { static: false }) overlayPanel: any;
    serverImg = environment.serverURLImage + '/';
    UserTaskStatusEnum = UserTaskStatus;
    isShowInfo = false;
    selectedItem: any = {};
    items: MenuItem[] = [
        {
            id: '1',
            label: this.appMain.isDesktop() ? 'Danh sách' : '',
            icon: 'pi pi-fw pi-book',
            command: (event) => {
                this.activeItem = event.item;
                this.getWorkList();
            },
        },
        {
            id: '4',
            label: this.appMain.isDesktop() ? 'Kanban' : '',
            icon: 'pi pi-fw pi-chart-line',
            command: (event) => {
                this.activeItem = event.item;
                this.getWorkListKanban();
            },
        },
        {
            id: '5',
            label: this.appMain.isDesktop() ? 'Dự án' : '',
            icon: 'pi pi-fw pi-briefcase',
            command: (event) => {
                this.activeItem = event.item;
                this.getListProjectParent();
            },
        },
        {
            id: '2',
            label: this.appMain.isDesktop() ? 'Hạn chót' : '',
            icon: 'pi pi-fw pi-clock',
            command: (event) => {
                this.activeItem = event.item;
                this.getWorkListExpired();
            },
        },
        {
            id: '3',
            label: this.appMain.isDesktop() ? 'Lịch' : '',
            icon: 'pi pi-fw pi-calendar',
            command: (event) => {
                this.activeItem = event.item;
                this.calendarOption.height = 'auto';
                this.getWorkListCalendar();
            },
        },
    ];

    reviewStatusItems: any = [
        { value: 1, label: 'Chưa duyệt' },
        { value: 2, label: 'Cần làm lại' },
        { value: 3, label: 'Đã duyệt' },
    ];

    reviewStatus: any = 0;

    activeItem: MenuItem;
    loading: boolean = false;
    sortFields: any[] = [];
    sortTypes: any[] = [];
    selectedJob: UserTaskModeList;
    selectedImages: any[] = [];
    result: TypeData<UserTaskModeList> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };

    parentProjectResult: TypeData<UserTaskModeList> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };
    param: UserTaskRequestModel = {
        page: 1,
        pageSize: 10,
    };
    exportParam: UserTaskRequestModel = {
        searchText: '',
        startDate: startOfYear(new Date()),
        endDate: endOfMonth(new Date()),
        status: null,
        departmentId: null,
        parentProjectId: null,
        isStatusForManager: null,
        customerName: '',
        customerId: 0
    };
    status = [];
    departments: Department[] = [];
    subjectDept = new Subject<string>();
    userTaskImg = environment.serverURLImage + '/Uploads/usertask/';

    expiredWork: ExpiredModel = {
        month: new Date(),
        expired: [],
        expiredToday: [],
        expiredCurrentWeek: [],
        expiredNextWeek: [],
        notExpired: [],
    };
    kanbanWorks: KanbanModel[] = [];
    draggedJob: UserTaskModeList;

    employees: User[] = [];

    events: any[] = [];
    calendarOption: CalendarOptions;
    calendarApi: Calendar;
    users: User[] = [];

    displayBasic: boolean | undefined;
    responsiveOptions: any[] = [
        {
            breakpoint: '1500px',
            numVisible: 5
        },
        {
            breakpoint: '1024px',
            numVisible: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];
    statusItems: any[] = [];
    @ViewChild('calendar') calendarComponent: FullCalendarComponent;

    constructor(
        public appMain: AppMainComponent,
        private router: Router,
        private workflowService: WorkflowService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private readonly departmentService: DepartmentService,
        private readonly userService: UserService,
        private sanitizer: DomSanitizer,
        private confirmationService: ConfirmationService,
        private readonly authService: AuthService,
        private userTaskCommentService: UserTaskCommentService,
        private readonly customerStatusService: CustomerStatusService,
        private readonly customerService: CustomerService

    ) { }

    ngAfterViewInit(): void {
        this.calendarApi = this.calendarComponent?.getApi();
        this.calendarOption.height = '0';
    }

    getUsers() {
        this.userService.getAllUserActive().subscribe({
            next: (res) => {
                this.users =
                    res?.data?.map((user) => {
                        return {
                            ...user,
                            avatar: this.serverImage + user.avatar,
                        };
                    }) || [];
            },
            error: () => {
                this.users = [];
            },
        });
    }

    getUserById(id: number) {
        return this.users.find(x => x.id === id);
    }

    ngOnInit(): void {
        this.getUsers();
        this.getStatus();
        this.activeItem = this.items[0];
        this.status = [
            {
                value: UserTaskStatus.OPENING,
                name: 'Mới tạo',
            },
            {
                value: UserTaskStatus.DOING,
                name: 'Đang làm',
            },
            {
                value: UserTaskStatus.REVIEWING,
                name: 'Chờ đánh giá',
            },
            {
                value: UserTaskStatus.PAUSE,
                name: 'Tạm dừng',
            },
            {
                value: UserTaskStatus.COMPLETE,
                name: 'Hoàn thành',
            },
        ];
        // @ts-ignore
        this.exportParam?.status = [UserTaskStatus.OPENING, UserTaskStatus.DOING, UserTaskStatus.PAUSE, UserTaskStatus.REVIEWING];
        this.getWorkList();
        this.getDepartments();
        this.subjectDept.pipe(debounceTime(500)).subscribe((value) => {
            this.getDepartments(value);
        });
        this.calendarOption = {
            initialDate: new Date(),
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay',
            },
            buttonText: {
                today: 'Hôm nay',
                month: 'Tháng',
                week: 'Tuần',
                day: 'Ngày',
            },
            titleFormat: {
                month: '2-digit',
                year: 'numeric',
            },
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            events: this.events,
            eventsSet: (event) => {
                // this.onChangeCalendar()
                // this.loadEventCalendar()
            },
        };
        this.getListProjectParent();
        this.getAllUserActive();
        if (AppUtil.getStorage('customerIdPassing')) {
            this.onAddWorkflow();
        }
    }

    getStatus() {
        this.customerStatusService
            .getAllCustomerStatus(1)
            .subscribe((res: any) => {
                this.statusItems = res.data
            });
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    first = 0;
    isShowForm = false;
    getWorkList(event?: any) {
        this.loading = true;
        const _param = {
            page: Number(event?.first || 0) / Number(event?.rows || 1) + 1,
            pageSize: event?.rows || 10,
            startDate: this.exportParam?.startDate?.toISOString(),
            endDate: this.exportParam?.endDate?.toISOString(),
            statuses: this.exportParam?.status,
            departmentId: this.exportParam?.departmentId,
            parentProjectId: this.exportParam?.parentProjectId || 0,
            UserCreatedId: this.exportParam?.UserCreatedId || 0,
            isStatusForManager: this.exportParam?.isStatusForManager || 0,
            customerId: this.exportParam?.customerId || 0,
            searchText: this.exportParam?.searchText || ''
        };
        if (this.isShowForm) {
            this.isShowForm = false;
            _param.page = this.param.page;
            _param.pageSize = this.param.pageSize;
            this.first = this.result.totalItems;
        } else {
            this.param.page = _param.page;
            this.param.pageSize = _param.pageSize;
        }

        if ([undefined, null].includes(this.exportParam?.status))
            delete _param.statuses;
        if (!this.exportParam?.departmentId) delete _param.departmentId;
        this.workflowService.getListMode(_param).subscribe(
            (response) => {
                console.log(response);
                this.loading = false;
                this.result = response;
                const data =
                    response?.data?.reduce((arr, item) => {
                        let bgName = '';
                        switch (item.status) {
                            case UserTaskStatus.REVIEWING:
                                bgName = 'bg-pink-400';
                                break;
                            case UserTaskStatus.DOING:
                                bgName = 'bg-green-400';
                                break;
                            case UserTaskStatus.PAUSE:
                                bgName = 'bg-orange-400';
                                break;
                            case UserTaskStatus.COMPLETE:
                                bgName = 'bg-blue-400';
                                break;
                            default:
                                bgName = 'surface-400';
                                break;
                        }
                        let bgDueDate = 'bg-bluegray-400';
                        if (
                            compareAsc(
                                new Date(item.dueDate),
                                startOfDay(new Date()),
                            ) === -1
                        )
                            bgDueDate = 'bg-pink-400';

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfDay(new Date()),
                            ) === 0
                        )
                            bgDueDate = 'bg-yellow-400';

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfDay(addDays(new Date(), 1)),
                            ) > -1 &&
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                endOfWeek(new Date()),
                            ) < 1
                        )
                            bgDueDate = 'bg-green-400';

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfWeek(addWeeks(new Date(), 1)),
                            ) > -1 &&
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                endOfWeek(addWeeks(new Date(), 1)),
                            ) < 1
                        )
                            bgDueDate = 'bg-teal-400';
                        if (!item.dueDate) bgDueDate = 'bg-white';
                        arr.push({
                            ...item,
                            bgName: bgName,
                            bgDueDate: bgDueDate,
                        });
                        return arr;
                    }, []) || [];
                this.result.data = data;
            },
            (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    getWorkListExpired(event?: any) {
        this.loading = true;
        const _param = {
            page: 1,
            pageSize: event?.first || 0 + event?.rows || 0 || 10,
            startDate: this.exportParam?.startDate?.toISOString(),
            endDate: this.exportParam?.endDate?.toISOString(),
            status: this.exportParam?.status,
            departmentId: this.exportParam?.departmentId,
            isExpired: true,
        };
        if ([undefined, null].includes(this.exportParam?.status))
            delete _param.status;
        if (!this.exportParam?.departmentId) delete _param.departmentId;
        this.workflowService.getListMode(_param).subscribe(
            (response) => {
                this.loading = false;
                const _expired = [];
                const _expiredToday = [];
                const _expiredCurrentWeek = [];
                const _expiredNextWeek = [];
                const _notExpired = [];
                response?.data?.map((item) => {
                    if (!item.dueDate) {
                        _notExpired.push({
                            ...item,
                            responsibleUserCreated: {
                                ...item.responsibleUserCreated,
                                avatar:
                                    this.serverImg +
                                    item.responsibleUserCreated?.avatar,
                            },
                        });
                    } else {
                        if (
                            compareAsc(
                                new Date(item.dueDate),
                                startOfDay(new Date()),
                            ) === -1
                        )
                            _expired.push({
                                ...item,
                                responsibleUserCreated: {
                                    ...item.responsibleUserCreated,
                                    avatar:
                                        this.serverImg +
                                        item.responsibleUserCreated?.avatar,
                                },
                            });

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfDay(new Date()),
                            ) === 0
                        )
                            _expiredToday.push({
                                ...item,
                                responsibleUserCreated: {
                                    ...item.responsibleUserCreated,
                                    avatar:
                                        this.serverImg +
                                        item.responsibleUserCreated?.avatar,
                                },
                            });

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfDay(addDays(new Date(), 1)),
                            ) > -1 &&
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                endOfWeek(new Date()),
                            ) < 1
                        )
                            _expiredCurrentWeek.push({
                                ...item,
                                responsibleUserCreated: {
                                    ...item.responsibleUserCreated,
                                    avatar:
                                        this.serverImg +
                                        item.responsibleUserCreated?.avatar,
                                },
                            });

                        if (
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                startOfWeek(addWeeks(new Date(), 1)),
                            ) > -1 &&
                            compareAsc(
                                startOfDay(new Date(item.dueDate)),
                                endOfWeek(addWeeks(new Date(), 1)),
                            ) < 1
                        )
                            _expiredNextWeek.push({
                                ...item,
                                responsibleUserCreated: {
                                    ...item.responsibleUserCreated,
                                    avatar:
                                        this.serverImg +
                                        item.responsibleUserCreated?.avatar,
                                },
                            });
                    }
                    this.expiredWork.expired = _expired;
                    this.expiredWork.expiredToday = _expiredToday;
                    this.expiredWork.expiredCurrentWeek = _expiredCurrentWeek;
                    this.expiredWork.expiredNextWeek = _expiredNextWeek;
                    this.expiredWork.notExpired = _notExpired;
                });
            },
            (err) => { },
        );
    }

    eventColors: string[] = [
        'blue',
        'green',
        'cyan',
        'pink',
        'indigo',
        'teal',
        'orange',
        'bluegray',
        'purple',
        'gray',
        'primary',
    ];

    getWorkListCalendar(param?: UserTaskRequestModel) {
        this.loading = true;
        const _param = {
            page: 0,
            startDate:
                param?.startDate?.toISOString() ||
                this.exportParam?.startDate?.toISOString(),
            endDate:
                param?.endDate?.toISOString() ||
                this.exportParam?.endDate?.toISOString(),
            status: this.exportParam?.status || null,
            departmentId: this.exportParam?.departmentId || null,
        };
        if ([undefined, null].includes(this.exportParam?.status))
            delete _param.status;
        if (!this.exportParam?.departmentId) delete _param.departmentId;

        let color = 0;

        this.workflowService.getListMode(_param).subscribe((response) => {
            this.loading = false;
            const _events = [];
            response?.data?.map((item) => {
                _events.push({
                    id: item.id,
                    title: item.name,
                    start: addHours(
                        new Date(item.createdDate),
                        -1 * Number(item.actualHours | 0),
                    ),
                    end: new Date(item.dueDate || Date.now()),
                    backgroundColor: this.eventColors[color],
                });

                color++;
                if (color == this.eventColors.length) {
                    color = 0;
                }
            });

            this.calendarOption.events = _events;
        });
    }

    getWorkListKanban(event?: any) {
        this.loading = true;
        const _param = {
            page:
                Math.floor(
                    Number(event?.first || 0) / Number(event?.rows | 1),
                ) || 1,
            pageSize: event?.rows || 10,
            startDate: this.exportParam?.startDate?.toISOString(),
            endDate: this.exportParam?.endDate?.toISOString(),
            status: this.exportParam?.status,
            departmentId: this.exportParam?.departmentId,
        };
        if ([undefined, null].includes(this.exportParam?.status))
            delete _param.status;
        if (!this.exportParam?.departmentId) delete _param.departmentId;
        this.workflowService.getListMode(_param).subscribe((response) => {
            this.loading = false;
            const data = _.groupBy(response.data, ['createPerson']);
            const _kanbanWorks = [];
            Object.keys(data)?.map((key) => {
                const values = data[key] as UserTaskModeList[];
                _kanbanWorks.push({
                    user: {
                        ...values?.[0]?.responsibleUserCreated,
                        avatar:
                            this.serverImg +
                            values?.[0]?.responsibleUserCreated?.avatar,
                    },
                    todo:
                        values?.filter((item) =>
                            [
                                UserTaskStatus.OPENING,
                                UserTaskStatus.PAUSE,
                            ].includes(item.status),
                        ) || [],
                    inProgress:
                        values?.filter(
                            (item) => item.status === UserTaskStatus.DOING,
                        ) || [],
                    // sửa lại lấy giá trị chờ đánh giá (reviewing)
                    done:
                        values?.filter(
                            (item) => item.status === UserTaskStatus.REVIEWING,
                        ) || [],
                });
            });
            if (!this.kanbanWorks?.length) this.kanbanWorks = _kanbanWorks;
            else
                this.kanbanWorks?.map((kanban) => {
                    const newValue = _kanbanWorks?.find(
                        (kb) => kb.user?.fullName === kanban?.user.fullName,
                    );
                    const todoIds = kanban?.todo?.map((item) => {
                        return item.id;
                    });
                    const inProgressIds = kanban?.inProgress?.map((item) => {
                        return item.id;
                    });
                    const doneIds = kanban?.done?.map((item) => {
                        return item.id;
                    });
                    kanban.todo = [
                        ...kanban?.todo,
                        ...(newValue?.todo?.filter(
                            (x) => !todoIds.includes(x.id),
                        ) || []),
                    ];
                    kanban.inProgress = [
                        ...kanban?.inProgress,
                        ...(newValue?.inProgress?.filter(
                            (x) => !inProgressIds.includes(x.id),
                        ) || []),
                    ];
                    kanban.done = [
                        ...kanban?.done,
                        ...(newValue?.done?.filter(
                            (x) => !doneIds.includes(x.id),
                        ) || []),
                    ];
                });
        });
    }

    getListProjectParent(event?: any) {
        const param = {
            page: Number(event?.first || 0) / Number(event?.rows || 1) + 1,
            pageSize: event?.rows || 10,
        };
        this.workflowService.getListProjectParent(param).subscribe(
            (res) => {
                this.parentProjectResult = res;
                const data = res.data?.map((item, index) => {
                    return {
                        no: (param.page - 1) * param.pageSize + index + 1,
                        ...item,
                        children: [],
                    };
                });
                this.parentProjectResult.data = data;
            },
            (err) => { },
        );
    }

    getChildren(expanded: boolean, item: any): void {
        if (expanded) return;
        this.workflowService
            .getListProjectChildren({ parentId: item.id })
            .subscribe((res) => {
                const data =
                    res?.map((child, index) => {
                        return {
                            no: index + 1,
                            ...child,
                        };
                    }) || [];
                item.children = data;
            });
    }

    onAddWorkflow() {
        this.display = true;
        this.isShowForm = true;
        this.formData = {};
    }

    dragStartTodo(job: UserTaskModeList) {
        this.draggedJob = job;
    }

    dragEndTodo() {
        // this.draggedJob = null
    }

    dropTodo(event) {
        if (
            this.draggedJob &&
            this.draggedJob.status !== UserTaskStatus.OPENING
        ) {
            this.loading = true;
            this.workflowService
                .statusTask({
                    userTaskId: this.draggedJob.id,
                    status: UserTaskStatus.PAUSE,
                })
                .subscribe(
                    (res) => {
                        this.loading = false;
                        if (res) {
                            const kanbanWork = this.kanbanWorks.find(
                                (kb) =>
                                    kb.user?.fullName ===
                                    this.draggedJob?.responsibleUserCreated
                                        ?.fullName,
                            );
                            const kanbanWorkIndex =
                                this.kanbanWorks.indexOf(kanbanWork);
                            kanbanWork.todo = [
                                ...(kanbanWork.todo || []),
                                {
                                    ...this.draggedJob,
                                    status: UserTaskStatus.PAUSE,
                                },
                            ];
                            switch (this.draggedJob?.status) {
                                case UserTaskStatus.DOING:
                                    kanbanWork.inProgress =
                                        kanbanWork.inProgress.filter(
                                            (x) => x.id !== this.draggedJob.id,
                                        );
                                    break;
                                case UserTaskStatus.COMPLETE:
                                    kanbanWork.done = kanbanWork.done.filter(
                                        (x) => x.id !== this.draggedJob.id,
                                    );
                                    break;
                            }
                            this.kanbanWorks[kanbanWorkIndex] = kanbanWork;
                        }
                        this.draggedJob = null;
                    },
                    (err) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            detail: err,
                        });
                        this.draggedJob = null;
                    },
                );
        }
    }

    dragStartInProgress(job: UserTaskModeList) {
        this.draggedJob = job;
    }

    dragEndInProgress() {
        // this.draggedJob = null
    }

    dropInProgress(event) {
        if (
            this.draggedJob &&
            this.draggedJob.status !== UserTaskStatus.DOING
        ) {
            this.loading = true;
            this.workflowService
                .statusTask({
                    userTaskId: this.draggedJob.id,
                    status: UserTaskStatus.DOING,
                })
                .subscribe(
                    (res) => {
                        this.loading = false;
                        if (res) {
                            const kanbanWork = this.kanbanWorks.find(
                                (kb) =>
                                    kb.user?.fullName ===
                                    this.draggedJob?.responsibleUserCreated
                                        ?.fullName,
                            );
                            const kanbanWorkIndex =
                                this.kanbanWorks.indexOf(kanbanWork);
                            kanbanWork.inProgress = [
                                ...(kanbanWork.inProgress || []),
                                {
                                    ...this.draggedJob,
                                    status: UserTaskStatus.DOING,
                                },
                            ];
                            switch (this.draggedJob?.status) {
                                case UserTaskStatus.OPENING:
                                case UserTaskStatus.PAUSE:
                                    kanbanWork.todo = kanbanWork.todo.filter(
                                        (x) => x.id !== this.draggedJob.id,
                                    );
                                    break;
                                case UserTaskStatus.COMPLETE:
                                    kanbanWork.done = kanbanWork.done.filter(
                                        (x) => x.id !== this.draggedJob.id,
                                    );
                                    break;
                            }
                            this.kanbanWorks[kanbanWorkIndex] = kanbanWork;
                        }
                        this.draggedJob = null;
                    },
                    (err) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            detail: err,
                        });
                        this.draggedJob = null;
                    },
                );
        }
    }

    dragStartDone(job: UserTaskModeList) {
        this.draggedJob = job;
    }

    dragEndDone() {
        // this.draggedJob = null
    }
    testLog = (item) => {
        console.log(item);
    }
    dropDone(event) {
        if (
            this.draggedJob &&
            this.draggedJob.status === UserTaskStatus.DOING
        ) {
            this.loading = true;
            this.workflowService
                .statusTask({
                    userTaskId: this.draggedJob.id,
                    status: UserTaskStatus.COMPLETE,
                })
                .subscribe(
                    (res) => {
                        this.loading = false;
                        if (res) {
                            const kanbanWork = this.kanbanWorks.find(
                                (kb) =>
                                    kb.user?.fullName ===
                                    this.draggedJob?.responsibleUserCreated
                                        ?.fullName,
                            );
                            const kanbanWorkIndex =
                                this.kanbanWorks.indexOf(kanbanWork);
                            kanbanWork.done = [
                                ...(kanbanWork.done || []),
                                {
                                    ...this.draggedJob,
                                    status: UserTaskStatus.COMPLETE,
                                },
                            ];
                            kanbanWork.inProgress =
                                kanbanWork.inProgress.filter(
                                    (x) => x.id !== this.draggedJob.id,
                                );
                            this.kanbanWorks[kanbanWorkIndex] = kanbanWork;
                        }
                        this.draggedJob = null;
                    },
                    (err) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            detail: err,
                        });
                        this.draggedJob = null;
                    },
                );
        }
    }

    getDepartments(keyword?: string) {
        this.departmentService.getAllDepartmentForTask().subscribe(
            (res) => {
                this.departments = res?.data || [];
            },
            (error) => {
                this.departments = [];
            },
        );
    }

    onFilterDepartment(event: any) {
        if (event) this.subjectDept.next(event.filter);
    }

    exportData() {
        this.loading = true;
        this.workflowService.export(this.exportParam).subscribe(
            (res) => {
                this.loading = false;
                saveAs(
                    res,
                    `Danh_sach_cong_viec_${format(new Date(), 'ddMMyyHHmm')}`,
                );
            },
            (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onCancelForm() {
        this.display = false;
    }

    onDeleteWorkflow() {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Bạn có muốn xóa công việc này?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.loading = true;
                this.workflowService.delete(this.selectedJob.id).subscribe(
                    (res) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Xóa thành công',
                        });
                        this.getWorkList();
                    },
                    (error) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            detail: 'Xóa thất bại',
                        });
                    },
                );
            },
            reject: () => { },
        });
    }

    onEditWorkflow(isShowForm = true) {
        if (isShowForm) {
            this.loading = true;
        }
        this.workflowService.getById(this.selectedJob.id).subscribe(
            (res) => {
                if (res) {
                    const userIds =
                        [
                            res.userCreated,
                            ...(res.taskRole?.map((item) => {
                                return item.userId;
                            }) || []),
                        ] || [];
                    this.userService
                        .getPagingUser({
                            page: 1,
                            pageSize: userIds.length,
                            ids: userIds,
                        })
                        .subscribe(
                            (userResponse) => {
                                this.loading = false;
                                const responsiblePersonIds =
                                    res.taskRole
                                        ?.filter(
                                            (item) =>
                                                item.userTaskRoleId ===
                                                UserTaskRole.RESPONSIBLE,
                                        )
                                        ?.map((per) => per.id) || [];
                                const joinedPersonIds =
                                    res.taskRole
                                        ?.filter(
                                            (item) =>
                                                item.userTaskRoleId ===
                                                UserTaskRole.JOINED,
                                        )
                                        ?.map((per) => per.id) || [];
                                const viewedPersonIds =
                                    res.taskRole
                                        ?.filter(
                                            (item) =>
                                                item.userTaskRoleId ===
                                                UserTaskRole.VIEWER,
                                        )
                                        ?.map((per) => per.id) || [];
                                if (res.dueDate != null) {
                                    res.dueDate = new Date(res.dueDate);
                                }
                                this.formData = {
                                    ...res,
                                    userCreateName: userResponse?.data?.find(
                                        (per) => per.id === res.userCreated,
                                    )?.fullName,
                                    responsiblePerson:
                                        userResponse?.data
                                            ?.filter((per) =>
                                                responsiblePersonIds.includes(
                                                    per.id,
                                                ),
                                            )
                                            ?.map((item) => {
                                                return {
                                                    ...item,
                                                    avatar:
                                                        this.serverImg +
                                                        item.avatar,
                                                };
                                            }) || [],
                                    joinedPersons:
                                        userResponse?.data
                                            ?.filter((per) =>
                                                joinedPersonIds.includes(
                                                    per.id,
                                                ),
                                            )
                                            ?.map((item) => {
                                                return {
                                                    ...item,
                                                    avatar:
                                                        this.serverImg +
                                                        item.avatar,
                                                };
                                            }) || [],
                                    viewedPersons:
                                        userResponse?.data
                                            ?.filter((per) =>
                                                viewedPersonIds.includes(
                                                    per.id,
                                                ),
                                            )
                                            ?.map((item) => {
                                                return {
                                                    ...item,
                                                    avatar:
                                                        this.serverImg +
                                                        item.avatar,
                                                };
                                            }) || [],
                                };
                                if (isShowForm) {
                                    this.display = true;
                                    this.isShowForm = true;
                                }
                                this.overlayPanel.hide();
                            },
                            (err) => {
                                this.loading = false;
                                this.messageService.add({
                                    severity: 'error',
                                    detail: 'error.0',
                                });
                            },
                        );
                }
            },
            (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    detail: 'error.0',
                });
            },
        );
    }

    onPinWorkflow() {
        this.loading = true;
        this.workflowService.pinTask(this.selectedJob.id).subscribe(
            (res) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    detail: 'success.pin',
                });
                this.getWorkList();
            },
            (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    detail: 'error.0',
                });
            },
        );
    }

    onChangeStatusWorkflow(status: UserTaskStatus, isStart = false) {
        if (this.selectedJob.isExistTask && isStart) {
            this.messageService.add({ severity: 'info', detail: this.translateService.instant('info.fail_update_work_flow_status') });
            this.overlayPanel.hide();
            return;
        }
        switch (this.selectedJob.status) {
            case UserTaskStatus.OPENING:
                if (
                    [
                        UserTaskStatus.COMPLETE,
                        UserTaskStatus.PAUSE,
                        UserTaskStatus.OPENING,
                    ].includes(status)
                )
                    return;
                break;
            case UserTaskStatus.DOING:
                if (
                    [UserTaskStatus.DOING, UserTaskStatus.OPENING].includes(
                        status,
                    )
                )
                    return;
                break;
            case UserTaskStatus.PAUSE:
                if (
                    [UserTaskStatus.PAUSE, UserTaskStatus.OPENING].includes(
                        status,
                    )
                )
                    return;
                break;
            case UserTaskStatus.COMPLETE:
                if (
                    [UserTaskStatus.COMPLETE, UserTaskStatus.OPENING].includes(
                        status,
                    )
                )
                    return;
                break;
        }
        this.loading = true;
        this.workflowService
            .statusTask({
                userTaskId: this.selectedJob.id,
                status: status,
            })
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'success',
                        detail: this.translateService.instant('success.update_status'),
                    });
                    this.getWorkList();
                    this.overlayPanel.hide();
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', detail: err });
                    this.overlayPanel.hide();
                }
            });
    }

    onCopyWorkflow() {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Bạn có muốn copy công việc này?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.loading = true;
                this.workflowService.copy(this.selectedJob.id).subscribe(
                    (res) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'success',
                            detail: 'success.copy',
                        });
                    },
                    (err) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            detail: 'error.0',
                        });
                    },
                );
            },
            reject: () => { },
        });
    }

    onChangeCalendar() {
        if (this.calendarApi) {
            let startDate;
            let endDate;
            switch (this.calendarApi.currentData?.currentViewType) {
                case 'dayGridMonth':
                    startDate = startOfMonth(
                        this.calendarApi.currentData?.currentDate,
                    );
                    endDate = endOfMonth(startDate);
                    break;
                case 'dayGridWeek':
                    startDate = startOfWeek(
                        this.calendarApi.currentData?.currentDate,
                    );
                    endDate = endOfWeek(startDate);
                    break;
                case 'dayGridDay':
                    startDate = startOfDay(
                        this.calendarApi.currentData?.currentDate,
                    );
                    endDate = endOfDay(startDate);
                    break;
            }

            this.getWorkListCalendar({
                startDate: startDate,
                endDate: endDate,
            });
        }
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.onSearchUserTask();
        }
    }

    onSearchUserTask(event?: any) {
        switch (this.activeItem.id) {
            case '1':
                this.getWorkList(this.exportParam);
                break;
            case '2':
                break;
            case '3':
                this.onChangeCalendar();
                break;
            case '4':
                break;
        }
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddWorkflow();
                break;
        }
    }

    fileLinks: any[] = [];
    serverUserTaskImg = environment.serverURLImage + '/Uploads/usertask/';
    doAttachFile(event: any): void {
        if (
            this.fileLinks.length >= 4 ||
            event.target?.files.length > 4 ||
            event.target?.files.length + this.fileLinks.length > 4
        ) {
            return;
        }
        for (let i = 0; i < event.target?.files.length; i++) {
            const formData = new FormData();
            formData.append('file', event.target?.files[i]);
            this.userTaskCommentService.uploadFile(formData)
                .subscribe((res: any) => {
                    if (this.fileLinks.length < 4) {
                        this.fileLinks.push(res);
                    }
                });
        }
    }

    onRemoveImages() {
        this.fileLinks = this.fileLinks.filter((x) => !this.selectedImages.includes(x.fileId));
    }

    onImageClick(id: any) {
        // remove or add class name style_prev_kit (css hover)
        let image = document.getElementById(id);
        let isUsingClass = image.classList.contains('style_prev_kit');
        if (isUsingClass) {
            image.classList.remove('style_prev_kit');
            image.classList.add('opacity-custom');
            this.selectedImages = [...this.selectedImages, id];
        } else {
            image.classList.add('style_prev_kit');
            image.classList.remove('opacity-custom');
            this.selectedImages = this.selectedImages.filter((x) => x !== id);
        }
    }

    newComment: any;
    newCommentImage: any;
    serverImage = `${environment.serverURLImage}/`;
    comments: any[] = [];
    onChangeEditor(event) {
        this.newComment = event.htmlValue;
        event?.delta?.ops?.map((item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const formData = new FormData();
                formData.append(
                    'file',
                    new Blob([image.split(',')[1]], { type: 'image/png' }),
                );
                this.userTaskCommentService.uploadFile(formData).subscribe(
                    (res) => {
                        if (res) {
                            this.newCommentImage.push({
                                oldText: image,
                                newLink: this.serverImage + res.fileName,
                            });
                        }
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
            }
        });
    }

    isGetComments = false;
    onGetComments(task) {
        this.isGetComments = true;
        this.workflowService.getById(task.id).subscribe({
            next: (res): void => {
                this.selectedItem = res;
                this.userTaskCommentService.getByTask({ id: task.id }).subscribe(
                    (res) => {
                        this.comments = res?.map((cmt) => {
                            return {
                                ...cmt,
                                commentHTML: this.sanitizer.bypassSecurityTrustHtml(
                                    cmt.comment || '',
                                ),
                            };
                        });
                        this.isGetComments = false;
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(this.translateService, 'error.0'),
                        });
                        this.isGetComments = false;
                    },
                );
            }
        });

    }

    onAddComment() {
        if (this.newCommentImage?.length) {
            this.newCommentImage?.map((cmtImg) => {
                this.newComment.replace(cmtImg.oldText, cmtImg.newLink);
            });
        }
        this.userTaskCommentService
            .add({
                id: 0,
                userTaskId: this.selectedItem.id,
                userId: this.authService.user.id,
                type: 'edit',
                comment: this.newComment,
                parentId: 0,
                createdDate: new Date(),
                fileLink: this.fileLinks,
                nameOfUser: this.authService.user.fullname,
                isAllowEdit: true,
                taskRole: [],
            })
            .subscribe(
                (res) => {
                    if (res) {
                        this.newComment = '';
                        this.fileLinks = [];
                        this.onGetComments(this.selectedItem);
                    }
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    allowShowEditPopup(item) {
        return item['responsiblePerson'].map(x => x.userId).includes(this.authService.user.id);
    }

    filterCustomerName(event) {
        this.getListCustomer(event.query.toLowerCase());
    }

    getListCustomer(searchText: string = '') {
        this.customerService
            .getAllCustomer(searchText)
            .subscribe((res: any) => {
                this.customers = res.data;
                this.filteredCustomers = res.data.map(
                    (item) => `${item.code} | ${item.name}`,
                );
            });
    }

    customers: any[] = [];
    filteredCustomers: any[] = [];
    onCustomerNameSelect(event) {
        if (event) {
            let customer = this.customers.find(
                (x) => x.code === event.split('|')[0].trim(),
            );
            if (customer) {
                this.exportParam.customerId = customer.id;
                this.getWorkList(this.exportParam);
                return;
            }
        } else {
            this.exportParam.customerId = 0;
            this.getWorkList(this.exportParam);
        }
    }
}
