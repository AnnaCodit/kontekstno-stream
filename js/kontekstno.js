
async function create_room() {
    const data = await kontekstno_query('random-challenge');
    room_id = data.id;
    return room_id;
}

async function kontekstno_query(method = '') {
    const url = "https://xn--80aqu.xn--e1ajbkccewgd.xn--p1ai/" + method;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
}
