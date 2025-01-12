import config from "../../config/config";
import { RefreshResponseType } from "../types/refresh-response.type";
import {UserInfo} from "../types/type.userInfo";


export class Auth {

    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoKey: string = 'userInfo';

    public static setToken(accessToken:string, refreshToken:string): void {

        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);

    }

    public static async processUnAuthResponse(): Promise<boolean> {
        const refreshToken: string|null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })
            if (response && response.ok) {
                const result: RefreshResponseType | null = await response.json();
                if (result && !result.error && result.accessToken && result.refreshToken) {
                    this.setToken(result.accessToken, result.refreshToken)
                    return true;
                }
            }

        }
        this.removeToken();
        location.href = '#/'
        return false;
    }

   public static removeToken(): void {

        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);

    }

   public static async logout(): Promise<boolean>  {
        const refreshToken: string| null = localStorage.getItem(this.refreshTokenKey);
        const response: Response = await fetch(config.host + '/logout', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({refreshToken: refreshToken})
        })
        if (response && response.ok) {
            const result = await response.json();
            if (result && !result.error) {
                Auth.removeToken();
                localStorage.removeItem(Auth.userInfoKey);
                return true;
            }
        }
        return false;
    }

   public static setUserInfo(info: { fullName: string; userId: number; email: string | undefined }): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

   public static getUserInfo(): UserInfo | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo ) {
            return JSON.parse(userInfo);
        }
        return null;
    }

}