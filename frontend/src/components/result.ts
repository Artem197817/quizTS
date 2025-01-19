import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import { QueryParamsType } from "../types/query-params.type";
import { PassTestResponse } from "../types/pass-test-response.type";
import { UserInfo } from "../types/type.userInfo";

export class Result {
   private routesParam: QueryParamsType

    constructor() {
        this.routesParam = UrlManager.getQueryParam();
        this.init();
    }

    showResult(result: PassTestResponse) {
        const scopeElement: HTMLElement | null = document.getElementById('result-scope')
        if(scopeElement){
            scopeElement.innerText =
            result.score + '/' + result.total;
        }
       
    }

    async init() {
        const userInfo: UserInfo|null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }
        if (this.routesParam.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routesParam.id +
                    '/result?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    sessionStorage.setItem('testId', result.test_id)
                    this.showResult(result);
                    return;
                }

            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/'
    }

}
