# Kirjasto bot

https://t.me/Kirjastobot

## Yleistä

Kirjasto bot auttaa sinua löytämään sopivan kirjaston läheltä. Datan botti saa kirjastojen API:sta (https://api.kirjastot.fi).

## Asennuksesta

### Docker

Dockerilla saat ohjelman käyntiin helposti komennolla:
```
docker run -e TELEGRAM_BOT_TOKEN="GET_THIS_FROM_BOTFATHER" --name="kirjasto-bot" kirjasto-bot
```

### Normaali

```
npm install
echo "TELEGRAM_BOT_TOKEN=xxxxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxx" > .env
npm start
```

## Konfiguroinnista

- BOTPIC: https://www.kirjastot.fi/sites/default/files/matbank/yleisten-kirjastojen-tunnus.png
- COMMANDS: 
    ```
    apua - näyttää ohjeet
    sijainti - kirjaston sijainti kartalla
    aukioloajat - halutun kirjaston aukiolo
    palvelut - näe haluamasi kirjaston palvelut
    ```
- TOKEN: Luo .env-tiedosto, joka sisältää `TELEGRAM_BOT_TOKEN=xxxxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxx`

## Kehittämisestä

Voit rakentaa Dockerin avulla kuvan ohjelmasta myös omalle tietokoneellesi. Se tapahtuu komennolla:
```
docker build -t Kirjasto-bot .
```