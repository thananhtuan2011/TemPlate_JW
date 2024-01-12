export class JobAndStatusDto {
    jobs: JobDto[];
    statuses: StatusDto[];
}

export class JobDto {
    id: number;
    count: number;
    name: string;
    color: string;
    statusIds: number[];
    isSelect?: boolean;
    isDisable?: boolean;

    init(data?: any) {
        if (data) {
            this.id = data['id'];
            this.name = data['name'];
            this.count = data['count'];
            this.color = data['color'];
            this.statusIds = data['statusIds'];
        }
    }

    static fromJS(data: any): JobDto {
        data = typeof data === 'object' ? data : {};
        let result = new JobDto();
        result.init(data);
        return result;
    }

    get nameAndCount(): string {
        return `${this.name} (${this.count})`;
    }

    get hasStatusIds(): boolean {
        return this.statusIds?.length > 0;
    }

    public hasStatusId(statusId: number): boolean {
        if (!this.hasStatusIds) return false;
        return this.statusIds.indexOf(statusId) != -1;
    }

    public reset() {
        this.isSelect = false;
        this.isDisable = false;
    }
}

export class StatusDto {
    id: number;
    name: string;
    count: number;
    color: string;
    jobIds: number[];
    isSelect?: boolean;
    isDisable?: boolean;

    init(data?: any) {
        if (data) {
            this.id = data['id'];
            this.name = data['name'];
            this.count = data['count'];
            this.color = data['color'];
            this.jobIds = data['jobIds'];
        }
    }

    static fromJS(data: any): StatusDto {
        data = typeof data === 'object' ? data : {};
        let result = new StatusDto();
        result.init(data);
        return result;
    }

    get nameAndCount(): string {
        return `${this.name} (${this.count})`;
    }

    get hasJobIds(): boolean {
        return this.jobIds?.length > 0;
    }

    public hasJobId(jobId: number): boolean {
        if (!this.hasJobIds) return false;
        return this.jobIds.indexOf(jobId) != -1;
    }

    public reset() {
        this.isSelect = false;
        this.isDisable = false;
    }
}
