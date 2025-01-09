import {Form} from "./components/form";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Answer} from "./components/answer";
import {Auth} from "./services/auth";
import {TypeRoute} from "./types/type.route";

export class Router{
    private contentElement: HTMLElement | null;
    private linkStyles: HTMLElement | null;
    private profileElement: HTMLElement | null;
    private profileUserName: HTMLElement | null;
    private pageTitle: HTMLElement | null;
    private routes: TypeRoute[];


    constructor(){
       this.contentElement = document.getElementById('content');
       this.linkStyles = document.getElementById('styles');
       this.profileElement = document.getElementById('profile');
       this.profileUserName = document.getElementById('profile-user');
       this.pageTitle = document.getElementById('page-title')

        this.routes=[
            {
                routes: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'styles/index.css',
                load: () =>{}
            },
            {
                routes: '#/signUp',
                title: 'Регистрация',
                template: 'templates/signUp.html',
                styles: 'styles/form.css',
                load: () =>{
                    new Form('signUp');
                }
            },
            {
                routes: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () =>{
                    new Form('login');
                }
            },
            {
                routes: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'styles/choice.css',
                load: () =>{
                    new Choice();
                }
            },
            {
                routes: '#/test',
                title: 'Тест',
                template: 'templates/test.html',
                styles: 'styles/test.css',
                load: () =>{
                    new Test();
                }
            },
            {
                routes: '#/result',
                title: 'Результаты теста',
                template: 'templates/result.html',
                styles: 'styles/result.css',
                load: () =>{
                    new Result();
                }
            },
            {
                routes: '#/answer',
                title: 'Ответы',
                template: 'templates/answer.html',
                styles: 'styles/answer.css',
                load: () =>{
                    new Answer();
                }
            },
        ];
    }
public async openRoute():Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if(urlRoute === '#/logout'){
           await Auth.logout();
            window.location.href = "#/";
            return;
        }

    const newRoute:TypeRoute | undefined = this.routes.find(item =>{
        return item.routes === urlRoute;
    })
    if(!newRoute){
    window.location.href = "#/";
    return
    }

    if(!this.contentElement || !this.linkStyles || !this.profileElement || !this.profileUserName
    || !this.pageTitle) {
        if(urlRoute === '#/'){
            return
        } else {
            window.location.href = "#/";
            return 
        }
    }
        this.contentElement.innerHTML = await fetch(newRoute.template)
            .then(response => response.text());

        this.linkStyles.setAttribute('href', newRoute.styles);
        this.pageTitle.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo()
        const accessToken: string = localStorage.getItem(Auth.accessTokenKey);

        if (accessToken && userInfo) {

            this.profileElement.style.display = 'flex';
            this.profileUserName.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load();

}
}