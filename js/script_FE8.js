/**************************************
TEB's Eventiel
Please do not use this code outside of the
Emblem Brigade Forums without Cedar's permission.
***************************************/

 /*****Special Thanks To*********************
 
- Nintenlord for making the Event Assembler and EA documentation
- Arch for the "Event Hacking for Dummies" tutorial and bootcamp videos
- Camtech075 for his event doc (featuring Shadowofchaos and DancerA)
- Blazer for the Ultimate Tutorial
- Markyjoe1990 and Nintenlord for the FE8 event template.
- Everyone from the Emblem Brigade for their support and being awesome

 *******************************************/

/******* TODO LIST *****************************
 In General (Reminder notes to self)
 * Clean up code
 * Use external css instead of spamming the html style attribute
 * Comment stuff (search for "COMMENTS UNFINISHED BELOW THIS LINE" to continue commenting)
 * Make it so that refreshing the page doesn't delete everything
   -Save stuff with cookies or something. COOKIES.
 * Figure out the best way to access EA directly through command-line shell or
   something without making the browser think it's a huge security risk
 
 Unit Blocks Editor
 * Add missing class sprites (Zhack):
	 - Birdy (Enemy, NPC)
	 - WSaint
	 - Pistoleer/Pistoleer_F
	 - Trooper/Trooper_F
	 
 * Display some loading text/gif when maps are being loaded
 * 
 
 Event Writer
 * Add the option to edit existing event actions
 * Error: Invalid pointer names are still added even after displaying error message
 * Error: Map pointer images are acting weird
 
 Event Output
 * Allow user to choose if they want their code commented (hmmm...)
 
 Conditions
 * Make an "edit" option available
 * AREA, draw rectangles with the canvas element (low priority)
 * Allow user to manage available event ids (add/edit/delete)
 * Selected condition arrow
 
 Test...STUFF...
 
 Possible Future Tools
 * Tile change events
 * Reading in user's event files
 * Converting event files written for older EA versions to EA v.9.10 format
  (Parser/lexer for EA code)
 * FE8 event writer
 
 ********************************************/

// JQuery code to make textboxes draggable
$(function() {
 $("#SmallTextboxImg").draggable({containment:"#textboxPosImagesDiv"});
 $("#MediumTextboxImg").draggable({containment:"#textboxPosImagesDiv"});
 $("#LargeTextboxImg").draggable({containment:"#textboxPosImagesDiv"});
 });

// Called when page is loaded/refreshed
function setUp(eventFormDictionary, selectedMaps, fe8Defs, zhackDefs, FE8Chapters, FE8Music, FE8Backgrounds, FE8Spells)
{
	//TODO: FIX THIS TO WORK WITH LOCALSTORAGE
	$('#topOutputForm').find('input[type=checkbox]:checked').removeAttr('checked'); //unchecks checkboxes for some reason
	getAvailableEventIds();
	updateSelectOptions(".MapChoices",selectedMaps);
	updateSelectOptions("#sel_chosenChapter",FE8Chapters[0]);
	updateSelectOptions(".ChaptIdsList",FE8Chapters[1]);
	updateSelectOptions(".MusicList",FE8Music);
	updateSelectOptions(".BackgroundList",FE8Backgrounds);
	updateSelectOptions(".SpellList",FE8Spells);
	draw();
	selectDef(fe8Defs, zhackDefs);
	switchEventForm();
	updateEventOutput();
	switchMainForm("EventOutput", eventFormDictionary, fe8Defs);
	
	// Temporary solution gogogo
	document.eventAdderForm.txt_eventInsertionPoint.value = "";
	
	// OOBB is default
	// document.topOutputForm.ckb_fadeToBlack.checked = "checked";
	// toggleOOBBInOpeningEvent();
}


/***
Saving and Loading functions!!!
*/
function saveData(){
	localStorage.setItem("save_html",document.body.innerHTML);
	localStorage.setItem("save_flag","set");
	alert("Saved!")
}

function loadData(){
		//Check if saved flag is set
	if(localStorage.getItem("save_flag") == "set"){
		//restore from save
		document.body.innerHTML = localStorage.getItem("save_html");
		updateEventOutput();
		draw();
	}
	else{
		alert("No save data found!");
	}
}

function clearData(){
	localStorage.removeItem("save_flag");
	alert("Save data cleared.")
}

/*** Used to format definition lists obtained from other sources
  (Not really used in this tool, just for generating the lists)
function getNicelyFormatedList(list)
{
	var retVal = "";
	for(var i = 0; i < list.length; i++)
	{
		var id = list[i].match(/0x[0-9A-Fa-f]+/);
		var name = list[i].replace(/0x[0-9A-Fa-f]+ - /g,"");
		retVal += "\"" + name + " " + id + "\",\n";
	}
	alert(retVal);
}
*/

// Adds temporary and permanent event ids 0x05 - 0xC3
// Also adds condition ids
function getAvailableEventIds()
{
	var eventIds = [];
	var conditionIds = ["0x01","0x02","0x03","0x04"];
	var id = "";
	for(var i = 7; i < 100; i++)
	{
		var integer = i.toString(16);
		if(integer != "43")
		{
			id = "0x" + integer;
			eventIds.push(id);
			conditionIds.push(id);
		}
	}
	updateSelectOptions(".AvailableEventIds", eventIds);
	updateSelectOptions(".AvailableCondIds", conditionIds);
	var permEventIds = [];
	for(var j = 102; j < 195; j++)
	{
		var integer = j.toString(16);
		if(integer != "9c")
			permEventIds.push("0x" + integer);
	}
	updateSelectOptions(".AvailablePermEventIds",permEventIds);
}

/* Changes the highlighting of the specified main form tab
 *
 * Parameters:
 * string id - Id of the tab to highlight/unhighlight
 * boolean highlight - specifies whether the tab should be highlighted/not highlighted
 */
function highlightTab(id, highlight)
{
	var color = (highlight)?("red"):("black");
	var tab = document.getElementById(id);
	tab.style.color = color;
}

// Sets all parts of the event writer invisible
function setAllPartsInvisible()
{
	$(".nav li").each(function() {
		this.style.color = "black";
	});
	
	document.topDefForm.style.display = "none";
	document.topOutputForm.style.display = "none";
	document.topEventForm.style.display = "none";
	document.conditionForm.style.display = "none";
	document.getElementById("eventWriterWrapper").style.display = "none";
	document.getElementById("mapWrapper").style.display = "none";
	document.getElementById("unitEditorWrapper").style.display = "none";
	document.getElementById("unitBlockDiv").style.display = "none";
	document.getElementById("eventBlockWrapper").style.display = "none";
	document.getElementById("condBlockDiv").style.display = "none";
	document.getElementById("txa_eventOutput").style.display = "none";
	document.getElementById("customDefWrapper").style.display = "none";
	document.getElementById("storedDefContentDiv").style.display = "none";
	document.getElementById("manualMoveImgDiv").style.display = "none";
	document.getElementById("unitPointerImgDiv").style.display = "none";
	document.getElementById("eventPointerImgDiv").style.display = "none";
	
	// Bottom jquery code causes TEB site to crash
/*	$("body > *").each(function() {
		if(this.id != "Navigation")
			this.style.display = "none";
	});*/	
}

/* Sets the visibility of the selected main form
 *
 * Parameters:
 * string form - specifies which form to change the visibility of
 * boolean setVisible - set form visible if true, invisible if false
 */
function setSelectedMainFormVisible(form,setVisible,eventFormDictionary)
{
	var visibility = (setVisible)?("inline"):("none");
	
	var formIdArray = eventFormDictionary[form];
	for(var i = 1; i < formIdArray.length; i++)
		document.getElementById(formIdArray[i]).style.display = visibility;
	highlightTab(formIdArray[0], setVisible);

}

/* Switch to the selected main form
 *
 * Parameters:
 * string form - specifies which form to switch to
 */
function switchMainForm(form, eventFormDictionary, fe8Defs)
{
	var prevForm = document.getElementById("hd_selectedEditor").value;
	setSelectedMainFormVisible(prevForm,false,eventFormDictionary);
	setSelectedMainFormVisible(form,true,eventFormDictionary);
	document.getElementById("hd_selectedEditor").value = form;
	if(form == "DefMaker")
		switchToDefMaker(fe8Defs);
	else if(form == "EventWriter")
		switchToEventWriter();
	else if(form == "DefMaker")
		switchToDefMaker(fe8Defs);
	else if(form == "ConditionWriter")
		switchToConditionWriter();
}

// Called when switching to the Definition Maker
function switchToDefMaker(fe8Defs)
{
	updateDefType(fe8Defs);
	getDefinitionsOutput();
	document.getElementById("hd_selectedEditor").value = "DefMaker";
}

// Called when switching to the Event Writer
function switchToEventWriter()
{
	updateEventOutput();
	switchEventForm();
}

// Called when switching to the Event Conditions
function switchToConditionWriter()
{
	updateEventOutput();
	getNextCondition('sel_genCond');
	getNextEvent('sel_genEvent');
	document.getElementById("GenPointer").style.display = "inline";
	document.getElementById("CAMPointer").style.display = "none";
	//document.getElementById("hd_selectedEditor").value = "ConditionWriter";
}

/*****OUTDATED CODE -- see switchMainForm()
function switchToUnitEditor()
{
	setAllPartsInvisible();
	setUnitEditorVisible();
	document.getElementById("hd_selectedEditor").value = "UnitEditor";
}

function switchToEventOutput()
{
	setAllPartsInvisible();
	setEventOutputVisible();
	document.getElementById("hd_selectedEditor").value = "EventOutput";
}
*/

// Resets map pointers and click positions back to (0,0)
function resetMapPointerLoc()
{
	$(".MapClickPos").each(function()
	{
		this.value = 0;
	});
	
	document.getElementById("StartPointer").style.left = "0px";
	document.getElementById("StartPointer").style.top = "0px";
	
	document.getElementById("LoadPointer").style.left = "0px";
	document.getElementById("LoadPointer").style.top = "0px";
}

// Resets unit blocks to default ("Good" and "Bad" unit blocks only)
function resetBlocks()
{
	while(document.topUnitForm.sel_unitBlock.options.length > 0)
		removeBlock(true, "Unit");
	document.topUnitForm.txt_newUnitBlock.value = "Units";
	addBlock("Unit");
}

/* Sets what map clicks do:
 * Add - Sets the click position to the start/load position of a new unit.
 * Edit - Allows user to edit a clicked unit
 * Delete - Deletes the clicked unit
 */
function setMapClickMode()
{
	var mode = getSelectedOption(document.topUnitForm.sel_mapClickMode);
	if(mode == "Add")
	{
		document.unitEditorForm.btn_editUnit.disabled = "disabled";
		document.topUnitForm.sel_unitBlock.disabled = "";
		document.unitEditorForm.txt_unitNum.value = "";
		document.getElementById("unitNum").style.display = "none";
		if(document.unitEditorForm.sel_character.options.length > 0)
			document.unitEditorForm.btn_addUnit.disabled = "";
	}
	else if(mode == "Edit")
	{
		document.unitEditorForm.btn_addUnit.disabled = "disabled";
		document.getElementById("unitNum").style.display = "inline";
		document.topUnitForm.sel_unitBlock.disabled = "disabled";
	}
	else
	{
		document.unitEditorForm.btn_addUnit.disabled = "disabled";
		document.unitEditorForm.btn_editUnit.disabled = "disabled";
		document.getElementById("unitNum").style.display = "none";
		document.topUnitForm.sel_unitBlock.disabled = "disabled";
	}
}	

// Gets rid of all selectable options (for characters, classes, and items) in the Unit Editor form
function clearAllOptions()
{
	document.getElementById("sel_character").innerHTML = "";
	document.getElementById("sel_class").innerHTML = "";
	document.getElementById("sel_leadChar").innerHTML = "";
	document.getElementById("sel_item1").innerHTML = "";
	document.getElementById("sel_item2").innerHTML = "";
	document.getElementById("sel_item3").innerHTML = "";
	document.getElementById("sel_item4").innerHTML = "";
}

/* Updates the options for the specified selection combo box
 *
 * Parameters:
 * string select - selection combo box id
 * Array array - the array containing all the new options to be added to the combo box
 */
function updateSelectOptions(select,array)
{
	$(select).each(function()
	{
		$(this).empty();
		for(key in array)
			$(this).append(optionOpen + array[key] + optionClosed);
	});
}

/* Sets the status of the specified option to selected for any given combo box
 *
 * Parameters:
 * string option - Option that should be selected
 * element select - the select combo box that contains the specified option
 *
 * Returns true if successful
 */
function setSelectedOption(option, select)
{
	var currentOption;
	for(var i = 0; i < select.options.length; i++)
	{
		currentOption = select.options[i];
		if(currentOption.value == option)
		{
			currentOption.selected = "selected";
			return true;
		}
	}
	alert("Error: " + option + " is not an available selection.");
	return false;
}

/* Sets a unit block as the selected unit block
 *
 * Parameter:
 * int num - Id of the unit block to be selected
 *
 * Returns true if successful
 */
function setSelectedBlock(num)
{
	var currentOption, blockId;
	var select = document.topUnitForm.sel_unitBlock;
	for(var i = 0; i < select.options.length; i++)
	{
		currentOption = select.options[i];
		blockId = currentOption.id.match(/[0-9]+/);
		if(blockId == num)
		{
			currentOption.selected = "selected";
			return true;
		}
	}
	alert("Error: " + option + " is not an available selection.");
	return false;
}

/* Gets the selected option of a select combo box
 *
 * Parameter:
 * element form - the combo box
 *
 * Returns selected option (string)
 */
function getSelectedOption(form)
{
	var index = form.selectedIndex;
	return form.options[index].value;
}

/* Get the id number of the selected block, given the block type
 * If no blocks are selected, return -1
 *
 * Paramter:
 * string type - specifies the type of block (Unit, Condition, Event, ManualMove, ScriptedFight)
 *
 * Returns id number
 */
function getSelectedBlock(type)
{
	var form = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	if(form.options[0] !== null && form.options[0] !== undefined)
	{
		var index = form.selectedIndex;
		var block_id = form.options[index].id;
		return block_id.match(/[0-9]+/);
	}
	return -1;
}

/* Get the id number of a block by its name, given the block type
 * If no blocks are selected, return -1
 *
 * Parameters:
 * string name - block name
 * string type - specifies the type of block (Unit, Condition, Event, ManualMove, ScriptedFight)
 *
 * Returns id number
 */
function getBlockIdByName(name, type)
{
	var currentOption, rawId;
	select = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	for(var i = 0; i < select.options.length; i++)
	{
		currentOption = select.options[i];
		if(currentOption.value == name)
		{
			rawId = currentOption.id;
			return rawId.match(/[0-9]+/);
		}
	}
	if(type == "Unit")
	{
		if(name !== "Units" && name !== "Units")
			alert("Error: " + type + " block " + name + "could not be found.");
	}
}

/* Get the name of a block by its id number, given the block type
 *
 * Parameters:
 * int id - block id number
 * string type - specifies the type of block (Unit, Condition, Event, ManualMove, ScriptedFight)
 *
 * Returns block name
 */
function getBlockNameById(id, type)
{
	var currentOption, currentId, raw_currentId;
	select = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	for(var i = 0; i < select.options.length; i++)
	{
		currentOption = select.options[i];
		raw_currentId = currentOption.id;
		currentId = "" + raw_currentId.match(/[0-9]+/);
		id = "" + id;
		if(currentId == id)
			return currentOption.value;
	}
	if(type == "Unit")
	{
		if(name !== "Units" && name !== "Units")
			alert("Error: " + type + " block " + id + "could not be found.");
	}
	
}

// Draws up the map image
function draw() 
{
	var ctx = document.getElementById("mapCanvas").getContext('2d');
	var img = new Image();
	
	// When image loads, make sure the canvas is the correct size
	img.onload = function()
	{
		var canvas = document.getElementById("mapCanvas");
		var width = img.naturalWidth;
		var height = img.naturalHeight;
		var gridlines = document.mapGridLineToggleForm.toggleGridCheck.checked
		// Set canvas size to match image size
		canvas.width = width;
		canvas.height = height;
		updateBlockLocks(width,height);
		// Draw the image
		ctx.drawImage(img, 0, 0, width, height);
		
		/* The below code draws gridlines on the map image
		 *	might be useful if people want an option for gridlines */
	 if(gridlines){
		ctx.strokeStyle="rgba(50,50,50,0.3)";
	 }
		else {
			ctx.strokeStyle="rgba(50,50,50,0)";
	 	}
	 	ctx.lineWidth = 1;
		for(var a = 0; a < width; a+=16)
		{
			for(var b = 0; b < height; b+=16)
			{
				ctx.strokeRect(a,b,16,16);
			}
		}
		
	};
	
	// Load the image
	img.src = document.myCustomMapForm.hiddenMap.value;
	
	// Set default click mode to "Add" (add units by clicking on the map image)
	setSelectedOption("Add", document.topUnitForm.sel_mapClickMode);
	setMapClickMode();
	
	// Sets all the map pointers and click positions to (0,0)
	resetMapPointerLoc();
}

// Load custom map from file
function uploadMap()
{
	var input, file, fr;
	if (typeof window.FileReader !== 'function')
	{
		alert("The file API isn't supported on this browser yet.\n" +
			  'Try using Firefox instead.');
		return;
	}
	input = document.myCustomMapForm.customMapImage;
	if (!input)
		alert("Couldn't find the map image element.");
	else if (!input.files)
	{
		alert("This browser doesn't seem to support the `files` property of file inputs.\n" +
			  'Try using Firefox instead.');
	}
	else if (!input.files[0])
		alert("Please select a file before clicking 'Load'");
	else
	{
		file = input.files[0];
		fr = new FileReader();
		fr.onload = (function()
		{
			document.myCustomMapForm.hiddenMap.value = fr.result;
			draw();
		});
		fr.readAsDataURL(file);
	}
}

/* Checks if a unit block is "locked"
 * (A block is locked when at least one of the units in the block has a 
 *  start/load position that cannot be contained by the current selected map size)
 *
 * Parameter:
 * int num - block id number
 *
 * Returns true if the block is locked
 */
function isBlockLocked(num)
{
	var lockedBlock = document.getElementById("lockedImg" + num);
	return (lockedBlock !== null);
}

/* Called when user changes the selected map
 * This method checks each unit block to see if all their units
 * are within the bounds of the new selected map size
 *
 * If the unit block CANNOT be loaded in the current map size and
 * it is NOT locked, it will be locked (hidding all of its units)
 
 * If the unit block CAN be loaded in the current map sized and
 * it IS locked, it will be unlocked (unhidding all of its units)
 *
 * Parameters:
 * int raw_width - width of the new map pixels
 * int raw_height - height of the new map in pixels
 */
function updateBlockLocks(raw_width,raw_height)
{
	var form = document.getElementById("sel_unitBlock");
	var array = form.options;
	var divIdName, raw_content, coordinates, x1, x2, x_coord, y1, y2, y_coord;
	var mapWidth = (raw_width/16)-1;
	var mapHeight = (raw_height/16)-1;
	var max_x;
	var max_y;
	for(var j = 0; j < array.length; j++)
	{
		max_x = 0;
		max_y = 0;
		var blockNum = array[j].id;
		blockNum = blockNum.match(/[0-9]+/);
		var blockHeader = document.getElementById("b_name" + blockNum);
		var lockedBlock = document.getElementById("lockedImg" + blockNum);
		var visImg = document.getElementById("visImg" + blockNum);
		// If block is not locked
		if(lockedBlock === null)
		{
			var idArray = getAllIdsInBlock(blockNum, "Unit");
			if(idArray !== null)
			{
				for(var i = 0; i < idArray.length; i++)
				{
					divIdName = 'unit' + idArray[i];
					raw_content = document.getElementById(divIdName).innerHTML;
					coordinates = raw_content.split("//")[0].match(/[0-9][0-9]?,[0-9][0-9]?/g);
					//broken??
					// console.log(coordinates)
					// x1 = parseInt(coordinates[0].split(",")[0]);
					// x2 = parseInt(coordinates[1].split(",")[0]);
					// y1 = parseInt(coordinates[0].split(",")[1]);
					// y2 = parseInt(coordinates[1].split(",")[1]);
					// x_coord = (x1 > x2)?(x1):(x2);
					// y_coord = (y1 > y2)?(y1):(y2);
					x_coord = parseInt(coordinates[0].split(",")[0]);
					y_coord = parseInt(coordinates[0].split(",")[1]);
					max_x = (x_coord > max_x)?(x_coord):(max_x);
					max_y = (y_coord > max_y)?(y_coord):(max_y);
				}
				// if max_x is larger than map x or max_y is larger than map y, then lock the block
				if(max_x > mapWidth || max_y > mapHeight)
				{
					var newImg = document.createElement('img');
					newImg.setAttribute('id',"lockedImg" + blockNum);
					newImg.setAttribute('src',"BlockIcons/Locked.png");
					newImg.setAttribute('class',"minMaxImg");
					var newHidden = document.createElement('input');
					newHidden.setAttribute('id',"hd_lockedImg" + blockNum);
					newHidden.setAttribute('type',"hidden");
					newHidden.setAttribute('value',max_x + "," + max_y);
					blockHeader.appendChild(newImg);
					blockHeader.appendChild(newHidden);
					changeVisibilityOfUnitBlock(blockNum,false);
					visImg.style.display = "none";
					hideUnitList(blockNum,true);
				}
			}
		}
		// If block is locked
		else
		{
			var hidden = document.getElementById("hd_lockedImg" + blockNum);
			var raw_maxCoord = "" + hidden.value;
			var maxCoordArray = raw_maxCoord.split(",");
			var visImgSrc = visImg.src;
			// Check if max_x and max_y are smaller than the new map's, and if so, unlock them
			if(maxCoordArray[0] < mapWidth && maxCoordArray[1] < mapHeight)
			{
				blockHeader.removeChild(lockedBlock);
				blockHeader.removeChild(hidden);
				visImg.style.display = "inline";
				hideUnitList(blockNum,false);
				if(visImgSrc.indexOf("Visible") >= 0)
					changeVisibilityOfUnitBlock(blockNum,true);
			}
		}
	}
}

// Loads the selected map
function loadSelectedMap()
{
	// Gets map image from the dropdown list
	var selVal = getSelectedOption(document.myMapSelectForm.mapSelection);
	// Gets the value after the space in the dropdown list item
	var mapIndex = selVal.split(" ");
	document.myCustomMapForm.hiddenMap.value = "ChapterMaps/" + mapIndex.pop() + ".png";
	draw();
}

/* OUTDATED -- Checks if map sprites (and thus units) have been loaded on the map image.
 * If units have been loaded, ask the user if it's okay to delete the units.
 * If there are no units, it's all good.

function okayToDeleteUnitsOnMap()
{
	if(unitsOnMap())
	{
		return confirm("If you change maps, all current unit blocks will be deleted.\n" +
						"Do you still want to change maps? (Okay = change map)");
	}
	return true;
}

function unitsOnMap()
{
	var children = document.getElementById("mapImagesDiv").getElementsByTagName("IMG");
	for(var i = 0; i < children.length; i++)
	{
		if(children[i].id.indexOf("my") >= 0)
			return true;
	}
	return false;
}

 */
 
/* OUTDATED -- Not being used at the moment

function changeMapSprite()
{
	// Changes map sprite based on selected unit class
	var classSprite = getSelectedOption(document.unitEditorForm.sel_class);
	var alleg = getSelectedOption(document.unitEditorForm.sel_side);
	//document.getElementById("MapSprite").src = "https://dl.dropbox.com/u/71611130/" + classSprite + alleg + ".png";
}
 */
 
 /* Handles what happens when a unit's sprite on the map is clicked
  *
  * Parameters:
  * int unitNum - Id number of the unit that was clicked on
  * int listNum - Id number of the unit block the unit belongs to
  */
function clickImg(unitNum, listNum)
{
	var editor = document.getElementById("hd_selectedEditor").value;
	// If the Unit Editor is selected
	if(editor == "UnitEditor")
	{
		var mode = getSelectedOption(document.topUnitForm.sel_mapClickMode);
		// If click mode is "Add," only allow the user to set load coordinates
		if(mode == "Add")
			setLoadCoord(unitNum);
		// If click mode is "Edit," load the clicked unit's data into the unit editor form
		else if(mode == "Edit")
			loadUnitData(unitNum);
		// If click mode is "Delete," delete the clicked unit
		else
			removeUnit(unitNum, listNum);
	}
	// If the Event Writer is selected, return the position of the image
	// Behaves just like if the user had clicked on the map itself
	else if(editor == "EventWriter")
	{
		var img = getImgFromIdNum(unitNum);
		var coordArray = getMapCoordFromImage(img);
		updateEventWriterMapCoord(coordArray[0],coordArray[1]);
	}
}

/* Get the map coordinates (in 16x16px tiles) of a unit sprite on the map
 *
 * Parameters:
 * element img - unit sprite image
 *
 * Returns an array containing x,y coordinates (in tiles) of the sprite's position on the map
 */
function getMapCoordFromImage(img)
{
	var raw_x = img.style.left;
	var raw_y = img.style.top;
	var x = (raw_x.match(/[0-9]+/))/16;
	var y = (raw_y.match(/[0-9]+/))/16;
	return [x,y];
}

/* Returns the map sprite element with the specified id number
 *
 * Parameter:
 * int num - unit id number
 *
 * Returns a map sprite element
 */
function getImgFromIdNum(num)
{
	var imgIdName = 'my'+num+'Img';
	if(num == -1)
		imgIdName = "StartPointer";
	else if(num == -2)
		imgIdName = "LoadPointer";
	return document.getElementById(imgIdName);
}

/* Normally called when the user clicks on a unit sprite on the map.
 * Sets "load position" in the unit editor form
 * to the position of the clicked unit sprite
 * Also sets the event pointer position
 *
 * Parameter:
 * int num - unit id number
 */
function setLoadCoord(num)
{
	var img = getImgFromIdNum(num);
	var arrayCoord = getMapCoordFromImage(img);
	mapX = arrayCoord[0];
	mapY = arrayCoord[1];
	if (!document.unitEditorForm.ckb_bothPos.checked)
	{
		// If Load Position checkbox is checked, update x and y locations
		if(document.unitEditorForm.rd_loadPos.checked)
		{
			document.getElementById("LoadPointer").style.left = mapX*16 + "px";
			document.getElementById("LoadPointer").style.top = mapY*16 + "px";
			document.unitEditorForm.txt_load_x.value = mapX;
			document.unitEditorForm.txt_load_y.value = mapY;
		}
		if(document.unitEditorForm.rd_startPos.checked && (num == -2))
		{
			document.getElementById("StartPointer").style.left = mapX*16 + "px";
			document.getElementById("StartPointer").style.top = mapY*16 + "px";
			document.unitEditorForm.txt_start_x.value = mapX;
			document.unitEditorForm.txt_start_y.value = mapY;
		}
	}
	document.mapClickPosForm.txt_mouseX.value = mapX;
	document.mapClickPosForm.txt_mouseY.value = mapY;
	setEventPos(mapX,mapY);
}

/* Loads the unit data of the specified unit to the Unit Editor form.
 * Called when editing units.
 *
 * Parameter:
 * int num - unit id number
 */
function loadUnitData(num)
{
	// Get raw unit code
	var unitId = "unit" + num;
	var contents = document.getElementById(unitId).innerHTML;
	
	// Parse raw unit code
	var raw_data = contents.split("//");
	var cut1 = raw_data[0].split("Level(");
	var charClass = cut1[0].split(" ");
	var cut2 = cut1[1].split(")");
	var lvlAlleg = cut2[0].split(", ");
	var cut3 = cut2[1].split(/] /);
	var load = cut3[0].replace("[","").replace(" ","").split(",");
	var start = cut3[1].replace("[","").replace(" ","").split(",");
	var items = cut3[2].replace("[","").replace("0x00","No Item").split(", ");
	var cut4 = raw_data[1].split("(");
	cut4 = cut4[1].split(")");
	cut4 = cut4[0].split(", ");
	var listNum = cut4[1];
	
	// Get the hex code for characters, classes, and items
	var contentsHex = document.getElementById("hd_" + unitId).value;
	var charClassHex = contentsHex.split("Level(")[0].split(" ");
	var raw_itemsHex = contentsHex.split(/ \[[0-9]+,[0-9]+\] \[[0-9]+,[0-9]+\] /)[1];
	var itemsHex = raw_itemsHex.split("]")[0].replace("[","").replace("0x00","No Item").split(", ");
	
	// Select the unit block that contains the specified unit that is being edited
	setSelectedBlock(listNum);
	
	// Sets the unit# to the id number of the unit being edited
	document.unitEditorForm.txt_unitNum.value = num;
	
	// Load unit data into the Unit Editor form
	var character = charClass[1] + " " + charClassHex[1];
	setSelectedOption(character, document.unitEditorForm.sel_character);
	var u_class = charClass[2] + " " + charClassHex[2];
	setSelectedOption(u_class, document.unitEditorForm.sel_class);
	var leadChar = charClass[3];
	leadChar = (leadChar == "0x00")?("None"):(leadChar + " " + charClassHex[3]);
	setSelectedOption(leadChar, document.unitEditorForm.sel_leadChar);
	document.unitEditorForm.txt_level.value = lvlAlleg[0];
	var alleg = lvlAlleg[1];
	setSelectedOption(alleg, document.unitEditorForm.sel_side);
	var autolvl = lvlAlleg[2];
	document.unitEditorForm.ckb_autoLevel.checked = (autolvl == 0)?(""):("checked");
	document.unitEditorForm.txt_load_x.value = load[0];
	document.unitEditorForm.txt_load_y.value = load[1];
	document.unitEditorForm.txt_start_x.value = start[0];
	document.unitEditorForm.txt_start_y.value = start[1];
	var itemId;
	while(items.length < 4)
		items.push("No Item");
	for(var i = 0; i < 4; i++)
	{
		var selectId = "sel_item" + (i + 1);
		if(items[i] != "No Item")
			setSelectedOption(items[i] + " " + itemsHex[i], document.getElementById(selectId));
		else
			setSelectedOption("No Item", document.getElementById(selectId));
	}
	var ai = cut3[3].replace(" ","");
	setSelectedOption(ai, document.unitEditorForm.AI);
	
	// Enable the edit button
	document.unitEditorForm.btn_editUnit.disabled = "";
}

/* Returns the data of a unit block, formatted as EA code
 * 
 * Parameter:
 * int num - unit block id number
 *
 * Returns unit block data as a string
 */
function returnUnitData(num)
{
  var listNum = getSelectedBlock("Unit");
  var character = getSelectedOption(document.unitEditorForm.sel_character);
  var u_class = getSelectedOption(document.unitEditorForm.sel_class);
  var leadchar = getSelectedOption(document.unitEditorForm.sel_leadChar);
  leadchar = (leadchar == "None")?("0x00"):(leadchar);
  var level = document.unitEditorForm.txt_level.value;
  var alleg = getSelectedOption(document.unitEditorForm.sel_side);
  var autolvl = 0;
  if(document.unitEditorForm.ckb_autoLevel.checked) autolvl = 1;
  var x_st = document.unitEditorForm.txt_start_x.value;
  var y_st = document.unitEditorForm.txt_start_y.value;
  var x_ld = document.unitEditorForm.txt_load_x.value;
  var y_ld = document.unitEditorForm.txt_load_y.value;
  // Get Flags
  var flags = getSelectedOption(document.unitEditorForm.sel_flag);
  // Get REDAs
  var reda_num = document.unitEditorForm.txt_reda_num.value;
  var reda_num_hex = "0x" + reda_num.toString(16);
  var reda_pointer = document.unitEditorForm.txt_reda_pointer.value;
  if (reda_pointer == '') reda_pointer = "0x00";
  // Get all the items, can probably clean this up later
  var items = "";
  var itemsHex = "";
  var item1 = getSelectedOption(document.unitEditorForm.sel_item1);
  var item2 = getSelectedOption(document.unitEditorForm.sel_item2);
  var item3 = getSelectedOption(document.unitEditorForm.sel_item3);
  var item4 = getSelectedOption(document.unitEditorForm.sel_item4);
  var itemArray = [item2,item3,item4];
  items += (item1 != "No Item")?(item1.match(/[A-Za-z0-9_]+/)):"0x00";
  itemsHex += (item1 != "No Item")?(item1.match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/)):"0x00";
  for(var i = 0; i < 3; i++)
  {
		if(itemArray[i] != "No Item")
		{
			items += ", " + itemArray[i].match(/[0-9A-Za-z_]+/);
			itemsHex += ", " + itemArray[i].match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/);
		}
  }
  var ai = getSelectedOption(document.unitEditorForm.AI);
  var unitHexData = 'UNIT ' + character.match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/) + 
					' ' + u_class.match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/) + 
					' ' + leadchar.match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/) + 
					' Level(' + level + ', ' + alleg + ', ' + autolvl + ') ' + 
					'[' + x_ld + ',' + y_ld + ']' + 
					' ' + flags + ' 0x00 ' + reda_num_hex + ' ' + reda_pointer + //REMEMBER TO ADD THESE!!!
					// '[' + x_st + ',' + y_st + '] ' +
					' [' + itemsHex + '] ' + ai + "\n";
					
  return 'UNIT ' + character.match(/[0-9A-Za-z_]+/) + ' ' + 
		  u_class.match(/[0-9A-Za-z_]+/) + ' ' + leadchar.match(/[0-9A-Za-z_]+/) + 
		 ' Level(' + level + ', ' + alleg + ', ' + autolvl + ') ' +
		 '[' + x_ld + ',' + y_ld + '] ' + flags + ' 0x00 ' + reda_num_hex + ' ' + reda_pointer + 
		 ' [' + items + '] ' + ai + ' //  <a href=\'#\' onclick=\'removeUnit(' + 
		  num + ', ' + listNum + '); return false\'>Delete</a>' +
		  "<input type='hidden' id='hd_unit" + num + "' value = '" + unitHexData + "'>";
}

// Edits the data of the selected unit to match what is in the Unit Editor form
function editUnit(mapSpriteDict)
{
	var num = document.unitEditorForm.txt_unitNum.value;
	var unitId = "unit" + num;
	document.getElementById(unitId).innerHTML = returnUnitData(num);
	setImgPos(num, mapSpriteDict);
	updateEventOutput();
}

/* Gets the position (in 16x16px tiles) of the clicked area on the map.
 * Sets various input values equal to this position,
 * depending on which main form is selected (Unit Editor, Event Writer, or Condition Writer)
 *
 * Parameter:
 * event - associated with click event
 */
function getMapCoord(event)
{
	pos_x = event.offsetX?(event.offsetX):event.pageX-document.getElementById("mapImagesDiv").offsetLeft;
	pos_y = event.offsetY?(event.offsetY):event.pageY-document.getElementById("mapImagesDiv").offsetTop;
	// Divide the x and y click positions (pixels) by 16 pixels, then floor the result to get x and y map tile coordinates
	var imgWidth = (document.getElementById("mapCanvas").width)/16;
	var imgHeight = (document.getElementById("mapCanvas").height)/16;
	// Checks if the click position is at the very edge of the image
	// If the click is on the edge, subtract 1 from the final calculation
	var mapX = (Math.floor(pos_x/16)>=imgWidth)?(Math.floor(pos_x/16)-1):Math.floor(pos_x/16);
	document.mapClickPosForm.txt_mouseX.value = mapX;
	var mapY = (Math.floor(pos_y/16)>=imgHeight)?(Math.floor(pos_y/16)-1):Math.floor(pos_y/16);
	document.mapClickPosForm.txt_mouseY.value = mapY;
	var editor = document.getElementById("hd_selectedEditor").value;
	if(editor == "UnitEditor")
		updateUnitEditorMapCoord(mapX,mapY);
	if(editor == "EventWriter")
		updateEventWriterMapCoord(mapX,mapY);
	if(editor == "ConditionWriter")
		updateConditionWriterMapCoord(mapX,mapY);
}

/* Updates the input values and pointers of the Unit Editor
 * to match the most recent map click position.
 *
 * Parameters:
 * int mapX - x-position of the map click (in 16x16px tiles)
 * int mapY - y-position of the map click (in 16x16px tiles)
 */
function updateUnitEditorMapCoord(mapX,mapY)
{
				// If Start Position checkbox is checked, update x and y locations
				if(document.unitEditorForm.rd_startPos.checked || document.unitEditorForm.ckb_bothPos.checked)
				{
					document.unitEditorForm.txt_start_x.value = mapX;
					document.unitEditorForm.txt_start_y.value = mapY;
					// Reposition map sprite
					document.getElementById("StartPointer").style.left = mapX*16 + "px";
					document.getElementById("StartPointer").style.top = mapY*16 + "px";
					/* Uncomment this if you want the map sprite displayed before you add the unit
					document.getElementById("MapSprite").style.left = mapX*16 + "px";
					document.getElementById("MapSprite").style.top = mapY*16 + "px";
					*/
				}
	// If Load Position checkbox is checked, update x and y locations
	if(document.unitEditorForm.rd_loadPos.checked || document.unitEditorForm.ckb_bothPos.checked)
	{
		document.getElementById("LoadPointer").style.left = mapX*16 + "px";
		document.getElementById("LoadPointer").style.top = mapY*16 + "px";
		document.unitEditorForm.txt_load_x.value = mapX;
		document.unitEditorForm.txt_load_y.value = mapY;
	}
}

/* Updates the input values and pointers of the Event Writer
 * to match the most recent map click position.
 *
 * Parameters:
 * int mapX - x-position of the map click (in 16x16px tiles)
 * int mapY - y-position of the map click (in 16x16px tiles)
 */
function updateEventWriterMapCoord(mapX,mapY)
{
	var eventType = getSelectedOption(document.topEventForm.sel_eventActionType).match(/[A-Za-z_]+/);
	var eventForm = document.getElementById("hd_selectedEventForm").value;
	if(eventType == "Event")			
		setEventPos(mapX,mapY);
	else if(eventType == "Manual_Move")
		setManualMoveStartPos(mapX, mapY);
}

/* Updates the input values and pointers of the Event Conditions form
 * to match the most recent map click position.
 *
 * Parameters:
 * int mapX - x-position of the map click (in 16x16px tiles)
 * int mapY - y-position of the map click (in 16x16px tiles)
 */
function updateConditionWriterMapCoord(mapX,mapY)
{
	var selectedXPosId = document.getElementById("hd_condXPosField").value;
	var selectedYPosId = document.getElementById("hd_condYPosField").value;
	if(selectedXPosId !== "" && selectedXPosId !== undefined && selectedXPosId !== null)
	{
		var selectedXPos = document.getElementById(selectedXPosId);
		var selectedYPos = document.getElementById(selectedYPosId);
		selectedXPos.value = mapX;
		selectedYPos.value = mapY;
		document.getElementById("GenPointer").style.left = mapX*16 + "px";
		document.getElementById("GenPointer").style.top = mapY*16 + "px";
	}
	else
	{
		document.getElementById("GenPointer").style.left = mapX*16 + "px";
		document.getElementById("GenPointer").style.top = mapY*16 + "px";
	}
}

/* Updates the input values and pointers of the Event Writer
 * (when default event block type is chosen)
 * to match the most recent map click position.
 *
 * Parameters:
 * int mapX - x-position of the map click (in 16x16px tiles)
 * int mapY - y-position of the map click (in 16x16px tiles)
 */
function setEventPos(mapX, mapY)
{
	var mapWidth = (document.getElementById("mapCanvas").width)/16;
	var mapHeight = (document.getElementById("mapCanvas").height)/16;
	var maxX = mapWidth - 8;
	var maxY = mapHeight - 6;
	var eventForm = document.getElementById("hd_selectedEventForm").value;
	var selectedXPosId = document.getElementById("hd_selectedXPosField").value;
	var selectedYPosId = document.getElementById("hd_selectedYPosField").value;
	if(eventForm == "scroll" || eventForm == "speech_bubble" || eventForm == "small_brown_box")
	{
		mapX = (mapX > maxX)?(maxX):(mapX);
		mapX = (mapX < 7)?(7):(mapX);
		mapY = (mapY > maxY)?(maxY):(mapY);
		mapY = (mapY < 4)?(4):(mapY);
		document.getElementById("CAMPointer").style.left = (mapX-7)*16 + "px";
		document.getElementById("CAMPointer").style.top = (mapY-4)*16 + "px";
		
		var canvas = document.getElementById('textboxPosEntryCanvas');
		var context = canvas.getContext('2d');
		var imageObj = new Image();

		imageObj.onload = function() {
		// draw cropped image
		var sourceX = (mapX-7)*16;
		var sourceY = (mapY-4)*16;
		var sourceWidth = 240;
		var sourceHeight = 160;
		var destWidth = canvas.width;
		var destHeight = canvas.height;

		context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
		};
		imageObj.src = document.myCustomMapForm.hiddenMap.value;
	}
	else if(selectedXPosId !== "" && selectedXPosId !== undefined && selectedXPosId !== null)
	{
		var selectedXPos = document.getElementById(selectedXPosId);
		var selectedYPos = document.getElementById(selectedYPosId);
		if(eventForm == "focus_view" || eventForm == "load_map" || eventForm == "map_spells")
		{
			mapX = (mapX > maxX)?(maxX):(mapX);
			mapX = (mapX < 7)?(7):(mapX);
			mapY = (mapY > maxY)?(maxY):(mapY);
			mapY = (mapY < 4)?(4):(mapY);
			selectedXPos.value = mapX;
			selectedYPos.value = mapY;
			document.getElementById("CAMPointer").style.left = (mapX-7)*16 + "px";
			document.getElementById("CAMPointer").style.top = (mapY-4)*16 + "px";
		}
		else
		{
			selectedXPos.value = mapX;
			selectedYPos.value = mapY;
			document.getElementById("GenPointer").style.left = mapX*16 + "px";
			document.getElementById("GenPointer").style.top = mapY*16 + "px";
		}
	}
	else
	{
		document.getElementById("GenPointer").style.left = mapX*16 + "px";
		document.getElementById("GenPointer").style.top = mapY*16 + "px";
	}
}

/* Updates the input values and pointers of the Event Writer
 * (when manual move event block type is chosen)
 * to match the most recent map click position.
 *
 * Parameters:
 * int mapX - x-position of the map click (in 16x16px tiles)
 * int mapY - y-position of the map click (in 16x16px tiles)
 */
function setManualMoveStartPos(x,y)
{
	var listNum = getSelectedBlock("ManualMove");
	if(listNum >= 0)
	{
		var listId = "m_list" + listNum;
		var listContents = document.getElementById(listId).innerHTML;
		var isListEmpty = (listContents === null || listContents === undefined || listContents == "");
		var reset = (isListEmpty)?(true):(confirm("Changing the start position will clear all existing movements.\n" +
													"Change the start position anyway?"));
		if(reset)
		{
			clearManualMoveBlockContents(getSelectedBlock("ManualMove"));
			var startPointer = document.getElementById("ManualMoveStartPointer");
			var endPointer = document.getElementById("ManualMoveEndPointer");
			startPointer.style.left = x*16 + "px";
			startPointer.style.top = y*16 + "px";
			endPointer.style.left = x*16 + "px";
			endPointer.style.top = y*16 + "px";
			var blockNum = getSelectedBlock('ManualMove');
			document.getElementById("manualMoveStart" + blockNum).value = x + "," + y;
			document.mapClickPosForm.txt_mouseX.value = x;
			document.mapClickPosForm.txt_mouseY.value = y;
		}
	}
	else
		alert("No manual move blocks exist.\n" + 
			"Create a manual move block first.");
}

/* Updates the recorded x,y positions of the currently selected input
 * in the Event Writer form to match the most recent map click position.
 *
 * Parameters:
 * int x - x-coordinate (in 16x16px tiles) of the most recent map click position
 * int y - y-coordinate (in 16x16px tiles) of the most recent map click position
 */
function setSelectedPosIds(x,y)
{
	document.getElementById("hd_selectedXPosField").value = x;
	document.getElementById("hd_selectedYPosField").value = y;
}

/* Updates the recorded x,y positions of the currently selected input
 * in the Event Conditions form to match the most recent map click position.
 *
 * Parameters:
 * int x - x-coordinate (in 16x16px tiles) of the most recent map click position
 * int y - y-coordinate (in 16x16px tiles) of the most recent map click position
 */
function setSelectedCondPosIds(x,y)
{
	document.getElementById("hd_condXPosField").value = x;
	document.getElementById("hd_condYPosField").value = y;
}

/* Clears contents of a specified manual move block.
 *
 * Parameters:
 * int blockNum - id of the manual move block to be cleared
 */
function clearManualMoveBlockContents(blockNum)
{
	var id = "manualMove" + blockNum + "Id";
	var imgId = "moveImg" + blockNum;
	document.getElementById(id).value = "0";
	$("#manualMoveImgDiv > img").each(function()
	{
		var currentImgId = "" + this.id;
		if(currentImgId.indexOf(imgId) == 0)
			$("#" + currentImgId).remove();
	});
	var listId = "m_list" + blockNum;
	document.getElementById(listId).innerHTML = "";
}

/* When "use the same start and load positions" checkbox is checked, 
	disable checking the start/load pos checkboxes.
	Otherwise, enable the start/load pos checkboxes.
	Set all positions to start position coordinates.
*/
function toggleBothPos()
{	
	var checked = document.unitEditorForm.ckb_bothPos.checked;
	if(!checked)
	{
		document.unitEditorForm.rd_startPos.disabled = "";
		document.unitEditorForm.rd_loadPos.disabled = "";
	}
	else
	{
		document.unitEditorForm.rd_startPos.disabled = "disabled";
		document.unitEditorForm.rd_loadPos.disabled = "disabled";
	}	
	var mapX = document.unitEditorForm.txt_start_x.value;
	document.unitEditorForm.txt_load_x.value = mapX;
	var mapY = document.unitEditorForm.txt_start_y.value;
	document.unitEditorForm.txt_load_y.value = mapY;
	document.getElementById("LoadPointer").style.left = mapX*16 + "px";
	document.getElementById("LoadPointer").style.top = mapY*16 + "px";
}


// Unchecks the specified radio button
function uncheck(radio)
{
	radio.checked = "";
}


/* Adds an event action to the currently selected event block.
 *
 * Parameters:
 * string[] actionDataArray - return value of getActionEventData(), which contains the event code
 */

function addEventAction(actionDataArray)
{
	var insertPoint = document.eventAdderForm.txt_eventInsertionPoint.value;
	var insertPointDiv = "action" + insertPoint;
	var eventNum = getSelectedBlock("Event");
	var eventListId = "e_list" + eventNum;
	var parent = document.getElementById(eventListId);
	var num = getNewBlockElementIdNum("action");
	var newdiv = document.createElement('div');
	var divIdName = 'action' + num;
	newdiv.setAttribute('id',divIdName);
	var actionData = actionDataArray[0];
	
	// If the action is valid
	if(actionDataArray != "invalid input")
	{
			// If the action is not an "endif"
		if(actionDataArray[0].indexOf("Endif") < 0)
		{
			actionData += (document.eventAdderForm.ckb_removeAllText.checked)?("REMA\n"):("");
			actionData += (document.eventAdderForm.ckb_removeTextbox.checked)?("RETB\n_0x89\n"):("");
			actionData += (document.eventAdderForm.ckb_removeOnlyTextBubble.checked)?("REBU\n"):("");
			actionData += (document.eventAdderForm.ckb_pauseUntilFinished.checked)?("ENUN\n"):("");
		}
		actionData += "  // <a href='javascript:setEventInsertionPoint(" + num + "," + eventNum + ");'>Insert Pt.</a>&nbsp;&nbsp;" +
						"<a href='javascript:removeAction(" + num + "," + eventNum + ");'>Delete</a>" +
						"<input type='hidden' id='hd_eventCode" + num + "' value='" + actionDataArray[1] + "'>";
		actionData = "<img src='BlockIcons/SelectArrow.png'>" + actionData;
		newdiv.innerHTML = actionData;
		// If no insertion point specified, append at end
		if(insertPoint == "")
			parent.appendChild(newdiv);
		// If insertion point is -1, insert after "action-1"
		else if(insertPoint == "-1")
		{
			$("#action-1_" + eventNum).after(newdiv);
		}
		// If insertion point is a valid number, insert after insertion point
		else
		{
			$("#" + insertPointDiv).after(newdiv);
			removeInsertionPointer(insertPointDiv);
		}
		// Set new insertion point to after added event
		document.eventAdderForm.txt_eventInsertionPoint.value = num;
		updateEventOutput();
	
		// If adding an additional IF/ELSE
		if(document.getElementById("storedConditionId").value != 0)
		{
			//Lock down everything
			
		}
		
		// If there is a closing action selected (IF/ELSE)
		var closeSet = document.getElementById("sel_closeActionSet");
		var selectedClose = closeSet.selectedIndex;
		
		// If there is something in the close set
		if(selectedClose >= 0)
		{
			var code = "" + closeSet.options[0].value + "\n";
			closeSet.remove(0);
			// Temporarily set selectedEventForm to "" to prevent removed action from being re-added
			actionType = document.getElementById("hd_selectedEventForm").value;
			document.getElementById("hd_selectedEventForm").value = "";
			if(closeSet.options[0] === undefined)
				document.getElementById("closeActionDiv").style.display = "none";
			if(code.indexOf("FADU") == 0)
				addEventAction(["Fade(false,true," + code.match(/[0-9]+/) + ")", code]);
			else if(code.indexOf("FAWU") == 0)
				addEventAction(["Fade(false,false," + code.match(/[0-9]+/) + ")", code]);
			else if(code.indexOf("ENIF") == 0)
				addEventAction(["Endif(" + code.match(/0x[0-9a-fA-F]+/) + ")", code]);
			// Set selectedEventForm back to original setting
			document.getElementById("hd_selectedEventForm").value = actionType;
		}
		// Add stuff to close set
		// Get the type of event action that is being added, which is stored in "hd_selectedEventForm"
		var actionType = document.getElementById("hd_selectedEventForm").value;
		if(actionType == "fade_set")
		{
			$("#sel_closeActionSet").prepend("<option id='closeAction" + num + "_" + eventNum + "'>" 
												+ actionDataArray[1].replace("I","U") + optionClosed);
			document.getElementById("closeActionDiv").style.display = "inline";
		}
		if(actionType.indexOf("if_") == 0 || actionType.indexOf("else") == 0)
		{
			condId = actionDataArray[0].match(/0x[0-9A-Fa-f]+/);
			$("#sel_closeActionSet").prepend("<option id='closeAction" + num + "_" + eventNum + "'>"
												+ "ENIF " + condId + " " + optionClosed);
			document.getElementById("closeActionDiv").style.display = "inline";
		}

	}
	else
		alert("Error: Some required values were left blank.\nAction was not added.");
}

/* Gets the position where new events should be inserted in
 * the event block
 *
 * Parameters:
 * int num - id number of the event that all newly added events should be inserted after
 * int blockNum - block id of the event block that is being editted
 */
function setEventInsertionPoint(num, blockNum)
{
	var selectedBlock = getSelectedBlock('Event');
	if(blockNum == selectedBlock)
	{
		var prevId = document.eventAdderForm.txt_eventInsertionPoint.value;
		if(prevId !== undefined && prevId !== "")
		{
			removeInsertionPointer("action" + prevId);
		}
		document.eventAdderForm.txt_eventInsertionPoint.value = num;
		setInsertionPointer("action" + num);
	}
}

/* Removes the insertion pointer icon from the specified event
 *
 * Parameters:
 * int id - id of the event that has an insertion pointer that should be removed
 */
function removeInsertionPointer(id)
{
	var prevDivContent = "" + document.getElementById(id).innerHTML;
	document.getElementById(id).innerHTML = prevDivContent.replace("<img src=\"BlockIcons/SelectArrow.png\">","");
}

/* Sets the insertion pointer icon in front of the specified event
 *
 * Parameters:
 * int id - id of the event that is getting an insertion pointer
 */
function setInsertionPointer(id)
{
	document.getElementById(id).innerHTML = "<img src=\"BlockIcons/SelectArrow.png\">" +
											document.getElementById(id).innerHTML;
}

/* Sets the insertion pointer icon in front of the specified scripted fight
 *
 * Parameters:
 * int id - id of the scripted fight that is getting an insertion pointer
 */
function setScriptedFightInsertionPoint(num, blockNum)
{
	var selectedBlock = getSelectedBlock('ScriptedFight');
	if(blockNum == selectedBlock)
		document.scriptedFightAdderForm.hd_scriptedFightInsertionPoint.value = num;
}

/* Generates a new block element id for a new block element.
 *
 * Parameters:
 * string type - type of block (i.e., unit, event, scripted fight, etc.)
 */
function getNewBlockElementIdNum(type)
{
  var id = type + "Id";
  var numi = document.getElementById(id);
  var num = (document.getElementById(id).value -1)+ 2;
  numi.value = num;
  return num;
}

// Adds a new unit to the currently selected unit block
function addUnit(mapSpriteDict)
{
	var listNum = getSelectedBlock("Unit");
	
	// If the block is not locked (aka. units can be added to this block)
	// listNum = unit block number
	// num = unit number
	if(!isBlockLocked(listNum))
	{
		var unitListId = "b_list" + listNum;
		var parent = document.getElementById(unitListId);
		var num = getNewBlockElementIdNum("unit");
		var newdiv = document.createElement('div');
		var divIdName = 'unit' + num;
		newdiv.setAttribute('id',divIdName);

		newdiv.innerHTML =  returnUnitData(num);
		parent.appendChild(newdiv);
		var mapDiv = document.getElementById('mapImagesDiv');
		var newImg = document.createElement('img');
		var imgIdName = 'my'+num+'Img';
		newImg.setAttribute('id',imgIdName);
		imgClick = "clickImg(" + num + ", " + listNum + ");";
		newImg.setAttribute('onclick', imgClick);
		mapDiv.appendChild(newImg);
		setImgPos(num, mapSpriteDict);

		// If the x starting position is greater than 0, shift cursor to the left.
		// Otherwise, shift cursor to the right.
		var x_st = document.unitEditorForm.txt_load_x.value;
		x_st = (x_st > 0)?(x_st-1):(1);
		document.unitEditorForm.txt_load_x.value = x_st;
		document.getElementById("StartPointer").style.left = x_st*16 + "px";
		if(document.unitEditorForm.ckb_bothPos.checked)
		{
			document.unitEditorForm.txt_load_x.value = x_st;
			document.getElementById("LoadPointer").style.left = x_st*16 + "px";
		}

		// Uncomment to display map sprite before adding unit
		// document.getElementById("MapSprite").style.left = x_st*16 + "px";
		updateEventOutput();
	}
	else
		alert("Error: This block is locked. No units can be edited/added to it.\n"
				+ "To unlock this block, please select a larger map.");
	
}

/* Removes unit from the specified unit block
 *
 * Parameters:
 * int divNum - unit id (each unit has its own unique id number)
 * int listNum - unit block id
 */
function removeUnit(divNum, listNum)
{
  var divIdName = 'unit' + divNum;
  var imgIdName = 'my' + divNum + 'Img';
  var listId = 'b_list' + listNum;
  var d = document.getElementById(listId);
  var olddiv = document.getElementById(divIdName);
  d.removeChild(olddiv);
  var mapd = document.getElementById('mapImagesDiv');
  var oldImg = document.getElementById(imgIdName);
  mapd.removeChild(oldImg);
  updateEventOutput();
}

/* Remove an action from an event block
 *
 * Parameters:
 * int divNum - action id
 * int listNum - event block id
 * @TODO: These parameter names have clearly been copy/pasted, please change this
 */ 
function removeAction(divNum, listNum)
{
  var divIdName = 'action' + divNum;
  var selectedDivNum = getSelectedBlock('Event');
  var listId = 'e_list' + listNum;
  var d = document.getElementById(listId);
  var olddiv = document.getElementById(divIdName);
  var prevId = "" + $("#" + divIdName).prev().attr('id');
  var prevNum = prevId.match(/-?[0-9]+/);
  d.removeChild(olddiv);
  updateEventOutput();
  if(listNum == selectedDivNum)
  {
	var existingNum = document.eventAdderForm.txt_eventInsertionPoint.value;
	var selectedAction = document.getElementById("action" + existingNum);
	if(selectedAction !== null && selectedAction !== undefined)
		removeInsertionPointer("action" + existingNum);
	document.eventAdderForm.txt_eventInsertionPoint.value = prevNum;
	setInsertionPointer("action" + prevNum);
  }
}


/****COMMENTS UNFINISHED BELOW THIS LINE****/
function removeCondition(divNum, list)
{
	var divIdName = "condition" + divNum;
	var listId = list + "_list";
	var parent = document.getElementById(listId);
	var olddiv = document.getElementById(divIdName);
	parent.removeChild(olddiv);
	updateEventOutput();
}

function removeScriptedAttack(divNum, listNum)
{
  var divIdName = 'scriptedAttack' + divNum;
  var selectedDivNum = getSelectedBlock('ScriptedFight');
  var listId = 's_list' + listNum;
  var d = document.getElementById(listId);
  var olddiv = document.getElementById(divIdName);
  var prevId = "" + $("#" + divIdName).prev().attr('id');
  var prevNum = prevId.match(/-?[0-9]+/);
  d.removeChild(olddiv);
  updateEventOutput();
  if(listNum == selectedDivNum)
	document.scriptedFightAdderForm.hd_scriptedFightInsertionPoint.value = prevNum;	
}

function setImgPos(num, mapSpriteDict)
{
  var u_class = getSelectedOption(document.unitEditorForm.sel_class).match(/[A-Za-z0-9_]+/);
  var imgClass;
  var alleg = getSelectedOption(document.unitEditorForm.sel_side);
  var x_st = document.unitEditorForm.txt_load_x.value;
  var y_st = document.unitEditorForm.txt_load_y.value;
  var imgid = "my" + num + "Img";
  var img = document.getElementById(imgid);
  if(mapSpriteDict[u_class] !== undefined)
  {
	imgClass = mapSpriteDict[u_class];
  }
  else
	imgClass = "Generic";
  imageUrl = "MapSprites/" + imgClass + alleg + ".png";
  img.src = imageUrl;
  img.style.position = "absolute";
  img.style.left = (x_st*16) + "px";
  img.style.top = (y_st*16) + "px";
}

function toggleBlock(num)
{
	var listid = "b_list" + num;
	var isHidden = document.getElementById(listid).style.display;
	if(isHidden != "none")
		hideUnitList(num,true);
	else
		hideUnitList(num,false);
}

function hideUnitList(num,hide)
{
	var listid = "b_list" + num;
	var endid = "b_end" + num;
	var imgid = "minMaxImg" + num;
	if(hide)
	{
		document.getElementById(listid).style.display = "none";
		document.getElementById(endid).style.display = "none";
		document.getElementById(imgid).src = "BlockIcons/Maximize.png";
	}
	else
	{
		document.getElementById(listid).style.display = "";
		document.getElementById(endid).style.display = "";
		document.getElementById(imgid).src = "BlockIcons/Minimize.png";
	}	
}

function toggleEventBlock(id)
{
	var listid, imgid;
	if(typeof id == "number")
	{
		var selectedForm = "" + getSelectedOption(document.topEventForm.sel_eventActionType);
		var firstLetter = selectedForm[0];
		listid = firstLetter.toLowerCase() + "_list" + id;
		imgid = "minMaxImg" + firstLetter + id;
	}
	else
	{
		listid = id.toLowerCase() + "_list";
		imgid = "minMaxImg" + id;
	}
	var isHidden = document.getElementById(listid).style.display;
	if(isHidden != "none")
	{
		document.getElementById(listid).style.display = "none";
		document.getElementById(imgid).src = "BlockIcons/Maximize.png";
	}
	else
	{
		document.getElementById(listid).style.display = "";
		document.getElementById(imgid).src = "BlockIcons/Minimize.png";
	}
}

function toggleInvisibleArrows(num)
{
	var countId = "manualMove" + num + "Id";
	var visId = "visImgM" + num;
	var imgSrc = document.getElementById(visId).src;
	var arrowNum = document.getElementById(countId).value;
	var isVisible = (imgSrc.indexOf("Invisible") >= 0);
	var visibilityStyle = (isVisible)?("inline"):("none");
	// Checks if there are any arrows in the block
	if(arrowNum > 0)
	{
		for(var i = 1; i <= arrowNum; i++)
			document.getElementById("moveImg" + num + "_" + i).style.display = visibilityStyle;
	}
	var visibility = (isVisible)?("Visible"):("Invisible");
	document.getElementById(visId).src = "BlockIcons/" + visibility + ".png";
}

function toggleInvisibleUnits(num)
{
	var visId = "visImg" + num;
	var imgSrc = document.getElementById(visId).src;
	var isVisible = (imgSrc.indexOf("Invisible") >= 0);
	var visibility = (isVisible)?("Visible"):("Invisible");
	changeVisibilityOfUnitBlock(num,isVisible);
	document.getElementById(visId).src = "BlockIcons/" + visibility + ".png";
}

function changeVisibilityOfUnitBlock(num,isVisible)
{
	var visId = "visImg" + num;
	var imgSrc = document.getElementById(visId).src;

	var listid = "b_list" + num;
	var unitsInList = document.getElementById(listid).innerHTML;
	
	var visStyle = (isVisible)?("inline"):("none");
	var unitIdArray = getAllIdsInBlock(num, "Unit");
	
	// Checks if there are any units in the block
	if(unitsInList.indexOf("UNIT") >= 0)
	{
		for(var i = 0; i < unitIdArray.length; i++)
			document.getElementById("my" + unitIdArray[i] + "Img").style.display = visStyle;
	}
}

function shiftBlocks(type)
{
	var blockNum = getSelectedBlock(type);
	var lowerType = lowerCaseFirstLetter(type);
	var blockid = "#" + lowerType + "Block" + blockNum;
	var visId = "visImg" + type[0].replace("U", "") + blockNum;
	var img = document.getElementById(visId);
	if(img !== null && img !== undefined)
	{
		var imgSrc = img.src;
		if(imgSrc.indexOf("Invisible") >= 0)
		{
			if(type == "Unit")
				toggleInvisibleUnits(blockNum);
			else if(type == "ManualMove")
				toggleInvisibleArrows(blockNum);
		}
	}
	if(lowerType == "manualMove")
	{
		var prevBlockId = document.getElementById("manualMoveBlockDiv").firstChild.id;
		var prevblockNum = prevBlockId.match(/[0-9]+/);
		var endPointer = document.getElementById("ManualMoveEndPointer");
		var coordArray = getMapCoordFromImage(endPointer);
		var x = coordArray[0];
		var y = coordArray[1];
		document.getElementById("manualMoveEnd" + prevblockNum).value = x + "," + y;
		
		var raw_coords = document.getElementById("manualMoveEnd" + blockNum).value;
		coordArray = raw_coords.split(",");
		endPointer.style.left = coordArray[0]*16 + "px";
		endPointer.style.top = coordArray[1]*16 + "px";
		document.mapClickPosForm.txt_mouseX.value = coordArray[0];
		document.mapClickPosForm.txt_mouseY.value = coordArray[1];
		
		var startPointer = document.getElementById("ManualMoveStartPointer");
		raw_coords = document.getElementById("manualMoveStart" + blockNum).value;
		coordArray = raw_coords.split(",");
		startPointer.style.left = coordArray[0]*16 + "px";
		startPointer.style.top = coordArray[1]*16 + "px";
	}
	else if(lowerType == "event")
	{
		var prevNum = document.eventAdderForm.txt_eventInsertionPoint.value;
		if(prevNum !== null && prevNum !== undefined && prevNum !== "")
			removeInsertionPointer("action" + prevNum);
		document.eventAdderForm.txt_eventInsertionPoint.value = "";
	}
	else if(lowerType == "scriptedFight")
		document.scriptedFightAdderForm.hd_scriptedFightInsertionPoint.value = "";
	$(blockid).hide().prependTo("#" + lowerType + "BlockDiv").slideDown();
}

// Add new block
function addBlock(type)
{
  var newBlock = "txt_new" + type + "Block";
  var raw_name = document.getElementById(newBlock).value;
  var name = "" + raw_name.match(/[a-zA-Z0-9_\(\)]+/);
  if(name == '' || name == null)
  {
	alert("Please enter a valid name for the new " + lowerCaseFirstLetter(type) + " block.\n" +
		  "(Numbers, letters, and underscores only)");
  }
  else if(existingPointerNames.indexOf(name) >= 0)
  {
	alert("The pointer name \"" + name + "\" is already being used.\n" +
		"Please enter a new unique block name.");
  }
  else
  {
	existingPointerNames.push(name);
	var parentId = lowerCaseFirstLetter(type) + "BlockDiv";
	var numId = lowerCaseFirstLetter(type) + "Block";
	var parent = document.getElementById(parentId);
	var num = getNewBlockElementIdNum(numId);
	var newdiv = document.createElement('div');
	var divIdName = lowerCaseFirstLetter(type) + 'Block' + num;
	newdiv.setAttribute('id',divIdName);
	if(type == "Unit")
	{
		newdiv.innerHTML = "<div id='b_name" + num + "' class='b_name'>" + name + ":" +
							"<a href='javascript:toggleBlock(" + num + ");'>" +
							"<img src='BlockIcons/Minimize.png'" +
							" id='minMaxImg" + num + "' class='minMaxImg'></a>" +
							"<a href='javascript:toggleInvisibleUnits(" + num + ");'>" +
							"<img src='BlockIcons/Visible.png'" +
							" id='visImg" + num + "' class='minMaxImg'></a></div>" +
							"<div id='b_list" + num + "'> </div>" +
							"<div id='b_end" + num + "'>UNIT</div>";
	}
	else if(type == "Event")
	{
		newdiv.innerHTML = "<div id='e_name" + num + "' class='b_name'>" + name + ":" +
						   "<a href='javascript:toggleEventBlock(" + num + ");'>" +
						   "<img src='BlockIcons/Minimize.png'" +
						   " id='minMaxImgE" + num + "' class='minMaxImg'></a></div>" +
						   "<div id='e_list" + num  + "'><div id='action-1_" + num + "'>" +
						   "<a href='javascript:setEventInsertionPoint(-1," + num + ");'>Insert At Beginning</a>&nbsp;&nbsp;" +
						   "<a href='javascript:setEventInsertionPoint(\"\"," + num + ");'>Insert At End</a></div></div>";
	}
	else if(type == "ManualMove")
	{
		newdiv.innerHTML = "<div id='m_name" + num + "' class='b_name'>" + name + ":" +
							"<a href='javascript:toggleEventBlock(" + num + ");'>" +
						   "<img src='BlockIcons/Minimize.png'" +
						   " id='minMaxImgM" + num + "' class='minMaxImg'></a>" +
						   "<a href='javascript:toggleInvisibleArrows(" + num + ");'>" +
							"<img src='BlockIcons/Visible.png'" +
							" id='visImgM" + num + "' class='minMaxImg'></a></div>" +
						   "<input type='hidden' id='manualMove" + num + "Id' value='0'>" +
						   "<input type='hidden' id='manualMoveStart" + num + "' value='0,0'>" +
						   "<input type='hidden' id='manualMoveEnd" + num + "' value='0,0'>" +						   
						   "<div id='m_list" + num  + "'></div>";
	}
	else if(type == "ScriptedFight")
	{
		newdiv.innerHTML = "<div id='s_name" + num + "' class='b_name'>" + name + ":" +
						   "<a href='javascript:toggleEventBlock(" + num + ");'>" +
						   "<img src='BlockIcons/Minimize.png'" +
						   " id='minMaxImgS" + num + "' class='minMaxImg'></a></div>" +
						   "<div id='s_list" + num  + "'><div id='action-1_" + num + "'>" +
						   "<a href='javascript:setScriptedFightInsertionPoint(-1," + num + ");'>Insert At Beginning</a></div></div>";
	}	
	parent.appendChild(newdiv);
	var otherBlocksExist = (document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block").options.length > 0);
	var optionOpenWithId = (otherBlocksExist)?("<option id='select" + type + "Block" + num + "'>"):
											  ("<option id='select" + type + "Block" + num + "' selected='selected'>");
	$("#sel_" + lowerCaseFirstLetter(type) + "Block").append(optionOpenWithId + name + optionClosed);
	updateAllBlockSelectors(type);
  }
  document.getElementById(newBlock).value = "";
  updateEventOutput();
}

function updateAllBlockSelectors(type)
{
	var blockArray = [];
	var blocks = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	for(var i = 0; i < blocks.options.length; i++)
		blockArray.push(blocks.options[i].value);
	updateSelectOptions('.' + type + 'Blocks',blockArray);
}

function removeItemFromArray(item, array)
{
	var index = array.indexOf(item);
	array.splice(index, 1);
}

function removeBlock(input,type)
{
	var blockNum = getSelectedBlock(type);
	var form = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	var index = form.selectedIndex;
	var blockName = getSelectedOption(form);
	if(input)
	{
		form.remove(index);
		removeItemFromArray(blockName, existingPointerNames);
		updateAllBlockSelectors(type);
		var divIdName = lowerCaseFirstLetter(type) + "Block" + blockNum;
		var parent = document.getElementById(lowerCaseFirstLetter(type) + "BlockDiv");
		var olddiv = document.getElementById(divIdName);
		var idArray = getAllIdsInBlock(blockNum, type);
		if(idArray !== null)
		{
			for(var i = 0; i < idArray.length; i++)
			{
				if(type == "Unit")
					removeUnit(idArray[i], blockNum);
			}
		}
		if(type == "ManualMove")
			clearManualMoveBlockContents(blockNum);
		parent.removeChild(olddiv);
	}
	updateEventOutput();
}

function getAllIdsInBlock(blockNum, type)
{
	var num_regex = new RegExp("[0-9]+","g");
	var id;
	var first = "";
	if(type == "Unit")
		id = "#b_list" + blockNum + " > div";
	else if(type == "Event")
		id = "#e_list" + blockNum + " > div";
	else if(type == "ScriptedFight")
		id = "#s_list" + blockNum + " > div";
	else if(type == "Condition")
		id = blockNum + "_list > div";
	var idString = $(id).map(function()
		{
			var idString = "" + this.id;
			if(idString.indexOf("-1") < 0)
				return this.id;
		}).get().join(',');
	return idString.match(num_regex);
}

function confirmRemoveBlock(type)
{
	var blockName = getSelectedOption(document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block"));
	if(type == "Unit" && (blockName == "Units" || blockName == "Units"))
	{
		alert("Cannot delete block " + blockName + ".");
		return false;
	}
	else if(type == "Event" && (blockName == "BeginningScene" || blockName == "EndingScene" || 
								blockName == "EventAfterExitingPrepScreen"))
	{
		alert("Cannot delete " + blockName + ".");
		return false;
	}
	return confirm("Forever DELETE unit block " + blockName + "?  (Ok = Delete)");
}

function uploadDef()
{
	if (window.File && window.FileReader && window.FileList && window.Blob)
	{
		var f = document.topDefForm.file_customDef.files[0];

		if(f)
		{
			var r = new FileReader();
			r.onload = function(e) 
			{
				document.topDefForm.sel_chosenDef.selectedIndex = 0;
				clearAllOptions();
				var contents = e.target.result;
				if(isValidDefContent(contents))
				{
					readDefFile(contents);
					document.unitEditorForm.btn_addUnit.disabled = "";
				}
				else
					document.unitEditorForm.btn_addUnit.disabled = "disabled";
			}
			r.readAsText(f);
		} 
		else
			alert("Failed to load file.");
	} 
	else
	{
		alert('The File APIs are not fully supported by your browser. \n' +
			  'Try using Firefox instead. :)');
	}
}

function getDefinitionText(selection)
{
	var choice = selection + "_Def";
	document.unitEditorForm.btn_addUnit.disabled = "";
	var defContainer = document.getElementById(choice);
	if(defContainer.tagName.toLowerCase() == "iframe")
	{
		var iframe_window = window.frames[choice];
		return iframe_window.document.getElementById("info").innerHTML;
	}
	else
		return defContainer.value;
}

function selectDef(fe8Defs, zhackDefs)
{
	clearAllOptions();
	var choice = getSelectedOption(document.topDefForm.sel_chosenDef);
	if(choice == "FE8")
	{
		setDefinitionArray(fe8Defs[0],".Char");
		setDefinitionArray(fe8Defs[1],".Classes");
		setDefinitionArray(fe8Defs[2],".Item");
		document.unitEditorForm.btn_addUnit.disabled = "";		
	}
	else if(choice == "Zhack")
	{
		setDefinitionArray(zhackDefs[0],".Char");
		setDefinitionArray(zhackDefs[1],".Classes");
		setDefinitionArray(zhackDefs[2],".Item");
		document.unitEditorForm.btn_addUnit.disabled = "";
	}
	else if(choice != "N/A")
	{
		var content = getDefinitionText(choice);
		readDefFile(content);
	}
	else
		document.unitEditorForm.btn_addUnit.disabled = "disabled";
}

function processDefRequests(contents,select)
{
	var request = arguments[2];	
	var data = getDefinitionArray(contents);
	
	if(request !== undefined && request !== null)
		return data;
	else
		setDefinitionArray(data, select);
}

function getDefinitionArray(contents)
{
	var hash = new RegExp("(#[a-zA-Z]+)","g");
	var dataWithId = new RegExp("[a-zA-Z0-9_\(\)]+ 0x[0-9a-zA-Z][0-9a-zA-Z]?","g");	
	var raw_data = contents.replace(hash,"");
	var data = raw_data.match(dataWithId);
	/*var lollazy = []; // Use to get definitions
	/*for(var i = 0; i < data.length; i++)
	{
		lollazy.push('"' + data[i] + '"');
	}
	alert(lollazy);*/
	
	return data;
}

function setDefinitionArray(data, select)
{
	updateSelectOptions(select,data);
	if(select == ".Item")
	{
		data.unshift("No Item");
		updateSelectOptions(".ItemOptions", data);
		data.splice(0,1);
	}
	if(select == ".Char")
	{
		data.unshift("None");
		updateSelectOptions("#sel_leadChar", data);
		data.splice(0,1);
	}
}

// Checks if the definitions are properly formatted.
function isValidDefContent(raw_content)
{
	var d_slash = new RegExp("//[a-zA-Z0-9 ]+","g");
	var content = raw_content.split(d_slash);
	var mapping = ["","CHARACTER","CLASS","ITEM"];
	var def = new RegExp("#[a-zA-Z]+ [a-zA-Z0-9_\(\)]+ 0x[0-9a-zA-Z][0-9a-zA-Z]?","g");
	if(content === undefined || content === null)
	{
		alert("Error: Provided definitions contain no text.\n" +
			  "Definitions could not be loaded.");
		return false;
	}
	else if(content.length == 1)
	{
		alert("Error: Provided definitions are incorrectly formatted.\n" +
			  "Definitions could not be loaded.");
		return false;
	}
	else
	{
		for(var i = 1; i <= 3; i++)
		{
			if(content[i] === undefined || content[i] === null)
			{
				alert("Error: Provided definitions are missing " + mapping[i] + " definitions.\n" +
					  "Definitions could not be loaded.");
				return false;
			}
			var matchFound = content[i].match(def);
			if(matchFound === undefined || matchFound === null)
			{
				alert("Error: Provided " + mapping[i] + " definitions are incorrectly formatted.\n" +
					  "Definitions could not be loaded.");
				return false;
			}
		}
	}
	return true;
}

function readDefFile(contents)
{
	if(isValidDefContent(contents))
	{
		var request = arguments[1];
		var d_slash = new RegExp("//[a-zA-Z0-9 ]*","g");
		var sections = contents.split(d_slash);
		if(request !== undefined && request !== null)
		{
			if(request.indexOf("Character") >= 0)
				return processDefRequests(sections[1],".Char",request);
			else if(request.indexOf("Class") >= 0)
				return processDefRequests(sections[2],".Classes",request);
			else if(request.indexOf("Item") >= 0)
				return processDefRequests(sections[3],".Item",request);
		}
		else
		{
			processDefRequests(sections[1],".Char");
			processDefRequests(sections[2],".Classes");
			processDefRequests(sections[3],".Item");
		}
	}
}

function updateDefType(fe8Defs)
{
	var choice = getSelectedOption(document.defMakerForm.sel_defType);
	if(choice == "Character")
		updateSelectOptions("#sel_origDef",fe8Defs[0]);
	else if(choice == "Class")
		updateSelectOptions("#sel_origDef",fe8Defs[1]);
	else
		updateSelectOptions("#sel_origDef",fe8Defs[2]);
}

function addCustomDef()
{
	var type = getSelectedOption(document.defMakerForm.sel_defType).toLowerCase();
	var replacement = document.defMakerForm.txt_customDef.value.match(/[a-zA-Z0-9_]+/);
	var defNum = getSelectedOption(document.defMakerForm.sel_origDef).match(/0x[0-9][0-9]?/);
	var outputId = "hdn_" + type + "DefOutput";
	oldContent = document.getElementById(outputId).value;
	if(replacement === undefined || replacement === null)
	{
		alert("Please enter a valid definition name.\n" +
			  "(Numbers, letters, and underscores only)");
	}
	else
	{
		document.getElementById(outputId).value = oldContent + "\n#define " + replacement + " " + defNum;
		getDefinitionsOutput();
	}
}

function getDefinitionsOutput()
{
	var charOutput = document.getElementById("hdn_characterDefOutput").value;
	var classOutput = document.getElementById("hdn_classDefOutput").value;
	var itemOutput = document.getElementById("hdn_itemDefOutput").value;
	var output = document.getElementById("txa_finalDefOutput");
	output.value = charOutput + " \n\n" + classOutput + " \n\n" + itemOutput;
}

function addNewDefsToList()
{
	var defName = document.defMakerForm.txt_customDefName.value;
	if(defName == "")
		alert("Please name your definitions file.");
	else
	{
		var parent = document.getElementById("storedDefContentDiv");
		var content = document.getElementById("txa_finalDefOutput").value;
		if(isValidDefContent(content))
		{
			var hiddenInput = document.createElement('input');
			var defId = defName + "_Def";
			hiddenInput.setAttribute('type', 'hidden');
			hiddenInput.setAttribute('id', defId);
			hiddenInput.setAttribute('value', content);
			parent.appendChild(hiddenInput);
			$("#sel_chosenDef").append(optionOpen + defName + optionClosed);
			alert("Definition file " + defName + " was added successfully.\n" +
				  "These definitions will now be available in the list of selectable definition options.");
		}
	}
}

function toggleDefNumSource(num)
{
	var fe8 = document.defMakerForm.rd_useExistingFE8Def;
	var defNum = document.defMakerForm.rd_useDefNumber;
	if(num == 1)
	{
		uncheck(fe8);
		document.defMakerForm.sel_origDef.disabled = "disabled";
		defNum.checked = "checked";
		document.defMakerForm.txt_customDefNumber.disabled = "";
	}
	else if(num == 0)
	{
		fe8.checked = "checked";
		document.defMakerForm.sel_origDef.disabled = "";
		uncheck(defNum);
		document.defMakerForm.txt_customDefNumber.disabled = "disabled";
	}
}

function saveDefOutput()
{
	var content = document.getElementById("txa_finalDefOutput").value.split("//");
	document.getElementById("hdn_characterDefOutput").value = "//" + content[1].replace("\n\n","");
	document.getElementById("hdn_classDefOutput").value = "//" + content[2].replace("\n\n","");
	document.getElementById("hdn_itemDefOutput").value = "//" + content[3];
}

function resetNextCondEvent(selectId,type)
{
	$('#third' + type + 'Tier > *').each(function() 
	{
		this.style.display = "none";
	});
	
	if(selectId == ("sel_gen" + type))
	{
		$('#second' + type + 'Tier > *').each(function() 
		{
			this.style.display = "none";
		});
	}
	
	if(type == "Event")
		resetAllEventForms();
}

function getNextEvent(selectId)
{
	var subId, selected;
	if(selectId == "sel_genEvent")
	{
		resetNextCondEvent(selectId,"Event");
		var form = document.eventAdderForm;
		var choice = getSelectedOption(form.sel_genEvent);
		subId = "sel_" + choice.toLowerCase().match(/[A-Za-z]+/) + "Event";
		selected = document.getElementById(subId);
		getNextEvent(subId);
		selected.style.display = "inline";
	}
	else
	{
		var choice = getSelectedOption(document.getElementById(selectId));
		var section = choice.toLowerCase().match(/[A-Za-z_]+/);
		setEventForm(section);
	}
}

function setEventForm(selector)
{
	resetNextCondEvent("","Event");
	var divId = selector + "EventDiv";
	var selectedDiv = document.getElementById(divId);
	if(selectedDiv !== undefined && selectedDiv !== null)
	{
		document.getElementById("lb_thirdEventTier").style.display = "inline";
		selectedDiv.style.display = "inline";
		setRequiredInfo(selector);
	}
	else
	{
		document.getElementById("hd_selectedEventForm").value = selector;
		document.getElementById("GenPointer").style.display = "inline";
		document.getElementById("CAMPointer").style.display = "none";
		showGenericEntries(selector);
	}	
}

function getNextCondition(selectId)
{
	resetNextCondEvent(selectId,"Cond");
	document.getElementById("eventIdForConditionsDiv").style.display = "inline";
	var choice;
	if(selectId == "sel_genCond")
	{
		var form = document.conditionForm;
		choice = "" + getSelectedOption(form.sel_genCond).match(/[A-Za-z_]+/);
		choice = choice.toLowerCase();
		var subId = "sel_" + choice + "Cond";
		var divId = choice + "CondDiv";
		var selected = document.getElementById(divId);
		if(document.getElementById(subId) !== null && document.getElementById(subId) !== undefined)
			getNextCondition(subId);
		else
		{
			document.getElementById("hd_selectedCondForm").value = choice;
		}
		selected.style.display = "inline";
	}
	else
	{
		choice = "" + getSelectedOption(document.getElementById(selectId)).match(/[A-Za-z_]+/);
		choice = choice.toLowerCase();
		var divId = choice + "CondDiv";
		var selectedDiv = document.getElementById(divId);
		if(selectedDiv !== undefined && selectedDiv !== null)
		{
			selectedDiv.style.display = "inline";
			document.getElementById("hd_selectedCondForm").value = choice;
		}
		if(choice == "door" || choice == "chest" || choice == "throne")
		{
			document.getElementById("attachEventDiv").style.display = "inline";
			document.conditionForm.ckb_eventAttached.checked = "";
			document.getElementById("eventIdForConditionsDiv").style.display = "none";
		}
		else if(choice == "shops" || choice == "fire" || choice == "poison" || 
				choice == "ballistae")
		{
			document.getElementById("eventIdForConditionsDiv").style.display = "none";
		}
	}
}

function updateEventOutput()
{
	var eventTableId = getSelectedOption(document.topOutputForm.sel_chosenChapter).match(/0x[0-9A-Z][0-9A-Z]/);
	var startOffset = document.topOutputForm.txt_startOffset.value;
	var UnitId = getBlockIdByName("Units","Unit");
	var UnitBlock = (UnitId !== null && UnitId !== undefined)?
						(getEventCodeOfUnitBlock(UnitId)):("Units:\nUNIT\n");
	
	document.getElementById("txa_eventOutput").value = 
	"#include EAstdlib.event\n\n" +
	"EventPointerTable(" + eventTableId + ",ThisChapter)\n\n" +
	"ORG " + startOffset + "\n\n" +
	"ThisChapter:\nPOIN TurnBasedEvents\nPOIN CharacterBasedEvents\n" +
	"POIN LocationBasedEvents\nPOIN MiscBasedEvents\n" +
	"POIN Dunno Dunno Dunno\nPOIN Tutorial\n"+"POIN TrapData TrapData\nPOIN Units Units\n" +
	"POIN $0 $0 $0 $0 $0 $0\nPOIN BeginningScene EndingScene\n\n" +
	UnitBlock + "\n" +
	getEventCodeOfConditionBlocks() +
	getEventCodeOfEventBlock(getBlockIdByName("BeginningScene","Event")) +
	getEventCodeOfEventBlock(getBlockIdByName("EndingScene","Event")) +
	getEventCode("Event") + "\n" +
	getEventCode("ManualMove") + "\n" +
	getEventCode("ScriptedFight") + "\n" +
	getEventCode("Unit") + "\n" +
	getEventCodeOfShops() + "\n" +
	"MESSAGE Events end at offset currentOffset";
}


function toggleTurnInputForm(num)
{
	if(num == 0)
	{
		uncheck(document.conditionForm.rd_rangeTurn);
		document.getElementById("singleTurnDiv").style.display = "inline";
		document.getElementById("rangeTurnDiv").style.display = "none";
	}
	else if(num == 1)
	{
		uncheck(document.conditionForm.rd_singleTurn);
		document.getElementById("singleTurnDiv").style.display = "none";
		document.getElementById("rangeTurnDiv").style.display = "inline";
	}
}

/* Sets all generic event form components invisible,
 * and also resets all form labels to default values.
 */
function resetAllEventForms()
{
	$('#genericEventEntryDiv > *').each(function() 
	{
		this.style.display = "none";
	});
	$('#genericEventEntryDiv span').each(function()
	{
		var idName = this.id;
		var raw_name = "" + idName.match(/[a-zA-Z_0-9]+?(?=Entry)/);
		var name = raw_name.replace("lb_","").replace("_"," ");
		this.innerHTML = capitalizeFirstLetter(name) + ":";
	});
	$('#genericEventEntryDiv input').each(function()
	{
		if(this.type == "checkbox")
			this.checked = "";
	});
	document.eventAdderForm.rd_characterEntry.style.display = "none";
	document.eventAdderForm.rd_posEntry.style.display = "none";
	document.eventAdderForm.ckb_timeEntry.style.display = "none";
}

/* lja;glska;jgk, why is my logic so convoluted.
 * I'll get to commenting this later.
 */
function setRequiredInfo(type)
{
	document.getElementById("GenPointer").style.display = "inline";
	document.getElementById("CAMPointer").style.display = "none";
	if(type == "status")
		document.getElementById('lb_thirdEventTier').style.display = 'none';
	var form = document.getElementById("sel_" + type + "Type");
	if(form === null || form === undefined)
		document.getElementById("hd_selectedEventForm").value = type;
	else
	{
		var choice = getSelectedOption(form).toLowerCase().match(/[a-z_]+/);
		showGenericEntries(choice);
	}
}

function showCharacterOrPositionOption(descript,charLabel,posLabel)
{
	var character = document.getElementById("characterEntryDiv");
	var pos = document.getElementById("posEntryDiv");
	var rd_character = document.eventAdderForm.rd_characterEntry;
	var rd_pos = document.eventAdderForm.rd_posEntry;
	var charOrPos = document.getElementById("lb_charOrPos");
	
	character.style.display = "inline";
	pos.style.display = "inline";
	rd_character.style.display = "inline";
	rd_pos.style.display = "inline";

	document.getElementById("lb_characterEntry").innerHTML = charLabel;
	document.getElementById("lb_positionEntry").innerHTML = posLabel;

	if(descript != "")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = descript;
	}
}


/* Makes the necessary generic event form components
 * for the specified event action (choice) visible.
 * Some form labels are also changed to better
 * describe the specified event action.
 */
function showGenericEntries(choice)
{
	document.getElementById("genericEventEntryDiv").style.display = "inline";	
	resetAllEventForms();
	setSelectedPosIds('txt_xPosEntry','txt_yPosEntry');
	
	var block = document.getElementById("unitBlockEntryDiv");
	var multiBlock = document.getElementById("multiUnitBlockEntryDiv");
	var character = document.getElementById("characterEntryDiv");
	var character2 = document.getElementById("character2EntryDiv");
	var side = document.getElementById("sideEntryDiv");
	var rd_character = document.eventAdderForm.rd_characterEntry;
	var rd_pos = document.eventAdderForm.rd_posEntry;
	var charOrPos = document.getElementById("lb_charOrPos");
	var pos = document.getElementById("posEntryDiv");
	var textboxPos = document.getElementById("textboxPosEntryDiv");
	var endPos = document.getElementById("endPosEntryDiv");
	var customMove = document.getElementById("customMoveEntryDiv");
	var time = document.getElementById("timeEntryDiv");
	var ckb_time = document.eventAdderForm.ckb_timeEntry;
	var fadeStyle = document.getElementById("fadeStyleEntryDiv");
	var fadeColor = document.getElementById("fadeColorEntryDiv");
	var music = document.getElementById("musicEntryDiv");
	var openText = document.getElementById("openTextEntryDiv");
	var openText2 = document.getElementById("openTextEntry2Div");
	var background = document.getElementById("backgroundEntryDiv");
	var ckb_background = document.eventAdderForm.ckb_backgroundEntry;
	var pause = document.getElementById("pauseUntilFinishedDiv");
	var removeAll = document.getElementById("removeTextDiv");
	var moreText = document.getElementById("addMoreTextDiv");
	var eventId = document.getElementById("eventIdEntryDiv");
	var eventBlock = document.getElementById("eventBlocksEntryDiv");
	var chapterId = document.getElementById("chapterIdEntryDiv");
	var radio = document.getElementById("genericRadioOptionsDiv");
	var genericCheckbox = document.getElementById("genericCheckboxDiv");
	var additionalConditions = document.getElementById("additionalConditionsDiv");
	var manualConditionId = document.getElementById("manualConditionIdDiv");
	var ai = document.getElementById("aiEntryDiv");
	var item = document.getElementById("itemEntryDiv");
	document.getElementById("hd_selectedEventForm").value = choice;
	
	if(choice == "load_unit")
	{
		multiBlock.style.display = "inline";
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "flicker_in")
	{
		block.style.display = "inline";
		character.style.display = "inline";
		time.style.display = "inline";
		pause.style.display = "inline";
		document.getElementById("lb_unit_BlockEntry").innerHTML = "Unit Block to Load:";
		document.getElementById("lb_timeEntry").innerHTML = "Flicker Speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = faster)";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "thief" || choice == "warp_in" || choice == "assassin")
	{
		block.style.display = "inline";
		pos.style.display = "inline";
		document.getElementById("lb_unit_BlockEntry").innerHTML = "Unit Block to Load:";
		document.getElementById("lb_positionEntry").innerHTML = "Load/Start Position:";
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "set_visible" || choice == "set_invisible")
	{
		character.style.display = "inline";
		pause.style.display = "inline";
	}
	else if(choice == "give_to_specific_character")
	{
		character.style.display = "inline";
		item.style.display = "inline";
	}
	else if(choice == "give_to_active_character" || choice == "give_to_main_lord")
	{
		item.style.display = "inline";
	}
	else if(choice == "invisible" || choice == "grayed_out" || choice == "rescuer" || choice == "rescued")
	{
		character.style.display = "inline";
		pause.style.display = "inline";
		
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Apply Status";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Reverse Status";
	}
	else if(choice == "flicker_out")
	{
		character.style.display = "inline";
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Flicker Speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML =	"(lower = faster)";	
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "disappear" || choice == "reappear" || choice == "kill" || 
			choice == "warp_out")
	{
		showCharacterOrPositionOption("Select by...<br>","Character:","Position of unit:");
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "change_ai")
	{
		showCharacterOrPositionOption("Select by...<br>","Character","Position of unit:");
		ai.style.display = "inline";
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "focus_view")
	{
		showCharacterOrPositionOption("","On Character:","On Map Location:");
		document.getElementById("GenPointer").style.display = "none";
		document.getElementById("CAMPointer").style.display = "inline";
		document.eventAdderForm.txt_xPosEntry.value = "7";
		document.eventAdderForm.txt_yPosEntry.value = "5";
	}
	else if(choice == "flash_cursor")
	{
		showCharacterOrPositionOption("","On Character:","On Map Location:");
		
		genericCheckbox.style.display = "inline";
		document.eventAdderForm.ckb_genericCheckbox.checked = "checked";
		document.getElementById("lb_genericCheckboxEntry").innerHTML = "Focus view on cursor";
	}
	else if(choice == "move_cursor")
	{
		pos.style.display = "inline";
		document.getElementById("lb_positionEntry").innerHTML = "To Map Location:";
	}
	else if(choice == "move_to_location")
	{
		showCharacterOrPositionOption("Select unit to move...<br>","By character:","By position of unit:");
		endPos.style.display = "inline";
		document.getElementById("lb_end_PositionEntry").innerHTML = "Move To:";
		
		ckb_time.style.display = "inline";
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Moving speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = slower)";
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "manual_move")
	{
		showCharacterOrPositionOption("Select unit to move...<br>","By character:","By position of unit:");
		document.getElementById("manualMoveEntryDiv").style.display = "inline";

		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "reposition")
	{
		showCharacterOrPositionOption("Select unit to move...<br>","By character:","By position of unit:");
		endPos.style.display = "inline";
		document.getElementById("lb_end_PositionEntry").innerHTML = "Move To:";

		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "move_next_to_character")
	{
		character.style.display = "inline";
		character2.style.display = "inline";
		document.getElementById("lb_characterEntry").innerHTML = "Move:";
		document.getElementById("lb_character_2Entry").innerHTML = "Next to:";
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "replace")
	{
		showCharacterOrPositionOption("Select unit to replace...<br>","By character:","By position of unit:");
		
		block.style.display = "inline";
		character2.style.display = "inline";
		document.getElementById("lb_unit_BlockEntry").innerHTML = "Load replacement character:";
		document.getElementById("lb_character_2Entry").innerHTML = "Replacement character:";
		
		fadeColor.style.display = "inline";
		music.style.display = "inline";
		document.eventAdderForm.ckb_musicEntry.style.display = "inline";
		document.getElementById("lb_musicEntry").innerHTML = "Sound effect during transition:";
		
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Transition time:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = faster)";
	}
	else if(choice == "fade")
	{
		fadeStyle.style.display = "inline";
		fadeColor.style.display = "inline";
		
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Fade speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = slower)";
	}
	else if(choice == "fade_set")
	{
		fadeColor.style.display = "inline";
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Fade speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = slower)";
	}
	else if(choice == "fog_of_war")
	{
		fadeColor.style.display = "inline";
		time.style.display = "inline";
		document.eventAdderForm.txt_timeEntry.value = "3";
		document.getElementById("lb_timeEntry").innerHTML = "Vision distance:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(no fog = 0)";
		document.getElementById("lb_fade_ColorEntry").innerHTML = "Fog Color:";
	}
	else if(choice == "rescue")
	{
		showCharacterOrPositionOption("Select unit to rescue...<br>","By character:","By position of unit:");
		character2.style.display = "inline";
		document.getElementById("lb_character_2Entry").innerHTML = "Rescuer:";
		
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "drop")
	{
		block.style.display = "inline";
		character.style.display = "inline";
		document.getElementById("lb_unit_BlockEntry").innerHTML = "Dropped character (unit block):";
		document.getElementById("lb_characterEntry").innerHTML = "Character dropping the unit:";

		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "change_sides")
	{
		character.style.display = "inline";
		side.style.display = "inline";
	}
	else if(choice == "scripted_fight" || choice == "uncontrolled_fight")
	{
		character.style.display = "inline";
		character2.style.display = "inline";
		document.getElementById("scriptedFightEntryDiv").style.display = "inline";
		document.getElementById("lb_characterEntry").innerHTML = "Attacker:";
		document.getElementById("lb_character_2Entry").innerHTML = "Defender:";
	}
	else if(choice == "scripted_heal")
	{
		character.style.display = "inline";
		character2.style.display = "inline";
		item.style.display = "inline";
		document.getElementById("scriptedFightEntryDiv").style.display = "inline";
		document.getElementById("lb_characterEntry").innerHTML = "Attacker:";
		document.getElementById("lb_character_2Entry").innerHTML = "Defender:";
	}
	else if(choice == "change_music")
		music.style.display = "inline";
	else if(choice == "sound")
	{
		music.style.display = "inline";
		document.getElementById("lb_musicEntry").innerHTML = "Sound Effect:";
	}
	else if(choice == "fade_out_music")
	{
		time.style.display = "inline";
		document.eventAdderForm.txt_timeEntry.value = "5";
		document.getElementById("lb_timeEntry").innerHTML = "Fade speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = faster)";
	}
	else if(choice == "time_based_stall")
	{
		time.style.display = "inline";
		document.getElementById("lb_timeEntry").innerHTML = "Stall time:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(larger values = longer stall)";
	}
	else if(choice == "give_money")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "From village";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "From cutscene";
	
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Amount:";
		document.eventAdderForm.txt_openTextEntry.value = "1000";
	}
	else if(choice == "load_background")
	{
		background.style.display = "inline";
		fadeColor.style.display = "inline";
		time.style.display = "inline";
		document.eventAdderForm.txt_timeEntry.value = "10";
		document.getElementById("lb_timeEntry").innerHTML = "Fade Speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = slower)";
	}
	else if(choice == "default_fade_into_cg")
	{
		openText.style.display = "inline";		
		fadeColor.style.display = "inline";
		time.style.display = "inline";
		document.eventAdderForm.txt_timeEntry.value = "10";
		document.getElementById("lb_timeEntry").innerHTML = "Fade Speed:";
		document.getElementById("lb_time_DescriptionEntry").innerHTML = "(lower = slower)";	
		document.getElementById("lb_textEntry").innerHTML = "CG Number:";
		document.eventAdderForm.txt_openTextEntry.value = "25";
	}
	else if(choice == "fade_into_cg_from_background")
	{
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "CG Number:";
		document.eventAdderForm.txt_openTextEntry.value = "25";
	}
	else if(choice == "default_remove_cg")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Remove text and/or background";
	}
	else if(choice == "fade_from_cg_to_background")
		background.style.display = "inline";
	else if(choice == "fade_from_cg_to_map")
	{
		pos.style.display = "inline";
		document.getElementById("lb_positionEntry").innerHTML = "Map Position:";
	}
	else if(choice == "move_main_lord")
	{
		pos.style.display = "inline";
		document.getElementById("lb_positionEntry").innerHTML = "To Position:";
		pause.style.display = "inline";
		document.eventAdderForm.ckb_pauseUntilFinished.checked = "checked";
	}
	else if(choice == "remove_cursor")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Remove cursor from map";
	}
	else if(choice == "game_over")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Automatic game over";
	}
	else if(choice == "event_based_stall")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Add Event Pause <a href=\"javascript:alert(" + 
															"'This will pause the game until all \n" + 
															"preceding unit-based actions are completed.');\">[Info]</a>";
	}
	else if(choice == "end_game")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Ends the game";
	}
	else if(choice == "end_lyn_mode")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Ends Lyn mode";
	}
	else if(choice == "sword_slash")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Screen goes black, and white sword slash<br>" + 
															"cuts across the screen (w/ selected sound effect).<br>";
		music.style.display = "inline";
		document.getElementById("lb_musicEntry").innerHTML = "Sound Effect:";
		
		openText.style.display = "inline";
		document.eventAdderForm.ckb_openTextEntry.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "CG Number:";
		document.eventAdderForm.txt_openTextEntry.value = "25";
	}
	else if(choice == "rumble")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Start Rumble";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "End Rumble";	
	}
	else if(choice == "quintessence_effect")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Magical dark-wavy effect fills the screen.";
	}
	else if(choice == "lightning_bolt")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Lightning bolt strikes map at...<br>";
		pos.style.display = "inline";
	}
	else if(choice == "map_spells")
	{
		pos.style.display = "inline";
		document.getElementById("lb_positionEntry").innerHTML = "Occurs at position:";
		document.getElementById("spellsEntryDiv").style.display = "inline";
		document.getElementById("GenPointer").style.display = "none";
		document.getElementById("CAMPointer").style.display = "inline";
		document.eventAdderForm.txt_xPosEntry.value = "7";
		document.eventAdderForm.txt_yPosEntry.value = "5";
	}
	else if(choice == "add_text")
	{
		makeAllConvoFormsVisible();
		document.getElementById("lb_textEntry").innerHTML = "Text ID:";
	}
	else if(choice == "add_mode_based_text")
	{
		makeAllConvoFormsVisible();
		document.getElementById("lb_textEntry").innerHTML = "Text ID (if Eliwood Mode):";
		openText2.style.display = "inline";
		document.getElementById("lb_textEntry2").innerHTML = "Text ID (if Hector Mode):";
	}
	else if(choice == "add_gender_based_text")
	{
		makeAllConvoFormsVisible();
		document.getElementById("lb_textEntry").innerHTML = "Text ID (if tactician male):";
		openText2.style.display = "inline";
		document.getElementById("lb_textEntry2").innerHTML = "Text ID (if tactician female):";
	}
	else if(choice == "add_event_based_text")
	{
		makeAllConvoFormsVisible();
		eventId.style.display = "inline";
		openText2.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Text ID (if event triggered):";
		document.getElementById("lb_textEntry2").innerHTML = "Text ID (if event not triggered):";
		document.eventAdderForm.txt_eventIdEntry.value = "0x05";
	}
	else if(choice == "add_asm_based_text")
	{
		makeAllConvoFormsVisible();
		eventId.style.display = "inline";
		openText2.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Text ID (if ASM returns 0):";
		document.getElementById("lb_textEntry2").innerHTML = "Text ID (if ASM returns 1):";
		document.getElementById("lb_event_IdEntry").innerHTML = "ASM Offset:";
		document.eventAdderForm.txt_eventIdEntry.value = "0x7A2F1";
	}
	else if(choice == "cg_convos")
	{
		moreText.style.display = "inline";
		openText.style.display = "inline";
		removeAll.style.display = "inline";
		document.eventAdderForm.txt_openTextEntry.value = "800";
		document.getElementById("lb_textEntry").innerHTML = "Text ID:";
		document.getElementById("lb_moreTextEntry").innerHTML = "Addition to previous text";
		document.eventAdderForm.ckb_removeAllText.checked = "checked";
	}
	else if(choice == "scroll" || choice == "speech_bubble")
	{
		moreText.style.display = "inline";
		openText.style.display = "inline";
		textboxPos.style.display = "block";
		document.eventAdderForm.txt_openTextEntry.value = "800";
		document.getElementById("removeTextboxDiv").style.display = "inline";
		document.getElementById("lb_moreTextEntry").innerHTML = "Addition to previous text";
		document.getElementById("lb_moreTextEntry").innerHTML = "Automatically centered";
		document.getElementById("lb_textEntry").innerHTML = "Text ID:";
		document.eventAdderForm.ckb_removeTextbox.checked = "checked";
		updateTextboxPosEntryImage();
		
		document.getElementById("GenPointer").style.display = "none";
		document.getElementById("CAMPointer").style.display = "inline";
		document.eventAdderForm.txt_xPosEntry.value = "7";
		document.eventAdderForm.txt_yPosEntry.value = "5";
	}
	else if(choice == "small_brown_box")
	{
		openText.style.display = "inline";
		textboxPos.style.display = "block";
		document.eventAdderForm.txt_openTextEntry.value = "800";
		document.getElementById("removeTextboxDiv").style.display = "inline";
		document.getElementById("lb_moreTextEntry").innerHTML = "Automatically centered";
		document.getElementById("lb_textEntry").innerHTML = "Text ID:";
		document.eventAdderForm.ckb_removeTextbox.checked = "checked";
		updateTextboxPosEntryImage();
		
		document.getElementById("GenPointer").style.display = "none";
		document.getElementById("CAMPointer").style.display = "inline";
		document.eventAdderForm.txt_xPosEntry.value = "7";
		document.eventAdderForm.txt_yPosEntry.value = "5";
	}
	else if(choice == "remove_text")
	{
		removeAll.style.display = "inline";
		document.getElementById("removeTextboxDiv").style.display = "inline";
		document.eventAdderForm.ckb_removeAllText.checked = "checked";		
	}
	else if(choice == "load_map")
	{
		chapterId.style.display = "inline";
		pos.style.display = "inline";
		document.getElementById("lb_chapter_IdEntry").innerHTML = "Map chapter:";
		document.getElementById("lb_positionEntry").innerHTML = "Focus view on:";
		document.getElementById("GenPointer").style.display = "none";
		document.getElementById("CAMPointer").style.display = "inline";
		document.eventAdderForm.txt_xPosEntry.value = "7";
		document.eventAdderForm.txt_yPosEntry.value = "5";
	}
	else if(choice == "move_to_next_chapter")
	{
		chapterId.style.display = "inline";	
	}
	else if(choice == "move_to_next_chapter_direct")
	{
		chapterId.style.display = "inline";	
	}
	else if(choice == "default_map_change")
	{
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Map Change Id:";
		document.eventAdderForm.txt_openTextEntry.value = "0";
		
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Apply map change";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Reverse map change";
	}
	else if(choice == "map_change_by_position")
	{
		pos.style.display = "inline";
		document.getElementById("lb_positionEntry").innerHTML = "Position of map change:";
	}
	else if(choice == "adjust_volume")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Low Volume";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Normal Volume";		
	}
	else if(choice == "stationary")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Stationary";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Automatically moves with units";	
	}
	else if(choice == "event_ids")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Trigger Event Id";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Reset Event Id";

		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Event Id:";
	}
	else if(choice == "call" || choice == "jump")
		eventBlock.style.display = "inline";
	else if(choice == "unskippable_event")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Make event unskippable with start.";		
	}
	else if(choice == "asm_routine")
	{
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "ASM Offset:";
	}
	else if(choice == "clear_all_units")
	{
		charOrPos.style.display = "inline";
		document.getElementById("lb_charOrPos").innerHTML = "Remove all units from the map.";
	}
	else if(choice == "if_event_triggered")
	{
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Event Id:";

		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
		
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Event ID triggered";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Event ID not triggered";
	}
	else if(choice == "if_before_turn_x")
	{
		openText.style.display = "inline";
		document.getElementById("lb_textEntry").innerHTML = "Turn:";
		
		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
	}
	else if(choice == "if_character_active")
	{		
		character.style.display = "inline";
		
		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
		
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Character active";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Character not active";
	}
	else if(choice == "if_character_dead" || choice == "if_character_on_map")
	{
		character.style.display = "inline";
		
		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
	}
	else if(choice == "if_yes_chosen" || choice == "if_player_phase" || 
			choice == "if_lucky" || choice == "if_male_tactician")
	{
		radio.style.display = "inline";
		document.getElementById("lb_genericRadio1Entry").innerHTML = "Default";
		document.getElementById("lb_genericRadio2Entry").innerHTML = "Opposite";
	
		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
	}
	else if(choice == "if_eliwood_mode" || choice == "if_hector_mode" || choice == "if_tutorial_mode")
	{
		additionalConditions.style.display = "inline";
		manualConditionId.style.display = "inline";
		document.eventAdderForm.ckb_additionalConditions.checked = "";
		document.eventAdderForm.ckb_manualConditionId.checked = "";
	}
	else if(choice == "else" || choice == "endif")
	{
		document.eventAdderForm.ckb_manualConditionId.checked = "";
		manualConditionId.style.display = "inline";
	}
}

function makeAllConvoFormsVisible()
{
	var removeAll = document.getElementById("removeTextDiv");
	var moreText = document.getElementById("addMoreTextDiv");
	var background = document.getElementById("backgroundEntryDiv");
	var ckb_background = document.eventAdderForm.ckb_backgroundEntry;
	var openText = document.getElementById("openTextEntryDiv");
	
	moreText.style.display = "inline";
	openText.style.display = "inline";
	document.eventAdderForm.txt_openTextEntry.value = "800";
	document.eventAdderForm.txt_openTextEntry2.value = "801";
	ckb_background.style.display = "inline";
	background.style.display = "inline";
	removeAll.style.display = "inline";
	document.getElementById("lb_moreTextEntry").innerHTML = "Addition to previous text";
	document.eventAdderForm.ckb_removeAllText.checked = "checked";
}

function toggleTextBackgroundForm()
{
	var isChecked = "" + document.eventAdderForm.ckb_addMoreText.checked;
	var label = "" + document.getElementById("lb_moreTextEntry").innerHTML;
	var background = document.getElementById("backgroundEntryDiv");
	var ckb_background = document.eventAdderForm.ckb_backgroundEntry;
	var pos = document.getElementById("posEntryDiv");
	if(label == "Addition to previous text")
	{
		if(isChecked == "true")
		{
			background.style.display = "none";
			ckb_background.style.display = "none";
			ckb_background.checked = "";
		}
		else
		{
			background.style.display = "inline";
			ckb_background.style.display = "inline";
		}
	}
	else if(label == "Automatically centered")
	{
		if(isChecked == "true")
			pos.style.display = "none";
		else
			pos.style.display = "inline";
	}
}


function getCondEventData()
{
	var actionType = document.getElementById("hd_selectedCondForm").value;
	var retVal, eventId, pointer, parent;
	var eventIdChoice = getSelectedOption(document.getElementById("sel_eventIdSource"));
	if(eventIdChoice == "None")
		eventId = "0x0";
	else if(eventIdChoice == "Existing Id")
		eventId = getSelectedOption(document.getElementById("sel_existingEventIdsList")).match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/);
	else
	{
		var name = document.getElementById("txt_newEventIdLabel").value;
		name = (name !== undefined && name !== null)?(name):("No_Name");
		eventId = (eventIdChoice == "New Temporary Id")?(popNextNewEventId(name)):(popNextPermEventId(name));
	}
	if(document.conditionForm.rd_existingEvent.checked)
		pointer = getSelectedOption(document.conditionForm.sel_eventPointer);
	else
	{
		pointer = document.conditionForm.txt_eventPointer.value;
		document.topEventForm.txt_newEventBlock.value = pointer;
		addBlock('Event');
	}
	
	var num = getNewBlockElementIdNum("condition");
	var newdiv = document.createElement('div');
	var divIdName = "condition" + num;
	newdiv.setAttribute('id',divIdName);
	
	if(actionType == "turn")
	{
		var isMultiTurn = document.conditionForm.rd_rangeTurn.checked;
		var singleTurn = document.conditionForm.txt_singleTurnInput.value;
		var startTurn = document.conditionForm.txt_startTurnInput.value;
		var amountOfTurns = document.conditionForm.txt_turnAmountInput.value;
		var turnPhase = getSelectedOption(document.conditionForm.sel_startTurn).match(/[A-Za-z]+/);
		retVal = "TurnEvent" + turnPhase + "(" + eventId + "," + pointer + ",";
		parent = document.getElementById("turn_list");
		retVal = (isMultiTurn)?(retVal + startTurn + "," + amountOfTurns + ")\n"):(retVal + singleTurn + ")\n");
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"turn\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	var x1 = document.conditionForm.txt_condXPos.value;
	var y1 = document.conditionForm.txt_condYPos.value;
	var x2 = document.conditionForm.txt_bottomXArea.value;
	var y2 = document.conditionForm.txt_bottomYArea.value;
	parent = document.getElementById("location_list");
	if(actionType == "area")
	{
		parent = document.getElementById("event_list");
		retVal = "AREA " + eventId + " " + pointer + " [";
		retVal = (document.conditionForm.ckb_sameAreaPos.checked)?
							(retVal + x1 + "," + y1 + "] [" + x1 + "," + y1 + "]\n"):
							(retVal + x1 + "," + y1 + "] [" + x2 + "," + y2 + "]\n");
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"event\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "village")
	{
		var isVillage = document.conditionForm.rd_village.checked;
		retVal = (isVillage)?("Village("):("House(");
		retVal = retVal + eventId + "," + pointer + "," + x1 + "," + y1 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"location\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "shops")
	{
		var shopType = getSelectedOption(document.conditionForm.sel_typeOfShop).replace(" ", "");
		var shopData = document.conditionForm.txt_shopDataPointer.value;
		var itemList = $("#sel_itemsInShop > option:selected").map(function(){ return this.value }).get().join();
		itemList = itemList.replace(/ /g,":");
		itemList = itemList.replace(/,/g," ");
		retVal = shopType + "(" + shopData + "," + x1 + "," + y1 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"location\");'>Delete</a>" +
						"<input type='hidden' id='hd_shopCode" + num + "' value='" + shopData + ":\nSHLI " + itemList + "\n'>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "door")
	{
		if(document.conditionForm.ckb_eventAttached.checked)
			retVal = "DOOR " + eventId + " " + pointer + " [" + x1 + "," + y1 + "] 0x12\n";
		else
			retVal = "Door(" + x1 + "," + y1 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"location\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "chest")
	{
		var item = getSelectedOption(document.conditionForm.sel_itemFromChest).replace(" ",":");
		var money = document.getElementById("txt_moneyFromChest").value;
		var chestType = (document.conditionForm.rd_itemFromChest.checked)?("Chest(" + item + ","):("ChestMoney(" + money + ",");
		var chestType2 = (document.conditionForm.rd_itemFromChest.checked)?(item):("0x77+" + money + "*0x10000");
		if(document.conditionForm.ckb_eventAttached.checked)
			retVal = "CHES " + eventId + " " + chestType2 + " [" + x1 + "," + y1 + "] 0x14\n";
		else
			retVal = chestType + x1 + "," + y1 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"location\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "throne")
	{
		if(document.conditionForm.ckb_eventAttached.checked)
			retVal = "Seize(" + eventId + "," + pointer + "," + x1 + "," + y1 + ")\n";
		else
			retVal = "Seize(" + x1 + "," + y1 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"location\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "talk")
	{
		var oneWay = document.conditionForm.ckb_char1OnlyCond.checked;
		var char1 = getSelectedOption(document.getElementById("sel_char1Cond")).replace(" ", ":");
		var char2 = getSelectedOption(document.getElementById("sel_char2Cond")).replace(" ", ":");
		retVal = (oneWay)?("CharacterEvent("):("CharacterEventBothWays(");
		parent = document.getElementById("character_list");
		retVal = retVal + eventId + "," + pointer + "," + char1 + "," + char2 + ")\n";
		newdiv.innerHTML = retVal + "  // <a href='javascript:removeCondition(" + num + ",\"character\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	parent = document.getElementById("event_list");
	if(actionType == "battled")
	{
		var triggeredId = document.conditionForm.txt_battleQuoteTrigId.value;
		newdiv.innerHTML = "AFEV " + eventId + " " + pointer + " " + triggeredId + "\n" +
							"  // <a href='javascript:removeCondition(" + num + ",\"event\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "event")
	{
		var triggeredId = document.conditionForm.txt_condEventId.value;
		newdiv.innerHTML = "AFEV " + eventId + " " + pointer + " " + triggeredId + "\n" +
							"  // <a href='javascript:removeCondition(" + num + ",\"event\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "defeat_boss")
	{
		newdiv.innerHTML = "DefeatBoss(" + pointer + ")\n" +
							"  // <a href='javascript:removeCondition(" + num + ",\"event\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "defeat_all")
	{
		newdiv.innerHTML = "DefeatAll(" + pointer + ")\n" +
							"  // <a href='javascript:removeCondition(" + num + ",\"event\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	
	x1 = document.conditionForm.txt_trapXPos.value;
	y1 = document.conditionForm.txt_trapYPos.value;
	parent = document.getElementById("traps_list");
	if(actionType == "fire")
	{
		newdiv.innerHTML = "FIRE [" + x1 + "," + y1 + "] 0x0 [1,1]\n" +
							"// <a href='javascript:removeCondition(" + num + ",\"traps\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "poison")
	{
		var direction = getSelectedOption(document.conditionForm.sel_trapDirect).match(/[0-3]/);
		newdiv.innerHTML = "GAST [" + x1 + "," + y1 + "] 0x" + direction + " [1,1]\n" +
							"// <a href='javascript:removeCondition(" + num + ",\"traps\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	else if(actionType == "ballistae")
	{
		var type = getSelectedOption(document.conditionForm.sel_ballistaeType).match(/[0-9]+/);
		newdiv.innerHTML = "BLST [" + x1 + "," + y1 + "] 0x" + type + "\n" +
							"// <a href='javascript:removeCondition(" + num + ",\"traps\");'>Delete</a>";
		parent.appendChild(newdiv);
	}
	updateEventOutput();
}

/* Returns pseudocode of the event action being added.
 * Pseudocode makes the event action more readable to the user.
 */
function getEventActionData()
{
	// Assign variables to all the generic event form components
	var block = getSelectedOption(document.eventAdderForm.sel_unitBlockEntry);
	var multiBlock = $("#sel_multiUnitBlockEntry > option:selected").map(function(){ return this.value }).get().join();
	var character = getSelectedOption(document.eventAdderForm.sel_characterEntry).match(/[A-Za-z0-9_]+/);
	var hexChar = getSelectedOption(document.eventAdderForm.sel_characterEntry).match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/);
	var character2 = getSelectedOption(document.eventAdderForm.sel_character2Entry).match(/[A-Za-z0-9_]+/);
	var hexChar2 = getSelectedOption(document.eventAdderForm.sel_character2Entry).match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/);
	var item = getSelectedOption(document.eventAdderForm.sel_giveItem).match(/[A-Za-z0-9_]+/);
	var hexItem = getSelectedOption(document.eventAdderForm.sel_giveItem).match(/0x[0-9A-Fa-f][0-9A-Fa-f]?/);
	var charInput = character + ":" + hexChar;
	var char2Input = character2 + ":" + hexChar2;
	var itemInput = item + ":" + hexItem;
	var charChecked = document.eventAdderForm.rd_characterEntry.checked;
	var xPos = document.getElementById("txt_xPosEntry").value;
	var yPos = document.getElementById("txt_yPosEntry").value;
	var xEndPos = document.getElementById("txt_xEndPosEntry").value;
	var yEndPos = document.getElementById("txt_yEndPosEntry").value;
	var side = getSelectedOption(document.getElementById("sel_sideType"));
	var time = document.getElementById("txt_timeEntry").value;
	var timeChecked = document.eventAdderForm.ckb_timeEntry.checked;
	var fadeStyleIn = document.eventAdderForm.rd_fadeStyleIn.checked;
	var fadeColorBlack = document.eventAdderForm.rd_fadeColorBlack.checked;
	var openText = document.eventAdderForm.txt_openTextEntry.value;
	var openText2 = document.eventAdderForm.txt_openTextEntry2.value;
	var music = getSelectedOption(document.eventAdderForm.sel_musicEntry).match(/0x[0-9A-F]+/);
	var background = getSelectedOption(document.eventAdderForm.sel_backgroundEntry).match(/0x[0-9A-F]{2}/);
	var isMoreText = document.eventAdderForm.ckb_addMoreText.checked;
	var includeBackground = document.eventAdderForm.ckb_backgroundEntry.checked;
	var eventId = document.eventAdderForm.txt_eventIdEntry.value;
	eventId = eventId.match(/[0-9A-Fa-f]+(?!x)/);
	var eventBlock = getSelectedOption(document.eventAdderForm.sel_eventBlocksEntry);
	var unskippableText = document.eventAdderForm.ckb_unskippableText.checked;
	var radio1Checked = document.eventAdderForm.rd_genericRadio1.checked;
	var genericChecked = document.eventAdderForm.ckb_genericCheckbox.checked;
	var chapterId = getSelectedOption(document.eventAdderForm.sel_chapterIdEntry).match(/0x[0-9]{2}/);
	var weather = getSelectedOption(document.eventAdderForm.sel_weatherType).match(/[0-9]/);
	var ai = getSelectedOption(document.eventAdderForm.sel_aiEntry);
	var label, parameters, fadeInColor, fadeOutColor;
	var noSkip = (unskippableText)?("NCONVOS\n"):("");

	// Get the type of event action that is being added, which is stored in "hd_selectedEventForm"
	var actionType = document.getElementById("hd_selectedEventForm").value;
	
	// event action "invisible" is equivalent to "set_invisible"/"set_visible"
	if(actionType == "invisible")
	{
		if(radio1Checked)
			actionType = "set_invisible";
		else
			actionType = "set_visible";
	}
	
	/* The type of event action is added to the front 
	 * of the return string, before the parentheses.
	 * The details of said event action are stored
	 * as "parameters" inside the parentheses.
	 */
	var retVal = capitalizeFirstLetter(actionType) + "(";
	// No checks required
	if(actionType == "load_unit")
		return [retVal + multiBlock + ")", "LOAD1 0x1 " + multiBlock.replace(/,/g," ") + "\n"];
	else if(actionType == "remove_cursor")
		return [retVal + ")","CURE\n"];
	else if(actionType == "hide_map")
		return [retVal + ")","HIDEMAP\n"];
	else if(actionType == "show_map")
		return [retVal + ")","SHOWMAP\n"];
	else if(actionType == "game_over")
		return [retVal + ")","GameOver\n"];
	else if(actionType == "end_game")
		return [retVal + ")","TheEnd\n"];
	else if(actionType == "end_lyn_mode")
		return [retVal + ")","LynModeEnding\n"];
	else if(actionType == "clear_all_units")
		return [retVal + ")","ASMC 0x7A8B9\n"];
	else if(actionType == "quintessence_effect")
		return [retVal + ")","QuintessenceEffect\n"];
	else if(actionType == "event_based_stall")
		return [retVal + ")","ENUN\n"];	
	else if(actionType == "remove_background" || actionType == "default_remove_cg")
		return ["removeAllBackgroundText()", "REMA\n"];
	else if(actionType == "remove_text")
		return ["code()", ""];
	else if(actionType == "unskippable_event")
		return [retVal + ")","NEVENTS\n"];
	
	else if(actionType.indexOf("if_") == 0 || actionType.indexOf("else") == 0 || actionType.indexOf("endif") == 0)
	{
		var condId;
		if(document.eventAdderForm.ckb_manualConditionId.checked)
		{
			condId = document.eventAdderForm.txt_manualConditionId.value;
			condId = "0x" + condId.match(/[0-9A-Fa-f]+(?!x)/);
		}
		else
			condId = popNextCondId();
		label = retVal + condId + ")";
		if(actionType == "if_eliwood_mode")
			return [label, "IFEM " + condId + "\n"];
		else if(actionType == "if_hector_mode")
			return [label, "IFHM " + condId + "\n"];
		else if(actionType == "if_tutorial_mode")
			return [label, "IFTT " + condId + "\n"];
		else if(actionType == "else")
			return [label, "ELSE " + condId + "\n"];
		else if(actionType == "endif")
			return [label, "ENIF " + condId + "\n"];
		
		label = retVal + radio1Checked + "," + condId + ")";
		parameters = (radio1Checked)?("IFAT " + condId + " "):("IFAF " + condId + " ");
		if(actionType == "if_player_phase")
			return [label, parameters + " ____\n"];
		else if(actionType == "if_lucky")
			return [label, parameters + " ____\n"];
		else if(actionType == "if_male_tactician")
			return [label, parameters + " ____\n"];
		else if(actionType == "if_yes_chosen")
		{
			parameters = (radio1Checked)?("IFYN " + condId + "\n"):("IFNY " + condId + "\n");
			return [label, parameters];
		}
		
		openText = openText.match(/[0-9A-Fa-f]+(?!x)/);
		label = retVal + condId + "," + openText + ")";
		if(actionType == "if_before_turn_x")
			return (openText !== null && openText != "")?([label, "IFTU " + condId + " " + openText + "\n"]):("invalid input");
		
		label = retVal + radio1Checked + "," + condId + "," + openText + ")";
		if(actionType == "if_event_triggered")
		{
			parameters = (radio1Checked)?("IFET "):("IFEF ");
			return (openText !== null && openText != "")?([label, parameters + condId + " 0x" + openText + "\n"]):("invalid input");
		}
		
		label = retVal + condId + "," + character + ")";
		if(actionType == "if_character_dead")
			return [label, "IFCD " + condId + " " + charInput + "\n"];
		else if(actionType == "if_character_on_map")
			return [label, "IFUF 0 " + condId + " " + charInput + "\n"];
		
		label = retVal + radio1Checked + "," + condId + "," + character + ")";
		if(actionType == "if_character_active")
		{
			parameters = (radio1Checked)?("IFCA 0 "):("IFCNA ");
			return [label, parameters + condId + " " + charInput + "\n"];
		}
	}
	
	label = retVal + chapterId + ")";
	if(actionType == "move_to_next_chapter")
		return [label,"MNCH " + chapterId + "\n"];
	else if(actionType == "move_to_next_chapter_direct")
		return [label,"MNC2 " +chapterId + "\n"];
	
	label = retVal + character + ")";
	if(actionType == "set_visible")
		return [label, "UNCR " + charInput + " 1b\n"];
	else if (actionType == "set_invisible")
		return [label, "UNCM " + charInput + " 1b\n"];

	if(charChecked)
	{
		label = retVal + character + ")";
		parameters = charInput;
	}
	else
	{
		label = retVal + xPos + "," + yPos + ")";
		parameters = "[" + xPos + "," + yPos + "]";
	}
	if(actionType == "disappear")
		return [label, "DISA " + parameters + "\n"];
	else if(actionType == "reappear")
		return [label, "REPA " + parameters + "\n"];
	else if(actionType == "kill")
		return [label, "KILL " + parameters + "\n"];
	else if(actionType == "focus_view")
		return [label, "CAM1 " + parameters + "\n"];
	else if(actionType == "warp_out")
		return [label, "WarpOut(" + parameters.match(/[A-Za-z0-9_]+/) + ")\n"];
	else if(actionType == "flash_cursor")
	{
		if(genericChecked)
		{
			label = label.match(/[^)]+/) + ", focusView, CAM1)";
			return [label, "CAM1 " + parameters + "\nCURF " + parameters + "\n"];
		}
		return [label, "CURF " + parameters + "\n"];
	}
	
	label = retVal + radio1Checked + ")";
	if(actionType == "stationary")
	{
		parameters = (radio1Checked)?("CMOF\n"):("CMON\n");
		return [label, parameters];
	}
	else if(actionType == "adjust_volume")
	{
		parameters = (radio1Checked)?("MUSI\n"):("MUNO\n");
		return [label, parameters];
	}
	else if(actionType == "rumble")
	{
		parameters = (radio1Checked)?("Rumble\n"):("EndRumble\n");
		return [label, parameters];
	}

	label = retVal + background + ")";
	if(actionType == "fade_from_cg_to_background")
		return [label, "FROMCGTOBG " + background + " 0x2\n"];
	
	label = retVal + item + ")";
	if(actionType == "give_to_active_character")
		return [label, "ITGV " + itemInput + "\n"];
	else if(actionType == "give_to_main_lord")
		return [label, "ITGM " + itemInput + "\n"];
	
	label = retVal + music + ")";
	if(actionType == "change_music")
		return [label, "MUS1 " + music + "\n"];
	else if(actionType == "sound")
		return [label, "SOUN " + music + "\n"];
	else if(actionType == "sword_slash")
	{
		var returnInfo = "invalid input";
		openText = "" + openText;
		openText = openText.match(/[0-9A-Fa-f]+(?!x)/);
		
		if(document.eventAdderForm.ckb_openTextEntry.checked)
		{
			return (openText !== null && openText !== undefined && openText !== "")?
					([label.match(/[^)]+/) + "," + openText + ")", 
					"FADI 16\nHIDEMAP\nASMC 0xECB1\nSTAL 0\nBACG 0x5B\nSTAL 40\nSOUN " + music + 
					"\nASMC 0x7D8ED\nSTAL 30\nSHCG 0x" + openText + 
					"\nFADU 4\nSTAL 150\nFADI 4\nBACG 0x5B\nFADU 10\nSHOWMAP\nREMA\n"]):
					("invalid input");
		}
		else
			return [label, "FADI 16\nHIDEMAP\nASMC 0xECB1\nSTAL 0\nBACG 0x5B\n" + 
					"STAL 20\nSOUN " + music + "\nASMC 0x7D8ED\nFADU 8\nSHOWMAP\nREMA\n"];
	}
	
	label = retVal + weather + ")";
	if(actionType == "set_weather")
		return [label, "WEA1 " + weather + "\n"];
	
	label = retVal + eventBlock + ")";
	if(actionType == "jump")
		return [label, "JUMP " + eventBlock + "\n"];
	else if(actionType == "call")
		return [label, "CALL " + eventBlock + "\n"];

	// Minimum two parameters
	
	label = retVal + character + "," + radio1Checked + ")";
	parameters = (radio1Checked)?("UNCM "):("UNCR ");
	parameters += " " + charInput + " ";
	if(actionType == "grayed_out")
		return [label, parameters + "02\n"];
	else if(actionType == "rescuer")
		return [label, parameters + "10\n"];
	else if(actionType == "rescued")
		return [label, parameters + "20\n"];
	
	label = retVal + character + "," + side + ")";
	if(actionType == "change_sides")
		return [label, "Turn" + side + "(" + charInput + ")\n"];

				
	if(actionType == "change_ai")
	{
		if(charChecked)
		{
			label = retVal + character + "," + ai + ")";
			parameters = "CHAI " + charInput + " " + ai + "\n";
		}
		else
		{
			label = retVal + xPos + "," + yPos + "," + ai + ")";
			parameters = "CHAI [" + xPos + "," + yPos + "] " + ai + "\n";
		}
		return [label, parameters];
	}
	
	else if(actionType == "rescue")
	{
		if(charChecked)
		{
			label = retVal + character + "," + character2 + ")";
			parameters = "DISA " + charInput + "\nENUN\nUNCM " + char2Input + " 10\nENUN\nSTAL 0x10\n";
		}
		else
		{	
			label = retVal + xPos + "," + yPos + "," + character2 + ")";
			parameters = "DISA [" + xPos + "," + yPos + "]\nENUN\nUNCM " + char2Input + " 10\nSTAL 0x10\n";
		}
		return [label, parameters];
	}
	
	else if(actionType == "drop")
	{
		label = retVal + block + "," + character + ")";
		return [label, "LOAD1 0x1 " + block + "\nUNCR " + charInput + " 10\nENUN\n"];
	}	

	else if(actionType == "move_next_to_character")
	{
		label = retVal + character + "," + character2 + ")";
		return [label, "MOVENEXTTO " + charInput + " " + char2Input + "\n"];
	}
	
	else if(actionType == "give_to_specific_character")
	{
		label = retVal + item + "," + character + ")";
		return [label, "ITGC " + charInput + " " + itemInput + "\n"];
	}
		
	label = retVal + xPos + "," + yPos + ")";
	if(actionType == "fade_from_cg_to_map")
		return [label, "FROMCGTOMAP [" + xPos + "," + yPos + "]\n"];
	else if(actionType == "move_cursor")
		return [label, "CUMO [" + xPos + "," +  yPos+ "]\n"];
	else if(actionType == "move_main_lord")
		return [label, "MOVEMAINC [" + xPos + "," +  yPos+ "]\n"];
	else if(actionType == "map_change_by_position")
		return [label, "MACC [" + xPos + "," + yPos + "]\n"];
	else if(actionType == "lightning_bolt")
	{
		var xPosHex = xPos.toString(16);
		var yPosHex = yPos.toString(16);
		xPosHex = (xPosHex.length == 1)?("0" + xPosHex):(xPosHex);
		yPosHex = (yPosHex.length == 1)?("0" + yPosHex):(yPosHex);
		return [label, "SOUN 0xF5\n_0xD0 0xFFFFFF" + xPosHex + 
						" 0xFFFFFF" + yPosHex + 
						" 0x42\nWORD 0x8011499\nSTAL 50\n"];
	}
	// Minimum three parameters
	
	label = retVal + block + "," + xPos + "," + yPos + ")";
	if(actionType == "thief")
		return [label, "LOAD1 0x1 " + block + "\n" + "_0xE3 0xCAE5F8 [" + 
						xPos + "*0x10-1," + yPos + "*0x10-1]\n SOUN 0x2F6\n"];
	else if(actionType == "assassin")
		return [label, "LOAD1 0x1 " + block + "\n" + "_0xE3 0xCB401C [" +
						xPos + "*0x10-1," + yPos + "*0x10-1]\n SOUN 0x2F6\n"];
	else if(actionType == "warp_in")
		return [label, "WarpIn(" + block + "," + xPos + "," + yPos + ")\n"];
	else if(actionType == "map_spells")
	{
		var spell = getSelectedOption(document.eventAdderForm.sel_spellsEntry).match(/0x08[0-9A-F]+/);
		label = retVal + spell + "," + xPos + "," + yPos + ")";
		return [label, "CAM1 [" + xPos + "," + yPos + "]\nNEVENTS\nASMC " + spell + "\nSTAL 0x90\n"];
	}
	
	
	if(charChecked)
	{
		label = retVal + character + "," + xEndPos + "," + yEndPos;
		parameters = charInput;
	}
	else
	{
		label = retVal + xPos + "," + yPos + "," + xEndPos + "," + yEndPos;
		parameters = "[" + xPos + "," + yPos + "]";
	}
	
	if(actionType == "move_to_location")
	{
		parameters = "MOVE " + parameters + " [" + xEndPos + "," + yEndPos + "]";
		if(timeChecked)
		{
			if(validInputProvided([time]))
			{
				label += ",time" + time;
				parameters += " " + time;
			}
			else
				return "invalid input";
		}
		return [label + ")", parameters + "\n"];
	}
	else if(actionType == "manual_move")
	{
		parameters = "MOVE " + parameters + " ";
		retVal += (charChecked)?(character + ","):(xPos + "," + yPos + ",");
		var existingMove = document.eventAdderForm.rd_existingManualMove.checked;
		var moveName = "";
		if(existingMove)
			moveName = getSelectedOption(document.eventAdderForm.sel_manualMoveBlockEntry);
		else
		{
			moveName = document.eventAdderForm.txt_newManualMoveName.value;
			document.getElementById("txt_newManualMoveBlock").value = moveName;
			addBlock("ManualMove");
		}
		return [retVal + moveName + ")", parameters + moveName + "\n"];
	}
	else if(actionType == "reposition")
		return [label + ")", "REPOS " + parameters + " [" + xEndPos + "," + yEndPos + "]\n"];
	
	
	label = retVal + character + "," + character2 + ",";
	parameters = "FIGH " + charInput + " " + char2Input + " ";
	var fightName = "";
	var existingFight = document.eventAdderForm.rd_existingScriptedFight.checked;
	if(existingFight && (actionType.indexOf("scripted_") == 0 || actionType.indexOf("uncontrolled_") == 0))
		fightName = getSelectedOption(document.eventAdderForm.sel_scriptedFightBlockEntry);
	else if(actionType.indexOf("scripted_") == 0 || actionType.indexOf("uncontrolled_") == 0)
	{
		fightName = document.eventAdderForm.txt_newScriptedFightName.value;
		document.getElementById("txt_newScriptedFightBlock").value = fightName;
		addBlock("ScriptedFight");
	}
	
	if(actionType == "scripted_fight")
		return [label + fightName + ")", parameters + fightName + " 0\n"];

	else if(actionType == "uncontrolled_fight")
		return [label + fightName + ")", parameters + fightName + " [0x0,0x0,0x0,0x1]\n"];
		
	else if(actionType == "scripted_heal")
		return [label + fightName + "," + item + ")", parameters + fightName + " [" + itemInput + ",0x0,0x0,0x0]\n"];
	
	label = retVal + chapterId + "," + xPos + "," + yPos + ")";
	if(actionType == "load_map")
		return [label, "LOMA " + chapterId + " [" + xPos + "," + yPos + "]\n"];
	
	// two open texts and eventId
	if(validInputProvided([openText,openText2,eventId]))
	{
		openText = "" + openText;
		openText2 = "" + openText2;
		openText = openText.match(/[0-9A-Fa-f]+(?!x)/);
		openText2 = openText2.match(/[0-9A-Fa-f]+(?!x)/);
		label = retVal + isMoreText + "," + unskippableText + "," + openText + "," + openText2 + "," + eventId;
		label += (includeBackground)?("," + background + ")"):(")");
		var noSkip = (unskippableText)?("NCONVOS\n"):("");
		var moreText = (isMoreText)?("MORE"):("");
		if(actionType == "add_event_based_text")
		{
			if(includeBackground)
				parameters = "FADI 0x10\nHIDEMAP\nBACG " + background + "\nFADU 0x10\nSHOWMAP\n" + noSkip + 
								"TEXTIFEVENTID 0x" + eventId + " 0x" + openText + " 0x" + openText2 + "\n";
			else
				parameters = noSkip + moreText + "TEXTIFEVENTID 0x" + eventId + " 0x" + openText + " 0x" + openText2 + "\n";
			return [label, parameters];
		}
		else if(actionType == "add_asm_based_text")
		{
			if(includeBackground)
				parameters = "FADI 0x10\nHIDEMAP\nBACG " + background + "\nFADU 0x10\nSHOWMAP\n" + noSkip + 
								"TEXTIFASM 0x" + eventId + " 0x" + openText + " 0x" + openText2 + "\n";	
			else
				parameters = noSkip + moreText + "TEXTIFASM 0x" + eventId + " 0x" + openText + " 0x" + openText2 + "\n";
			return [label, parameters];
		}
	}
	
	// time and open text
	if(validInputProvided([time,openText]))
	{
		openText = "" + openText;
		openText = openText.match(/[0-9A-Fa-f]+(?!x)/);
		label = retVal + fadeColorBlack + "," + time + "," + openText + ")";
		if(actionType == "default_fade_into_cg")
		{
			fadeInColor = (fadeColorBlack)?("FADICG"):("FAWICG");
			fadeOutColor = (fadeColorBlack)?("FADUCG"):("FAWUCG");
			parameters = fadeInColor + " " + time + "\nSHCG 0x" + openText +
						"\n" + fadeOutColor + " " + time + "\n";
			return [label, parameters];
		}
	}
		
	// two open texts
	if(validInputProvided([openText,openText2]))
	{
		label = retVal + isMoreText + "," + unskippableText + "," + openText + "," + openText2;
		label += (includeBackground)?("," + background + ")"):(")");
		var noSkip = (unskippableText)?("NCONVOS\n"):("");
		var moreText = (isMoreText)?("MORE"):("");
		if(actionType == "add_mode_based_text")
		{
			if(includeBackground)
				parameters = "FADI 0x10\nHIDEMAP\nBACG " + background + "\nFADU 0x10\nSHOWMAP\n" + 
								noSkip + "TEXTIFEM 0x" + openText + " 0x" + openText2 + "\n";
			else
				parameters = noSkip + moreText + "TEXTIFEM 0x" + openText + " 0x" + openText2 + "\n";
			return [label, parameters];
		}
		else if(actionType == "add_gender_based_text")
		{
			if(includeBackground)
				parameters = "FADI 0x10\nHIDEMAP\nBACG " + background + "\nFADU 0x10\nSHOWMAP\n" + 
								noSkip + "TEXTIFTACTF 0x" + openText + " 0x" + openText2 + "\n";
			else
				parameters = noSkip + moreText + "TEXTIFTACTF 0x" + openText + " 0x" + openText2 + "\n";
			return [label, parameters];
		}
	}

	// Time
	if(validInputProvided([time]))
	{
		label = retVal + time + ")";
		if(actionType == "fade_out_music")
			return [label, "MUEN 0x" + time + "\n"];
		else if(actionType == "time_based_stall")
			return [label, "STAL " + time + "\n"];

		else if(actionType == "flicker_out")
		{
			label = retVal + character + "," + time + ")";
			parameters = "";
			for(var i = 0; i < 4; i++)
				parameters += "UNCM " + charInput + " 1b\nSTAL " + time + 
				"\nUNCR " + charInput + " 1b\nSTAL " + time + "\n";
			parameters += "DISA " + charInput + "\nENUN\n";
			return [label, parameters];	
		}
		
		else if(actionType == "flicker_in")
		{
			label = retVal + character + "," + block + "," + time + ")";
			parameters = "LOAD1 0x1 " + block + "\n";
			for(var i = 0; i < 4; i++)
				parameters += "UNCM " + charInput + " 1b\nSTAL " + time + 
							"\nUNCR " + charInput + " 1b\nSTAL " + time + "\n";
			return [label, parameters];
		}
		
		fadeInColor = (fadeColorBlack)?("FADI "):("FAWI ");
		fadeOutColor = (fadeColorBlack)?("FADU "):("FAWU ");
		
		if(actionType == "fade")
		{
			label = retVal + fadeStyleIn + "," + fadeColorBlack + "," + time + ")";
			if(fadeStyleIn)
				return [label, fadeInColor + time + "\n"];
			else
				return [label, fadeOutColor + time + "\n"];
		}
		else if(actionType == "fade_set")
		{
			label = retVal + "true," + fadeColorBlack + "," + time + ")";
			return [label, fadeInColor + time + "\n"];
		}
		else if(actionType == "load_background")
		{
			label = retVal + fadeColorBlack + "," + time + "," + background + ")";
			return [label, fadeInColor + time + "\nBACG " + background +
							"\n" + fadeOutColor + time + "\n"];
		}
		else if(actionType == "replace")
		{
			if(charChecked)
			{
				label = retVal + character + "," + character2 + "," + 
						block + "," + fadeColorBlack + "," + time;
				parameters = fadeInColor + time + "\nHIDEMAP\nDISA " + charInput + "\n" + 
							"ENUN\nLOAD1 0x1 " + block + "\nENUN\nMOVENEXTTO " + char2Input + " " +
							charInput + "\nENUN\nSHOWMAP\n" + fadeOutColor + time + "\n";
			}
			else
			{
				label = retVal + xPos + "," + yPos + "," + character2 + "," + 
						block + "," + fadeColorBlack + "," + time;
				parameters = fadeInColor + time + "\nHIDEMAP\n" + 
							"DISA " + "[" + xPos + "," + yPos + "]" + "\nENUN\nLOAD1 0x1 " + block + 
							"\nENUN\nSHOWMAP\n" + fadeOutColor + time + "\n";
			}
			if(document.eventAdderForm.ckb_musicEntry.checked)
			{
				label += ",music" + music;
				parameters = "SOUN " + music + "\n" + parameters;
			}
			return [label + ")", parameters];
		}
		else if(actionType == "fog_of_war")
		{
			label = retVal + fadeColorBlack + "," + time + ")";	
			parameters = (fadeColorBlack)?("VCBF " + time + "\n"):("VCWF " + time + "\n");
			return [label, parameters];
		}
	}
	// open Text
	if(validInputProvided([openText]))
	{
		if(actionType == "add_text")
		{
			label = retVal + isMoreText + "," + unskippableText + "," + openText;
			var moreText = (isMoreText)?("MORETEXT 0x"):("TEX1 0x");
			if(includeBackground)
			{
				label += "," + background;
				parameters = "FADI 0x10\nHIDEMAP\nBACG " + background + "\nFADU 0x10\n" + 
							 "SHOWMAP\n" + noSkip + "TEX1 0x" + openText + "\n";
			}
			else
				parameters = noSkip + moreText + openText + "\n";
			return [label + ")", parameters];
		}
		
		label = retVal + openText + ")";
		if(actionType == "fade_into_cg_from_background")
			return [label, "FROMBGTOCG 0x" + openText + " 0x2\n"];
		else if(actionType == "asm_routine")
			return [label, "ASMC 0x" + openText + "\n"];
		
		else if(actionType == "give_money")
		{
			openText = document.eventAdderForm.txt_openTextEntry.value;
			label = retVal + radio1Checked + "," + openText + ")";
			parameters = (radio1Checked)?("0x0"):("0x1");
			return [label, "MONE " + parameters + " " + openText + "\n"];
		}
		
		else if(actionType == "cg_convos")
		{
			label = retVal + isMoreText + "," + unskippableText + "," + openText + ")";
			var moreText = (isMoreText)?("MORE"):("");
			return [label, noSkip + moreText + "TEXTCG 0x" + openText + "\n"];
		}
		else if(actionType == "small_brown_box")
		{
			xPos = document.eventAdderForm.txt_xPosTextboxEntry.value;
			yPos = document.eventAdderForm.txt_yPosTextboxEntry.value;
			label = retVal + openText + "," + xPos + "," + yPos + ")";
			return [label, "TEX8 0x" + openText + " [" + xPos + "," + yPos + "]\n"];
		}
		
		if(isMoreText)
		{
			label = retVal + unskippableText + "," + openText + ")";
			parameters = "[0,0] 0x" + openText + "\n";
		}
		else
		{
			label = retVal + unskippableText + "," + openText + "," + xPos + "," + yPos + ")";
			parameters = "[" + xPos + "," + yPos + "] 0x" + openText + "\n";
		}
		
		if(actionType == "scroll")
		{
			xPos = document.eventAdderForm.txt_xPosTextboxEntry.value;
			yPos = document.eventAdderForm.txt_yPosTextboxEntry.value;
			return (isMoreText)?([label, noSkip + "TEX6 0x5 " + parameters]):([label, noSkip + "TEX6 0x1 " + parameters]);
		}
		else if(actionType == "speech_bubble")
		{
			xPos = document.eventAdderForm.txt_xPosTextboxEntry.value;
			yPos = document.eventAdderForm.txt_yPosTextboxEntry.value;
			return (isMoreText)?([label, noSkip + "TEX6 0x5 " + parameters]):([label, noSkip + "TEX6 0x1 " + parameters]);
		}
		label = retVal + radio1Checked + "," + openText + ")";
		if(actionType == "default_map_change")
		{
			parameters = (radio1Checked)?("MAC1 0x" + openText + " 0x0\n"):("MAC1 0x" + openText + " 0x1\n");
			return [label, parameters];
		}
		else if(actionType == "event_ids")
		{
			parameters = (radio1Checked)?("ENUT 0x" + openText + "\n"):("ENUF 0x" + openText + "\n");
			return [label, parameters];
		}
	}
		
	// If nothing matches, return invalid input
	return "invalid input";
}

function moveCloseActionUp(){
  $('#sel_closeActionSet option:selected').each(function(){
   $(this).insertBefore($(this).prev());
  });
 }

function validInputProvided(array)
{
	for(var i = 0; i < array.length; i++)
	{
		if(array[i] === undefined || array[i] === null || array[i] == "")
			return false;
	}
	return true;
}

function getEventCodeOfSpecificConditionBlock(list)
{
	var content, replacementArray, replacementOptions, replacement;
	var retCode = "";
	$("#" + list + " > div").each(function()
	{
		content = this.innerHTML;
		content = content.split("  //")[0];
		retCode += getDefinitionOrHexEventCode(content);
	});
	return retCode + "END_MAIN\n\n";;
}

function getEventCodeOfConditionBlocks()
{
	var content;
	var retCode = "TurnBasedEvents:\n";
	retCode += (document.topOutputForm.ckb_prepScreen.checked)?
				("TurnEventPlayer(0x0,EventAfterExitingPrepScreen,1)\n"):
				("TurnEventPlayer(0x0,BeginningScene,1)\n");

	retCode += getEventCodeOfSpecificConditionBlock("turn_list");
	
	retCode += "CharacterBasedEvents:\n";
	retCode += getEventCodeOfSpecificConditionBlock("character_list");
	
	retCode += "LocationBasedEvents:\n";
	retCode += getEventCodeOfSpecificConditionBlock("location_list");
	
	retCode += "MiscBasedEvents:\nCauseGameOverIfLordDies\n";
	retCode += getEventCodeOfSpecificConditionBlock("event_list");
	
	retCode += "Dunno:\n";
	retCode += "//DO NOT TOUCH\nWORD $00\n\n";

	retCode += "Tutorial:\n";
	retCode += "//DO NOT TOUCH\nWORD $00\n\n";

	retCode += "TrapData:\n";
	retCode += getEventCodeOfSpecificConditionBlock("traps_list");

	retCode += "ALIGN 4\n\n";
	
	return retCode;
}

function getEventCodeOfShops()
{
	var idName;
	var content = "// Shop Data\n";
	$("#location_list input").each(function()
	{
		idName = "" + this.id;
		if(idName.indexOf("hd_shopCode") == 0)
			content += getDefinitionOrHexEventCode(this.value);
	});
	
	return content;
}

function getEventCodeOfEventBlock(blockId)
{
	var retCode = "";
	var name = getBlockNameById(blockId, "Event");
	var nameId = "e_name" + blockId;
	var blockName = document.getElementById(nameId).innerHTML.split("<")[0];
	var prepScreenCheck = (name == "BeginningScene" && document.topOutputForm.ckb_prepScreen.checked);
	retCode += blockName + "\n";
	idArray = getAllIdsInBlock(blockId, 'Event');
	if(idArray !== null && idArray !== undefined)
	{
		for(var k = 0; k < idArray.length; k++)
		{
			elementId = "action" + idArray[k];
			var element = "" + document.getElementById(elementId).innerHTML;
			var extraCode = "" + element.split(")")[1].split("//")[0].replace(" ","");
			retCode += getActionEventCode(idArray[k]);
			retCode += (extraCode !== undefined && extraCode !== "")?(extraCode.replace(" ","")):("");
		}
	}
	return (prepScreenCheck)?(retCode + "ENDB\n\n"):(retCode + "ENDA\n\n");
}

function getActionEventCode(actionNum)
{
	var actionId = "hd_eventCode" + actionNum;
	var code = document.getElementById(actionId).value;
	return getDefinitionOrHexEventCode(code);
}

function getDefinitionOrHexEventCode(code)
{
	var splitDefs;
	var definitions = code.match(/[A-Za-z0-9_]+\:0x[0-9A-Fa-f][0-9A-Fa-f]?/g);
	if(definitions !== null && definitions !== undefined)
	{
		for(var i = 0; i < definitions.length; i++)
		{
			splitDefs = definitions[i].split(":");
			if(document.topDefForm.ckb_defsInOutput.checked)
				code = code.replace(definitions[i], splitDefs[0]);
			else
				code = code.replace(definitions[i], splitDefs[1]);
		}
	}
	return code;
}

function getEventCodeOfScriptedFightBlock(blockId)
{
	var retCode = "";
	nameId = "s_name" + blockId;
	retCode += document.getElementById(nameId).innerHTML.split("<")[0] + "\n";
	idArray = getAllIdsInBlock(blockId, 'ScriptedFight');
	if(idArray !== null && idArray !== undefined)
	{
		for(var k = 0; k < idArray.length; k++)
		{
			elementId = "scriptedAttack" + idArray[k];
			var element = "" + document.getElementById(elementId).innerHTML;
			retCode += "" + element.split("//")[0].replace(" ","") + "\n"; 
		}
	}
	return retCode + "BLDT\n\n";
}

function getEventCodeOfUnitBlock(blockId)
{
	var retCode = "";
	var nameId = "b_name" + blockId;
	retCode += document.getElementById(nameId).innerHTML.split("<")[0] + "\n";
	var idArray = getAllIdsInBlock(blockId, 'Unit');
	if(idArray !== null && idArray !== undefined)
	{
		for(var k = 0; k < idArray.length; k++)
		{
			var elementId = "unit" + idArray[k];
			if(document.topDefForm.ckb_defsInOutput.checked)
			{
				var element = document.getElementById(elementId).innerHTML;
				retCode += element.split("//")[0] + "\n";
			}
			else
				retCode += document.getElementById("hd_" + elementId).value;
		}
	}
	return retCode + "UNIT\n\n";
}

function getEventCodeOfManualMoveBlock(blockId)
{
	var retCode = "";
	var nameId = "m_name" + blockId;
	retCode += document.getElementById(nameId).innerHTML.split("<")[0] + "\nMOMA";
	var numOfMoves = document.getElementById("manualMove" + blockId + "Id").value;
	for(var k = 1; k <= numOfMoves; k++)
	{
		elementId = "customMove" + blockId + "_" + k;
		var element = document.getElementById(elementId).innerHTML;
		retCode += " " + element.replace("<br>", "");
	}
	return retCode + "\nALIGN 4\n\n";
}

function getEventCode(type)
{
	var retCode;
	if(type == "Event")
		retCode = "// Events\n";
	else if(type == "Unit")
		retCode = "// Units\n";
	else if(type == "ManualMove")
		retCode = "// Manual Movement\n";
	else if(type == "ScriptedFight")
		retCode = "// Scripted Fights\n";

	var form = document.getElementById("sel_" + lowerCaseFirstLetter(type) + "Block");
	var idArray, nameId, elementId;
	var retCode;
	for(var i = 0; i < form.options.length; i++)
	{
		var raw_blockId = form.options[i].id;
		var blockName = form.options[i].value;
		var blockId = raw_blockId.match(/[0-9]+/);
		if(type == "Unit" && blockName != "Units" && blockName != "Units")
		{
			retCode += getEventCodeOfUnitBlock(blockId);
		}
		else if(type == "Event" && blockName !== "BeginningScene" && blockName !== "EndingScene")
		{
			retCode += getEventCodeOfEventBlock(blockId);
		}
		else if(type == "ManualMove")
		{
			retCode += getEventCodeOfManualMoveBlock(blockId);
		}
		else if(type == "ScriptedFight")
			retCode += getEventCodeOfScriptedFightBlock(blockId);
	}
	return retCode;
}


function updateEventFormInfo(string)
{
	var actionArray = string.split("(");
	var actionType = actionArray[0].toLowerCase();
	var partsArray = actionArray[1].split(",");
	var pointerName1, pointerName2, pointerName3, pointerName4, pointerName5, pointerName6,
		hexNum1, hexNum2, hexNum3, hexNum4, hexNum5, hexNum6,
		num1, num2, num3, num4, num5, num6,
		isTrue1, isTrue2, isTrue3, isTrue4, isTrue5, isTrue6,
		music, fadeInColor, fadeOutColor;
	
	// Multiparameter things
	if(actionType == "load_unit")
	{
		retVal = "LOAD1 0x1";
		for(var i = 0; i < partsArray.length; i++)
			retVal += " " + partsArray[i].match(/[A-Za-z0-9_]+/);
		return retVal + "\n";
	}
	
	// If there is only one parameter
	if(partsArray[1] === null || partsArray[1] === undefined)
	{
		pointerName1 = actionArray[1].match(/[A-Za-z0-9_]+/);
		isTrue1 = actionArray[1].match(/[A-Za-z]+/) == "true";
		music = actionArray[1].match(/0x[0-9A-F]+/);
		hexNum1 = actionArray[1].match(/[0-9A-Fa-f]+(?!x)/);
		num1 = actionArray[1].match(/[0-9]+/);
		if(actionType == "removeallbackgroundtext")
			return "REMA\n";
		else if(actionType == "remove_cursor")
			return "CURE\n";
		else if(actionType == "hide_map")
			return "HIDEMAP\n";
		else if(actionType == "show_map")
			return "SHOWMAP\n";
		else if(actionType == "game_over")
			return "GameOver\n";
		else if(actionType == "end_game")
			return "TheEnd\n";
		else if(actionType == "end_lyn_mode")
			return "LynModeEnding\n";
		else if(actionType == "clear_all_units")
			return "ASMC 0x7A8B9\n";
		else if(actionType == "quintessence")
			return "QuintessenceEffect\n"
		else if(actionType == "event_based_stall")
			return "ENUN\n";
		// set_visible(character)
		if(actionType == "set_visible")
			return "UNCR " + pointerName1 + " 1b\n";
		// set_invisible(character)
		else if(actionType == "set_invisible")
			return "UNCM " + pointerName1 + " 1b\n";	
		// disappear(character)
		else if(actionType == "disappear")
			return "DISA " + pointerName1 + "\n";
		// reappear(character)
		else if(actionType == "reappear")
			return "REPA " + pointerName1 + "\n";
		// kill(character)
		else if(actionType == "kill")
			return "KILL " + pointerName1 + "\n";
		// warp_out(character)
		else if(actionType == "warp_out")
			return "WarpOut(" + pointerName1 + ")";
		// focus_view(character)
		else if(actionType == "focus_view")
			return "CAM1 " + pointerName1 + "\n";
		// flash_cursor(character)
		else if(actionType == "flash_cursor")
			return "CURF " + pointerName1 + "\n";
		// stationary(stationaryCamera?)
		else if(actionType == "stationary")
			return (isTrue1)?("CMOF\n"):("CMON\n");
		// adjust_volume(lowerVolume?)
		else if(actionType == "adjust_volume")
			return (isTrue1)?("MUSI\n"):("MUNO\n");
		// rumble(rumbleOn?)
		else if(actionType == "rumble")
			return (isTrue1)?("Rumble\n"):("EndRumble\n");
		// change_music(musicId)
		else if(actionType == "change_music")
			return "MUS1 " + music + "\n";
		// sound(musicId)
		else if(actionType == "sound")
			return "SOUN " + music + "\n";
		// sword_slash(musicId)
		else if(actionType == "sword_slash")
			return "FADI 16\nHIDEMAP\nASMC 0xECB1\nSTAL 0\nBACG 0x5B\n" + 
					"STAL 40\nSOUN " + music + "\nASMC 0x7D8ED\nFADU 2\nSHOWMAP\n";
		// fade_out_music(time)
		if(actionType == "fade_out_music")
			return "MUEN 0x" + hexNum1 + "\n";
		// time_based_stall(time)
		else if(actionType == "time_based_stall")
			return "STAL " + hexNum1 + "\n";
		// give_to_active_character(item)
		if(actionType == "give_to_active_character")
			return "ITGV " + pointerName1 + "\n";
		// give_to_main_lord(item)
		else if(actionType == "give_to_main_lord")
			return "ITGM " + pointerName1 + "\n";
		// fade_into_cg_from_background(cgId)
		else if(actionType == "fade_into_cg_from_background")
			return "FROMBGTOCG 0x" + hexNum1 + " 0x2\n";
		// fade_from_cg_to_background(backgroundId)
		else if(actionType == "fade_from_cg_to_background")
			return "FROMCGTOBG 0x" + hexNum1 + " 0x2\n";
		// set_weather(weatherId)
		else if(actionType == "set_weather")
			return "WEA1 " + num1 + "\n";
		// move_to_next_chapter(chaptId)
		else if(actionType == "move_to_next_chapter")
			return "MNCH 0x" + hexNum1 + "\n";
		// move_to_next_chapter_direct(chaptId)
		else if(actionType == "move_to_next_chapter_direct")
			return "MNC2 0x" + hexNum1 + "\n";
		// asm_routine(asmOffset)
		else if(actionType == "asm_routine")
			return "ASMC 0x" + hexNum1 + "\n";
		// jump(eventName)
		else if(actionType == "jump")
			return "JUMP " + pointerName1 + "\n";
		// call(eventName)
		else if(actionType == "call")
			return "CALL " + pointerName1 + "\n";
	}
	// If there are two parameters
	else if(partsArray[2] === null || partsArray[2] === undefined)
	{
		num1 = partsArray[0].match(/[0-9]+/);
		num2 = partsArray[1].match(/[0-9]+/);
		hexNum2 = partsArray[1].match(/[0-9]+(?!x)/);
		pointerName1 = partsArray[0].match(/[A-Za-z0-9_]+/);
		pointerName2 = partsArray[1].match(/[A-Za-z0-9_]+/);
		isTrue1 = (partsArray[0].match(/[a-z]+/) == "true");
		isTrue2 = (partsArray[1].match(/[a-z]+/) == "true");
		// disappear(x,y)
		if(actionType == "disappear")
			return "DISA [" + num1 + "," +  num2 + "]\n";
		// reapear(x,y)
		else if(actionType == "reappear")
			return "REPA [" + num1 + "," +  num2 + "]\n";
		// kill(x,y)
		else if(actionType == "kill")
			return "KILL [" + num1 + "," +  num2+ "]\n";
		// warp_out(x,y)
		else if(actionType == "warp_out")
			return "WarpOut(" + num1 + "," +  num2+ ")\n";
		// move_main_lord(x,y)
		else if(actionType == "move_main_lord")
			return "MOVEMAINC [" + num1 + "," +  num2+ "]\n";
		// focus_view(x,y)
		else if(actionType == "focus_view")
			return "CAM1 [" + num1 + "," +  num2+ "]\n";
		// flash_cursor(x,y)
		else if(actionType == "flash_cursor")
			return "CURF [" + num1 + "," +  num2+ "]\n";
		// move_cursor(x,y)
		else if(actionType == "move_cursor")
			return "CUMO [" + num1 + "," +  num2+ "]\n";
		// fade_from_cg_to_map(x,y)
		else if(actionType == "fade_from_cg_to_map")
			return "FROMCGTOMAP [" + num1 + "," + num2 + "]\n";
		// map_change_by_position(x,y)	
		else if(actionType == "map_change_by_position")
			return "MACC [" + num1 + "," + num2 + "]\n";
		else if(actionType == "lightning_bolt")
		{
			var num1Hex = "" + parseInt(num1,16);
			var num2Hex = "" + parseInt(num2,16);
			return "SOUN 0xF5\n_0xD0 0xFFFFFF" + 
					num1Hex.match(/(?=0x)[0-9A-Fa-f]+/) + 
					" 0xFFFFFF" + num2Hex.match(/(?=0x)[0-9A-Fa-f]+/) + 
					" 0x42\nWORD 0x8011499\nSTAL 50";
		}
		// change_sides(character, side)
		else if(actionType == "change_sides")
			return "Turn" + pointerName2 + "(" + pointerName1 + ")\n";
		// change_ai(character, ai)
		else if(actionType == "change_ai")
			return "CHAI " + pointerName1 + " " + pointerName2 + "\n";
		// flicker_out(character, time)
		else if(actionType == "flicker_out")
		{
			retVal = "";
			for(var i = 0; i < 4; i++)
				retVal += "UNCM " + pointerName1 + " 1b\nSTAL 0x" + hexNum2 + 
				"\nUNCR " + pointerName1 + " 1b\nSTAL 0x" + hexNum2 + "\n";
			retVal += "DISA " + pointerName1 + "\nENUN\n";
			return retVal;
		}
		// rescue(rescuedChar, rescuingChar)
		else if(actionType == "rescue")
			return "DISA " + pointerName1 + "\nENUN\nUNCM " + pointerName2 + " 10\nENUN\nSTAL 0x10\n";
		// move_next_to_character(movingChar, targetChar)
		else if(actionType == "move_next_to_character")
			return "MOVENEXTTO " + pointerName1 + " " + pointerName2 + "\n";
		// drop(loadDroppedChar, droppingChar)
		else if(actionType == "drop")
			return "LOAD1 0x1 " + pointerName1 + "\nUNCR " + pointerName2 + " 10\nENUN\n";
		retVal = (isTrue2)?("UNCM "):("UNCR ");
		// grayed_out(character, applyGrayedOutStatus?)
		if(actionType == "grayed_out")
			return retVal + pointerName1 + " 02\n";
		// rescuer(character, applyRescuerStatus?)
		else if(actionType == "rescuer")
			return retVal + pointerName1 + " 10\n";
		// rescued(character, applyRescuedStatus?)
		else if(actionType == "rescued")
			return retVal + pointerName1 + " 20\n";
		// give_to_specific_character(character, item)
		else if(actionType == "give_to_specific_character")
			return "ITGC " + pointerName2 + " " + pointerName1 + "\n";
		var noSkip = (isTrue1)?("NCONVOS\n"):("");
		// scroll(disableSkipping?, textId)
		if(actionType == "scroll")
			return noSkip + "TEX6 0x5 [0,0] 0x" + hexNum2 + "\n";
		// speech_bubble(disableSkipping?, textId)
		else if(actionType == "speech_bubble")
			return noSkip + "TEX6 0x4 [0,0] 0x" + hexNum2 + "\n";
		// default_map_change(applyMapChange?, mapChangeId)
		else if(actionType == "default_map_change")
			return (isTrue1)?("MAC1 0x" + hexNum2 + " 0x0\n"):("MAC1 0x" + hexNum2 + " 0x1\n");
		// fog_of_war(makeFogBlack?, visionDistance)
		else if(actionType == "fog_of_war")
			return (isTrue1)?("VCBF " + num2 + "\n"):("VCWF " + num2 + "\n");
		// event_ids(triggerEventId?, eventId)
		else if(actionType == "event_ids")
			return (isTrue1)?("ENUT " + hexNum2 + "\n"):("ENUF " + hexNum2 + "\n");
		// give_money(fromVillage?, amount)
		else if(actionType == "give_money")
			return (isTrue1)?("MONE 0x0 " + num2 + "\n"):("MONE 0x1 " + num2 + "\n");
	}
	// If there are three parameters
	else if(partsArray[3] === null || partsArray[3] === undefined)
	{
		pointerName1 = partsArray[0].match(/[A-Za-z0-9_]+/);
		pointerName2 = partsArray[1].match(/[A-Za-z0-9_]+/);
		pointerName3 = partsArray[2].match(/[A-Za-z0-9_]+/);
		num1 = partsArray[0].match(/[0-9]+/);
		num2 = partsArray[1].match(/[0-9]+/);
		num3 = partsArray[2].match(/[0-9]+/);
		hexNum1 = partsArray[0].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum2 = partsArray[1].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum3 = partsArray[2].match(/[0-9A-Fa-f]+(?!x)/);
		isTrue1 = (partsArray[0].match(/[a-z]+/) == "true");
		isTrue2 = (partsArray[1].match(/[a-z]+/) == "true");

		// thief(loadUnit, x, y)
		if(actionType == "thief")
		{
			return "LOAD1 0x1 " + pointerName1 + "\n" +
					"_0xE3 0xCAE5F8 [" + num2 + "*0x10-1," + num3 + "*0x10-1]\nSOUN 0x2F6\n";
		}
		// assassin(loadUnit, x, y)
		else if (actionType == "assassin")
		{
			return "LOAD1 0x1 " + pointerName1 + "\n" +
					"_0xE3 0xCB401C [" + num2 + "*0x10-1," + num3 + "*0x10-1]\nSOUN 0x2F6\n";
		}
		// warp_in(loadUnit, x, y)
		else if (actionType == "warp_in")
			return "WarpIn(" + pointerName1 + "," + num2 + "," +  num3 + ")\n";
		// move_to_location(character, x, y)
		else if (actionType == "move_to_location")
			return "MOVE " + pointerName1 + " [" + num2 + "," +  num3 + "]\n";
		// reposition(character, x, y)
		else if(actionType == "reposition")
			return "REPOS " + pointerName1 + " [" + num2 + "," +  num3 + "]\n";
		// flicker_in(character, loadUnit, time)
		else if(actionType == "flicker_in")
		{
			retVal = "LOAD1 0x1 " + pointerName2 + "\n";
			for(var i = 0; i < 4; i++)
				retVal += "UNCM " + pointerName1 + " 1b\nSTAL 0x" + hexNum3 + "\nUNCR " + pointerName1 + " 1b\nSTAL 0x" + hexNum3 + "\n";
			return retVal;
		}
		// load_map(chapterId, x, y)
		else if(actionType == "load_map")
			return "LOMA " + hexNum1 + " [" + num2 + "," + num3 + "]\n"; 
		// flash_cursor(character, filler, filler)
		else if(actionType == "flash_cursor")
			return "CAM1 " + pointerName1 + "\nCURF " + pointerName1 + "\n";
		// fade(fadeIn?, fadeColorBlack?, time)
		else if(actionType == "fade")
		{
			fadeInColor = (isTrue2)?("FADI 0x"):("FAWI 0x");
			fadeOutColor = (isTrue2)?("FADU 0x"):("FAWU 0x");
			if(isTrue1)
				return fadeInColor + num3 + "\n";
			else
				return fadeOutColor + num3 + "\n";
		}
		// load_background(fadeColorBlack?, time, backgroundId)
		else if(actionType == "load_background")
		{
			fadeInColor = (isTrue1)?("FADI"):("FAWI");
			fadeOutColor = (isTrue1)?("FADU"):("FAWU");
			return fadeInColor + " 0x" + hexNum2 + "\nBACG 0x" + hexNum3 +
					"\n" + fadeOutColor + " 0x" + hexNum2 + "\n";
		}
		// default_fade_into_cg(fadeColorBlack?, time, cgId)
		else if(actionType == "default_fade_into_cg")
		{
			fadeInColor = (isTrue1)?("FADICG"):("FAWICG");
			fadeOutColor = (isTrue1)?("FADUCG"):("FAWUCG");
			return fadeInColor + " 0x" + hexNum2 + "\nSHCG 0x" + hexNum3 +
					"\n" + fadeOutColor + " 0x" + hexNum2 + "\n";
		}
		var noSkip = (isTrue2)?("NCONVOS\n"):("");
		// add_text(moreText?, unskippable?, textId)
		if(actionType == "add_text")
		{
			var moreText = (isTrue1)?("MORETEXT 0x"):("TEX1 0x");
			return noSkip + moreText + hexNum3 + "\n";
		}
		// cg_convos(moreText?, unskippable?, textId)
		else if(actionType == "cg_convos")
		{
			var moreText = (isTrue1)?("MORE"):("");
			return noSkip + moreText + "TEXTCG 0x" + hexNum3 + "\n";
		}
		// small_brown_box(textId, x, y)
		else if(actionType == "small_brown_box")
			return "TEX8 0x" + hexNum1 + " [" + num2 + "," + num3 + "]\n";
		// fight(char1, char2, fightName)
		else if(actionType == "fight")
			return "FIGH " + pointerName1 + " " + pointerName2 + " " + pointerName3 + " 0\n";
		// rescue(x, y, rescuingChar)
		else if(actionType == "rescue")
			return "DISA [" + num1 + "," + num2 + "]\nENUN\nUNCM " + pointerName3 + " 10\nSTAL 0x10\n";
		// change_ai(x, y, ai)
		else if(actionType == "change_ai")
			return "CHAI [" + num1 + "," + num2 + "] " + pointerName3 + "\n";
	}
	// If there are four parameters
	else if(partsArray[4] === null || partsArray[4] === undefined)
	{
		pointerName1 = partsArray[0].match(/[A-Za-z0-9]+/);
		
		num1 = partsArray[0].match(/[0-9]+/); 
		num2 = partsArray[1].match(/[0-9]+/);
		num3 = partsArray[2].match(/[0-9]+/);
		num4 = partsArray[3].match(/[0-9]+/);
		
		hexNum2 = partsArray[1].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum3 = partsArray[2].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum4 = partsArray[3].match(/[0-9A-Fa-f]+(?!x)/);
		
		isTrue1 = (partsArray[0].match(/[a-z]+/) == "true");
		isTrue2 = (partsArray[1].match(/[a-z]+/) == "true");
		
		var lastParam = "" + partsArray[3].match(/[A-Za-z0-9]+/);
		// move_to_location(character, end_x, end_y, speed)
		// move_to_location(start_x, start_y, end_x, end_y)
		if(actionType == "move_to_location")
		{
			if(lastParam.indexOf("time") == 0)
				return "MOVE " + pointerName1 + " [" + num2 + "," +  num3 + "] 0x" + hexNum4 + "\n";
			else
				return "MOVE [" + num1 + "," +  num2 + "] [" + num3 + "," +  num4 + "]\n";
		}
		// reposition(start_x, start_y, end_x, end_y)
		else if(actionType == "reposition")
			return "REPOS [" + num1 + "," +  num2 + "] [" + num3 + "," +  num4 + "]\n";
		// flash_cursor(x, y, filler, filler)
		else if(actionType == "flash_cursor")
			return "CAM1 [" + num1 + "," +  num2 + "]\nCURF [" + num1 + "," +  num2 + "]\n";
		var moreText = (isTrue1)?("MORE"):("");
		var noSkip = (isTrue2)?("NCONVOS\n"):("");
		// add_text(moreText?, unskippable?, textId, backgroundId)
		if(actionType == "add_text")
		{
			// If a background is loaded, the "more text" option is disabled
			return "FADI 0x10\nHIDEMAP\nBACG 0x" + hexNum4 + 
					"\nFADU 0x10\nSHOWMAP\n" + noSkip + "TEX1 0x" + hexNum3 + "\n";
		}
		// add_mode_based_text(moreText?, unskippable?, textId_Eliwood_Mode, textId_Hector_Mode)
		else if(actionType == "add_mode_based_text")
			return noSkip + moreText + "TEXTIFEM 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		// add_gender_based_text(moreText?, unskippable?, textId_Male, textId_Female)
		else if(actionType == "add_gender_based_text")
			return noSkip + moreText + "TEXTIFTACTF 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		noSkip = (isTrue1)?("NCONVOS\n"):("");
		// scroll(unskippable?, textId, x, y)
		if(actionType == "scroll")
			return noSkip + "TEX6 0x1 [" + num3 + "," + num4 + "] 0x" + hexNum2 + "\n";
		// speech_bubble(unskippable?, textId, x, y)
		else if(actionType == "speech_bubble")
			return noSkip + "TEX6 0x0 [" + num3 + "," + num4 + "] 0x" + hexNum2 + "\n";
	}
	// If there are five parameters
	else if(partsArray[5] === null || partsArray[5] === undefined)
	{
		pointerName1 = partsArray[0].match(/[A-Za-z0-9_]+/);
		pointerName2 = partsArray[1].match(/[A-Za-z0-9_]+/);
		pointerName3 = partsArray[2].match(/[A-Za-z0-9_]+/);
		
		num1 = partsArray[0].match(/[0-9]+/);
		num2 = partsArray[1].match(/[0-9]+/);
		num3 = partsArray[2].match(/[0-9]+/);
		num4 = partsArray[3].match(/[0-9]+/);

		isTrue1 = (partsArray[0].match(/[a-z]+/) == "true");
		isTrue2 = (partsArray[1].match(/[a-z]+/) == "true");
		isTrue4 = (partsArray[3].match(/[a-z]+/) == "true");
		
		hexNum3 = partsArray[2].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum4 = partsArray[3].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum5 = partsArray[4].match(/[0-9A-Fa-f]+(?!x)/);
		
		// move_to_location(start_x, start_y, end_x, end_y, speed)
		if(actionType == "move_to_location")
			return "MOVE [" + num1 + "," +  num2 + "] [" + num3 + "," +  num4 + "] 0x" + hexNum5 + "\n";
		// replace(replacedChar, replacingChar, loadReplacingChar, fadeColorBlack?, fadeTime)
		else if(actionType == "replace")
		{
			fadeInColor = (isTrue4)?("FADI"):("FAWI");
			fadeOutColor = (isTrue4)?("FADU"):("FAWU");
			return fadeInColor + " 0x" + hexNum5 + "\nHIDEMAP\nDISA " + pointerName1 + "\n" + 
					"LOAD1 0x1 " + pointerName3 + "\nENUN\nMOVENEXTTO " + pointerName2 + " " + pointerName1 +
					"\nENUN\nSHOWMAP\n" + fadeOutColor + " 0x" + hexNum5 + "\n";
		}

		var moreText = (isTrue1)?("MORE"):("");
		var noSkip = (isTrue2)?("NCONVOS\n"):("");
		// add_mode_based_text(moreText?, unskippable?, textId_Eliwood_Mode, textId_Hector_Mode, backgroundId)
		if(actionType == "add_mode_based_text")
		{
			return "FADI 0x10\nHIDEMAP\nBACG 0x" + hexNum5 + "\nFADU 0x10\nSHOWMAP\n" + 
					noSkip + "TEXTIFEM 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		}
		// add_gender_based_text(moreText?, unskippable?, textId_Male, textId_Female, backgroundId)
		else if(actionType == "add_gender_based_text")
		{
			return "FADI 0x10\nHIDEMAP\nBACG " + hexNum5 + "\nFADU 0x10\nSHOWMAP\n" + 
					noSkip + "TEXTIFTACTF 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		}
		// add_event_based_text(moreText?, unskippable?, textId_Triggered, textId_Untriggered, eventId)
		else if(actionType == "add_event_based_text")
			return noSkip + moreText + "TEXTIFEVENTID 0x" + hexNum5 + " 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		// add_asm_based_text(moreText?, unskippable?, textId_Triggered, textId_Untriggered, asmOffset)
		else if(actionType == "add_asm_based_text")
			return noSkip + moreText + "TEXTIFASM 0x" + hexNum5 + " 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
	}
	else if(partsArray[6] === null || partsArray[6] === undefined)
	{
		pointerName1 = partsArray[0].match(/[A-Za-z0-9_]+/);
		pointerName2 = partsArray[1].match(/[A-Za-z0-9_]+/);
		pointerName3 = partsArray[2].match(/[A-Za-z0-9_]+/);
		pointerName4 = partsArray[3].match(/[A-Za-z0-9]+/);
		
		num1 = partsArray[0].match(/[0-9]+/);
		num2 = partsArray[1].match(/[0-9]+/);
		num3 = partsArray[2].match(/[0-9]+/);
		num4 = partsArray[3].match(/[0-9]+/);

		isTrue1 = (partsArray[0].match(/[a-z]+/) == "true");
		isTrue2 = (partsArray[1].match(/[a-z]+/) == "true");
		isTrue4 = (partsArray[3].match(/[a-z]+/) == "true");
		isTrue5 = (partsArray[4].match(/[a-z]+/) == "true");
		
		hexNum3 = partsArray[2].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum4 = partsArray[3].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum5 = partsArray[4].match(/[0-9A-Fa-f]+(?!x)/);
		hexNum6 = partsArray[5].match(/[0-9A-Fa-f]+(?!x)/);

		music = partsArray[5].match(/0x[0-9A-F]+/);
		
		var lastParam = partsArray[5].match(/[A-Za-z0-9]+/) + "";
		if(actionType == "replace")
		{
			// replace(replacedChar, replacingChar, loadReplacingChar, fadeColorBlack?, fadeSpeed, musicId)
			if(lastParam.indexOf("music") == 0)
			{
				var fadeInColor = (isTrue4)?("FADI"):("FAWI");
				var fadeOutColor = (isTrue4)?("FADU"):("FAWU");
				return "SOUN " + music + "\n" + fadeInColor + " 0x" + hexNum5 + "\nHIDEMAP\nDISA " + 
						pointerName1 + "\n" + "LOAD1 0x1 " + pointerName3 + "\nENUN\nMOVENEXTTO " + pointerName2 + 
						" " + pointerName1 + "\nENUN\nSHOWMAP\n" + fadeOutColor + " 0x" + hexNum5 + "\n";
			}
			// replace(x, y, replacingChar, loadReplacingChar, fadeColorBlack?, fadeSpeed)
			else
			{
				var fadeInColor = (isTrue5)?("FADI"):("FAWI");
				var fadeOutColor = (isTrue5)?("FADU"):("FAWU");
				return fadeInColor + " 0x" + hexNum6 + "\nHIDEMAP\nDISA [" + num1 + "," + num2 + "]\n" + 
					"LOAD1 0x1 " + pointerName4 + "\nENUN\nSHOWMAP\n" + fadeOutColor + " 0x" + hexNum6 + "\n";
			}
		}
		var noSkip = (isTrue2)?("NCONVOS\n"):("");
		// add_event_based_text(moreText?, unskippable?, textId_Triggered, textId_Untriggered, eventId, backgroundId)
		if(actionType == "add_event_based_text")
		{
			return "FADI 0x10\nHIDEMAP\nBACG 0x" + hexNum6 + "\nFADU 0x10\nSHOWMAP\n" + 
					noSkip + "TEXTIFEVENTID 0x" + hexNum5 + " 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		}
		// add_asm_based_text(moreText?, unskippable?, textId_Triggered, textId_Untriggered, eventId, backgroundId)
		else if(actionType == "add_asm_based_text")
		{
			return "FADI 0x10\nHIDEMAP\nBACG " + hexNum6 + "\nFADU 0x10\nSHOWMAP\n" + 
					noSkip + "TEXTIFASM 0x" + hexNum5 + " 0x" + hexNum3 + " 0x" + hexNum4 + "\n";
		}
	}
	else if(partsArray[7] === null || partsArray[7] === undefined)
	{
		num1 = partsArray[0].match(/[0-9]+/);
		num2 = partsArray[1].match(/[0-9]+/);
		
		pointerName4 = partsArray[3].match(/[A-Za-z0-9]+/);
		
		isTrue5 = (partsArray[4].match(/[a-z]+/) == "true");
		
		hexNum6 = partsArray[5].match(/[0-9A-Fa-f]+(?!x)/);
		
		music = partsArray[6].match(/0x[0-9A-F]+/);
		
		// replace(x, y, replacingChar, loadReplacingChar, fadeColorBlack?, fadeSpeed, musicId)
		if(actionType == "replace")
		{
			var fadeInColor = (isTrue5)?("FADI"):("FAWI");
			var fadeOutColor = (isTrue5)?("FADU"):("FAWU");
			return "SOUN " + music + "\n" + fadeInColor + " 0x" + hexNum6 + "\nHIDEMAP\n" +
					"DISA [" + num1 + "," + num2 + "]\nLOAD1 0x1 " + pointerName4 + "\nENUN\nSHOWMAP\n" + 
					fadeOutColor + " 0x" + hexNum6 + "\n";
		}
	}
	return "";
}

function capitalizeFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseFirstLetter(string)
{
	return string.charAt(0).toLowerCase() + string.slice(1);
}

function addScriptedAttack()
{
	var type = getSelectedOption(document.scriptedFightAdderForm.sel_scriptedAction);
	var blockNum = getSelectedBlock("ScriptedFight");
	if(blockNum >= 0)
	{
		var num = getNewBlockElementIdNum("scriptedFight");
		var attackListId = "s_list" + blockNum;
		var parent = document.getElementById(attackListId);
		var newDiv = document.createElement('div');
		var divIdName = 'scriptedAttack' + num;
		var damage = document.scriptedFightAdderForm.txt_damage.value;
		damage = damage.match(/[0-9]+/);
		damage = (type !== "Miss" && type !== "No_Damage")?(damage + ","):("");
		var fighter = (document.scriptedFightAdderForm.rd_Attacker.checked)?("Attacker"):("Defender");
		var isLastAttack = (document.scriptedFightAdderForm.ckb_lastAttack.checked)?("1"):("0");
		newDiv.setAttribute('id',divIdName);
		newDiv.setAttribute('style', 'margin-right:5px;');
		var content = "";

		if(type == "Heal")
			content = "AttackerHit(" + "(-" + damage.match(/[0-9]+/) + ")," + isLastAttack + ")";	
		else
			content = fighter + type.replace("_", "") + "(" + damage + isLastAttack + ")";
		
		newDiv.innerHTML = content + "  // <a href='javascript:setScriptedFightInsertionPoint(" + num + "," + blockNum +
							");'>Insert Pt.</a>&nbsp;&nbsp;" + 
							"<a href='javascript:removeScriptedAttack(" + num + "," + blockNum + ");'>Delete</a>";
							
		var insertPoint = document.scriptedFightAdderForm.hd_scriptedFightInsertionPoint.value;
		var insertPointDiv = "scriptedAttack" + insertPoint;
		if(insertPoint == "")
			parent.appendChild(newDiv);
		else
		{
			$("#" + insertPointDiv).after(newDiv);
			document.scriptedFightAdderForm.hd_scriptedFightInsertionPoint.value = num;
		}
		updateEventOutput();
	}
	else
		alert("Error: No scripted fight event exists.  Please create a scripted fight event.");
}

function addManualMovement(type, num)
{
	var direction = "";
	var color = getSelectedOption(document.manualMoveAdderForm.sel_color);
	var blockNum = getSelectedBlock("ManualMove");
	var moveNum = getNewBlockElementIdNum("manualMove" + blockNum);
	if(moveNum <= 60)
	{
		if(num == 0)
			direction = type;
		else
		{
			var mapX = document.mapClickPosForm.txt_mouseX;
			var mapY = document.mapClickPosForm.txt_mouseY;
			if(type == "x")
			{
				mapX.value = parseInt(mapX.value) + num;
				direction = (num > 0)?("right"):("left");
			}
			else
			{
				mapY.value = parseInt(mapY.value) + num;
				direction = (num > 0)?("down"):("up");
			}
			var mapDiv = document.getElementById('manualMoveImgDiv');
			var newImg = document.createElement('img');
			var imgIdName = "moveImg" + blockNum + "_" + moveNum;
			var imageUrl = "MoveArrows/" + color +"_" + direction + ".png";
			var imgStyle = "position:absolute; left:" + parseInt(mapX.value)*16 +
							"px; top:" + parseInt(mapY.value)*16 + "px;";
			var imgClick = "setManualMoveStartPos(" + mapX.value + "," + mapY.value + ");";
			newImg.setAttribute('id',imgIdName);
			newImg.setAttribute('src',imageUrl);
			newImg.setAttribute('style',imgStyle);
			newImg.setAttribute('onclick', imgClick);
			mapDiv.appendChild(newImg);
			
			document.getElementById("ManualMoveEndPointer").style.left = parseInt(mapX.value)*16 + "px";
			document.getElementById("ManualMoveEndPointer").style.top = parseInt(mapY.value)*16 + "px";
		}
		var unitListId = "m_list" + blockNum;
		var parent = document.getElementById(unitListId);
		var newSpan = document.createElement('span');
		var spanIdName = 'customMove' + blockNum + "_" + moveNum;
		newSpan.setAttribute('id',spanIdName);
		newSpan.setAttribute('style', 'margin-right:5px;');
		newSpan.innerHTML = (parseInt(moveNum)%7 == 0)?(direction + "<br>"):(direction);
		parent.appendChild(newSpan);
		updateEventOutput();
	}
	else
	{
		var numi = document.getElementById("manualMove" + blockNum + "Id");
		numi.value = numi.value - 1;
		alert("Max cap of " + numi.value + " moves reached. Please create a new move block.");
	}	
}

function undoLastManualMove()
{
	var blockNum = getSelectedBlock("ManualMove");
	var id = "manualMove" + blockNum + "Id";
	var currentCount = document.getElementById(id).value;
	if(currentCount > 0)
	{
		var spanId = "customMove" + blockNum + "_" + currentCount;
		$("#" + spanId).remove();
		
		var imgId = "moveImg" + blockNum + "_" + currentCount;
		var imgExists = document.getElementById(imgId);
		if(imgExists !== null && imgExists !== undefined)
			$("#" + imgId).remove();
		
		currentCount = parseInt(currentCount) - 1;
		document.getElementById(id).value = currentCount;
		moveEndPointerToLastManualMove(blockNum, currentCount);
	}
}

function moveEndPointerToLastManualMove(blockNum, currentCount)
{
	var imgId = "moveImg" + blockNum + "_" + currentCount;
	var lastMove = document.getElementById(imgId);
	var coordArray;
	if(lastMove !== null && lastMove !== undefined)
	{
		document.getElementById("ManualMoveEndPointer").style.left = lastMove.style.left;
		document.getElementById("ManualMoveEndPointer").style.top = lastMove.style.top;
		coordArray = getMapCoordFromImage(lastMove);
		document.mapClickPosForm.txt_mouseX.value = coordArray[0];
		document.mapClickPosForm.txt_mouseY.value = coordArray[1];
		return true;
	}
	else if(currentCount == 0)
	{
		var startPointer = document.getElementById("ManualMoveStartPointer");
		document.getElementById("ManualMoveEndPointer").style.left = startPointer.style.left;
		document.getElementById("ManualMoveEndPointer").style.top = startPointer.style.top;
		coordArray = getMapCoordFromImage(startPointer);
		document.mapClickPosForm.txt_mouseX.value = coordArray[0];
		document.mapClickPosForm.txt_mouseY.value = coordArray[1];
		return true;
	}
	else
		return moveEndPointerToLastManualMove(blockNum, currentCount-1);
}

function toggleScriptedDamageVisibility()
{
	var damageField = document.getElementById("scriptedDamageDiv");
	var damageLabel = document.getElementById("lb_scriptedDamage");
	var choice = getSelectedOption(document.scriptedFightAdderForm.sel_scriptedAction);
	if(choice == "Miss" || choice == "No_Damage")
		damageField.style.display = "none";
	else
	{
		damageField.style.display = "inline";
		if(choice == "Silencer")
			damageLabel.innerHTML = "Target HP:";
		else if(choice == "Heal")
			damageLabel.innerHTML = "Restored HP:";
		else
			damageLabel.innerHTML = "Damage:";
	}
}

function switchEventForm()
{
	$("#eventWriterWrapper > form").each(function()
	{
		this.style.display = "none";
	});
	$("#eventBlockWrapper > div").each(function()
	{
		this.style.display = "none";
	});
	
	document.getElementById("sel_eventBlock").style.display = "none";
	document.getElementById("sel_manualMoveBlock").style.display = "none";
	document.getElementById("sel_scriptedFightBlock").style.display = "none";
	document.getElementById("txt_newEventBlock").style.display = "none";
	document.getElementById("txt_newManualMoveBlock").style.display = "none";
	document.getElementById("txt_newScriptedFightBlock").style.display = "none";
	document.getElementById("manualMoveImgDiv").style.display = "none";
	document.getElementById("genEventImgDiv").style.display = "none";

	var raw_choice = "" + getSelectedOption(document.topEventForm.sel_eventActionType).match(/[A-Za-z_]+/);
	raw_choice = raw_choice.replace("_", "");
	var choice = lowerCaseFirstLetter(raw_choice);
	document.getElementById(choice + "AdderForm").style.display = "inline";
	document.getElementById(choice + "BlockDiv").style.display = "inline";
	document.getElementById("sel_" + choice + "Block").style.display = "inline";
	document.getElementById("txt_new" + raw_choice + "Block").style.display = "inline";
	document.topEventForm.btn_deleteEventBlock.setAttribute("onclick", "removeBlock(confirmRemoveBlock('" + raw_choice + "'),'" + raw_choice + "');");
	document.topEventForm.btn_addEventBlock.setAttribute("onclick","addBlock('" + raw_choice + "');");
	if(choice == "event")
	{
		getNextEvent('sel_genEvent');
		document.getElementById("genEventImgDiv").style.display = "inline";
	}
	if(choice == "manualMove")
		document.getElementById("manualMoveImgDiv").style.display = "inline";
}

function toggleOOBBInOpeningEvent()
{
	var checked = document.topOutputForm.ckb_fadeToBlack.checked;
	var eventNum = getSelectedBlock("Event");
	var eventListId = "e_list" + eventNum;
	// Get insertion point
	var oldActionNum = document.eventAdderForm.txt_eventInsertionPoint.value;
	var prevNum;
	// If insertion point is valid
	if(oldActionNum !== null && oldActionNum !== undefined && oldActionNum != "")
	{
		removeInsertionPointer("action" + oldActionNum);
		prevNum = oldActionNum;
	}
	else
	{
		prevNum = "";
	}
	if(checked)
	{
		// Add OOBB to front of opening event
		var parent = document.getElementById(eventListId);
		var newdiv = document.createElement('div');
		newdiv.setAttribute('id','action0');
		newdiv.innerHTML = "Remove_Begining_Blackness()  // <a href='javascript:setEventInsertionPoint(" + 
															0 + "," + eventNum + ");'>Insert Pt.</a>" +
						"<input type='hidden' id='hd_eventCode" + 0 + "' value='OOBB\n'>";
		$("#action-1_" + eventNum).after(newdiv);
	}
	else
	{
		// Remove OOBB from opening event
		var parent = document.getElementById(eventListId);
		var olddiv = document.getElementById("action0");
		prevNum = "";
		
		parent.removeChild(olddiv);
	}
	updateEventOutput();

	document.eventAdderForm.txt_eventInsertionPoint.value = prevNum;
	if(prevNum != "")
	{
		setInsertionPointer("action" + prevNum);
	}
}

function toggleEventAfterExitingPrepScreen()
{
	var num = 2;
	var name = "EventAfterExitingPrepScreen";
	var parent = document.getElementById("eventBlockDiv");
	var divIdName = "eventBlock" + num;
	if(document.topOutputForm.ckb_prepScreen.checked)
	{
		var newdiv = document.createElement('div');
		newdiv.setAttribute('id',divIdName);
			newdiv.innerHTML = "<div id='e_name" + num + "' class='b_name'>" + name + ":" +
							   "<a href='javascript:toggleEventBlock(" + num + ");'>" +
							   "<img src='BlockIcons/Minimize.png'" +
							   " id='minMaxImgE" + num + "' class='minMaxImg'></a></div>" +
							   "<div id='e_list" + num  + "'><div id='action-1_" + num + "'>" +
							   "<a href='javascript:setEventInsertionPoint(-1," + num + ");'>Insert At Beginning</a>" +
							   "<a href='javascript:setEventInsertionPoint(\"\"," + num + ");'>Insert At End</a></div>" +
							   "<div id='action1'> Remove_Begining_Blackness()  // <a href='javascript:setEventInsertionPoint(" + 
								1 + "," + num + ");'>Insert Pt.</a>" + "<input type='hidden' id='hd_eventCode" + 1 + 
								"' value=''></div></div>";
		parent.appendChild(newdiv);
		var optionOpenWithId = "<option id='selectEventBlock" + num + "'>";
		$("#sel_eventBlock").append(optionOpenWithId + name + optionClosed);
		updateAllBlockSelectors("Event");
		updateEventOutput();
	}
	else
	{
		var form = document.getElementById("sel_eventBlock");
		setSelectedOption(name, form);
		var index = form.selectedIndex;
		form.remove(index);
		updateAllBlockSelectors("Event");
		var divIdName = "eventBlock" + num;
		var olddiv = document.getElementById(divIdName);
		parent.removeChild(olddiv);
		updateEventOutput();
	}
}

function updateTextboxPosEntryImage()
{
	$("#textboxPosImagesDiv > img").each(function()
	{
		this.style.display = "none";
	});
	var choice = getSelectedOption(document.eventAdderForm.sel_textboxSize);
	var imgId = choice + "TextboxImg";
	document.getElementById(imgId).style.display = "inline";
}

function placeTextboxPosEntry()
{
	var choice = getSelectedOption(document.eventAdderForm.sel_textboxSize);
	var imgId = choice + "TextboxImg";
	var raw_x = document.getElementById(imgId).style.left;
	var raw_y = document.getElementById(imgId).style.top;
	document.eventAdderForm.txt_xPosTextboxEntry.value = raw_x.match(/[0-9]+/);
	document.eventAdderForm.txt_yPosTextboxEntry.value = raw_y.match(/[0-9]+/);
}

function popNextNewEventId(name)
{
	var array = document.getElementById("sel_availableEventIdsList");
	var first = array.options[0].value;
	array.remove(0);
	$("#sel_existingEventIdsList").append(optionOpen + first + " " + name + optionClosed);
	return first;
}

function popNextPermNewEventId(name)
{
	var array = document.getElementById("sel_availablePermEventIdsList");
	var first = array.options[0].value;
	array.remove(0);
	$("#sel_existingEventIdsList").append(optionOpen + first + " " + name + optionClosed);
	return first;
}

function popNextCondId()
{
	var storedId = document.getElementById("storedConditionId").value;
	if(storedId == 0)
	{
		var array = document.getElementById("sel_availableCondIdsList");
		var first = array.options[0].value;
		array.remove(0);
		return first;
	}
	else
		return storedId;
}

function pushBackToNewEventId()
{
}

function toggleVisibilityOfEventIdFormElements()
{
	var choice = getSelectedOption(document.conditionForm.sel_eventIdSource);
	var newId = document.getElementById("newEventIdNameDiv");
	var existingId = document.getElementById("existingEventIdDiv");
	newId.style.display = "none";
	existingId.style.display = "none";
	
	if(choice == "Existing Id")
		existingId.style.display = "inline";
	else if(choice.indexOf("New") == 0)
		newId.style.display = "inline";
}

function toggleEventIdCondFormVisibility()
{
	var visibility = (document.conditionForm.ckb_eventAttached.checked)?("inline"):("none");
	document.getElementById("eventIdForConditionsDiv").style.display = visibility;
}

$.fn.isAfter = function(sel) 
{
    return this.prevAll(sel).length !== 0;
}

$.fn.isBefore = function(sel) 
{
    return this.nextAll(sel).length !== 0;
}

function suggestEventForms(input, eventCodeDictionary) 
{
	if(input !== null && input !== undefined && input !== "")
	{
	   var suggestions = [];
	   for (var term in eventCodeDictionary)
	   {
		  var search_term = term.toLowerCase();
		  input = (input + "").toLowerCase();
	      if (search_term.indexOf(input) == 0)
		  {
	         suggestions.push(term);
	      }
	   }
	   if(suggestions !== null && suggestions.length > 0)
	   {
		   updateSelectOptions("#sel_eventCodeSearchForm",suggestions);
		   var selectedOption = document.getElementById("sel_eventCodeSearchForm").options[0];
		   selectedOption.selected = "selected";
		   selectedValue = selectedOption.innerHTML + "";
		   setEventForm(eventCodeDictionary[selectedValue]);
		   return;
	   }
   }
	document.getElementById("sel_eventCodeSearchForm").innerHTML = "";
}

function toggleEventSearchType()
{
	var advanced = document.getElementById("eventAdvancedSearchDiv");
	var categories = document.getElementById("eventCategorySearchDiv");
	if(document.eventAdderForm.ckb_advancedSearch.checked)
	{
		advanced.style.display = "inline";
		categories.style.display = "none";
	}
	else
	{
		advanced.style.display = "none";
		categories.style.display = "inline";
	}
}

var existingPointerNames = ["Units", "BeginningScene", "EndingScene",
						   "TurnBasedEvents", "CharacterBasedEvents",
						   "LocationBasedEvents", "MiscBasedEvents", "TrapData",
						   "EventAfterExitingPrepScreen"];
				 
var optionOpen = "<option>";
var optionClosed = "</option>";
				