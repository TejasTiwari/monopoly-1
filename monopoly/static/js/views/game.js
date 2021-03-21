"use strict";

class GameView {
  constructor() {
    this.initComponents();
    this.audioManager = new AudioManager();
    this.audioManager.play("background");

    this.gameInProcess = true;
    this.message = null;
    // this.afk = false;

    // const trade = require('../game_views/')
  }

  initComponents() {
    this.userName = document.getElementById("username").value;
    this.hostName = document.getElementById("hostname").value;

    this.$chatMessageContainer = document.getElementById("chat-messages");
    this.$chatMessageToSend = document.getElementById("chat-message-input");

    this.$audioControl = document.getElementById("audio-control");
    this.$audioControl.addEventListener("click", this.switchAudio.bind(this));

    this.$helpControl = document.getElementById("help-control");
    this.$helpControl.addEventListener("click", this.showHelp.bind(this));
    this.$helpOverlay = document.getElementById("rules-overlay");
    this.showingHelp = false;

    // this.afkButton = document.getElementById("afk");
    // this.afkButton.style.backgroundColor = "red";
    // this.afkButton.addEventListener("click", this.afkState.bind(this));

    if (this.userName === this.hostName) {
      this.$exitControl = document.getElementById("exit-control");
      this.$exitControl.addEventListener("click", this.endGame.bind(this));
    }

    this.$chatMessageToSend.addEventListener("keydown", (e) => {
      const key = e.which || e.keyCode;
      // Detect Enter pressed
      if (key === 13) this.sendMessage();
    });

    this.diceMessage = document.getElementById("dice-message").innerHTML;

    this.$usersContainer = document.getElementById("users-container");

    this.$modalCard = document.getElementById("modal-card");
    this.$modalCardContent = document.querySelector(
      "#modal-card .card-content-container"
    );
    this.$modalAvatar = document.getElementById("modal-user-avatar");
    this.$modalMessage = document.getElementById("modal-message-container");
    this.$modalButtons = document.getElementById("modal-buttons-container");
    this.$modalTitle = document.getElementById("modal-title");
    this.$modalSubTitle = document.getElementById("modal-subtitle");

    document.getElementById("trade").style.display = "none";

    this.showModal(
      null,
      "Welcome to Monopoly",
      "",
      "Loading game resources...",
      []
    );
    this.initBoard();
  }

  initBoard() {

    this.gameController = new GameController({
      // The DOM element in which the drawing will happen.
      containerEl: document.getElementById("game-container"),

      // The base URL from where the BoardController will load its data.
      assetsUrl: "/static/3d_assets",

      onBoardPainted: this.initWebSocket.bind(this),
    });

    window.addEventListener(
      "resize",
      () => {
        this.gameController.resizeBoard();
      },
      false
    );
    fetch('/static/modal_data.json').then(response => response)
                                .then(data => data.json())
                                .then(modalDataJSON => {
                                    this.modalData = modalDataJSON
                             })
                             this.modalData
  }

  initWebSocket() {
    this.socket = new WebSocket(
      `ws://${window.location.host}/game/${this.hostName}`
    );
    // console.log(this)
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleStatusChange(message);
      // this.message=message
    };
  }

  onDiceRolled() {
    const notifyServer = () => {
      this.socket.send(
        JSON.stringify({
          action: "roll",
        })
      );
    };
    setTimeout(notifyServer, 2000);
  }

  handleStatusChange(message) {
    const messageHandlers = {
      'init': this.handleInit,
      'add_err': this.handleAddErr,
      'roll_res': this.handleRollRes,
      'buy_land': this.handleBuyLand,
      'construct': this.handleConstruct,
      'cancel_decision': this.handleCancel,
      'game_end': this.handleGameEnd,
      'chat': this.handleChat,
      'trade': this.handleTrade,
      "propose": this.proposeTradeHandler,
      'accept': this.acceptTradeHandler,
      'reject': this.rejectTradeHandler,
    };

    console.log(message.action)

    if (!this.gameInProcess) return;

    messageHandlers[message.action].bind(this)(message);
    // console.log(this)
  }
//   afkState() {
//     this.afk = !this.afk;

//     if (this.afk) {
//       this.afkButton.style.backgroundColor = "green";
//     } else {
//       this.afkButton.style.backgroundColor = "red";
//     }
//   }
//  async afkHandler() {
//     // console.log(this)
//     if (this.afk && this.currentPlayer === this.myPlayerIndex) {
//       document.getElementById("roll").checked = true;
//     //   document.querySelector("#modal-buttons-container button").disabled = true;
//     //   document.querySelector("#modal-buttons-container button").innerText =
//     //     "Auto roll...";

//       this.audioManager.play("dice");
//     await this.onDiceRolled();
//     await this.cancelDecision();
//       this.socket.onmessage =  (event) => {
//         const message = JSON.parse(event.data);
//         if(message.action==='roll')
//        this.handleRollRes(message);
//        if(message.action==='canel_change')
//        this.handleCancel(message);

//       };
     
//     }
//   }

  /*
   * Init game status, called after ws.connect
   * players: @see initPlayers
   * amount: @see changeCashAmount
   * */
  initGame(players, amount, posChange) {
    // Init players
    this.initPlayers(players, posChange);

    // Init cash amount
    this.changeCashAmount(amount);
  }

  /*
   * Display players on the top
   * players: [{
   *   fullName: string, // user full name
   *   userName: string, // username
   *   avatar: string // user avatar url
   * }]
   * */
  initPlayers(players, initPos) {
    this.players = players;
    this.currentPlayer = null;

    for (let i = 0; i < players.length; i++) {
      if (this.userName === players[i].userName) this.myPlayerIndex = i;
      const avatarTemplate = players[i].avatar
        ? `<img class="user-avatar" src="${players[i].avatar}">`
        : `<div class="user-group-name">${players[i].fullName.charAt(0)}</div>`;

      this.$usersContainer.innerHTML += `
                <div id="user-group-${i}" class="user-group" style="background: ${GameView.PLAYERS_COLORS[i]}">
                    ${avatarTemplate}
                    <span class="user-cash">
                        <div class="monopoly-cash">M</div>
                        <div class="user-cash-num">1500</div>
                    </span>
                    <img class="user-role" src="/static/images/player_${i}.png">
                </div>`;
    }

    this.gameLoadingPromise = this.gameController.addPlayer(
      players.length,
      initPos
    );
  }

  /*
   * Change the cash balance
   * amounts: [int]
   * */
  changeCashAmount(amounts) {
    for (let i in amounts) {
      const $cashAmount = document.querySelector(
        `#user-group-${i} .user-cash-num`
      );
      $cashAmount.innerText = amounts[i] >= 0 ? amounts[i] : 0;
    }
  }

  /*
   * Change player
   * nextPlayer: int,
   * onDiceRolled: function
   * */
  changePlayer(nextPlayer, onDiceRolled) {
    let tradeView;
    console.log(this, nextPlayer);
    // update user indicator
    if (this.currentPlayer !== null) {
      let $currentUserGroup = document.getElementById(
        `user-group-${this.currentPlayer}`
      );
      $currentUserGroup.classList.remove("active");
    }

    let $nextUserGroup = document.getElementById(`user-group-${nextPlayer}`);
    $nextUserGroup.classList.add("active");

    this.currentPlayer = nextPlayer;
    let title = this.currentPlayer === this.myPlayerIndex ? "Your Turn!" : "";
    // this.tradeSocket.onmessage=(event) => {
    //     const message = JSON.parse(event.data);
    //     if(message.playerSelected===this.username){
    //         // logic for table
    //     }else if(message.currPlayer===this.username){
    //         // do nothing
    //     }
    //     else{
    //         // message.currPlayer and message.playerSelected are trading
    //     }
    // };

    //    console.log('ok', this)
    //   if(this.currPlayer === nextPlayer){
    //       setTimeout(()=>{
    //        this.players = this.players.filter((e,index)=>index!==nextPlayer)
    //        if( this.currentPlayer ===this.players.length){
    //            this.currentPlayer = 0;
    //         }
    //         this.changePlayer(this.currPlayer,onDiceRolled)

    //         this.socket.close()
    //         window.location = `http://${window.location.host}/monopoly/join`;

    // },4000)}
    // role dice
    const button =
      nextPlayer !== this.myPlayerIndex
        ? []
        : [
            {
              text: "Roll",
              callback: () => {
                document.getElementById("roll").checked = true;
                document.querySelector(
                  "#modal-buttons-container button"
                ).disabled = true;
                document.querySelector(
                  "#modal-buttons-container button"
                ).innerText = "Hold on...";

                this.audioManager.play("dice");

                onDiceRolled();
              },
            },
            {
              text: "Trade",
              callback: this.trade.bind(this),
            },
          ];
    // (nextPlayer === this.myPlayerIndex && this.afk)
    //   ? this.afkHandler()
    //   : undefined;

    this.showModal(nextPlayer, title, "", this.diceMessage, button);
  }

  /*
   * Display a pop-up modal
   * message: a snippet of text or HTML
   * playerIndex: int,
   * buttons: [{
   *   text: string, // "button text"
   *   callback: function
   * }],
   * displayTime: int // seconds to display
   * */
  async reject(initiator,acceptor) {
    this.socket.send(
      JSON.stringify({
        action: "reject",
         initiator,
        acceptor,
        hostname: this.hostName,
      })
    );
  }
  handleReject(message) {
    let next_player = message.next_player;
    this.changePlayer(next_player, this.onDiceRolled.bind(this));
  }
  showModal(playerIndex, title, subTitle, message, buttons, displayTime) {
    return new Promise((resolve) => {
      if (playerIndex === null) {
        this.$modalAvatar.src = GameView.DEFAULT_AVATAR;
      } else {
        this.$modalAvatar.src = `/static/images/player_${playerIndex}.png`;
        this.$modalAvatar.style.background =
          GameView.PLAYERS_COLORS[playerIndex];
      }

      if (playerIndex === this.myPlayerIndex) {
        this.$modalAvatar.classList.add("active");
      } else {
        this.$modalAvatar.classList.remove("active");
      }

      this.$modalMessage.innerHTML = message;
      this.$modalButtons.innerHTML = "";

      this.$modalTitle.innerText = title;
      this.$modalSubTitle.innerText = subTitle;

      for (let i in buttons) {
        let button = document.createElement("button");
        button.classList.add("large-button");
        button.id = `modal-button-${i}`;
        button.innerText = buttons[i].text;

        button.addEventListener("click", () => {
          buttons[i].callback();
          resolve();
        });

        button.addEventListener("mouseover", () => {
          this.audioManager.play("hover");
        });

        this.$modalButtons.appendChild(button);
      }

      this.$modalCard.classList.remove("hidden");
      this.$modalCard.classList.remove("modal-hidden");

      // hide modal after a period of time if displayTime is set
      if (displayTime !== undefined && displayTime > 0) {
        setTimeout(async () => {
          await this.hideModal(true);
          resolve();
        }, displayTime * 1000);
      } else {
        resolve();
      }
    });
  }

  /*
   * Hide the modal
   * */
  hideModal(delayAfter) {
    return new Promise((resolve) => {
      this.$modalCard.classList.add("modal-hidden");
      if (delayAfter === true) {
        setTimeout(() => {
          resolve();
        }, 500);
      } else {
        resolve();
      }
    });
  }

  async handleInit(message) {
    let players = message.players;
    let changeCash = message.changeCash;
    let nextPlayer = message.nextPlayer;
    let posChange = message.posChange;
    let eventMsg = message.decision;
    let title = message.title;
    let landname = message.landname;
    let owners = message.owners;
    let houses = message.houses;
    this.initGame(players, changeCash, posChange);

    await this.gameLoadingPromise;
    await this.hideModal(true);

    for (let i = 0; i < owners.length; i++) {
      if (owners[i] !== null) {
        this.gameController.addProperty(
          PropertyManager.PROPERTY_OWNER_MARK,
          i,
          owners[i]
        );
      }
    }

    for (let i = 0; i < houses.length; i++) {
      if (houses[i] === 4) {
        this.gameController.addProperty(PropertyManager.PROPERTY_HOTEL, i);
      } else {
        for (let building_num = 0; building_num < houses[i]; building_num++) {
          this.gameController.addProperty(PropertyManager.PROPERTY_HOUSE, i);
        }
      }
    }

    if (message.waitDecision === "false") {
      this.changePlayer(nextPlayer, this.onDiceRolled.bind(this));
    } else {
      const buttons =
        this.myPlayerIndex === nextPlayer
          ? [
              {
                text: "Buy",
                callback: this.confirmDecision.bind(this),
              },
              {
                text: "No",
                callback: this.cancelDecision.bind(this),
              },
              {
                text: "Trade",
                callback: this.trade.bind(this),
              }
            ]
          : [];
      eventMsg = this.players[nextPlayer].userName + " " + eventMsg;
      this.showModal(nextPlayer, title, landname, eventMsg, buttons);
    }
  }

  async handleAddErr() {
    await this.showModal(
      null,
      "Permission Denied",
      "Game Not Found",
      "Navigating back... Create your own game with your friends!",
      [],
      5
    );
    window.location = `http://${window.location.host}/monopoly/join`;
  }

  async proposeTrade(
    currentPlayer,
    playerSelected,
    propertyGivenIndex,
    propertyTakenIndex,
    moneyGiven,
    moneyTaken
  ) {
    console.log("prop trade working");
    this.socket.send(
      JSON.stringify({
        action: "propose",
        hostname: this.hostName,
        currentPlayer,
        playerSelected,
        propertyGivenIndex,
        propertyTakenIndex,
        moneyGiven,
        moneyTaken,
      })
    );
  }
  proposeTradeHandler(message) {
    console.log(message);
    let {
      initiator,
      acceptor,
      propertyGiven,
      moneyGiven,
      moneyTaken,
      propertyTaken,
    } = message;
    if (acceptor === this.myPlayerIndex) {
      document.getElementById("trade").style.display = "inherit";
      document.getElementsByClassName(
        "card-content-container"
      )[0].style.display = "none";
      document.getElementById("proposetradebutton").style.display = "none";
      document.getElementById("canceltradebutton").style.display = "none";
      document.getElementById("trade-leftp-name").innerText = this.players[
        initiator
      ].fullName;
      document.getElementById("trade-rightp-name").innerText = this.players[
        acceptor].fullName;
      document.getElementById("trade-leftp-money").disabled = true;
      document
        .getElementById("trade-leftp-money")
        .setAttribute("value", moneyGiven);
      document.getElementById("trade-rightp-money").disabled = true;
      document
        .getElementById("trade-rightp-money")
        .setAttribute("value", moneyTaken);
      document.getElementById("trade-leftp-property").innerHTML = propertyGiven;
      document.getElementById(
        "trade-rightp-property"
      ).innerHTML = propertyTaken;
      const acceptTrade = document.getElementById("accepttradebutton");
      acceptTrade.style.display = "";
      acceptTrade.onclick = () => {
        if(acceptor===this.myPlayerIndex){
          document.getElementsByClassName(
              "card-content-container"
            )[0].style.display = "";
            document.getElementsByClassName(
              "card-blur-container"
            )[0].style.display = "";
            document.getElementById("trade").style.display = "none";
        }

        this.acceptTrade( initiator,
          acceptor,
          propertyGiven,
          moneyGiven,
          moneyTaken,
          propertyTaken
        );
      } 


      const rejectTrade = document.getElementById("rejecttradebutton");
      rejectTrade.style.display = "";
      rejectTrade.onclick = reject_trade.bind(this);
      function reject_trade() {
        if (acceptor === this.myPlayerIndex) {
          document.getElementById("trade").style.display = "none";
          document.getElementsByClassName(
            "card-content-container"
          )[0].style.display = "";
          console.log(this.reject)
          this.reject(initiator, acceptor);
        }

        //  if (initiator === this.myPlayerIndex) {
        //   console.log(initiator);
        //   let div = document.getElementById("waitTrade");
        //   div.remove();
        //   document.getElementsByClassName("card-content-container")[0].style.display = "";
        //   document.getElementsByClassName("card-blue-container")[0].style.display = "";
        // } 
        // if(initiator !== this.myPlayerIndex &&acceptor !== this.myPlayerIndex) {
        //   this.showModal(
        //     initiator,
        //     "trade with" + this.players[acceptor].fullName + "was rejected",
        //     "",
        //     "",
        //     []
        //   );
        // }
      }
    }
    if (initiator === this.myPlayerIndex) {
        document.getElementsByClassName(
            "card-content-container"
          )[0].style.display = "none";
        document.getElementsByClassName(
            "card-blur-container"
          )[0].style.display = "none";
      let div = document.createElement("div");
      div.setAttribute("id", "waitTrade");
      div.innerHTML = `<h3>Awaiting players</h4>`;
      let trade = document.getElementById("trade");
      trade.before(div);

    } if(initiator !== this.myPlayerIndex && acceptor !== this.myPlayerIndex)
     {this.showModal(
        initiator,
        this.players[initiator].fullName +
          "trading with " +
          this.players[acceptor].fullName,
        "Please wait",
        "",
        []
      );}
  }

  acceptTradeHandler(message) {
      console.log(message)
    document.getElementById("trade").style.display = "none";
        // table display none
        // modal display ""
        this.changeCashAmount(message.updatedPlayersCash)
        
        if(message.initiator===this.myPlayerIndex){
            document.getElementsByClassName(
                "card-content-container"
              )[0].style.display = "none";
            document.getElementsByClassName(
                "card-blur-container"
              )[0].style.display = "none";
         document.getElementById('waitTrade').innerHTML=`<h4>Trade Accepted</h4>`
         setTimeout(()=>{
            document.getElementById("waitTrade").remove();
            document.getElementsByClassName(
                "card-content-container"
              )[0].style.display = "";
              document.getElementsByClassName(
                "card-blur-container"
              )[0].style.display = "";
         },2000)
        }

  }
  
  acceptTrade( initiator,
    acceptor,
    propertyGiven,
    moneyGiven,
    moneyTaken,
    propertyTaken,) {
        console.log("sent");
    this.socket.send(
      JSON.stringify({
        action: "accept",
    initiator,
        acceptor,
        propertyGiven,
        moneyGiven,
        moneyTaken,
        propertyTaken,
        hostname: this.hostName,
      })
    );
  }

  rejectTradeHandler(message){
    console.log(message);
    if(this.myPlayerIndex===message.initiator){
      let div = document.getElementById("waitTrade");
      div.remove();
      document.getElementsByClassName("card-content-container")[0].style.display = "";
      document.getElementsByClassName("card-blur-container")[0].style.display = "";
    }  
    if(message.initiator !== this.myPlayerIndex && message.acceptor !== this.myPlayerIndex) {
        // div vala logic, and disp modal
    //   this.showModal(
    //     message.initiator,
    //     this.players[message.initiator].fullName +
    //       "trading with " +
    //       this.players[message.acceptor].fullName,
    //     "Please wait",
    //     "",
    //     []
    //   );
    }  
  }

  handleTrade(message) {

    console.log(message, this);
    if (this.myPlayerIndex === this.currentPlayer) {
      document.getElementById("trade").style.display = "inherit";
      document.getElementsByClassName(
        "card-content-container"
      )[0].style.display = "none";
      document.getElementById("accepttradebutton").style.display = "none";
      document.getElementById("rejecttradebutton").style.display = "none";
    }
    let proposeTrade = document.getElementById("proposetradebutton");
    let cancelTrade = document.getElementById("canceltradebutton");
    document.getElementById("trade-leftp-name").innerText = this.players[
      this.currentPlayer
    ].fullName;
    // const that = this
    function startTrade() {
      let currentPlayer = this.currentPlayer;
      let playerSelected = playerSelectedIndex;
      // document.getElementById('accepttradebutton').style.display = '';
      // document.getElementById('rejecttradebutton').style.display = '';
      document.getElementById("proposetradebutton").disabled = "";
      document.getElementById("proposetradebutton").textContent =
        "Trade Proposed";
      //
      //
      let moneyGiven = document.getElementById("trade-leftp-money").value;
      let moneyTaken = document.getElementById("trade-rightp-money").value;

      let propertyGivableIndex = document.getElementsByClassName("leftp-check");
      let propertyGivenIndex = [];
      for (let i = 0; i < propertyGivableIndex.length; i++) {
        if (propertyGivableIndex[i].checked === true) {
          propertyGivenIndex.push(propertyGivableIndex[i].value);
        }
      }
      let propertyTakeableIndex = document.getElementsByClassName(
        "rightp-check"
      );
      let propertyTakenIndex = [];
      for (let i = 0; i < propertyTakeableIndex.length; i++) {
        if (propertyTakeableIndex[i].checked === true) {
          propertyTakenIndex.push(propertyTakeableIndex[i].value);
        }
      }
      console.log(
        currentPlayer,
        playerSelected,
        propertyGivenIndex,
        propertyTakenIndex,
        moneyGiven,
        moneyTaken
      );
      document.getElementsByClassName(
        "card-content-container"
      )[0].style.display = "";
      // this.showModal(currentPlayer, this.players[playerSelected].fullName + ' is deciding...', 'Please wait.','' , [] )

      document.getElementById("trade").style.display = "none";
      this.proposeTrade(
        currentPlayer,
        playerSelected,
        propertyGivenIndex,
        propertyTakenIndex,
        moneyGiven,
        moneyTaken
      );

      //  this.tradeSocket = new WebSocket(`ws://${window.location.host}/game/${this.hostName}`)
    }

    function stopTrade() {
      document.getElementById("trade").style.display = "none";
      document.getElementsByClassName(
        "card-content-container"
      )[0].style.display = "inherit";
    }

    proposeTrade.onclick = startTrade.bind(this);
    cancelTrade.onclick = stopTrade.bind(this);
    let currentPlayer = this.currentPlayer;

    let dropdown = [];
    for (let i = 0; i < message.players_info.length; i++) {
      if (i !== this.myPlayerIndex) {
        dropdown.push(this.players[i].fullName);
      }
    }
    
    let select = document.getElementById('select')
    if (!select) {
      select = document.createElement("select");
      select.setAttribute("id", "select")
    }
    
    document.getElementById('trade-rightp-name').append(select)
    for (let i = 0; i < dropdown.length && dropdown[i] !== -1; i++) {
      let option = document.createElement("option");
      option.innerHTML = dropdown[i];
      select.append(option);
    }

    let playerSelected = document.getElementById("select").value;
    let playerSelectedIndex = null;
    this.players.find((item, index) => {
      if (playerSelected === item.fullName) {
        playerSelectedIndex = index;
        return true;
      }
    })[0];
    console.log(playerSelected, playerSelectedIndex);

    let propertyCurrPlayer = [];
    let propertyRequestedPlayer = [];
    for (let i = 0; i < 40; i++) {
      if (message.players_info[0].owners[i] === currentPlayer) {
      
        propertyCurrPlayer.push(i);

      }
      if (message.players_info[0].owners[i] === playerSelectedIndex)
        propertyRequestedPlayer.push(i);
    }
    // let propertyRequestedPlayer = message.players_info[0].owners.filter((item) => item === playerSelectedIndex);
    console.log(propertyCurrPlayer, propertyRequestedPlayer);

    let table1 = document.createElement("table");
    let table2 = document.createElement("table");
    table1.style.display = "inline-block";
    table1.style.display = "inline-block";
    let table_1 = document.getElementById("trade-leftp-property");
    let table_2 = document.getElementById("trade-rightp-property");
    table_1.innerHTML=''
    table_2.innerHTML=''
    table_1.append(table1);
    table_2.append(table2);

    for (let i = 0; i < propertyCurrPlayer.length; i++) {
      let tr = document.createElement("tr");
      table1.append(tr);
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let input = document.createElement("input");
      input.setAttribute("class", "leftp-check");
      let propertyLabel = this.modalData[propertyCurrPlayer[i]].name;
     
      input.setAttribute("value", propertyLabel);
      input.setAttribute("type", "checkbox");

      // input.setAttribute('value', propertyCurrPlayer[i]);
      let label = document.createElement("label");
      label.innerText = propertyLabel

      input.style.display = "unset";
      td1.append(input);
      td1.append(label);
      // td2.append(propertyCurrPlayer[i]);
      tr.append(td1);
    }

    for (let i = 0; i < propertyRequestedPlayer.length; i++) {
      let tr = document.createElement("tr");
      table2.append(tr);
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let input = document.createElement("input");
      input.setAttribute("class", "rightp-check");
      let propertyLabel = this.modalData[propertyRequestedPlayer[i]].name;
     
      input.setAttribute("value", propertyLabel);
      
      input.style.display = "unset";
      input.setAttribute("type", "checkbox");
      // input.setAttribute('value', propertyRequestedPlayer[i]);
      let label = document.createElement("label");
      label.innerText = propertyLabel;
      td1.append(input);
      td1.append(label);
      // td2.append(propertyLabel);
      tr.append(td1);
    }
  }
  async handleRollRes(message) {
    let currPlayer = message.curr_player;
    let nextPlayer = message.next_player;
    console.log(nextPlayer,currPlayer)
    let steps = message.steps;
    let newPos = message.new_pos;
    let eventMsg = message.result;
    let title = message.title;
    let landname = message.landname;
    let rollResMsg =
      this.players[currPlayer].userName +
      " gets a roll result " +
      steps.toString();

    await this.showModal(
      currPlayer,
      this.players[currPlayer].userName + " got " + steps.toString(),
      "",
      "",
      [],
      2
    );

    await this.gameController.movePlayer(currPlayer, newPos);

    this.audioManager.play("move");

    if (message.bypass_start === "true") {
      let eventMsg =
        this.players[currPlayer].userName +
        " has passed the start point, reward 200.";
      if (message.is_cash_change !== "true") {
        let cash = message.curr_cash;
        this.changeCashAmount(cash);
      }
      await this.showModal(
        currPlayer,
        "Get Reward",
        "Start point",
        eventMsg,
        [],
        2
      );
    }

    if (message.is_option === "true") {
      const buttons =
        this.myPlayerIndex === currPlayer
          ? [
              {
                text: "Buy",
                callback: this.confirmDecision.bind(this),
              },
              {
                text: "No",
                callback: this.cancelDecision.bind(this),
              },
              {
                text: "Trade",
                callback: this.trade.bind(this),
              },
            ]
          : [];

      this.showModal(
        currPlayer,
        title,
        landname,
        this.players[currPlayer].userName + eventMsg,
        buttons
      );
    } else {
      if (message.is_cash_change === "true") {
        await this.showModal(
          currPlayer,
          title,
          landname,
          this.players[currPlayer].userName + eventMsg,
          [],
          3
        );
        let cash = message.curr_cash;
        this.changeCashAmount(cash);
        this.audioManager.play("cash");
        this.changePlayer(nextPlayer, this.onDiceRolled.bind(this));
      } else if (message.new_event === "true") {
        await this.showModal(
          currPlayer,
          title,
          landname,
          this.players[currPlayer].userName + eventMsg,
          [],
          3
        );
        this.changePlayer(nextPlayer, this.onDiceRolled.bind(this));
      } else {
        this.changePlayer(nextPlayer, this.onDiceRolled.bind(this));
      }
    }
  }

  handleBuyLand(message) {
    const { curr_player, curr_cash, tile_id } = message;
    this.changeCashAmount(curr_cash);
    this.gameController.addProperty(
      PropertyManager.PROPERTY_OWNER_MARK,
      tile_id,
      curr_player
    );

    let next_player = message.next_player;
    this.changePlayer(next_player, this.onDiceRolled.bind(this));
  }
  handleExchangeLand(data) {}

  handleConstruct(message) {
    let curr_cash = message.curr_cash;
    let tile_id = message.tile_id;
    this.changeCashAmount(curr_cash);
    if (message.build_type === "house") {
      this.gameController.addProperty(PropertyManager.PROPERTY_HOUSE, tile_id);
    } else {
      this.gameController.addProperty(PropertyManager.PROPERTY_HOTEL, tile_id);
    }
    this.changePlayer(message.next_player, this.onDiceRolled.bind(this));

    this.audioManager.play("build");
  }

  handleCancel(message) {
    let next_player = message.next_player;
    this.changePlayer(next_player, this.onDiceRolled.bind(this));
  }

  async handleGameEnd(message) {
    this.gameInProcess = false;

    let result = [];
    // let loser = message.loser;
    let all_asset = message.all_asset;
    for (let k = 0; k < all_asset.length; k++) {
      let big_asset = -1e20;
      let big_index = 0;
      for (let i = 0; i < all_asset.length; i++) {
        if (all_asset[i] === null) {
          continue;
        }
        if (big_asset < all_asset[i]) {
          big_asset = all_asset[i];
          big_index = i;
        }
      }
      result.push({
        playerIndex: big_index,
        score: big_asset,
      });
      all_asset.splice(big_index, 1, null);
    }
    this.showScoreboard(result);
  }

  handleChat(message) {
    let sender = message.sender;
    let content = message.content;
    this.addChatMessage(sender, content);
  }

  async confirmDecision() {
    this.socket.send(
      JSON.stringify({
        action: "confirm_decision",
        hostname: this.hostName,
      })
    );

    this.audioManager.play("cash");
    await this.hideModal(true);
  }

  async trade() {
    this.socket.send(
      JSON.stringify({
        action: "trade",
        hostname: this.hostName,
      })
    );
  }
  async cancelDecision() {
    this.socket.send(
      JSON.stringify({
        action: "cancel_decision",
        hostname: this.hostName,
      })
    );
    await this.hideModal(true);
  }

  /*
   * Add a chat message
   * playerIndex: int
   * message: string
   * */
  addChatMessage(playerIndex, message) {
    let messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.innerHTML = `
            <img class="chat-message-avatar" src="/static/images/player_${playerIndex}.png">
            <span class="chat-message-content">${message}</span>`;
    this.$chatMessageContainer.appendChild(messageElement);
  }

  sendMessage() {
    const message = this.$chatMessageToSend.value;
    this.socket.send(
      JSON.stringify({
        action: "chat",
        from: this.myPlayerIndex,
        content: message,
      })
    );
    this.$chatMessageToSend.value = "";
  }

  /*
   * ScoreList should be sorted
   * [{
   *   playerIndex: int,
   *   score: int
   * }]
   * */
  showScoreboard(scoreList) {
    let scoreboardTemplate = `<div id="scoreboard">`;
    for (let index in scoreList) {
      let rank = parseInt(index) + 1;
      scoreboardTemplate += `
                <div class="scoreboard-row">
                    <span class="scoreboard-ranking">${rank}</span>
                    <img class="chat-message-avatar" src="${
                      this.players[scoreList[index].playerIndex].avatar
                    }">
                    <span class="scoreboard-username">${
                      this.players[scoreList[index].playerIndex].fullName
                    }</span>
                    <div class="monopoly-cash">M</div>
                    <span class="scoreboard-score">${
                      scoreList[index].score
                    }</span>
                </div>`;
    }
    scoreboardTemplate += "</div>";
    this.$modalCardContent.classList.add("scoreboard-bg");
    this.showModal(null, "Scoreboard", "Good Game!", scoreboardTemplate, [
      {
        text: "Start a New Game",
        callback: () => {
          window.location = `http://${window.location.host}/monopoly/join`;
        },
      },
    ]);
  }

  switchAudio() {
    if (this.audioManager.playing) {
      this.$audioControl.classList.add("control-off");
    } else {
      this.$audioControl.classList.remove("control-off");
    }
    this.audioManager.mute();
  }

  showHelp() {
    this.showingHelp = !this.showingHelp;

    if (this.showingHelp) {
      this.$helpControl.classList.remove("control-off");
      this.$helpOverlay.classList.remove("hidden");
    } else {
      this.$helpControl.classList.add("control-off");
      this.$helpOverlay.classList.add("hidden");
    }
  }

  endGame() {
    this.socket.send(
      JSON.stringify({
        action: "end_game",
      })
    );
  }

  // async handleGameEnd() {
  //     await this.showModal(null, "Game Terminated by Host", "", "Navigating back...", [], 5);
  //     window.location = `http://${window.location.host}/monopoly/join`;
  // }
}

window.onload = () => {
  new GameView();
};

GameView.DEFAULT_AVATAR = "/static/images/favicon.png";

GameView.PLAYERS_COLORS = ["#FFD54F", "#90CAF9", "#E0E0E0", "#B39DDB"];