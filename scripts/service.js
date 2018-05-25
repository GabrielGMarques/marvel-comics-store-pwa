function getCurrentDate() {
    var date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

let resource = {
    init: function (path, intirePath) {
        this.path = path;
        this.intirePath = intirePath;

        return this;
    },
    query: function () {
        const apiUrl = 'https://gateway.marvel.com/v1/public';
        const PUBLIC_KEY = '9089339ab5def61d5cadff0f2fe9fa4c';
        const PRIV_KEY = '08df2e53affd6e2d7f28f75deb79da2a81796aee';

        let ts = getCurrentDate();
        let hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

        let url = (!this.intirePath ? apiUrl : '') + this.path + `?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;

        return fetch(url).then(function (response) {
            // Converter para JSON
            return response.json();
        }).then(function (obj) {
            // obj /retorna um objeto javascript
            return obj;
        });
    }
};

function toHttps(url) {
    return url.replace('http', 'https');
}

let dafaultSize = "portrait_incredible"
fechCharacters();

//characters
function fechCharacters() {
    resource.init('/characters').query().then(result => {
        let characteresList = document.getElementById('characters-list')
        characteresList.innerHTML = '';
        result.data.results.forEach(item => {
            characteresList.innerHTML = `         
                ${characteresList.innerHTML}
                <div class="character">
                    <div class="name">${item.name}</div>
                    <img src="${toHttps(item.thumbnail.path)}/${dafaultSize}.${item.thumbnail.extension}" alt="">
                </div>`;
        });
    });
}

//comics
function fetchComics() {
    resource.init('/comics').query().then(result => {
        let characteresList = document.getElementById('comics-list')
        characteresList.innerHTML = '';
        result.data.results.forEach(item => {
            characteresList.innerHTML = `            
                ${characteresList.innerHTML}
                <div class="character">
                    <div class="name">${item.title}</div>
                    <img src="${toHttps(item.thumbnail.path)}/${dafaultSize}.${item.thumbnail.extension}" alt="">
                </div>`;
        });
    });
}
//series
function fetchSeries() {
    resource.init('/series').query().then(result => {
        let characteresList = document.getElementById('series-list')
        characteresList.innerHTML = '';

        result.data.results.forEach(item => {
            characteresList.innerHTML = `
                ${characteresList.innerHTML}
                <div class="character">
                    <div class="name">${item.title}</div>
                    <img src="${toHttps(item.thumbnail.path)}/${dafaultSize}.${item.thumbnail.extension}" alt="">
                </div>`;
        });
    });
}