import { Component, HostListener, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { NewsModel } from '../../../models/web-setting/news.model';
import { SocialModel } from '../../../models/web-setting/social.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../utilities/app-util';
import { SocialService } from 'src/app/service/web-setting/social.service';
@Component({
    selector: 'app-social-network-web',
    templateUrl: './social-network-web.component.html',
    styles: [``],
})
export class SocialNetworkWebComponent implements OnInit {
    display: boolean = false;
    formData = undefined;
    loading: boolean = false;
    result: TypeData<SocialModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 1,
        pageSize: 20,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly socialService: SocialService,
    ) { }

    ngOnInit(): void { }
    getSocials(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.socialService.getPagingSocial(this.param).subscribe((res) => {
            AppUtil.scrollToTop()
            this.result = res
        }, error => {
            this.messageService.add({ severity: 'error', detail: 'Lỗi lấy dữ liệu' })
        })
    }

    onAddSocial() {
        this.display = true;
        this.formData = undefined;
    }

    onEditSocial(item) {
        this.getDetail(item.id).subscribe((res) => {
            this.formData = res;
            this.display = true;
        });
       
    }
    getDetail(id) {
        return this.socialService.getDetail(id)
    }
    getSocialDetail(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteSocial(id) {
        this.confirmationService.confirm({
            message: "Bạn muốn xóa mạng xã hội này",
            accept: () => {
                this.socialService
                    .deleteSocial(id)
                    .subscribe((response: any) => {
                        console.log(response)
                        // if (response.status == 200) {
                            this.messageService.add({
                                severity: 'success',
                                detail: 'Xóa thành công',
                            });
                            this.getSocials()
                        } 
                        // else {
                        //     this.messageService.add({
                        //         severity: 'error',
                        //         detail: response.message,
                        //     });
                        // }
                    // }
                    );
            },
        });
    }

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
        this.getSocials();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddSocial();
                break;
        }
    }
}
