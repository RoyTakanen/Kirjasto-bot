const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const htmlToText = require('html-to-text');
const moment = require('moment');

require('dotenv').config()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

function haeUrl(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function etsiKirjastoja(latitude, longitude, chatId, alue=5) {
    let etsitaan = true
    while (etsitaan) {
        let data = JSON.parse(await haeUrl(`https://api.kirjastot.fi/v4/library?geo.pos=${latitude},${longitude}&refs=city&geo.dist=${alue}`));
        let viesti;

        if (data.items.length > 0) {
            data.items.forEach(element => {
                viesti += `<b>Nimi:</b> ${element.name}\n`
                if (element.slogan) {
                    viesti += `<b>Slogan: </b><i>${element.slogan}</i>\n`
                }
                viesti += `<b>Etäisyys:</b> ${element.distance}km\n`
                viesti += `<b>Osoite:</b> <code>${element.address.street} ${element.address.city}, ${element.address.zipcode}</code>\n\n`
            })
    
    
            bot.sendMessage(chatId, `
            <b><i>🔎 Löytyi ${data.items.length} kirjastoa ${alue}km säteeltä</i></b>\n\n${viesti}
            `.replace('undefined', ''), {
                parse_mode: 'HTML'
            });
            etsitaan = false;
        } else {
            bot.sendMessage(chatId, `<b>🤖Hakurobotti ei löytänyt ${alue}km säteeltä kirjastoja. Lisäämme tehoja 🦾 ja yritämme uudestaan ${alue*5}km alueelta hakua</b>`, {
                parse_mode: 'HTML'
            });
            sleep(2000)
            alue = alue * 5
        }
    }
}

async function kirjastonPalvelut(kirjasto, chatId) {
    let data = JSON.parse(await haeUrl(`https://api.kirjastot.fi/v4/library?name=${kirjasto}&with=services`))
    let viesti;

    if (data.items.length > 0) {
        viesti += `<b>Kirjasto:</b> ${data.items[0].name}\n`
        if (data.items[0].slogan) {
            viesti += `<b>Slogan: </b><i>${data.items[0].slogan}</i>\n`
        }
        if (data.items[0].distance) {
            viesti += `<b>Etäisyys:</b> ${data.items[0].distance}km\n`
        }
        viesti += `<b>Osoite:</b> <code>${data.items[0].address.street} ${data.items[0].address.city}, ${data.items[0].address.zipcode}</code>\n\n`
    
        viesti += `<b>Palvelut</b>\n`
        data.items[0].services.forEach(palvelu => {
            let kuvaus = htmlToText.fromString(palvelu.description)
            viesti += `- ${palvelu.standardName}\n`
        })
    
        bot.sendMessage(chatId, viesti.replace('undefined', ''), {
            parse_mode: 'HTML'
        });
    } else {
        bot.sendMessage(chatId, '😔Kirjastoa ei löydy tietokannasta📚. Kirjoititkohan sen väärin?', {
            parse_mode: 'HTML'
        });
    }
}

async function reittiohjeetKirjastoon(kirjasto, chatID) {
    let data = JSON.parse(await haeUrl(`https://api.kirjastot.fi/v4/library?name=${kirjasto}`))

    if (data.items.length > 0) {
        bot.sendLocation(chatID, data.items[0].coordinates.lat, data.items[0].coordinates.lon)
    }
}

async function kirjastonAukioloajat(kirjasto, chatId) {
    let iddata = JSON.parse(await haeUrl(`https://api.kirjastot.fi/v4/library?name=${kirjasto}`))
    let viesti
    let viikonloppuun = 7 - moment().isoWeekday()
    let viikonalkuun = 6 - viikonloppuun
    let viikonnro = moment().weeks()

    viesti += `🗓<b><i>Näytetään aikataulu viikolle ${viikonnro}</i></b>\n\n`

    if (iddata.items.length > -1) {
        let id = iddata.items[0].id
        let aikadata = JSON.parse(await haeUrl(`https://api.kirjastot.fi/v4/schedules?library=${id}&period.start=-${viikonalkuun}d&period.end=${viikonloppuun}d`))

        aikadata.items.forEach(paiva => {
            viesti += `<b>${moment(paiva.date).locale('FI').format('dddd')}`
            if (paiva.closed) {
                viesti += '🚫:</b>\n'
                viesti += `suljettu\n\n`
            } else {
                viesti += '✅:</b>\n'
                if (paiva.times.length > 1) {
                    viesti += `asiakaspalvelu avoinna ${paiva.times[1].from}-${paiva.times[1].to}\n`
                } 
                viesti += `itsepalvelu avoinna ${paiva.times[0].from}-${paiva.times[0].to}\n\n`
            }
        });

        bot.sendMessage(chatId, viesti.replace('undefined', ''), {
            parse_mode: 'HTML'
        });
    } else {
        bot.sendMessage(chatId, '😔Kirjastoa ei löydy tietokannasta📚. Kirjoititkohan sen väärin?', {
            parse_mode: 'HTML'
        });
    }
}

bot.onText(/\/(start|apua)/, (msg) => {
    const chatId = msg.chat.id;

    viesti = `
    <b>Ominaisuudet:</b>

<b>💁Palvelut:</b> lähetä komento <code>/palvelut kirjastonnimi</code>
<b>🔎Hae kirjastoja:</b> lähetä sijaintisi
<b>📅Aukioloajat:</b> lähetä komento <code>/aukioloajat kirjastonnimi</code>
<b>📍Sijainti kartalla:</b> lähetä komento <code>/sijainti kirjastonnimi</code>

<b>Vinkkejä: </b>
- <i>Kirjastonnimi on haluamasi kirjasto</i>
- <i>Sijainnin lähettäminen tapahtuu painamalla paperiliittimeltä 📎 näyttävää kuvaketta vasemmalla alanurkassa</i>`
    bot.sendMessage(chatId, viesti.replace('undefined', ''), {
        parse_mode: 'HTML'
    });
    //bot.sendVideo(chatId, './data/kuinkalähettääsijainti.mp4')
})

bot.onText(/\/kirjasto/, (msg, args) => {
    let vaihtoehdot = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [
                ["Peruuta"]
            ]
        }
    };
    bot.sendMessage(msg.chat.id, 'Valitse kiinnostava kirjasto näppäimistöltä. ', vaihtoehdot).then(() => {
        bot.once('message',(msg)=>{
            kirjastonPalvelut(msg.text, msg.chat.id)
        })
    })
})

bot.onText(/\/palvelut (.+)/, (msg, args) => {

  const chatId = msg.chat.id;
  const kirjasto = args[1];

  kirjastonPalvelut(kirjasto, chatId)
});

bot.onText(/\/aukioloajat (.+)/, (msg, args) => {

    const chatId = msg.chat.id;
    const kirjasto = args[1];
  
    kirjastonAukioloajat(kirjasto, chatId)
  });  

bot.onText(/\/sijainti/, (msg, args) => {
    let kirjasto = args.input.replace('/sijainti ', '')

    reittiohjeetKirjastoon(kirjasto, msg.chat.id)
})

bot.on('location', (msg) => {
    const chatId = msg.chat.id;

    etsiKirjastoja(msg.location.latitude, msg.location.longitude, chatId)
});
