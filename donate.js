// Налаштування вікна доната. Заміни url на свої.
// {amount} у url підставляється обраною сумою (працює там, де сервіс підтримує суму в посиланні).
// fixed: true — суму користувач вводить уже на сторінці сервісу.
const DONATE = [
  { id: 'mono',   name: 'Monobank', sub: 'UAH', cur: 'UAH', amounts: [50, 100, 250, 500], url: 'https://send.monobank.ua/YOUR_JAR', color: '#ffffff' },
  { id: 'diaka',  name: 'Diaka',    sub: 'UAH', cur: 'UAH', fixed: true,                   url: 'https://dev-support.diaka.ua/donate', color: '#ffd500' }
];
