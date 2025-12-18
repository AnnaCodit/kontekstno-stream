
async function getData() {
    const url = "https://xn--80aqu.xn--e1ajbkccewgd.xn--p1ai/random-challenge";
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();

}

function renderChallenge(data) {
    const resultDiv = document.getElementById('my-result');

    console.log(data);

    // Проверяем структуру и рисуем 
    if (data && data.id) {
        // output entyre object inside html
        resultDiv.innerHTML = JSON.stringify(data);
        // resultDiv.innerText = data.id;
        resultDiv.style.color = 'black';
    } else {
        resultDiv.innerText = "Пришли странные данные";
    }
}

async function app() {
    try {
        const data = await getData();
        renderChallenge(data);
    } catch (error) {
        console.error(error);
    }
}

app()