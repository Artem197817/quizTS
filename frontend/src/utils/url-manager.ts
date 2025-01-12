import { QueryParamsType } from "../types/query-params.type";

export class UrlManager {

   static getQueryParam():QueryParamsType {
       const hash: string = document.location.hash.replace(/^#\/?/, '');

       const queryString: string = hash.split('?')[1] || '';

       let params: QueryParamsType = {};

       const re: RegExp = /([^&=]+)=([^&]*)/g;
       let tokens: RegExpExecArray|null;

       while (tokens = re.exec(queryString)) {
           params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]
               .replace(/\+/g, ' '));
       }

       return params;
    }
 //  static checkUserData(params) {

  //      if (!params.name || !params.lastName || !params.email) {
 //           location.href = '#/';
  //      }
  //  }
}