export class UrlManager {

   static getQueryParam() {
       const hash = document.location.hash.replace(/^#\/?/, '');

       const queryString = hash.split('?')[1] || '';

       let params = {};

       const re = /([^&=]+)=([^&]*)/g;
       let tokens;

       while (tokens = re.exec(queryString)) {
           params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]
               .replace(/\+/g, ' '));
       }

       return params;
    }
   static checkUserData(params) {

        if (!params.name || !params.lastName || !params.email) {
            location.href = '#/';
        }
    }
}