export interface WorkflowStatus {
    id?: number;
    name: string;
    description?: string;
    companyId?: number;
    statusDetect?: boolean;
    color: string;
    type: number;
}
