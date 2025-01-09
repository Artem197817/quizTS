import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";

export class Result {


    constructor() {
        this.routesParam = UrlManager.getQueryParam();
        this.init();
    }

    showResult(result) {
        document.getElementById('result-scope').innerText =
            result.score + '/' + result.total;
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/'
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
