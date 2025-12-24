
let channel_name = 'fra3a';

// // check channel_name inside localstorage
// channel_name = localStorage.getItem('channel_name');
// if (!channel_name) {
//     // show div . settings
//     document.querySelector('.settings').style.display = 'block';
// }

// localStorage.setItem('channel_name', channel_name);


function renderChallenge(data) {
    const bestMatchDiv = document.querySelector('.best-match');
    const lastWordsDiv = document.querySelector('.last-words');

    console.log(data);

    // Проверяем структуру и рисуем 
    if (data && data.id) {
        // output challenge data
        bestMatchDiv.innerHTML = JSON.stringify(data);
    } else {
        bestMatchDiv.innerText = "Пришли странные данные";
    }
}

// menu click handlers
// function initMenu() {
//     const menuItems = document.querySelectorAll('.menu ul li span');

//     menuItems.forEach(item => {
//         item.addEventListener('click', () => {
//             console.log('Menu clicked:', item.textContent);
//         });
//     });
// }

// basic app init
async function app() {
    try {

        if (channel_name) {
            const room_id = await create_room();
            console.log('ID комнаты: ', room_id);
            create_chat_connection(channel_name);
        }

        // initMenu();
        // const data = await getData();
        // renderChallenge(data);
    } catch (error) {
        console.error(error);
    }
}

function process_message() {

}

app();
