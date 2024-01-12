import { User } from './user.model';
import { UserTaskRole, UserTaskStatus } from '../utilities/app-enum';

export interface WorkflowModel {
    id?: number;
    name?: string;
    activity?: string;
    deadLine?: Date | string;
    deadLineConverted?: number;
    cratedPerson?: string;
    responsiblePerson?: UserAvatarModel[];
    project?: number;
    tag?: string;
    userCreated?: number;
    viewer?: number;
    isChoose?: boolean | undefined;
    status?: number;
    actualHours?: number;
    colorCode?: string;
    createdDate?: Date;
    dueDate?: Date;
    responsibleUserCreated?: UserAvatarModel;
    dueDateMode?: string;
    createPersons?: UserAvatarModel[];
    joinedPersons?: UserAvatarModel[];
    viewedPersons?: UserAvatarModel[];
    content?: string;
    department?: number;
}

export interface UserAvatarModel {
    fullName?: string;
    avatar?: string;
}

export interface ExpiredModel {
    month?: Date;
    expired?: UserTaskModeList[];
    expiredToday?: UserTaskModeList[];
    expiredCurrentWeek?: UserTaskModeList[];
    expiredNextWeek?: UserTaskModeList[];
    notExpired?: UserTaskModeList[];
}

export interface KanbanModel {
    month?: Date;
    todo?: UserTaskModeList[];
    inProgress?: UserTaskModeList[];
    done?: UserTaskModeList[];
    user?: ResponsiblePerson;
}

export interface ResponsiblePerson {
    fullName?: string;
    avatar?: string;
}

export interface UserTaskFileModel {
    fileId?: string;
    fileName?: string;
}

export interface UserTaskRoleDetailsModel {
    id?: number;
    userTaskRoleId?: UserTaskRole;
    userId?: number;
    userTaskId?: number;
}

export interface UserTaskCheckListModel {
    id?: number;
    userTaskId?: number;
    name?: string;
    fileLink?: string;
    status?: boolean;
}

export interface UserTaskStatusModel {
    userTaskId?: number;
    status?: UserTaskStatus;
}

export interface UserTaskRequestModel {
    page?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    isSort?: boolean;
    startDate?: Date;
    endDate?: Date;
    status?: UserTaskStatus;
    statuses?: UserTaskStatus[];
    departmentId?: number;
    parentProjectId?: number;
    UserCreatedId?: number;
    customerId?: number;
    customerName?: string;
    isStatusForManager?: number;
}

export interface UserTask {
    id?: number;
    name?: string;
    description?: string;
    userCreated?: number;
    createdDate?: Date;
    dueDate?: Date;
    viewAll?: boolean;
    parentId?: number;
    status?: UserTaskStatus;
    isDeleted?: boolean;
    fileLink?: string;
    viewer?: number;
    departmentId?: number;
}

export interface UserTaskModeList {
    id?: number;
    name?: string;
    description?: string;
    userCreated?: number;
    createdDate?: Date;
    dueDate?: Date;
    viewAll?: boolean;
    parentId?: number;
    status?: UserTaskStatus;
    isDeleted?: boolean;
    dueDateMode?: string;
    isExistTask?: boolean;
    orderNo?: number;
    responsiblePerson?: ResponsiblePerson[];
    responsibleUserCreated?: ResponsiblePerson;
    viewer?: number;
    activity?: string;
    fileLinkString?: string;
    fileLink?: UserTaskFileModel[];
    createPerson?: string;
    project?: string;
    actualHours?: number;
    bgName?: string;
    bgDueDate?: string;
    isExpired?: boolean;
}

export interface UserTaskModel {
    id?: number;
    name?: string;
    description?: string;
    userCreated?: number;
    createdDate?: Date;
    dueDate?: Date;
    viewAll?: boolean;
    parentId?: number;
    status?: UserTaskStatus;
    isDeleted?: boolean;
    departmentId?: number;
    checkList?: UserTaskCheckListModel[];
    taskRole?: UserTaskRoleDetailsModel[];
    childTask?: UserTaskModel[];
    fileLink?: UserTaskFileModel[];
    typeWorkId?: number;
    typeWorkName?: string;
    point?: number;
    isProject?: boolean;
}

export interface UserTaskCommentModel {
    id?: number;
    userTaskId?: number;
    userId?: number;
    type?: string;
    comment?: string;
    commentHTML?: any;
    parentId?: number;
    createdDate?: Date;
    fileLink?: UserTaskFileModel[];
    nameOfUser?: string;
    isAllowEdit?: boolean;
    taskRole?: UserTaskRoleDetailsModel[];
}
