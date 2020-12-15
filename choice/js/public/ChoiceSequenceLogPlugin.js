// paste the following code into index.html (without comment tag)
// <script src="../../js/ChoiceSequenceLogPlugin.js"></script>	<!-- ChoiceSequenceLogPlugin -->
// place above script tag containing src attribute that begins with 'mygame.js'

// Ext function toggle (set true/false to enable/disable)
var consoleLog = true; // toggles logging to console when calling events
var randToggle = true; // toggles logging for rand command if enabled as input
var logButtonToggle = true; // toggles button to display sequence log

// ChoiceSequenceLogPlugin
////
var ChoiceSequenceLogPlugin = {}

// constants
var checkedLogValue; // constant value for sequence log
var isMainGame; // checks if current screen is part of main game
var logLineNum; // gets line number from current scene
var logLineText; // gets line text based off logLineNum
var nextEle = document.getElementsByClassName("next")[0]; // gets element with class name 'next'
var returnGameString = "Return to the Game"; // string used to indicate return to main game scene

// initialize plugin
ChoiceSequenceLogPlugin._init = function () {
	// check if html file uses script file 'strings.js'
	if (typeof strings !== "undefined") {
		var defReturnGameString = returnGameString; // backup returnGameString if strings not found
		returnGameString = strings.return_game_action || defReturnGameString;
	}
	
	// set var to return bool based on function 
	isMainGame = function() {
		return ChoiceSequenceLogPlugin._checkMainGame();
	};
	
	// run event handler for body of html file
	ChoiceSequenceLogPlugin._bodyEventEle();
	
	// check if logButtonToggle is enabled
	if (logButtonToggle) {
		// 	initialize log button
		ChoiceSequenceLogPlugin._initLogButton();
	}
}

// check if elements within body of html file available for event handling
ChoiceSequenceLogPlugin._bodyEventEle = function () {
	// event handling on click within body of html file
	ChoiceSequenceLogPlugin._handleAddEvent(document.getElementsByTagName("body")[0], "click", function (event) {
		// get element that was clicked
		var eventTarget = event.target;
		
		// target is button with class 'next'
		if ((eventTarget.tagName.toLowerCase() == "button") && (eventTarget.getAttribute("class") == "next")) {
			// run event when button is clicked
			ChoiceSequenceLogPlugin._onClickNextButton(nextEle);
		}
	});
	
	// event handling on submit within body of html file
	ChoiceSequenceLogPlugin._handleAddEvent(document.getElementsByTagName("body")[0], "submit", function (event) {
		// get element that was submitted
		var eventTarget = event.target;
		
		// target is form with action '#'
		if ((eventTarget.tagName.toLowerCase() == "form") && (eventTarget.getAttribute("action") == "#")) {
			// run event when form is submitted
			ChoiceSequenceLogPlugin._onSubmitForm(eventTarget);
		}
	});
	
	// event handling on focusin within body of html file
	ChoiceSequenceLogPlugin._handleAddEvent(document.getElementsByTagName("body")[0], "focusin", function (event) {
		// get element that was submitted
		var eventTarget = event.target;
		
		// target is element with class 'next' or input
		if ((eventTarget.getAttribute("class") == "next") || (eventTarget.tagName.toLowerCase() == "input")) {
			// run event when element is focusined
			ChoiceSequenceLogPlugin._onFocusinEle(eventTarget);
		}
	});
}

// generate log button
ChoiceSequenceLogPlugin._initLogButton = function () {
	// check if element with id 'buttons' exists
	if (document.getElementById("buttons")) {
		// create 'Sequence Log' button and append to element with id 'buttons'
		var logButton = document.createElement("button");
		logButton.setAttribute("id", "logButton");
		logButton.setAttribute("class", "spacedLink");
		logButton.setAttribute("onclick", "ChoiceSequenceLogPlugin._onClickLogButton()");
		logButton.innerHTML = "Sequence Log";
		
		// append 'Sequence Log' button to element with id 'buttons'
		document.getElementById("buttons").appendChild(logButton);
	}
	// element not found
	else {
		// display alert
		alertify.alert("ChoiceSequenceLogPlugin: Cannot create 'Sequence Log' button.");
	}
}

// set up vars to handle event on focusin
ChoiceSequenceLogPlugin._onFocusinEle = function (eventTarget) {
	// check if current screen is part of main game
	if (isMainGame()) {
		// get current lines
		logLineNum = window.stats.scene.lineNum;
		logLineText = window.stats.scene.lines[logLineNum - 1];
		
		// get button by class name 'next' and current choicescript command is '*choice' or '*fake_choice'
		if (eventTarget.tagName.toLowerCase() == "button" && (logLineText.includes("*choice") || logLineText.includes("*fake_choice"))) {
			// set array for checked input
			var checkedInput = [];
			
			// get form above button
			var choiceForm = eventTarget.previousElementSibling;
			
			// loop through form
			for (var i = 0; i < choiceForm.length; i++) {
				// current input is checked
				if (choiceForm[i].checked) {
					// add current input to checkedInput array
					checkedInput.push(choiceForm[i]);
				}
			}
			
			// set log value for sequence log
			checkedLogValue = checkedInput[0].value + " (" + checkedInput[0].nextSibling.data + ")";
			// loop through array starting from second value
			for (var i = 1; i < checkedInput.length; i++) {
				// add to current log value
				checkedLogValue = checkedLogValue + ", " + checkedInput[i].value + " (" + checkedInput[i].nextSibling.data + ")";
			}
		}
	}
}

// run event when button with class 'next' is clicked
ChoiceSequenceLogPlugin._onClickNextButton = function (eventTarget) {
	// check if current screen is part of main game
	if (isMainGame()) {
		// current choicescript command is '*choice' or '*fake_choice'
		if (logLineText.includes("*choice") || logLineText.includes("*fake_choice")) {
			// store in current game state
			ChoiceSequenceLogPlugin._setSequenceLog(checkedLogValue);
			
			// log response to console
			if (consoleLog) {
				console.log("Choice selected at line " + logLineNum + ": " + checkedLogValue);
			}
		}
		// current choicescript command does not meet conditions
		else {
			// log response to console
			if (consoleLog) {
				console.log("No recording log for current choicescript command");
			}
		}
	}
	else {
		// log response to console
		if (consoleLog) {
			console.log("No recording log outside of main game");
		}
	}
}

// run event when form is submitted
ChoiceSequenceLogPlugin._onSubmitForm = function (eventTarget) {
	// check if current screen is part of main game
	if (isMainGame()) {
		// current choicescript command is '*input_text' or '*input_number' (or '*rand' if randToggle is enabled)
		if (logLineText.includes("*input_text") || logLineText.includes("*input_number") || (randToggle && logLineText.includes("*rand"))) {
			// get value of input
			var eventValue = eventTarget[0].value || "";
			
			// set log value for sequence log
			var inputLogValue = eventTarget[0].type + " (" + eventValue + ")";
			
			// store in current game state
			ChoiceSequenceLogPlugin._setSequenceLog(inputLogValue);
			
			// log response to console
			if (consoleLog) {
				console.log("Input submitted at line " + logLineNum + ": " + inputLogValue);
			}
		}
		// current choicescript command does not meet conditions
		else {
			// log response to console
			if (consoleLog) {
				console.log("No recording log for current choicescript command");
			}
		}
	}
	else {
		// log response to console
		if (consoleLog) {
			console.log("No recording log outside of main game");
		}
	}
}

// prompt user to name log file
ChoiceSequenceLogPlugin._onClickLogButton = function () {
	// set message for prompt
	var message = "<b><u>Sequence Log - " + window.storeName.replace(/_/g, "__") + "</u></b>";
	
	// set sequence log
	var sequenceLog;
	// check if var '_sequenceLog' exists
	if (window.stats.scene.stats._sequenceLog) {
		// set sequence log
		sequenceLog = window.stats.scene.stats._sequenceLog;
		sequenceLog = sequenceLog.replace(new RegExp(/\), /, "g"), "),\n");
	}
	
	// set html text area for sequence log
	var logTextArea = "<textarea id=\"logTextArea\" cols=40 rows=30 readonly=true>" + sequenceLog + "</textarea>";
	message = message + "<br><br>" + logTextArea;
	
	// set alert if browser does not have Blob enabled (unable to download as text file)
	if (!window.Blob) {
		// display alert
		alertify.alert(message + "<br><br>To save this log, copy the above content to a text file.");
	}
	// browser has Blob enabled (enable download as text file)
	else {
		// display confirm prompt
		alertify.confirm(message + "<br><br>To save this log, copy the above content to a text file, or press 'OK' below to download the log.", function (result) {
			// 'Cancel' selected
			if (!result) {
				return;
			}
			// 'OK' selected
			else {
				ChoiceSequenceLogPlugin._onSaveSequenceLog(sequenceLog);
			}
		});
	}
}

// prompt user to name log file
ChoiceSequenceLogPlugin._onSaveSequenceLog = function (sequenceLog) {
	// create prompt
	alertify.prompt("What would you like to call this log file?<br>Leaving this blank will result in a game identifier.", function(okPrompt, exportName) {
		// 'OK' button selected
		if (okPrompt) {
			// run sequence log generator
			ChoiceSequenceLogPlugin._generateSequenceLog(sequenceLog, exportName);
		}
	}, /* default value */ );
}

// generate sequence log text file
ChoiceSequenceLogPlugin._generateSequenceLog = function (sequenceLog, exportName) {
	// create text file
	var textFile = new Blob([sequenceLog], {type: "text/plain;charset=utf-8"});
	
	// create pseudo-hyperlink
	var sequenceLogLink = document.createElement("a");
	var textFileUrl = window.URL.createObjectURL(textFile);
	sequenceLogLink.setAttribute("id", "sequenceLogLink");
	sequenceLogLink.setAttribute("href", textFileUrl);
	sequenceLogLink.setAttribute("download", (exportName || (window.storeName.replace(/_/g, "__") + " - Sequence Log")) + ".txt");
	sequenceLogLink.click();
	// remove hyperlink after use
	window.URL.revokeObjectURL(textFileUrl);
	if (document.getElementById("sequenceLogLink")) {
		document.getElementById("sequenceLogLink").remove();
	};
}

// check if current scene is part of main game
ChoiceSequenceLogPlugin._checkMainGame = function () {
	// check if element with id 'buttons' exists
	if (document.getElementById("buttons")) {
		// set vars
		var headerButtons = document.getElementById("buttons").children; // set headerButtons array
		var checkMainGame = true; // bool to check if current screen is part of main game
		
		// loop through header buttons
		for (var i = 0; i < headerButtons.length; i++) {
			// check if header button displays returnGameString
			if (headerButtons[i].innerText == returnGameString) {
				// disable checkMainGame
				checkMainGame = false;
				break;
			}
		}
		// throw bool based on checkMainGame toggle
		if (checkMainGame) {
			return true;
		}
		else {
			return false;
		}
	}
	// no header buttons to check for
	else {
		return true;
	}
}

// set sequence log in window
ChoiceSequenceLogPlugin._setSequenceLog = function (eventValue) {
	// check if var '_sequenceLog' exists
	if (window.stats.scene.stats._sequenceLog) {
		// add to current string
		window.stats.scene.stats._sequenceLog = window.stats.scene.stats._sequenceLog + ", " + eventValue;
		
		// add to current game storage
		ChoiceSequenceLogPlugin._saveSequenceLogCookie();
	}
	// no var '_sequenceLog' exists
	else {
		// initialize var
		window.stats.scene.stats._sequenceLog = eventValue;
		
		// add to current game storage
		ChoiceSequenceLogPlugin._saveSequenceLogCookie();
	}
}

// save sequence log to current game storage
ChoiceSequenceLogPlugin._saveSequenceLogCookie = function () {
	restoreObject(initStore(), "state", null, function (gameSave) {
		if (gameSave) {
			// add to storage sequence log
			gameSave.stats._sequenceLog = window.stats.scene.stats._sequenceLog;
			
			// save cookie
			saveCookie(function () {}, "", gameSave.stats, gameSave.temps, gameSave.lineNum, gameSave.indent, this.debugMode, this.nav);
		}
	});
}

// handle add events for different browsers
ChoiceSequenceLogPlugin._handleAddEvent = function (element, eventType, functionValue) {
	// for browsers using attachEvent
	if (element.attachEvent) {
		element.attachEvent("on" + eventType, functionValue);
	}
	// for browsers using addEventListener
	else {
		element.addEventListener(eventType, functionValue);
	}
}

// initialize after a very small delay, so main scripts can catch up
setTimeout(ChoiceSequenceLogPlugin._init, 300);
