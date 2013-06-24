/**
 * Ubiquity.js - simulation of ubiquity in forest fire scale
 *
 * @version: 1.0 (2011/11/25)
 * @requires jQuery v1.7 or later, jqBarGraph v1.1
 * @author Makoto Sato
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 *
**/

$(function(){
	
	var mainTable = {
		'defColor' : "#eeeeee",	// default table cell color
		'treeColor' : "#00ff00",	// tree table cell color
		'burnColor' : "#ff0000",	// burn table cell color
		'fadeSpeed' : '',		// fade effect prop at table cell color change. (mili second)
		'init' : function() {
			this.fadeSpeed = $('#waiting_time').attr('value') / 2 ;
			
			var tablerow = $('#tablerow').attr('value');	// a numbur of row
			var tablecol = $('#tablecol').attr('value');	// a numbur of column
			initializeTable(tablerow, tablecol);
			
			function initializeTable(r, c) {
				$("#MainTable").remove();
				$("#mainDiv").append('<table id="MainTable"></table>');
				
				for (var i = 0; i < r; i++) {	// append tr and td tags
					$("#MainTable").append('<tr></tr>');
					for (var j = 0; j < c; j++) {
						$($("#MainTable tr")[i]).append('<td></td>');
					};
				};
				
				$('#MainTable td').css('background-color', mainTable.defColor);
			};
			
		},
		
		'genTree' : function() {	// generate tree at random in table cell
			var rnd_row = this.getRandomRow();
			var rnd_col = this.getRandomCol();
			this.markTd(rnd_row, rnd_col, this.treeColor);
		},
		
		'getRandomRow' : function() {
			var max = $("#MainTable tr").length;
			return Math.floor( Math.random() * max );
		},
		
		'getRandomCol' : function() {
			var max = $("td",$($("#MainTable tr")[0])).length;
			return Math.floor( Math.random() * max );
		},
		
		'markTd' : function(row, col, myColor){	// change color of a table cell
			var $target_tr = $($("#MainTable tr")[row]);
			var $target_td = $($("td", $target_tr)[col]);
			$target_td.css("background-color", myColor);
		},
		
		// burn random tree cell and neighboring tree cells recursively
		'burnTrees' : function() {
			var treesQueue = [];	// container of coordinates array which will be burnt sequentially
			var r = mainTable.getRandomRow();
			var c = mainTable.getRandomCol();
			setTreesQueue([[r,c]],treesQueue);	// push burnt coordinates arrays to treesQueue
			fire(treesQueue,0);	// change color of queue elements
			var ret = {};	// object for return
			ret.treeNum = countTrees(treesQueue);	// number of all trees in treesQueue ( for chart data )
			ret.stepNum = treesQueue.length;		// number of burn step ( for effect delay time )
			return ret;

			function setTreesQueue(coordinates, treesQueue) {	
				var burntTrees = [];	// temporary coordinates container
				
				// check coordinates of argument. the cell is tree? and the cell had already pushed to container?
				for (var i=0; i<coordinates.length; i++) {
					var r = coordinates[i][0];
					var c = coordinates[i][1];
					var $target_tr = $($("#MainTable tr")[r]);
					var $target_td = $($("td", $target_tr)[c]);
					
					if (mainTable.isTree(r,c) === true && hasTreesQueue(r,c, treesQueue) === false && hasBurntTrees(r,c, burntTrees) === false) {
						burntTrees.push([r,c]);
					};
				};
				
				// add coordinates to treesQueue
				if (burntTrees.length === 0) {
					return false;	// recursion end
				}else{
					treesQueue.push(burntTrees);
				};
				
				// get neighboring coordinates for recursion
				var nextCoordinates = []; 
				for (var j=0; j<burntTrees.length; j++) {
					var r = burntTrees[j][0];
					var c = burntTrees[j][1];
					nextCoordinates.push([r+1,c]);
					nextCoordinates.push([r-1,c]);
					nextCoordinates.push([r,c+1]);
					nextCoordinates.push([r,c-1]);
				};
				setTreesQueue(nextCoordinates, treesQueue);	// recursive call
				
				
				function hasBurntTrees(r,c,burntTrees) {	// check temporary coordinates container have already had target coordinates
					for (var i=0; i<burntTrees.length; i++) {
						if (burntTrees[i][0] === r && burntTrees[i][1] === c) {
							return true;
						};
					};
					return false;
				};
				
				
				function hasTreesQueue(r,c, treesQueue) {	// check coordinates container have already had target coordinates
					for (var i=0; i<treesQueue.length; i++) {
						for (var j=0; j<treesQueue[i].length; j++) {
							if (treesQueue[i][j][0] === r && treesQueue[i][j][1] ===c) {
								return true;
							};
						};
					};
					return false;
				};
				
			};
			
			
			function fire(treesQueue, index) {	
				if (typeof(treesQueue[index]) === 'undefined') {
					return false;	// recursion end
				}else{
					var cells = [];
					for (var i=0; i<treesQueue[index].length; i++) {
						var r = treesQueue[index][i][0];
						var c = treesQueue[index][i][1];
						var $target_tr = $($("#MainTable tr")[r]);
						var $target_td = $($("td", $target_tr)[c]);
						var recursiveFlag;
						
						// do recursive call only once in for loop
						if (i === 0) {
							recursiveFlag = true;
						}else{
							recursiveFlag = false;
						};
						
						// change cell color and fadeTo 0
						$target_td.css("background-color", mainTable.burnColor)
							.fadeTo(mainTable.fadeSpeed, 0, fireCallback($target_td, recursiveFlag, index) );
					};
					
				};
				
				function fireCallback($target, flag, QueIndex) {	// change default color and fadeTo 1
					return function() {
						$target.css("background-color", mainTable.defColor).fadeTo(mainTable.fadeSpeed,1, function(){
							if (flag === true) {
								fire(treesQueue, QueIndex+1);	// recursive call
							};
						});	
					};
				};
				
			};
			
			
			function countTrees(treesQueue) {
				var num = 0;
				for (var i=0; i<treesQueue.length; i++) {
					num += treesQueue[i].length;
				};
				return num;
			};
		},
		
		'isTree' : function(row, col) {	// check whether or not the cell is tree
			var $target_tr = $($("#MainTable tr")[row]);
			var $target_td = $($("td", $target_tr)[col]);
			var TargetColor = $target_td.css("background-color");
			
			if (typeof TargetColor === "undefined"){
				return false;
			}else if (TargetColor.charAt(0) === '#') {	// for IE
				if (TargetColor === mainTable.treeColor) {
					return true;
				}else{
					return false;
				};
			}else{
				if (rgb2hex(TargetColor) == mainTable.treeColor) {
					return true;
				}else{
					return false;
				};
			};
			
			function rgb2hex(rgbString) {	//  'rgb(255, 0, 255)' -> '#ff00ff'
				var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

				delete (parts[0]);
				for (var i = 1; i <= 3; ++i) {
				    parts[i] = parseInt(parts[i]).toString(16);
				    if (parts[i].length == 1) parts[i] = '0' + parts[i];
				}
				return "#" + parts.join('');
			};
		},
		
		'treeExists' : function () {	// check whether or not Main Table contains tree cells
			var row_max = $("#MainTable tr").length;
			var col_max = $("td",$($("#MainTable tr")[0])).length;
			
			for (var r=0; r<row_max; r++) {
				for (var c=0; c<col_max; c++) {
					if (mainTable.isTree(r,c) === true) {
						return true;
					};
				};
			};
			return false;
		}
	};
	
	var realTimeCh = {
		'fieldID' : 0,		// container ID of a data field
		'labelHeight' : 20,	// label height
		'barWidth' : 1,	// graph bar width
		'barMargin' : 1,	// margin of between bars
		'chHeight' : 200,	// chart area height
		'chWidth' : 300,	// chart area width
		'scaleMax' : 0,	// max value of y-axs scale
		'scaleFieldWidth' : 20,
		'scaleFontSize' : 10,
		'labelInterval' : 10,	// interval of putting labels
		'data' : [],		// data values
		'selfCSS' : {	// chart area css
			'position': 'relative',
			'text-align': 'center'
		},
		
		'fieldCSS' : {	// data field CSS
			'position': 'absolute',
			'bottom': '0px'
		},
		
		'barCSS' : {	// data bar CSS
			'position': 'relative',
			'background-color': '#777777',
			'overflow-x' : 'hidden',
			'overflow-y' : 'hidden'
		},
		
		'labelCSS' : {	// data label CSS
			
		},
		
		'init' : function() {
			
			this.fieldID = 0;
			this.data = [];
			
			// clear dataFields
			$('#realTimeChartDiv').empty();
			
			// set chart area CSS
			this.selfCSS.width =  this.chWidth + 'px';
			this.selfCSS.height = this.chHeight + this.labelHeight + 'px';
			$('#realTimeChartDiv').css(this.selfCSS);
			
			// initialize labelCSS props.
			this.labelCSS.height = this.labelHeight + 'px';
			this.labelCSS['font-size'] = this.scaleFontSize + 'px';
			
			// initialize fieldCSS props.
			this.fieldCSS.width = this.barWidth + 'px';
			this.fieldCSS['margin-left'] = this.barMargin + 'px';
			
			// initialize scaleMax prop.
			var tablerow = $('#tablerow').attr('value');
			var tablecol = $('#tablecol').attr('value');
			this.scaleMax = tablerow*tablecol;
			
			// add scaleField and set CSS
			$('#realTimeChartDiv').append('<div id="realTimeChScaleField"></div>');
			$('#realTimeChScaleField')
				.append('<div id="realTimeChScaleField_Max">' + this.scaleMax +'</div>')
				.append('<div id="realTimeChScaleField_Mid"></div>')
				.append('<div id="realTimeChScaleField_Min">0</div>')
				.append('<div id="realTimeChScaleField_label"></div>')
			;
			$('#realTimeChScaleField').css({
				'position': 'absolute',
				'bottom': '0px',
				'left' : '0px',
				'width' : this.scaleFieldWidth + 'px'
			});
			$('#realTimeChScaleField_Max').css({
				'top' : '0px',
				'font-size' : this.scaleFontSize + 'px'
			});
			$('#realTimeChScaleField_Mid').css({
				'height' : (this.chHeight - this.labelHeight * 2) + 'px'
			});
			$('#realTimeChScaleField_Min').css({
				'bottom' : '0px',
				'font-size' : this.scaleFontSize + 'px'
			});
			$('#realTimeChScaleField_label').css(this.labelCSS);
			
		},
		
		'addBar' : function(value, label) {	// add a dataField and set it's CSS
			
			// add value to data prop.
			this.data.push(value);
			
			// determine dataField position and bar height
			this.fieldCSS.left = this.scaleFieldWidth + (this.barWidth + this.barMargin) * this.fieldID + 'px';
			this.barCSS.height = Math.ceil(this.chHeight * (value/this.scaleMax)) + 'px';
			
			// add dataField and set CSS
			$('#realTimeChartDiv').append('<div id="realTimeChField' + this.fieldID + '"></div>');
			$('#realTimeChField' + this.fieldID)
				.css(this.fieldCSS)
				.append('<div id="realTimeChBar' + this.fieldID + '"></div>')	// add bar
				.append('<div id="realTimeChLabel' + this.fieldID + '"></div>')	// add label
			;
			
			// set CSS
			$('#realTimeChBar' + this.fieldID).css(this.barCSS);
			$('#realTimeChLabel' + this.fieldID).css(this.labelCSS);
			
			// insert label
			if ( this.fieldID % this.labelInterval === 0 ) {
				$('#realTimeChLabel' + this.fieldID).append(label);
			};
			
			this.fieldID++;
		}
	};
	
	var histogramCh = {
		'init' : function() {
			$('#histogramChartDiv').empty();
			$('#histogramChartDiv').removeAttr('style');
		},
		'load' : function() {
			var barColor = '#CCC';
			var binsNum = 10;		// number of frequency data bins
			var bins = getBins(realTimeCh.data, binsNum);	// frequency bins array
			var chData = frequency(realTimeCh.data, bins);
			
			for (var i=0; i<chData.length; i++) {
				chData[i].push(barColor);
			};
			
			$('#histogramChartDiv').jqBarGraph({ data: chData, width: 300, height: 220 });
			
			function getBins(data, num) {
				var minValue;
				var maxValue;
				var interval;
				var retBins = [];
				
				// get min and max
				for (var i=0; i<data.length; i++) {
					// set default data at first only
					if (typeof minValue === 'undefined') { minValue = data[i] };
					if (typeof maxValue === 'undefined') { maxValue = data[i] };
					
					if (data[i] < minValue) { minValue = data[i] };
					if (data[i] > maxValue) { maxValue = data[i] };
				};
				
				// push bins with interval
				interval = Math.ceil((maxValue - minValue)/num);
				for (var j=0; j<=num; j++) {
					retBins.push(minValue + interval * j);
				};
				
				return retBins;
			};
			
			function frequency(data, bins) {
				
				// ready data counter
				var fq = {};
				for (var i=0; i<bins.length; i++) {
					fq[bins[i]] = 0;
				};
				
				// count data
				for (var j=0; j<data.length; j++) {
					for (var k=0; k<bins.length; k++) {
						if (data[j] <= bins[k]) {
							fq[bins[k]]++;
							break;
						};
					};
				};
				
				// put jqBarGraph data
				var retArray= [];
				for (var m=0; m<bins.length; m++) {
					retArray.push([fq[bins[m]],bins[m]]);	// -> [bins, value]
				};
				
				return retArray;
			};
		}
	};
	
	var Game = {
		'intervalID' : '',
		'maxAttemptTimes' : '',
		'waitingTime' : '',
		'firePerStep' : '',
		'attemptTimes' : '',
		'run' : function() {
			
			// initialize props
			this.maxAttemptTimes = $("#attempt_times_max").attr("value");
			this.waitingTime = $("#waiting_time").attr("value");
			this.firePerStep = $("#fire_per_step").attr("value");
			this.attemptTimes = $("#attemptTimes").html();
			
			// button able/disable
			$('#run_button').attr('disabled','disabled');
			$('#stop_button').removeAttr('disabled');
			
			// repeat oneStep function
			Game.intervalID = setInterval(oneStep,this.waitingTime);
			
			function oneStep(){
				
				// increase attempt time
				Game.attemptTimes++;
				$("#attemptTimes").html(Game.attemptTimes);
				
				mainTable.genTree();	// generate tree at random
				
				// fire
				if ( Game.attemptTimes % Game.firePerStep === 0) {
					clearInterval(Game.intervalID);	// stop oneStep function repeating
					$('#stop_button').attr('disabled', 'disabled');
					var burnResult = mainTable.burnTrees();	// start burning effect
					var burningTime = burnResult.stepNum * Game.waitingTime;
					
					// wait while burning effect running, then...
					setTimeout(function(){ 
						realTimeCh.addBar(burnResult.treeNum, realTimeCh.fieldID);	// drow realtime chart
						Game.intervalID = setInterval(oneStep,Game.waitingTime);		// start oneStep function repeating
						$('#stop_button').removeAttr('disabled', 'disabled');
					},burningTime);
					
				};
				
				// finish running
				if ( Game.attemptTimes >= Game.maxAttemptTimes ) {
					clearInterval(Game.intervalID);
					$('#stop_button').attr('disabled','disabled');
					$('#run_button').removeAttr('disabled');
					$('#attemptTimes').html('0');
					histogramCh.init();
					histogramCh.load();
				};
			};
			
		},
		
		'stop' : function() {
			clearInterval(Game.intervalID);
			$('#stop_button').attr('disabled','disabled');
			$('#run_button').removeAttr('disabled');
		}
	};
	
	var eventHandler = {
		'listen' : function() {
			
			// form value change
			$targets = $('input.param');
			$targets.change(function(event){
				var $target = $(event.target);
				
				// validation of form value
				if ( isNumber($target.attr('value')) ) {	
					$target.css('background-color', '#ffffff');
					switch($target.attr('id')) {
						case 'tablerow' :
							if ( isNumber($('#tablecol').attr('value')) ){ init() };
							break;
						case 'tablecol' :
							if ( isNumber($('#tablerow').attr('value')) ){ init() };
							break;
						case 'attempt_times_max' :
							$("#settingAttemptTimes").html($('#attempt_times_max').attr('value'));
							break;
						case 'waiting_time' : 
							mainTable.fadeSpeed = $('#waiting_time').attr('value') / 2 ;
							Game.waitingTime = $("#waiting_time").attr("value");
							break;
					};
				}else{
					$target.css('background-color','#ffff00').focus();
					alert('input number only.');
				};
				
				// check if argument string is number only
				function isNumber(str) {
					if (str.match(/[^0-9]/g)){
						return false;
					}else{
						return true;
					};
				};
				
			});
			
			// run button click
			$("#run_button").click(function(){
				Game.run();
			});
			
			// stop button click
			$("#stop_button").click(function(){
				Game.stop();
			});
			
			// csv button click
			$('#saveChData_button').click(function(){
				var w = window.open('','CSV_data');
				w.document.open();
				w.document.write('<html><head><title>CSV data</title></head><body><textarea id="csv_textarea" rows="20" cols="60"></textarea></body></html>');
				var txtarea = w.document.getElementById('csv_textarea');
				txtarea.innerHTML = realTimeCh.data.join(',');
				w.document.close();
			});
			
		}
	};
	
	function init() {
		mainTable.init();
		realTimeCh.init();
		histogramCh.init();
		$("#attemptTimes").html('0');
		$("#settingAttemptTimes").html($('#attempt_times_max').attr('value'));
	};
	
	
	init();
	eventHandler.listen();
  });
