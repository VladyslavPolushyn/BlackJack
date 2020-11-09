document.addEventListener("DOMContentLoaded", function() {

    let money = 1000;
    let ranks = [
        ["A", 11],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
        ["7", 7],
        ["8", 8],
        ["9", 9],
        ["10", 10],
        ["J", 10],
        ["Q", 10],
        ["K", 10]
    ];
    let suits = ["C", "S", "D", "H"];

    let img_url = "img/cards/";
    let commonField = document.querySelector('.common-field');

    let player_field_cards = document.querySelectorAll(".player-field .card");
    let dealer_field_cards = document.querySelectorAll(".dealer-field .card");
    cardPositionLeft(player_field_cards);
    cardPositionLeft(dealer_field_cards);

    let bet;

    let player_cards;
    let dealer_cards;
   
    make_bet_btn.onclick = playGame;

    function playGame() {
        
        commonField.innerHTML = '';

        if(money == 0){
            commonField.innerHTML(`You don't have money!`);
        }else{

            // Переключаем кнопки после первой ставки
            toggleClass(make_bet_btn, "no-display");
            toggleClass(hit_me_btn, "no-display");
            toggleClass(stop_btn, "no-display");

            // Инициализируем и мешаем колоду
            let cards = [];
            for(let i = 0; i < ranks.length; i++){
                for(let k = 0; k < suits.length; k++){
                    cards.push([ ranks[i][1], ranks[i][0]+suits[k]+".png" ]);
                }
            }
            shuffle(cards);

            // Убираем карты с предыдущей раздачи
            closeCard(player_field_cards);
            closeCard(dealer_field_cards);

            // Раздаем начальные карты
            player_cards = [ cards.shift(), cards.shift() ];
            dealer_cards = [ cards.shift(), cards.shift() ];

            // Инициализируем очки
            let player_count = 0;
            let dealer_count = 0;

            // Запрашиваем и валидируем ставку
            do{
                bet = +prompt("Your bet:");
                if(bet > money){
                    alert("You don't have so much money!");
                }
            }while((bet > money)||(bet == ''));

            // Открываем первые карты
            openCard(player_cards, player_field_cards);
            openCard(dealer_cards, dealer_field_cards);

            //Закрываем 1 карту дилера (Чтобы открыть, вызываем функцию без аргумента)
            toggleDealerCard("close");

            // Считаем первичные очки
            player_count = makeCount(player_cards, player_count);
            dealer_count = makeCount(dealer_cards, dealer_count);

            // Отображаем наши очки
            displayScore(player_count);

            // Сразу проверка на БлэкДжэк
            if(player_count === 21) {
                commonField.innerHTML = blackJack('player');
            }

            hit_me_btn.onclick = function() {
                player_count = makeHit(player_cards, player_field_cards, player_count, cards);
            }

            stop_btn.onclick = function() {
                while(dealer_count < 17) {
                    dealer_count = makeHit(dealer_cards, dealer_field_cards, dealer_count, cards);
                }

                // console.log(`player: ${player_count} dealer: ${dealer_count}`);

                if(dealer_count > player_count && dealer_count <= 21) {
                    blackJack('dealer');
                }else if(dealer_count < player_count && dealer_count <= 21) {
                    blackJack('player');
                }else if(dealer_count > 21) {
                    blackJack('player');
                }else if(dealer_count === player_count) {
                    blackJack('nobody');
                }
            }

        }

    }

    function makeHit(user_cards, user_field_cards, user_count, cards) {

        user_cards.push( cards.shift() );
        openCard(user_cards, user_field_cards);
        user_count = makeCount(user_cards, user_count);
        cardPositionLeft(user_field_cards);

        if(user_cards != dealer_cards) {
            displayScore(user_count);
            if(user_count > 21) {
                blackJack('dealer');
            }
        }else {
            // 
        }

        // Возвращаем счет для перезаписи в переменную
        return user_count;
    }

    function openCard(cards_arr, cards_field_arr) {
        
        for(let i = 0; i < cards_arr.length; i++){
            cards_field_arr[i].style.backgroundImage = ` url("${img_url}${cards_arr[i][1]}") `;
        }

    }

    // Для закрытия карт после раздачи
    function closeCard(arr) {
        arr.forEach(function(elem) {
            elem.style.backgroundImage = `none`;
        });
    }

    function makeCount(arr, count) {
        count = 0;
        //если есть туз, то переменная = 1, если нет, то 0
        let aceCheck = 0;
        for(let i = 0; i < arr.length; i++) {
            count += arr[i][0];
            if(arr[i][0] === 11) {
                aceCheck = 1;
            }
        }

        if(aceCheck === 1 && count > 21) {
            return count - 10;
        }
        
        return count;
    }

    function displayScore(count) {
        current_score.innerHTML = count;
    }

    function cardPositionLeft(arr) {
        let possition = -60;
        arr.forEach(element => {
            possition += 60;
            element.style.left = possition + "px"
        });
    }

    function toggleClass(elem, className) {
        elem.classList.toggle(className);
    }

    function refreshMoney(bet, winner) {
        if(winner === 'player') {
            money = money + bet;
        }else if(winner === 'dealer') {
            money = money - bet;
        }
        // Еще на ничью
        current_money.innerHTML = money;
    }

    function toggleDealerCard(set) {
        if(set == "close"){
            dealer_field_cards[0].style.backgroundImage = ` url("${img_url}blue_back.png") `;
        }else{
            dealer_field_cards[0].style.backgroundImage = ` url("${img_url}${dealer_cards[0][1]}") `;
        }     
    }

    function blackJack(winner) {
        refreshMoney(bet, winner);
        toggleClass(hit_me_btn, "no-display");
        toggleClass(stop_btn, "no-display");
        toggleClass(make_bet_btn, "no-display");
        toggleDealerCard();
        if(winner == 'nobody') {
            console.log(winner + ' won.');
            commonField.innerHTML = winner + ' won!';   
        }
        else {
            console.log(winner + ' wins.');
            commonField.innerHTML = winner + ' wins!';
        }
        
    }

    // Мешаем колоду
    // https://habr.com/ru/post/358094/
    // вспомогательная функция
    function putToCache(elem, cache){
        if(cache.indexOf(elem) != -1){
        return;
        }
        var i = Math.floor(Math.random()*(cache.length + 1));
        cache.splice(i, 0, elem);
    }
    //функция, возвращающая свеженький, девственный компаратор
    function madness(){
        var cache = [];
        return function(a, b){
        putToCache(a, cache);
        putToCache(b, cache);
        return cache.indexOf(b) - cache.indexOf(a);
        }
    }
    //собственно функция перемешивания
    function shuffle(arr){
        var compare = madness();
        return arr.sort(compare);
    }

});