import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";

export class Test {

    constructor() {
        this.quiz = null;
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

    async init() {
        if (this.routesParam.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routesParam.id);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                    this.startQuiz();
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    startQuiz() {
        this.testTitleElement = document.getElementById('title');
        this.testOptionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next')
        this.passButtonElement = document.getElementById('pass');
        this.passButtonElement.onclick = this.move.bind(this, 'pass')
        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev')
        document.getElementById('pre-title').innerText = this.quiz.name;
        this.progresBarElement = document.getElementById('progress-bar');
        this.passLinkElement = document.querySelector('.pass-link');

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59;

        this.interval = setInterval(function () {
            seconds--;

            timerElement.innerText = seconds;

            if (seconds <= 0) {
                clearInterval(this.interval);
                this.complete();
            }
        }.bind(this), 1000);
    }

    prepareProgressBar() {

        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('div')
            itemElement.className = 'progress-bar-item ' + (i === 0 ? 'active' : '');

            const circleElement = document.createElement('div');
            circleElement.className = 'progress-bar-item-circle';
            const textElement = document.createElement('div');
            textElement.className = 'progress-bar-item-text';
            textElement.innerText = 'Вопрос' + (i + 1);

            itemElement.appendChild(circleElement);
            itemElement.appendChild(textElement);

            this.progresBarElement.appendChild(itemElement);

        }
    }

    showQuestion() {
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
            const inputId = 'answer-' + answer.id;
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

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passLinkElement.classList.add('disabled-link');
    }

    move(action) {
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

