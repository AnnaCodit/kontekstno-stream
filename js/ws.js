// Настройки клиента
// Мы НЕ передаем identity (логин/пароль), поэтому tmi.js сам станет "justinfan"



function create_chat_connection(channel_name = '') {

    const client = new tmi.Client({
        channels: [channel_name] // Впиши сюда нужный канал
    });

    // Подключаемся
    client.connect();

    // Слушаем сообщения
    // tags — это объект со всей инфой (цвет ника, бейджи, id сообщения и т.д.)
    client.on('message', (channel, tags, message, self) => {

        // Достаем данные. tmi.js сам обрабатывает, есть ли у юзера цвет
        // Если цвета нет, ставим дефолтный неоновый
        const color = tags['color'] || '#00FF00';
        const name = tags['display-name'];

        // console.log(message);


        // если в сообщении больше двух слов то игнорируем
        if (message.split(' ').length > 2) return;

        // prevent xss attack from message
        message = message.replace(/[^a-zA-Zа-яА-ЯёЁ0-9]/g, '');

        // Выводим на экран
        addMessage(name, color, message);
    });

}

function addMessage(name, color, text) {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = 'msg-row';

    // Формируем HTML с цветом ника
    div.innerHTML = `<span class="username" style="color: ${color}">${name}:</span> ${text}`;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight; // Скролл вниз
}