var mainFunction = (function() {
    var home = document.getElementById('home');
    var loader = document.getElementById('loader');
    var dataByCountry = document.getElementById('data-by-countries');
    var summary = document.getElementById('summary');
    var liveData = document.getElementById('live-data');
    var selectedView = home;
    var baseUrl = 'https://api.covid19api.com/';
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    var btnList = document.getElementsByClassName('nav-btn');
    for (var i = 0; i < btnList.length; i++) {
        btnList[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }

     var hideView = function() {
        home.style.display = 'none';
        dataByCountry.style.display = 'none';
        liveData.style.display = 'none';
        summary.style.display = 'none';
    };

    var showView = function(id) {
        id.style.display = 'flex';
    };

    var loadView = function(id = '', btn) {
        hideView();
        selectedView = id;
        const countries = document.getElementById('select-div');
        if(!document.getElementById('checkbox_toggle').hidden) {
            document.getElementById('checkbox_toggle').checked = false;
        }

        if(id == '' || id == 'summary') {  
            countries.style.display = 'none';
            loadData(id);
        } else {
            countries.style.display = 'block';
        }
    };

    var loadCountries = function() {
        fetch(baseUrl+"countries", requestOptions)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            result.sort((a,b) => (a.Country > b.Country) ? 1 : ((b.Country > a.Country) ? -1 : 0));

            let list = document.getElementById('countries');
            let option = document.createElement('option');
            option.value = 'null';
            option.text = 'Select Country';
            list.appendChild(option);
            result.forEach(country => {
                option = document.createElement('option');
                option.value = country.Slug;
                option.text = country.Country;
                list.appendChild(option);
            });

            list.value = 'null';
            list.addEventListener('change', function(e) {
               let value = e.target.value;
               if(value != null) {
                    loadData(selectedView, value);
               }
            });
        })
        .catch(error => console.log('error', error));
    };

    var createcard = function(rec, container, summaryCards = false) {
        const card = document.createElement('div');
        const cardTitle = document.createElement('div');
        const cardTitleP = document.createElement('p');
        const cardBody = document.createElement('div');
        const cardBodyH3 = document.createElement('h3');
        const cardBodyUl = document.createElement('ul');

        let date = new Date(rec.Date);

        if(!summaryCards) {
            card.classList = 'card';
            cardTitle.classList = 'card-title';
            cardBody.classList = 'card-body';
            cardTitleP.textContent = 'Date - ' + date.toLocaleString();
            cardBodyH3.textContent = 'Details';

            for (const [key, value] of Object.entries(rec)) {
                if(!['Date', 'ID', 'Lat', 'Lon', 'CountryCode'].includes(key)) {
                    const cardBodyLi = document.createElement('li');
                    if(value) {
                        cardBodyLi.textContent = `${key}: ${value}`;
                    }

                    cardBodyUl.append(cardBodyLi);
                }
            }
        } else {
            card.classList = 'card';
            cardTitle.classList = 'card-title';
            cardBody.classList = 'card-body';
            let recCountry;
            if(rec.Country) {
                recCountry = 'Country - ' + rec.Country;
            } else {
                recCountry = 'Global';
            }
            cardTitleP.textContent = recCountry;
            cardBodyH3.textContent = 'Details';

            for (let [key, value] of Object.entries(rec)) {
                if(!['Country', 'Premium', 'ID', 'Lat', 'Lon', 'CountryCode', 'slug'].includes(key)) {
                    const cardBodyLi = document.createElement('li');
                    if(key == 'Date') {
                        value = new Date(value);
                        value = value.toLocaleString();
                    }

                    if(value) {
                        cardBodyLi.textContent = `${key}: ${value}`;
                    }
                    cardBodyUl.append(cardBodyLi);
                }
            }
        }
        
        card.append(cardTitle);
        card.append(cardBody);

        cardTitle.append(cardTitleP);
        cardBody.append(cardBodyH3);
        cardBody.append(cardBodyUl);
        container.append(card);
    };

    var loadHomeData = function(result) {
        result.sort((a,b) => (a.Date > b.Date) ? 1 : ((b.Date > a.Date) ? -1 : 0));
        const home = document.getElementById('home');
        const container = document.getElementById('home-data-view');
        container.innerHTML = '';

        if(home.style.display == 'none') {
            home.style.display = 'block'
        }

        if(result.length > 0) {
            result.forEach(rec => {
                createcard(rec, container, false);
            });
        } else {
            container.innerText = 'No Data Found.'
        }

        loader.style.display = 'none';
        setTimeout(() => {
            loadData();
        }, 600000);
    };

    var loadDataByCountriesData = function(result) {
        result.sort((a,b) => (a.Date > b.Date) ? 1 : ((b.Date > a.Date) ? -1 : 0));
        const dataByCountries = document.getElementById('data-by-countries');
        const container = document.getElementById('country-wise-data-view');

        container.innerHTML = '';

        if(dataByCountries.style.display == 'none') {
            dataByCountries.style.display = 'block'
        }

        if(result.length > 0) {
            result.forEach(rec => {
                createcard(rec, container, false);
            });
        } else {
           var noData = document.createElement('p');
            noData.classList = 'center';
            noData.innerText = 'No Data Found for ' + document.getElementById('countries').value + '.';
            container.append(noData);
        }

        loader.style.display = 'none';
       
    };

    var loadLiveData = function(result) {
        result.sort((a,b) => (a.Date > b.Date) ? 1 : ((b.Date > a.Date) ? -1 : 0));
        const liveData = document.getElementById('live-data');
        const container = document.getElementById('live-data-view');

        const h3El = document.getElementById('live-data-title');
        container.innerHTML = '';

        if(liveData.style.display == 'none') {
            liveData.style.display = 'block';
        }

        if(result.length > 0 ) {
            h3El.style.display = 'block';
            document.getElementById('selected-country').innerText = result[0].Country;
            document.getElementById('live-date').innerText = result[0].Date.split('T')[0];
            result.forEach(rec => {
                createcard(rec, container, true);
            });
        } else {
            h3El.style.display = 'none';
            var noData = document.createElement('p');
            noData.classList = 'center';
            noData.innerText = 'No Data Found for ' + document.getElementById('countries').value + '.';
            container.append(noData);
        }

        loader.style.display = 'none';

        setTimeout(() => {
            loadData('live-data');
        }, 600000);
         
    };

    var loadSummaryData = function(result) {
        let globalData = result['Global'];
        let countriesData = result['Countries'];
        const summary = document.getElementById('summary');
        const container1 = document.getElementById('global');
        const container2 = document.getElementById('countries-data');

        if(summary.style.display == 'none') {
            summary.style.display = 'block'
        }
        container1.innerHTML = '';
        createcard(globalData, container1, true );
        container2.innerHTML = '';
        countriesData.forEach(country => {
            createcard(country, container2, true );
        });

        loader.style.display = 'none';
    }

    var loadData = function(view = '', country = '') {
        loader.style.display = 'block';
        let url = baseUrl;
        let today = new Date();
        let fromDate = new Date(new Date(today.getTime() - (7*24*60*60*1000)).setHours(0,0,0,0));
        let toDate = new Date(new Date(today.getTime() - (1*24*60*60*1000)).setHours(0,0,0,0));
        let date = new Date(new Date(today.getTime() - (1*24*60*60*1000)).setHours(0,0,0,0));
        switch(view) {
            case 'summary':
                url = url + "summary";
                break;
            case 'live-data':
                url = url+"live/country/"+country + '/status/confirmed/date/'+date.toISOString();
                break;
            case 'data-by-countries':
                url = url + "country/"+country + "?from=" + fromDate.toISOString() + "&to=" + toDate.toISOString();
                break;
            default:
                // let today = new Date();
                
                url = url + "world?from=" + fromDate.toISOString() + "&to=" + toDate.toISOString();
        }

        fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            if(view == 'summary') {
                loadSummaryData(result);
            } else if(view == 'live-data') {
                loadLiveData(result);
            } else if(view == 'data-by-countries') {
                loadDataByCountriesData(result);
            } else {
                loadHomeData(result);
            }

            document.getElementById('countries').value = 'null';
        });
    }
   
    loadCountries();
    loadView();
    loadData();
    return {
        hideView,
        showView,
        loadView,
        loadCountries
    }
})();