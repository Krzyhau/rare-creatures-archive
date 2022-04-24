
const MAX_CARDS = 128;

async function createCard(id) {
    let response = await fetch(`data/${id}.json`);
    let data = await response.json();
    
    // create card div and add basic information
    let card = $(`<div class="rct-card"></div>`);
    let header = $(`<div class="header"></div>`);
    header.append(`<div class="id">${('000' + id).substr(-3)}</div>`);

    //sometimes name can be too big. change font size to fit
    let name = $(`<span>${data.name}</span>`);
    if (data.name.length > 20) {
        let size = (20 + 5) / (data.name.length+5);
        name.css("font-size", `${size}em`);
    }
    let nameContainer = $(`<div class="name"></div>`);
    nameContainer.append(name);
    header.append(nameContainer);

    card.append(header);

    // await image load
    let img = new Image();
    img.src = `imgs/${id}.webp`;
    await img.decode();

    // add image
    card.append(`<div class="image"><img src="${img.src}"></img></div>`);

    // prepare stats bar
    let cardStats = $(`<div class="stats-inner"></div>`);

    // some stat info may be missing - substitute it with question marks
    let addMissingStatIfNeeded = (stat) => {
        if (Object.keys(data.stats).length < 3 && !(stat in data.stats)) {
            data.stats[stat] = "???";
        }
    };
    addMissingStatIfNeeded("hp");
    addMissingStatIfNeeded("atk");
    addMissingStatIfNeeded("def");

    // fill stats bar
    for (let stat in data.stats) {
        let statValue = data.stats[stat];

        let statElement = $(`<div class="stat ${stat}"></div>`);
        statElement.append(`<span class="stat-name">${stat}</span>`);
        statElement.append(`<span class="stat-value">${statValue}</span>`);
        cardStats.append(statElement);
    }

    let cardStatsContainer = $(`<div class="stats"></div>`);
    cardStatsContainer.append(cardStats);
    card.append(cardStatsContainer);

    // add main skill bar
    let skillName = ("skill" in data) ? data.skill : "???";
    let mainSkill = $(`<div class="main-skill"></div>`);
    mainSkill.append("<span class='main-skill-title'>Main Skill: </span>");
    mainSkill.append(`<span class="main-skill-name">${skillName}</span>`);
    card.append(mainSkill);

    // add description
    // fuck hashek. he made too long descriptions. Resizing it the same way I did it above
    let desc = ("desc" in data) ? data.desc : "???";
    let descriptionDiv = $(`<span>${desc}</span>`);
    if (desc.length > 256) {
        let size = (256+400) / (desc.length+400);
        descriptionDiv.css("font-size", `${size}em`);
    }
    let descriptionContainer = $(`<div class="description"></div>`);
    descriptionContainer.append(descriptionDiv);
    card.append(descriptionContainer);

    // add footer
    let footer = $(`<div class="footer"></div>`);
    footer.append(`<div class="author">${data.author}</div>`);
    footer.append(`<div class="date">${data.date}</div>`);
    card.append(footer);
    
    return card;
}


function createCardDeck() {
    // create divs
    let cardDeck = $(`<div class="deck"></div>`);
    let deckController = $(`<div class="deck-controller"></div>`);
    let buttonPrev = $(`<div class="arrow">◄</div>`);
    let input = $(`<input value="1">`);
    let buttonNext = $(`<div class="arrow">►</div>`);

    deckController.append(buttonPrev);
    deckController.append(input);
    deckController.append(buttonNext);

    cardDeck.append(deckController);


    // implement logic
    let loadCard = (id) => {
        id = Math.min(Math.max(parseInt(id), 1), MAX_CARDS);
        if(isNaN(id)) id=1;
        input.val(id);
        if (cardDeck.hasClass("loading")) return;
        cardDeck.toggleClass("loading", true);

        createCard(id).then(card => {
            cardDeck.find(".rct-card").remove();
            cardDeck.append(card);
            cardDeck.toggleClass("loading", false);
        });
    };

    input.change(function () {
        loadCard(input.val());
    });

    buttonPrev.click(function () {
        let id = parseInt(input.val()) - 1;
        if (id < 1) id = 1;
        input.val(id);
        loadCard(id);
    });

    buttonNext.click(function () {
        let id = parseInt(input.val()) + 1;
        if (id > MAX_CARDS) id = MAX_CARDS;
        input.val(id);
        loadCard(id);
    });

    input.change();

    return cardDeck;
}   