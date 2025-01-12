import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import {FormFields} from "../types/form-fields.type";
import {SignupResponseType} from "../types/signup-response.type";
import {LogoutResponseType} from "../types/logout-response.type";

export class Form {
    readonly elementAgree: HTMLInputElement | null;
    private processElement: HTMLElement | null = null;
    readonly page: "login" | "signUp";
    private fields: FormFields[] = [];

    constructor(page: "login" | "signUp") {

        this.page = page;

        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        this.fields = [

            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                valid: false,
            },
        ]

        if (this.page === 'signUp') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[A-Za-zА-Яа-яЁё\s]+$/,
                    valid: false,
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[A-Za-zА-Яа-яЁё\s]+$/,
                    valid: false,
                },
            )
        }


        const that: Form = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }
        })
        this.processElement = document.getElementById('process')
        if (this.processElement) {

            this.processElement.onclick = function () {
                that.processForm()
            }
        }

        if (this.page === 'signUp') {
            this.elementAgree = document.getElementById('agree') as HTMLInputElement;
            if (this.elementAgree) {
                this.elementAgree.onchange = function () {
                    that.validateForm();
                }
            }
        }
    }


    private validateField(field: FormFields, element: HTMLInputElement): void {
        if (element.parentNode) {
            if (!element.value || !element.value.match(field.regex)) {
                (element.parentNode as HTMLElement).style.borderColor = 'red';
                field.valid = false;
            } else {
                (element.parentNode as HTMLElement).removeAttribute('style');
                field.valid = true;
            }
        }

        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);
        if (this.elementAgree) {
            const isValid: boolean = this.elementAgree ? this.elementAgree.checked && validForm : validForm;
            if (this.processElement) {
                if (isValid) {
                    this.processElement.removeAttribute('disabled');
                } else {
                    this.processElement.setAttribute('disabled', 'disabled');
                }
                return isValid;
            }
        }
    }

   private async processForm():Promise<void> {


        if (this.validateForm) {

            const email:string|undefined = this.fields.find(item => item.name === 'email')?.element?.value;
            const password:string|undefined  = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signUp') {
                try {
                    const result:SignupResponseType = await CustomHttp.request('http://localhost:3003/api/signup', 'POST',
                        {
                            name: this.fields.find(item => item.name === 'name')?.element?.value,
                            lastName: this.fields.find(item => item.name === 'lastName')?.element?.value,
                            email: email,
                            password: password,
                        });


                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }

                } catch (error) {
                    console.log(error);
                    return;
                }

            }
            try {
                const result:LogoutResponseType = await CustomHttp.request('http://localhost:3003/api/login', 'POST',
                    {
                        email: email,
                        password: password,
                    });


                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken || !result.fullName || !result.userId) {
                        throw new Error(result.message);
                    }
                    Auth.setToken(result.accessToken, result.refreshToken)
                    console.log(result)
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId,
                        email: result.email,
                    })
                    location.href = '#/choice';
                }

            } catch (error) {
                console.log(error);
            }


        }
    }

}

