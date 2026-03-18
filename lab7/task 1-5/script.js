/*Завдання 1: Пріоритет завантаження скриптів У вас є два підключених файли.
Якщо small.js завантажується швидше за big.js, який з них виконається першим і чому?
<script src="big.js"></script>
<script src="small.js"></script>
Відповідь аргументуйте одним реченням.
* Першим виконається big.js, тому що звичайні "<script src" виконуються строго в порядку
розташування в HTML, незалежно від того, який файл завантажився швидше.
* */

/*Завдання 2: Логіка та змінні

Дайте відповідь, чому дорівнюватиме х у цьому прикладі: var a = 2; var x = 1 + (a *= 2);

Чи з'явиться alert у наступному коді та поясніть чому?
if ("0") { alert('Привіт'); }

Оголосіть змінні admin та name, запишіть у name рядок "Василь", скопіюйте його в admin та виведіть admin у консоль.
* */
/*1
var a = 2;
var x = 1 + (a *= 2);
console.log(x) //5
*/
//2
/*if ("0") {
    alert('Привіт');
}*/
/*alert спрацює, тому що рядок "0" — це непорожній рядок,
 а всі непорожні рядки в JavaScript вважаються truthy (умова if істинна)*/

/*3
let name = "Василь";
let admin = name;
console.log(admin); // Василь
*/
/*
* Завдання 3: Робота з API (Fetch) та фільтрація Використовуючи API: https://api.census.gov/data/2020/acs/acs5/profile?get=NAME&for=county:*

Напишіть асинхронну функцію для отримання даних.

Збережіть отримані дані у масив об'єктів.

Створіть функцію, яка приймає назву округу (наприклад, "Baldwin County, Alabama") і повертає його код (комбінацію state + county).

Додайте на сторінку <input> та кнопку. При натисканні на кнопку в консоль (або в окремий div) має виводитись код округу, введеного в поле.
* */


// Глобальний масив об'єктів
let counties = [];

// 1. Асинхронна функція для отримання даних
async function loadCounties() {
    const url = 'https://api.census.gov/data/2020/acs/acs5/profile?get=NAME&for=county:*';
    const response = await fetch(url);
    const data = await response.json();

    // 2. Перетворюємо в масив об'єктів
    counties = data.slice(1).map(row => ({
        name: row[0],       // "Baldwin County, Alabama"
        state: row[1],      // код штату
        county: row[2],     // код округу
        code: row[1] + row[2] // комбінований код state+county
    }));
}

// 3. Функція пошуку коду за назвою округу
function getCountyCodeByName(countyName) {
    const found = counties.find(c => c.name === countyName);
    return found ? found.code : null;
}

// 4. Обробка кнопки
document.addEventListener('DOMContentLoaded', async () => {
    await loadCounties(); // завантажуємо дані один раз при старті

    const input = document.getElementById('countyInput');
    const button = document.getElementById('findBtn');
    const resultDiv = document.getElementById('result');

    button.addEventListener('click', () => {
        const name = input.value.trim();
        const code = getCountyCodeByName(name);

        if (code) {
            console.log(code);
            resultDiv.textContent = `Код округу: ${code}`;
        } else {
            console.log('Округ не знайдено');
            resultDiv.textContent = 'Округ не знайдено';
        }
    });
});


//Завдання 4
const form = document.getElementById('userForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', function (event) {
    event.preventDefault(); // спочатку блокуємо стандартну відправку

    const firstName = document.getElementById('first_name').value.trim();
    const lastName  = document.getElementById('last_name').value.trim();
    const email     = document.getElementById('email').value.trim();

    // Перевірка: чи всі поля заповнені
    if (!firstName || !lastName || !email) {
        errorDiv.textContent = 'Будь ласка, заповніть всі поля.';
        alert('Будь ласка, заповніть всі поля.');
        return; // форму не відправляємо
    }

    // Якщо всі поля заповнені — показуємо alert з даними
    errorDiv.textContent = '';
    alert(`Користувач:\nІмʼя: ${firstName}\nПрізвище: ${lastName}\nEmail: ${email}`);

    // Якщо реально треба відправляти форму на сервер — можна розкоментувати:
    // form.submit();
});


const el = document.getElementById('elid');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const container = document.getElementById('container');

let currentOffset = 0;

leftBtn.addEventListener('click', () => {
    currentOffset -= 100;
    const minLeft = 0;
    if (currentOffset < minLeft) currentOffset = minLeft;
    el.style.left = currentOffset + 'px';
});

rightBtn.addEventListener('click', () => {
    currentOffset += 100;
    const maxLeft = container.clientWidth - el.clientWidth; // 400 - 100 = 300
    if (currentOffset > maxLeft) currentOffset = maxLeft;
    el.style.left = currentOffset + 'px';
});
