
let channel_name = 'fra3a';
let secret_word_id = '';


// // check channel_name inside localstorage
// channel_name = localStorage.getItem('channel_name');
// if (!channel_name) {
//     // show div . settings
//     document.querySelector('.settings').style.display = 'block';
// }

// localStorage.setItem('channel_name', channel_name);


// basic app init
async function app() {
    try {

        if (channel_name) {
            secret_word_id = await create_room();
            console.log('ID секрутного слова: ', secret_word_id);
            create_chat_connection(channel_name);
        }

        // initMenu();
        // const data = await getData();
        // renderChallenge(data);
    } catch (error) {
        console.error(error);
    }
}



app();
