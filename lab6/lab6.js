// Завдання 1
let a = 10;
let b = 3;
console.log("Завдання 1:");
console.log("Сума:", a + b);     // 13
console.log("Різниця:", a - b);  // 7
console.log("Множення:", a * b); // 30
console.log("Ділення:", a / b);  // 3.333...

// Завдання 2
let firstName = "Іван";
let lastName = "Іванов";
let fullName = firstName + " " + lastName;
console.log("\nЗавдання 2:");
console.log("Привіт, " + fullName + "!");

// Завдання 3
let age = 20;
console.log("\nЗавдання 3:");
if (age >= 18) {
    console.log("Доступ дозволено");
} else {
    console.log("Доступ заборонено");
}

// Завдання 4
console.log("\nЗавдання 4:");
for (let i = 1; i <= 10; i++) {
    console.log(i);
}

// Завдання 5
function square(number) {
    return number * number;
}
let result = square(5);
console.log("\nЗавдання 5:");
console.log("Квадрат 5 =", result);  // 25

// Завдання 6: Робота з масивами
let fruits = ["яблуко", "банан", "апельсин"];
fruits.push("вишня");
console.log("\nЗавдання 6:");
console.log(fruits);
