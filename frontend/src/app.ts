import {Router} from "./router";

class App {
    private router: Router;
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', () => {
            this.router.openRoute();
        });
        window.addEventListener('popstate', () => {
            this.router.openRoute();
        });
    }

}
(new App())