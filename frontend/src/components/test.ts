import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizListType} from "../types/quiz-list.type";
import {QueryParamsType} from "../types/query-params.type";
import {QuestionType, QuizAnswerType, QuizType} from "../types/quiz.type";
import {DefaultResponseType} from "../types/default-response.type";
import {UserResultType} from "../types/user-result.type";
import { ActionTestType } from "../types/action-test.type";
import { UserInfo } from "../types/type.userInfo";

export class Test {

   private currentQuestionIndex:number = 0;
   private testTitleElement:HTMLElement|null;
   private testOptionsElement:HTMLElement|null;
   private nextButtonElement:HTMLElement|null;
   private prevButtonElement:HTMLElement|null;
   private passButtonElement:HTMLElement|null;
   private progresBarElement:HTMLElement|null;
   private passLinkElement:HTMLElement|null;
   private routesParam:QueryParamsType;
   private quiz: QuizType | null = null;
   readonly userResult: UserResultType[];
   private interval: number = 0;

    constructor() {
        this.currentQuestionIndex = 1;
        this.testTitleElement = null;
        this.testOptionsElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.userResult = [];
        this.progresBarElement = null;
        this.passLinkElement = null;
        this.routesParam = UrlManager.getQueryParam();
        this.init().then();
    }

   private async init(): Promise<void> {
        if (this.routesParam.id) {
            try {
                const result: QuizType | DefaultResponseType = await CustomHttp.request(config.host + '/tests/' + this.routesParam.id);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.quiz = result as QuizType;
                    this.startQuiz();
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

   private startQuiz():void {
        if(!this.quiz) return;

        this.testTitleElement = document.getElementById('title');
        this.testOptionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        const that = this;
        if (this.nextButtonElement) {
            this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next)
        }
        this.passButtonElement = document.getElementById('pass');
        if (this.passButtonElement) {
            this.passButtonElement.onclick = this.move.bind(this, ActionTestType.pass)
        }
        this.prevButtonElement = document.getElementById('prev');
        if (this.prevButtonElement) {
            this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev)
        }
        const preTitleElement:HTMLElement | null = document.getElementById('pre-title');
        if (preTitleElement) {
            preTitleElement.innerText = this.quiz.name;
        }

        this.progresBarElement = document.getElementById('progress-bar');
        this.passLinkElement = document.querySelector('.pass-link');

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement:HTMLElement | null = document.getElementById('timer');
        if (timerElement) {
            const that:Test = this;
            let seconds:number = 59;

            this.interval = window.setInterval(function () {
                seconds--;

                timerElement.innerText = seconds.toString();

                if (seconds <= 0) {
                    clearInterval(that.interval);
                    that.complete();
                }
            }.bind(this), 1000);
        }

    }

   private prepareProgressBar():void {
            if (!this.quiz) return;
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement:HTMLElement| null = document.createElement('div')
            itemElement.className = 'progress-bar-item ' + (i === 0 ? 'active' : '');

            const circleElement:HTMLElement | null = document.createElement('div');
            circleElement.className = 'progress-bar-item-circle';
            const textElement:HTMLElement | null = document.createElement('div');
            textElement.className = 'progress-bar-item-text';
            textElement.innerText = 'Вопрос' + (i + 1);

            itemElement.appendChild(circleElement);
            itemElement.appendChild(textElement);
            if(this.progresBarElement){
                this.progresBarElement.appendChild(itemElement);
            }


        }
    }

   private showQuestion():void {
        if(!this.quiz) return;
        if(this.testTitleElement && this.passLinkElement && this.testOptionsElement){
        const activeQuestion: QuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenOption: UserResultType | undefined = this.userResult.find(item => item.questionId === activeQuestion.id);
        if (this.testTitleElement){
            this.testTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex
            + ': </span> ' + activeQuestion.question;
        }
        

        this.passLinkElement.classList.remove('disabled-link')
        this.testOptionsElement.innerHTML = '';
        const that: Test = this;
        activeQuestion.answers.forEach((answer: QuizAnswerType) => {
            const testOptionElement: HTMLElement = document.createElement('div');
            testOptionElement.className = 'test-question-option';
            const inputId: string = 'answer-' + answer.id;
            const inputElement: HTMLInputElement = document.createElement('input');
            inputElement.className = 'option-answer'
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id.toString());
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked')
            }

            inputElement.onchange = function () {
                that.chooseAnswer();
            }

            const inputLabelElement: HTMLElement = document.createElement('label');
            inputLabelElement.setAttribute('for', inputId);
            inputLabelElement.innerText = answer.answer;

            testOptionElement.appendChild(inputElement);
            testOptionElement.appendChild(inputLabelElement);

            if(this.testOptionsElement){
                this.testOptionsElement.appendChild(testOptionElement);
            }
           
        });
        

        if(this.nextButtonElement && this.prevButtonElement){

            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled')
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }

            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        }
    }

    }

   private chooseAnswer(): void {
    if(this.nextButtonElement && this.passLinkElement){
        this.nextButtonElement.removeAttribute('disabled');
        this.passLinkElement.classList.add('disabled-link');
    }
    }

   private move(action: ActionTestType): void {
        if(!this.quiz) return;
        const activeQuestion: QuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        const choosenAnswer: HTMLInputElement | undefined = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return (element as HTMLInputElement).checked;
        }) as HTMLInputElement;

        let chosenAnswerId: number | null = null;
        if (!choosenAnswer) {
            chosenAnswerId = -1;
            const existingResult: UserResultType | undefined = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            })
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                })
            }
        }

        if (choosenAnswer && choosenAnswer.value) {
            chosenAnswerId = Number(choosenAnswer.value);

            const existingResult: UserResultType | undefined = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            })
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                })
            }
        }

        if (action === ActionTestType.next || action === ActionTestType.pass) {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }
        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return
        }

        if(this.progresBarElement){
        Array.from(this.progresBarElement.children).forEach((item: Element, index: number) => {
            const currentIndex: number = index + 1;
            item.classList.remove('active');
            item.classList.remove('complete');

            if (currentIndex === this.currentQuestionIndex) {
                item.classList.add('active')
            } else if (currentIndex < this.currentQuestionIndex) {
                item.classList.add('complete')
            }

        })
    }
        this.showQuestion();
    }
   
   private async complete(): Promise<void> {
        const userInfo: UserInfo | null = Auth.getUserInfo();
        if (!userInfo || !userInfo.userId) {
            location.href = '#/'
            return;
        }

        try {

            const result: DefaultResponseType  = await CustomHttp.request(config.host + '/tests/' + this.routesParam.id
                + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult,
            })

            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                location.href = '#/result?id=' + this.routesParam.id
            }

        } catch (e) {
            console.log(e)
        }
    
    }
}

