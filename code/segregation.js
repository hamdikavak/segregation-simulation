var NUM_OF_COLS=75;
var NUM_OF_ROWS=75;
var canvas_width=525;
var canvas_height=525;
var radius;
var cell_size;
var cells;
var cell_to_be_moved;
var cell_changed;
var population_type_1;
var population_type_2;
var running_time_in_seconds=600;
var frame_per_second=5;
var frame_number = 0;
var frame_interval;
var refreshIntervalId;
var desired_similarity_1;
var desired_similarity_2;
var number_of_happy=0;
var numOfCells;
var simulationRunning = false;
var numOfEmptyCells;
var empty_cells;
var average_similarity;
var hapiness_percentages = [];
var generated_numbers = [];
var cells_that_will_move;

google.load("visualization", "1", {packages:["corechart"]});
var data;

var options = {
	  width: 400, height: 300,
      vAxis: {maxValue: 100, minValue: 0, title:'Resulting Similarity'},
      hAxis: {color: '#333', count: 5,  title:'Iteration Number'},
      legend:{position:'none'}
};

$(document).ready(function () {

	$('#segregationVisualizer').attr("width",canvas_width+"px");
	$('#segregationVisualizer').attr("height",canvas_height+"px");
	cell_size = Math.floor(canvas_width/NUM_OF_COLS);
	radius = cell_size/2;
	
	setDefaultSimulationParameters();
	
	
	$('#btnResetSimulation').bind('click', function() {
		setDefaultSimulationParameters();
	});
	
	$('#btnInitSimulation').bind('click', function() {
		changeButtonState('#btnRunSimulation', true);
		firstRun();
	});
	
	$('#btnRunSimulation').bind('click', function() {
		
		if(simulationRunning==false){
			$('#btnRunSimulation').val("Stop");
			simulationRunning = true;
			refreshIntervalId = setInterval(drawFrame,frame_interval);
			
		}
		else{
			$('#btnRunSimulation').val("Run");
			simulationRunning = false;
		}
	});
	

	$('#animSpeed').bind('change', function() {
		if(simulationRunning){
		clearInterval(refreshIntervalId);
		frame_interval = 1000/parseInt($(this).attr('value'));
		refreshIntervalId = setInterval(drawFrame,frame_interval);
		}
	});
	
});

function firstRun(){
	data = new google.visualization.DataTable();
	data.addColumn('number', 'Time');
	data.addColumn('number', 'Similarity %');
	frame_number=0;
	//$("#logs").text("");
	initializeAnimationParameters();
	randomlyFiilCells();
	drawCellsOnCanvas();
}

function setDefaultSimulationParameters(){
	simulationRunning = false;
	$('#populationType1').val("2250");
	$('#populationType2').val("2250");
	$('#desiredSimilarityType1').val("70");
	$('#desiredSimilarityType2').val("70");
	$('#animSpeed').val("5");
	changeButtonState('#btnRunSimulation', false);
}

function initializeAnimationParameters(){

	population_type_1 = parseInt($('#populationType1').val());
	population_type_2 = parseInt($('#populationType2').val());
	desired_similarity_1 = parseInt($('#desiredSimilarityType1').val());
	desired_similarity_2 = parseInt($('#desiredSimilarityType2').val());
	
	frame_interval = 1000/parseInt($('#animSpeed').attr('value'));
	numOfCells = NUM_OF_ROWS*NUM_OF_COLS;
	cells = new Array( numOfCells );
	cell_changed = new Array( numOfCells );
	cell_to_be_moved = new Array( numOfCells );
	numOfEmptyCells = numOfCells - population_type_1 - population_type_2;
	
	for (var i = 0; i < numOfCells; i++) {
		cells[i] = 0;
		cell_changed[i]=false;
		cell_to_be_moved[i]=false;
	}
	
	hapiness_percentages = [];
	hapiness_percentages.push(['Time','Similarity']);
}

function drawFrame(){
	//printCells("Cells before calculations");
	calculateNewPositions();
	//printCells("Cells after calculations");
	drawCellsOnCanvas();
	updateFrameNumber();
	if(stopTheAnimation()){
		clearInterval(refreshIntervalId);
		$('#btnRunSimulation').val("Run");
		changeButtonState('#btnRunSimulation', false);
		simulationRunning=false;
	}
}
function updateFrameNumber(){
	frame_number++;
	var ratio =  Math.floor(number_of_happy/(population_type_1+population_type_2)*10000)/100;
	
	var simillll=( Math.floor(average_similarity*100)/100);


	data.addRows([
	  [parseInt(frame_number),parseFloat(simillll)]
	]);

	hapiness_percentages.push([parseInt(frame_number),parseFloat(simillll)]);
	printLine("Frame: "+frame_number + "  Similarity:" + simillll + "   Happy:"+ratio+ " %");//  interrupted:"+interrupted);
	
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
	
	
	if(frame_number%frame_per_second==0 ){
		running_time_in_seconds--;
	}
}

function printCells(description){
var text1= description+":\n";
	
	for (var i = 0; i < NUM_OF_ROWS; i++) {
		for (var j = 0; j < NUM_OF_COLS; j++) {
			text1+=", "+cells[i*NUM_OF_COLS+j];
		}
		text1+="\n";
	}
	
	printLine(text1);
}

function printMoving(description){
	var text1= description+":\n";
		
		for (var i = 0; i < NUM_OF_ROWS; i++) {
			for (var j = 0; j < NUM_OF_COLS; j++) {
				if(cell_to_be_moved[i*NUM_OF_COLS+j])
					text1+=", 1";
				else
					text1+=", 0";
			}
			text1+="\n";
		}
		
		printLine(text1);
	}

function stopTheAnimation(){
	return simulationRunning==false || running_time_in_seconds<=0 || number_of_happy==(population_type_1+population_type_2);
}

function drawCellsOnCanvas(){
	var c=document.getElementById("segregationVisualizer");
	var ctx=c.getContext("2d");
	
	ctx.fillStyle="#E6E6E6";
	ctx.fillRect(0,0,canvas_width,canvas_height);
	
	ctx.fillStyle="#088A29";
	
	for (var i = 0; i < NUM_OF_ROWS; i++) {
		for (var j = 0; j < NUM_OF_COLS; j++) {
			if(cells[i*NUM_OF_COLS+j] ==1){
				ctx.beginPath();
				ctx.arc(j*cell_size+(cell_size/2),i*cell_size+(cell_size/2),radius,0,Math.PI*2,false);
				ctx.closePath();
				ctx.fill();
			}
		}
	}
	
	ctx.fillStyle="#CC6600";
	
	for (var i = 0; i < NUM_OF_ROWS; i++) {
		for (var j = 0; j < NUM_OF_COLS; j++) {
			if(cells[i*NUM_OF_COLS+j] ==2){
				ctx.beginPath();
				ctx.arc(j*cell_size+(cell_size/2),i*cell_size+(cell_size/2),radius,0,Math.PI*2,false);
				ctx.closePath();
				ctx.fill();
			}
		}
	}
}


function calculateNewPositions(){
	
	var numberOfSameType, num_of_neighbor, similarity;
	for (var i = 0; i < numOfCells; i++) {
		cell_changed[i]=false;
		cell_to_be_moved[i]=false;
	}
	number_of_happy = 0;
	average_similarity = 0;
	
	empty_cells = new Array(numOfEmptyCells);
	cells_that_will_move=[];
	var curr=0;
	for (var i = 0; i < numOfCells; i++) {
		if(cells[i]==0){
			empty_cells[curr]=i;
			curr++;
		}
	}
	generated_numbers = [];
	
	for (var i = 0; i < NUM_OF_ROWS; i++) {
		for (var j = 0; j < NUM_OF_COLS; j++) {
			if(cells[i*NUM_OF_COLS+j] != 0 ){
				numberOfSameType=0;
				num_of_neighbor = 0;
				
				if(cellExists(i-1, j-1)){
					num_of_neighbor++;
					if(cells[(i-1)*NUM_OF_COLS + j-1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i-1, j)){
					num_of_neighbor++;
					if(cells[(i-1)*NUM_OF_COLS+j] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i-1, j+1)){
					num_of_neighbor++;
					if(cells[(i-1)*NUM_OF_COLS+j+1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i, j-1)){
					num_of_neighbor++;
					if(cells[i*NUM_OF_COLS+j-1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i, j+1)){
					num_of_neighbor++;
					if(cells[i*NUM_OF_COLS+j+1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i+1, j-1)){
					num_of_neighbor++;
					if(cells[(i+1)*NUM_OF_COLS+j-1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i+1, j)){
					num_of_neighbor++;
					if(cells[(i+1)*NUM_OF_COLS+j] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				if(cellExists(i+1, j+1)){
					num_of_neighbor++;
					if(cells[(i+1)*NUM_OF_COLS+j+1] == cells[i*NUM_OF_COLS+j])
						numberOfSameType++;
				}
				
				similarity = (numberOfSameType/num_of_neighbor)*100;

				if(isNaN(similarity)==false){
					average_similarity +=similarity;
				}

				if ( (cells[i*NUM_OF_COLS+j] == 1 && similarity < desired_similarity_1) || (cells[i*NUM_OF_COLS+j] == 2 && similarity < desired_similarity_2)){
					cell_to_be_moved[i*NUM_OF_COLS+j]=true;
					//changePosition(i,j);
					cells_that_will_move.push(i*NUM_OF_COLS+j);
				}
				else{
					number_of_happy++;
				}
					
			}
		}
	}
	
	//printMoving("Cell to be moved");
	var lll=cells_that_will_move.length;
	var cur_lim, rannum;
	
	for (var i = 0; i < lll; i++) {
		cur_lim = cells_that_will_move.length;
		rannum = Math.floor(Math.random()*cur_lim);
		moveCell(cells_that_will_move[rannum]);
		
		cells_that_will_move.splice(rannum, 1);
	}
	
	average_similarity = average_similarity/(population_type_1 + population_type_2);
}

function changePosition(row_num, col_num){
	var ran;
	
	ran=Math.floor(Math.random()*numOfEmptyCells);
	generated_numbers.push(ran);
	
	cells[empty_cells[ran]]=cells[row_num*NUM_OF_COLS+col_num];
	//cell_changed[empty_cells[ran]]=true;
	cells[row_num*NUM_OF_COLS+col_num]=0;
	empty_cells[ran]=row_num*NUM_OF_COLS+col_num;
}

function moveCell(cell_num){
	var ran;
	
	ran=Math.floor(Math.random()*numOfEmptyCells);
	generated_numbers.push(ran);
	
	cells[empty_cells[ran]]=cells[cell_num];
	cells[cell_num]=0;
	empty_cells[ran]=cell_num;
}

function cellExists(row_num, col_num){
	return row_num>=0 && row_num<NUM_OF_ROWS && col_num>=0 && col_num < NUM_OF_COLS && cells[row_num*NUM_OF_COLS+col_num]!=0;
}

function randomlyFiilCells(){

	var ran;
	for (var i = 0; i < population_type_1; i++) {
		do{
			ran=Math.floor(Math.random()*numOfCells);
		}
		while(cells[ran]>0);
		cells[ran] = 1;
	}
	
	for (var i = 0; i < population_type_2; i++) {
		do{
			ran=Math.floor(Math.random()*numOfCells);
		}
		while(cells[ran]>0);
		cells[ran] = 2;
	}
}

function printLine(line){
	//$("#logs").prepend(line+"\n");
}

function changeButtonState(buttonId, enabled){
	if(enabled == false){
		$(buttonId).attr('disabled', 'disabled');
		$(buttonId).removeClass("buttonEnabled");
		$(buttonId).addClass("buttonDisabled");
	}
	else{
		$(buttonId).removeAttr('disabled');
		$(buttonId).removeClass("buttonDisabled");
		$(buttonId).addClass("buttonEnabled");
	}
}