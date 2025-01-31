import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizListType} from '../types/quiz-list.type';
import {TestResultType} from '../types/test-result.type';
import {UserInfo} from '../types/type.userInfo';
import {DefaultResponseType} from '../types/default-response.type';

export class Choice {

    private quizzes: QuizListType[] = []
    private testResults: TestResultType[] | null = null


    constructor() {

        this.init();

    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(config.host + '/tests');

        } catch (error) {
            console.log(error);
            return;
        }

        const userInfo: UserInfo | null = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result: DefaultResponseType | TestResultType[] = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.testResults = result as TestResultType[];
                }
            } catch (error) {
                console.log(error);
                return;
            }
        }
        this.processQuizzes();
    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice-options');

        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {

            this.quizzes.forEach(quiz => {
                const that: Choice = this;
                const choiceOptionElement: HTMLElement | null = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id.toString());
                choiceOptionElement.onclick = function (): void {
                    that.choiceQuiz(<HTMLElement>this);
                }

                const choiceOptionTextElement: HTMLElement | null = document.createElement('div');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('div');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                if (this.testResults) {
                    const result: TestResultType | undefined = this.testResults.find(elem => elem.testId === quiz.id);

                    if (result) {
                        const choiceOptionResultElement: HTMLElement | null = document.createElement('div');
                        choiceOptionResultElement.className = 'choice-option-result';
                        choiceOptionResultElement.innerHTML = '<div>Результаты</div><div> ' + result.score + '/' + result.total + '</div>';
                        choiceOptionElement.appendChild(choiceOptionResultElement);
                    }
                }
                const choiceOptionImageElement: HTMLElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'arrow.png');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);
                choiceOptionsElement.appendChild(choiceOptionElement);

            })
        }
    }

    private choiceQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?id=' + dataId;
        }
    }
}

