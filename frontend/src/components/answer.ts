import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UserInfo} from "../types/type.userInfo";
import {DefaultResponseType} from "../types/default-response.type";
import {TestData} from "../types/test-data.type";

export class Answer {
    private quiz: TestData | null = null;
    readonly userInfo: UserInfo | null = null;
    readonly testId: string | null = null;

    constructor() {
        this.userInfo = Auth.getUserInfo();
        this.testId = sessionStorage.getItem("testId");

        const resultCallbackElement: HTMLElement | null = document.getElementById('result-callback');

        if (resultCallbackElement) {
            resultCallbackElement.setAttribute('href', '#/result?id=' + this.testId)
        }

        if (this.userInfo && this.testId) {

            this.init().then();


        } else {
            location.href = '#/'
            return;
        }
    }

    private async init(): Promise<void> {
        try {
            if (this.userInfo && this.testId) {
                const result: TestData | DefaultResponseType = await CustomHttp.request(config.host + '/tests/'
                    + this.testId + '/result/details?userId=' + this.userInfo.userId);

                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.quiz = result as TestData;

                        this.showInfo();
                        this.showAnswer()


                }
            }
        } catch (error) {
            console.log(error);
            return
        }


    }

    showInfo() {
        const preTitle: HTMLElement | null = document.getElementById('pre-title');
        const testedElement: HTMLElement | null = document.getElementById('tested');
        if (preTitle && testedElement && this.quiz && this.userInfo) {

            preTitle.innerText = this.quiz.test.name;
            testedElement.innerText = this.userInfo.fullName
                + ', ' + this.userInfo.email;
        }
    }

    showAnswer() {
        let index: number = 0;


        const answerBlock: HTMLElement | null = document.getElementById('answer-block');
        if (this.quiz)
        this.quiz.test.questions.forEach(question => {
            const answerQuestionElement: HTMLElement = document.createElement('div');
            answerQuestionElement.className = 'answer-question';

            const answerTitleElement: HTMLElement = document.createElement('h2');
            answerTitleElement.className = 'answer-title';
            answerTitleElement.innerHTML = '<span>Вопрос ' + (index + 1)
                + ': </span> ' + question.question;

            const answersElement: HTMLElement = document.createElement('div');
            answersElement.className = 'answer-answers';


            answerQuestionElement.appendChild(answerTitleElement);

            question.answers.forEach((answer) => {
                const answerElement: HTMLElement = document.createElement('div');
                answerElement.className = 'answer-answer';
                answerElement.innerText = answer.answer;

                if (answer.correct === false) {
                    answerElement.style.color = '#DC3333';
                    answerElement.classList.add('invalid-answer');
                } else {
                    if (answer.correct === true) {
                        answerElement.style.color = '#5FDC33';
                        answerElement.classList.add('right-answer');
                    }
                }


                answersElement.appendChild(answerElement);

            });

            answerQuestionElement.appendChild(answersElement);
            if (answerBlock){
                answerBlock.appendChild(answerQuestionElement);
            }

            index++;
        });

    }
}

