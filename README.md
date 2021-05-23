# Kirjasto bot

https://t.me/Kirjastobot

## Yleistä

Kirjasto bot auttaa sinua löytämään sopivan kirjaston läheltä. Datan botti saa kirjastojen API:sta (https://api.kirjastot.fi).

## Asennuksesta

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
