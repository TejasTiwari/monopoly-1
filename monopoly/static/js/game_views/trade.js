
	// Trade functions:



	var currentInitiator;
	var currentRecipient;

	// Define event handlers:

	// var tradeMoneyOnKeyDown = function (e) {
	// 	var key = 0;
	// 	var isCtrl = false;
	// 	var isShift = false;

	// 	if (window.event) {
	// 		key = window.event.keyCode;
	// 		isCtrl = window.event.ctrlKey;
	// 		isShift = window.event.shiftKey;
	// 	} else if (e) {
	// 		key = e.keyCode;
	// 		isCtrl = e.ctrlKey;
	// 		isShift = e.shiftKey;
	// 	}

	// 	if (isNaN(key)) {
	// 		return true;
	// 	}

	// 	if (key === 13) {
	// 		return false;
	// 	}

	// 	// Allow backspace, tab, delete, arrow keys, or if control was pressed, respectively.
	// 	if (key === 8 || key === 9 || key === 46 || (key >= 35 && key <= 40) || isCtrl) {
	// 		return true;
	// 	}

	// 	if (isShift) {
	// 		return false;
	// 	}

	// 	// Only allow number keys.
	// 	return (key >= 48 && key <= 57) || (key >= 96 && key <= 105);
	// };

	// var tradeMoneyOnFocus = function () {
	// 	this.style.color = "black";
	// 	if (isNaN(this.value) || this.value === "0") {
	// 		this.value = "";
	// 	}
	// };

	// var tradeMoneyOnChange = function(e) {
	// 	$("#proposetradebutton").show();
	// 	$("#canceltradebutton").show();
	// 	$("#accepttradebutton").hide();
	// 	$("#rejecttradebutton").hide();

	// 	var amount = this.value;

	// 	if (isNaN(amount)) {
	// 		this.value = "This value must be a number.";
	// 		this.style.color = "red";
	// 		return false;
	// 	}

	// 	amount = Math.round(amount) || 0;
	// 	this.value = amount;

	// 	if (amount < 0) {
	// 		this.value = "This value must be greater than 0.";
	// 		this.style.color = "red";
	// 		return false;
	// 	}

	// 	return true;
	// };

	// document.getElementById("trade-leftp-money").onkeydown = tradeMoneyOnKeyDown;
	// document.getElementById("trade-rightp-money").onkeydown = tradeMoneyOnKeyDown;
	// document.getElementById("trade-leftp-money").onfocus = tradeMoneyOnFocus;
	// document.getElementById("trade-rightp-money").onfocus = tradeMoneyOnFocus;
	// document.getElementById("trade-leftp-money").onchange = tradeMoneyOnChange;
	// document.getElementById("trade-rightp-money").onchange = tradeMoneyOnChange;

	var resetTrade = function(initiator, recipient, allowRecipientToBeChanged) {
		var currentSquare;
		var currentTableRow;
		var currentTableCell;
		var currentTableCellCheckbox;
		var nameSelect;
		var currentOption;
		var allGroupUninproved;
		var currentName;

		var tableRowOnClick = function(e) {
			var checkboxElement = this.firstChild.firstChild;

			if (checkboxElement !== e.srcElement) {
				checkboxElement.checked = !checkboxElement.checked;
			}

			$("#proposetradebutton").show();
			$("#canceltradebutton").show();
			$("#accepttradebutton").hide();
			$("#rejecttradebutton").hide();
		};

		var initiatorProperty = document.getElementById("trade-leftp-property");
		var recipientProperty = document.getElementById("trade-rightp-property");

		currentInitiator = initiator;
		currentRecipient = recipient;

		// Empty elements.
		while (initiatorProperty.lastChild) {
			initiatorProperty.removeChild(initiatorProperty.lastChild);
		}

		while (recipientProperty.lastChild) {
			recipientProperty.removeChild(recipientProperty.lastChild);
		}

		var initiatorSideTable = document.createElement("table");
		var recipientSideTable = document.createElement("table");


		for (var i = 0; i < 40; i++) {
			currentSquare = square[i];

			// A property cannot be traded if any properties in its group have been improved.
			if (currentSquare.house > 0 || currentSquare.groupNumber === 0) {
				continue;
			}

			allGroupUninproved = true;
			var max = currentSquare.group.length;
			for (var j = 0; j < max; j++) {

				if (square[currentSquare.group[j]].house > 0) {
					allGroupUninproved = false;
					break;
				}
			}

			if (!allGroupUninproved) {
				continue;
			}

			// Offered properties.
			if (currentSquare.owner === initiator.index) {
				currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "tradeleftcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in the trade.";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNumber == 1 || currentSquare.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentSquare.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentSquare.name;

			// Requested properties.
			} else if (currentSquare.owner === recipient.index) {
				currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "traderightcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in the trade.";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNumber == 1 || currentSquare.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentSquare.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentSquare.name;
			}
		}

		// if (initiator.communityChestJailCard) {
		// 	currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
		// 	currentTableRow.onclick = tableRowOnClick;

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcheckbox";
		// 	currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
		// 	currentTableCellCheckbox.type = "checkbox";
		// 	currentTableCellCheckbox.id = "tradeleftcheckbox40";
		// 	currentTableCellCheckbox.title = "Check this box to include this Get Out of Jail Free Card in the trade.";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcolor";
		// 	currentTableCell.style.backgroundColor = "white";
		// 	currentTableCell.style.borderColor = "grey";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellname";

		// 	currentTableCell.textContent = "Get Out of Jail Free Card";
		// } else if (recipient.communityChestJailCard) {
		// 	currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
		// 	currentTableRow.onclick = tableRowOnClick;

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcheckbox";
		// 	currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
		// 	currentTableCellCheckbox.type = "checkbox";
		// 	currentTableCellCheckbox.id = "traderightcheckbox40";
		// 	currentTableCellCheckbox.title = "Check this box to include this Get Out of Jail Free Card in the trade.";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcolor";
		// 	currentTableCell.style.backgroundColor = "white";
		// 	currentTableCell.style.borderColor = "grey";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellname";

		// 	currentTableCell.textContent = "Get Out of Jail Free Card";
		// }

		// if (initiator.chanceJailCard) {
		// 	currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
		// 	currentTableRow.onclick = tableRowOnClick;

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcheckbox";
		// 	currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
		// 	currentTableCellCheckbox.type = "checkbox";
		// 	currentTableCellCheckbox.id = "tradeleftcheckbox41";
		// 	currentTableCellCheckbox.title = "Check this box to include this Get Out of Jail Free Card in the trade.";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcolor";
		// 	currentTableCell.style.backgroundColor = "white";
		// 	currentTableCell.style.borderColor = "grey";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellname";

		// 	currentTableCell.textContent = "Get Out of Jail Free Card";
		// } else if (recipient.chanceJailCard) {
		// 	currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
		// 	currentTableRow.onclick = tableRowOnClick;

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcheckbox";
		// 	currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
		// 	currentTableCellCheckbox.type = "checkbox";
		// 	currentTableCellCheckbox.id = "traderightcheckbox41";
		// 	currentTableCellCheckbox.title = "Check this box to include this Get Out of Jail Free Card in the trade.";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellcolor";
		// 	currentTableCell.style.backgroundColor = "white";
		// 	currentTableCell.style.borderColor = "grey";

		// 	currentTableCell = currentTableRow.appendChild(document.createElement("td"));
		// 	currentTableCell.className = "propertycellname";

		// 	currentTableCell.textContent = "Get Out of Jail Free Card";
		// }

		if (initiatorSideTable.lastChild) {
			initiatorProperty.appendChild(initiatorSideTable);
		} else {
			initiatorProperty.textContent = initiator.name + " has no properties to trade.";
		}

		if (recipientSideTable.lastChild) {
			recipientProperty.appendChild(recipientSideTable);
		} else {
			recipientProperty.textContent = recipient.name + " has no properties to trade.";
		}

		document.getElementById("trade-leftp-name").textContent = initiator.name;

		currentName = document.getElementById("trade-rightp-name");

		if (allowRecipientToBeChanged && pcount > 2) {
			// Empty element.
			while (currentName.lastChild) {
				currentName.removeChild(currentName.lastChild);
			}

			nameSelect = currentName.appendChild(document.createElement("select"));
			for (var i = 1; i <= pcount; i++) {
				if (i === initiator.index) {
					continue;
				}

				currentOption = nameSelect.appendChild(document.createElement("option"));
				currentOption.value = i + "";
				currentOption.style.color = player[i].color;
				currentOption.textContent = player[i].name;

				if (i === recipient.index) {
					currentOption.selected = "selected";
				}
			}

			nameSelect.onchange = function() {
				resetTrade(currentInitiator, player[parseInt(this.value, 10)], true);
			};

			nameSelect.title = "Select a player to trade with.";
		} else {
			currentName.textContent = recipient.name;
		}

		document.getElementById("trade-leftp-money").value = "0";
		document.getElementById("trade-rightp-money").value = "0";

	};

	var readTrade = function() {
		var initiator = currentInitiator;
		var recipient = currentRecipient;
		var property = new Array(40);
		var money;
		var communityChestJailCard;
		var chanceJailCard;

		for (var i = 0; i < 40; i++) {

			if (document.getElementById("tradeleftcheckbox" + i) && document.getElementById("tradeleftcheckbox" + i).checked) {
				property[i] = 1;
			} else if (document.getElementById("traderightcheckbox" + i) && document.getElementById("traderightcheckbox" + i).checked) {
				property[i] = -1;
			} else {
				property[i] = 0;
			}
		}

		// if (document.getElementById("tradeleftcheckbox40") && document.getElementById("tradeleftcheckbox40").checked) {
		// 	communityChestJailCard = 1;
		// } else if (document.getElementById("traderightcheckbox40") && document.getElementById("traderightcheckbox40").checked) {
		// 	communityChestJailCard = -1;
		// } else {
		// 	communityChestJailCard = 0;
		// }

		// if (document.getElementById("tradeleftcheckbox41") && document.getElementById("tradeleftcheckbox41").checked) {
		// 	chanceJailCard = 1;
		// } else if (document.getElementById("traderightcheckbox41") && document.getElementById("traderightcheckbox41").checked) {
		// 	chanceJailCard = -1;
		// } else {
		// 	chanceJailCard = 0;
		// }

		money = parseInt(document.getElementById("trade-leftp-money").value, 10) || 0;
		money -= parseInt(document.getElementById("trade-rightp-money").value, 10) || 0;

		var trade = new Trade(initiator, recipient, money, property, communityChestJailCard, chanceJailCard);

		return trade;
	};

	var writeTrade = function(tradeObj) {
		resetTrade(tradeObj.getInitiator(), tradeObj.getRecipient(), false);

		for (var i = 0; i < 40; i++) {

			if (document.getElementById("tradeleftcheckbox" + i)) {
				document.getElementById("tradeleftcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === 1) {
					document.getElementById("tradeleftcheckbox" + i).checked = true;
				}
			}

			if (document.getElementById("traderightcheckbox" + i)) {
				document.getElementById("traderightcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === -1) {
					document.getElementById("traderightcheckbox" + i).checked = true;
				}
			}
		}

		// if (document.getElementById("tradeleftcheckbox40")) {
		// 	if (tradeObj.getCommunityChestJailCard() === 1) {
		// 		document.getElementById("tradeleftcheckbox40").checked = true;
		// 	} else {
		// 		document.getElementById("tradeleftcheckbox40").checked = false;
		// 	}
		// }

		// if (document.getElementById("traderightcheckbox40")) {
		// 	if (tradeObj.getCommunityChestJailCard() === -1) {
		// 		document.getElementById("traderightcheckbox40").checked = true;
		// 	} else {
		// 		document.getElementById("traderightcheckbox40").checked = false;
		// 	}
		// }

		// if (document.getElementById("tradeleftcheckbox41")) {
		// 	if (tradeObj.getChanceJailCard() === 1) {
		// 		document.getElementById("tradeleftcheckbox41").checked = true;
		// 	} else {
		// 		document.getElementById("tradeleftcheckbox41").checked = false;
		// 	}
		// }

		// if (document.getElementById("traderightcheckbox41")) {
		// 	if (tradeObj.getChanceJailCard() === -1) {
		// 		document.getElementById("traderightcheckbox41").checked = true;
		// 	} else {
		// 		document.getElementById("traderightcheckbox41").checked = false;
		// 	}
		// }

		if (tradeObj.getMoney() > 0) {
			document.getElementById("trade-leftp-money").value = tradeObj.getMoney() + "";
		} else {
			document.getElementById("trade-rightp-money").value = (-tradeObj.getMoney()) + "";
		}

	};

	this.trade = function(tradeObj) {
		$("#board").hide();
		$("#control").hide();
		$("#trade").show();
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		if (tradeObj instanceof Trade) {
			writeTrade(tradeObj);
			this.proposeTrade();
		} else {
			var initiator = player[turn];
			var recipient = turn === 1 ? player[2] : player[1];

			currentInitiator = initiator;
			currentRecipient = recipient;

			resetTrade(initiator, recipient, true);
		}
	};


	this.cancelTrade = function() {
		$("#board").show();
		$("#control").show();
		$("#trade").hide();


		// if (!player[turn].human) {
		// 	player[turn].AI.alertList = "";
		// 	game.next();
		// }

	};

	this.acceptTrade = function(tradeObj) {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "This value must be a number.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "This value must be a number.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var showAlerts = true;
		var money;
		var initiator;
		var recipient;

		if (tradeObj) {
			showAlerts = false;
		} else {
			tradeObj = readTrade();
		}

		money = tradeObj.getMoney();
		initiator = tradeObj.getInitiator();
		recipient = tradeObj.getRecipient();


		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " does not have $" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// Ensure that some properties are selected.
		for (var i = 0; i < 40; i++) {
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		// isAPropertySelected |= tradeObj.getCommunityChestJailCard();
		// isAPropertySelected |= tradeObj.getChanceJailCard();

		if (isAPropertySelected === 0) {
			popup("<p>One or more properties must be selected in order to trade.</p>");

			return false;
		}

		if (showAlerts && !confirm(initiator.name + ", are you sure you want to make this exchange with " + recipient.name + "?")) {
			return false;
		}

		// Exchange properties
		for (var i = 0; i < 40; i++) {

			if (tradeObj.getProperty(i) === 1) {
				square[i].owner = recipient.index;
				addAlert(recipient.name + " received " + square[i].name + " from " + initiator.name + ".");
			} else if (tradeObj.getProperty(i) === -1) {
				square[i].owner = initiator.index;
				addAlert(initiator.name + " received " + square[i].name + " from " + recipient.name + ".");
			}

		}

		// if (tradeObj.getCommunityChestJailCard() === 1) {
		// 	initiator.communityChestJailCard = false;
		// 	recipient.communityChestJailCard = true;
		// 	addAlert(recipient.name + ' received a "Get Out of Jail Free" card from ' + initiator.name + ".");
		// } else if (tradeObj.getCommunityChestJailCard() === -1) {
		// 	initiator.communityChestJailCard = true;
		// 	recipient.communityChestJailCard = false;
		// 	addAlert(initiator.name + ' received a "Get Out of Jail Free" card from ' + recipient.name + ".");
		// }

		// if (tradeObj.getChanceJailCard() === 1) {
		// 	initiator.chanceJailCard = false;
		// 	recipient.chanceJailCard = true;
		// 	addAlert(recipient.name + ' received a "Get Out of Jail Free" card from ' + initiator.name + ".");
		// } else if (tradeObj.getChanceJailCard() === -1) {
		// 	initiator.chanceJailCard = true;
		// 	recipient.chanceJailCard = false;
		// 	addAlert(initiator.name + ' received a "Get Out of Jail Free" card from ' + recipient.name + ".");
		// }

		// Exchange money.
		if (money > 0) {
			initiator.pay(money, recipient.index);
			recipient.money += money;

			addAlert(recipient.name + " received $" + money + " from " + initiator.name + ".");
		} else if (money < 0) {
			money = -money;

			recipient.pay(money, initiator.index);
			initiator.money += money;

			addAlert(initiator.name + " received $" + money + " from " + recipient.name + ".");
		}

		updateOwned();
		updateMoney();

		$("#board").show();
		$("#control").show();
		$("#trade").hide();

		// if (!player[turn].human) {
		// 	player[turn].AI.alertList = "";
		// 	game.next();
		// }
	};

	this.proposeTrade = function() {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "This value must be a number.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "This value must be a number.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var tradeObj = readTrade();
		var money = tradeObj.getMoney();
		var initiator = tradeObj.getInitiator();
		var recipient = tradeObj.getRecipient();
		var reversedTradeProperty = [];

		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " does not have $" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// Ensure that some properties are selected.
		for (var i = 0; i < 40; i++) {
			reversedTradeProperty[i] = -tradeObj.getProperty(i);
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		// isAPropertySelected |= tradeObj.getCommunityChestJailCard();
		// isAPropertySelected |= tradeObj.getChanceJailCard();

		if (isAPropertySelected === 0) {
			popup("<p>One or more properties must be selected in order to trade.</p>");

			return false;
		}

		if (initiator.human && !confirm(initiator.name + ", are you sure you want to make this offer to " + recipient.name + "?")) {
			return false;
		}

		var reversedTrade = new Trade(recipient, initiator, -money, reversedTradeProperty, -tradeObj.getCommunityChestJailCard(), -tradeObj.getChanceJailCard());

		if (recipient.human) {

			writeTrade(reversedTrade);

			$("#proposetradebutton").hide();
			$("#canceltradebutton").hide();
			$("#accepttradebutton").show();
			$("#rejecttradebutton").show();

			addAlert(initiator.name + " initiated a trade with " + recipient.name + ".");
			popup("<p>" + initiator.name + " has proposed a trade with you, " + recipient.name + ". You may accept, reject, or modify the offer.</p>");
		} else {
			var tradeResponse = recipient.AI.acceptTrade(tradeObj);

			if (tradeResponse === true) {
				popup("<p>" + recipient.name + " has accepted your offer.</p>");
				this.acceptTrade(reversedTrade);
			} else if (tradeResponse === false) {
				popup("<p>" + recipient.name + " has declined your offer.</p>");
				return;
			} else if (tradeResponse instanceof Trade) {
				popup("<p>" + recipient.name + " has proposed a counteroffer.</p>");
				writeTrade(tradeResponse);

				$("#proposetradebutton, #canceltradebutton").hide();
				$("#accepttradebutton").show();
				$("#rejecttradebutton").show();
			}
		}
	};