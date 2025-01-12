import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizListType} from "../types/quiz-list.type";
import {QueryParamsType} from "../types/query-params.type";
import {QuizType} from "../types/quiz.type";
import {DefaultResponseType} from "../types/default-response.type";
import {UserResultType} from "../types/user-result.type";

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
        this.init();
    }

   private async init():Promise<void> {
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
        if (this.nextButtonElement) {
            this.nextButtonElement.onclick = this.move.bind(this, 'next')
        }
        this.passButtonElement = document.getElementById('pass');
        if (this.passButtonElement) {
            this.passButtonElement.onclick = this.move.bind(this, `pass`)
        }
        this.prevButtonElement = document.getElementById('prev');
        if (this.prevButtonElement) {
            this.prevButtonElement.onclick = this.move.bind(this, 'prev')
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
            let seconds:number = 59;

            this.interval = window.setInterval(function () {
                seconds--;

                timerElement.innerText = seconds.toString();

                if (seconds <= 0) {
                    clearInterval(this.interval);
                    this.complete();
                }
            }.bind(this), 1000);
        }

    }

   private prepareProgressBar():void {

        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement:HTMLElement = document.createElement('div')
            itemElement.className = 'progress-bar-item ' + (i === 0 ? 'active' : '');

            const circleElement:HTMLElement = document.createElement('div');
            circleElement.className = 'progress-bar-item-circle';
            const textElement:HTMLElement = document.createElement('div');
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
        if(this.testTitleElement && this.passLinkElement && this.testOptionsElement){
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
        this.testTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex
            + ': </span> ' + activeQuestion.question;

        this.passLinkElement.classList.remove('disabled-link')
        this.testOptionsElement.innerHTML = '';
        const that = this;
        activeQuestion.answers.forEach((answer) => {
            const testOptionElement = document.createElement('div');
            testOptionElement.className = 'test-question-option';
            const inputId: string = 'answer-' + answer.id;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer'
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked')
            }

            inputElement.onchange = function () {
                that.chooseAnswer();
            }

            const inputLabelElement = document.createElement('label');
            inputLabelElement.setAttribute('for', inputId);
            inputLabelElement.innerText = answer.answer;

            testOptionElement.appendChild(inputElement);
            testOptionElement.appendChild(inputLabelElement);

            this.testOptionsElement.appendChild(testOptionElement);
        });
        |}

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

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passLinkElement.classList.add('disabled-link');
    }

    move(action: string) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const choosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return element.checked;
        });

        let chosenAnswerId = null;
        if (!choosenAnswer) {
            chosenAnswerId = -1;
            const existingResult = this.userResult.find(item => {
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

            const existingResult = this.userResult.find(item => {
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

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }
        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return
        }

        Array.from(this.progresBarElement.children).forEach((item, index) => {
            const currentIndex = index + 1;
            item.classList.remove('active');
            item.classList.remove('complete');

            if (currentIndex === this.currentQuestionIndex) {
                item.classList.add('active')
            } else if (currentIndex < this.currentQuestionIndex) {
                item.classList.add('complete')
            }

        })

        this.showQuestion();
    }

    async complete() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/'
        }

        try {

            const result = await CustomHttp.request(config.host + '/tests/' + this.routesParam.id
                + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult,
            })

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/result?id=' + this.routesParam.id
            }

        } catch (e) {
            console.log(e)
        }

    }
}

