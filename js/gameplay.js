//Timeout set to allow for the whole document to load before executing the scripts, required by Android < 4.0 to get proper screen dimensions (works on emulator, not on 2.2/2.3 devices)
var t=setTimeout(function(){

//----------------------------------------------VARIABLE DECLARATION


//Reference the DOM elements that will be manipulated
//Basically all of the DIVs from the index.html file

var area = document.getElementById('area');
var level = document.getElementById('level');
var background = document.getElementById('background');
var stats = document.getElementById('stats');
var playbutton = document.getElementById('playbutton');
var mouth = new Mouth();
var zombie = document.getElementById('zombie_dude');
var choose_zombie = document.getElementById("chooseZombie");
var fpsCounter = document.getElementById("fpsCounter");
var brainPassed = document.getElementById("bump");

var canvasElement = document.getElementById('canvas');
var canvas = canvasElement.getContext("2d");
var canvas_width = canvasElement.width;
var canvas_height = canvasElement.height;
var frenzyBar = document.getElementById("frenzyBar");

var highscoreCanvasElement = document.getElementById('highscore');
var highscoreCanvas = highscoreCanvasElement.getContext("2d");
var highscore_canvas_width = highscoreCanvasElement.width;
var highscore_canvas_height = highscoreCanvasElement.height;

var x1 = document.getElementById("x1");
var x2 = document.getElementById("x2");
var x3 = document.getElementById("x3");

var nom = document.getElementById("nom");
var wipeout = document.getElementById("wipeout");
var frenzy = document.getElementById("frenzy");

var paused = document.getElementById("button_pause");
var right = document.getElementById("button_right");
var left = document.getElementById("button_left");
		
var started = document.getElementById("overlay_begin");
		
var play = document.getElementById("button_play");
var restart = document.getElementById("button_restart");
var exit = document.getElementById("button_exit");

//Detect mobile devices by user-agent string value
var isMobile = {
    Android: function() {return navigator.userAgent.match(/Android/i); },
    BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
    iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
    Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
    Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
    any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
}



//If the device is not a mobile device, get the screen dimensions through a jQuery call, utilizing data of jQuery Mobile (data-role page)
if(isMobile.any() == null) {
var viewportW =  $('[data-role="page"]').first().width();
var viewportH =  $('[data-role="page"]').first().height();
var scaledHeight = $('[data-role="page"]').first().height();
var scaledWidth = $('[data-role="page"]').first().width();
}
//If the device is a mobile device, set the width and height of the application to screen dimensions
else{ 
var viewportW =  screen.width;
var viewportH =  screen.height;
var scaledWidth = screen.width;
var scaledHeight = screen.height;
}
  




//Get scaling value, relative to 800x480 px which is the base for images
var scaleW = scaledWidth / 800;
var scaleH = scaledHeight / 480;


//Declare variables used in game manipulation
var lifes = 3;
var score = 0;
var isPaused = 1;
var comboCounter = 0;
var bOccurence=0;
var cOccurence=0;
var bfOccurence=0;



//Pause the zombie character animation initially
$(zombie).toggleClass("paused"); 	
		
	

		   
//----------------------------------------------BUTTON LISTENERS


		
		//Listener for the play button.
		$(play).click(function() {
		 highscore_update(); //update the highscore
		isPaused=0;	//change gameplay state from paused to active
		$(started).toggle(); //hide the overlay menu and its contents
		$(zombie).toggleClass("paused"); //change state of the zombie character animation
		});
		
		//Listener for the restart button.
		$(restart).click(function() {
		detect=false; //set detection variable to false in order to reset potential detection
		$(started).toggle();
		$(zombie).toggleClass("paused"); 
		
		//Retrieve which zombie character the user has chosen from the local storage
		if (localStorage.getItem(2) == 0){
		$(zombie).css('background-image', 'url(img/zombie1.png)');
		}
		if (localStorage.getItem(2) == 1){
		$(zombie).css('background-image', 'url(img/zombie3.png)');
		}
		//Reset score and gameplay state
		isPaused=0;	
		score=0;
		//Hide life graphics
		$(x1).css('visibility','hidden');
		$(x2).css('visibility','hidden');
		$(x3).css('visibility','hidden');
		
		//Delete all of the items on screen / in arrays
		len = candies.length;
						while (len--){
						candies[len].destroy();
						candies.splice(len,1);
						candyCount--;
		}
		len = brains.length;
						while (len--){
						brains[len].destroy();
						brains.splice(len,1);
						brainCount--;
		}
		len = specials.length;
						while (len--){
						specials[len].destroy();
						specials.splice(len,1);
						specialCount--;
		}
		
		});
		
		//Listener for the pause button
		$(paused).click(function() {
			highscore_update();
			isPaused=1;
			$(started).toggle();
			$(play).show();
		    $(exit).show();
			$(zombie).toggleClass("paused"); 
		});
		
		//Listener for the right button in options menu
		$(right).click(function() {
		$(choose_zombie).css('background-image', 'url(img/zombie3.png)'); //change the character displayed in the options menu
		$(zombie).css('background-image', 'url(img/zombie3.png)'); //change the character displayed in game accordingly
		localStorage.setItem(2,1); //remember the choice in local storage
		});
		
		//Listener for the left button in options menu
		$(left).click(function() {
		$(choose_zombie).css('background-image', 'url(img/zombie1.png)');
		$(zombie).css('background-image', 'url(img/zombie1.png)');
		localStorage.setItem(2,0);
		});
		
		

				
//----------------------------------------------NAVIGATION

//Declare the detection variable used for determining collision detection and a ratio variable used for calculation of collision detection rectangle position
var detect = false;	
var ratio = scaledWidth / scaledHeight;
var support = Math.round(1.3*mouth.height*ratio); //Value used in calculations to determine proper CSS element position to match the scaled collision detection rectangle

//On mouse move
 $(area).bind("mousemove", function(event) {	
			if (detect == true){ //if detection is set to true, that is if the mouse is pressed down while moving
			mouth.y=event.pageY; //move collision detection rectangle to the Y mouse position
			$(zombie).css('top', mouth.y - support); //move the zombie character accordingly
			}
		  });
//On mouse down		  
 $(area).bind("mousedown", function(event) {	
			detect = true; //set detection value to true
			if (localStorage.getItem(2) == 0){ //alter zombie appearance accordingly with chosen zombie character (value retrieved from the local storage)
						$(zombie).css('background-image', 'url(img/zombie2.png)');
				}
			if (localStorage.getItem(2) == 1){
						$(zombie).css('background-image', 'url(img/zombie4.png)');
				}
		  });
//On mouse up
 $(area).bind("mouseup", function(event) {	
			detect = false; //set detection to false 
			if (localStorage.getItem(2) == 0){
						$(zombie).css('background-image', 'url(img/zombie1.png)');
				}
			if (localStorage.getItem(2) == 1){
						$(zombie).css('background-image', 'url(img/zombie3.png)');
				}
		  });


//The same scheme for touch events...		  
 $(area).bind("touchmove", function(event) {	
			event.preventDefault();

		    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			if (detect == true){
			mouseY = Math.floor(touch.pageY);
			mouth.y=mouseY;
			$(zombie).css('top', mouth.y - support);
			}
		  });

$(area).bind("touchstart", function(event) {	
			event.preventDefault();
			detect = true;
			if (localStorage.getItem(2) == 0){
						$(zombie).css('background-image', 'url(img/zombie2.png)');
				}
			if (localStorage.getItem(2) == 1){
						$(zombie).css('background-image', 'url(img/zombie4.png)');
				}
		  });
		  
$(area).bind("touchend", function(event) {	
			event.preventDefault();
			detect = false;
			if (localStorage.getItem(2) == 0){
						$(zombie).css('background-image', 'url(img/zombie1.png)');
				}
			if (localStorage.getItem(2) == 1){
						$(zombie).css('background-image', 'url(img/zombie3.png)');
				}

		  });


//---------------------------------------------INITIAL LOCAL STORAGE OPERATIONS

		//If this is the first time the player plays the game, set the best score to 0 in order to avoid null exceptions
		if (localStorage.getItem(1) === null) {
		  localStorage.setItem(1,0)
		}
				
		var best_score = localStorage.getItem(1);
	
		//Similarly for the zombie character appearance, set initial value of local storage element
		if (localStorage.getItem(2) === null) {
		  localStorage.setItem(2,0)
		}
		
		//Describe which value of local storage corresponds to which zombie appearance
		if (localStorage.getItem(2) == 0){
		$(zombie).css('background-image', 'url(img/zombie1.png)');
		}
		
		if (localStorage.getItem(2) == 1){
		$(zombie).css('background-image', 'url(img/zombie3.png)');
		}		  
		  
//---------------------------------------------SCORE

//Function variable for updating score while playing
var score_update = function() {
			  canvas.clearRect(0, 0, canvas_width, canvas_height); //clear the small canvas
			  $(canvasElement).drawText({ //draw text, jCanvas syntax
			  fillStyle: "#8c9f98",
			  x: 1, y: 1, fromCenter: false,
			  font: "50pt londrina",
			  text: score.toString() //pass the score variable and stringify it
			});
        };		 

//-----------------------------------------HIGHSCORE

//Function variable for updating the highscore and current score displayed while the game is paused or lost (overlay)
var highscore_update = function() {
			  highscoreCanvas.clearRect(0, 0, highscore_canvas_width, highscore_canvas_height);
			  $(highscoreCanvasElement).drawText({
			  fillStyle: "#202e63",
			  x: 1, y: 1, fromCenter: false,
			  font: "30pt londrina",
			  text: "Best score: " + best_score.toString() + "\n" + "Current score: " + score.toString()
			});
        };		  		

		  
//----------------------------------------------COLLISION DETECTION	 

//Simple AABB collision detection algorithm		  
 function collides(a, b) {
          return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
        }

//Function determining the interaction between objects on collision
function handleCollisions(){
var j =0; //variable to determine if an array is not empty

if (j< brains.length) { //if the brain array is not empty
		//for each brain
		for (var i = 0; i < brains.length; ++i) {
			 if((detect == true) && (collides(brains[i],mouth)) && (brains[i].active == true)){ //if mouse or touch is pressed, collision between the brain and mouth occurs and if the brain is active
					   brains[i].active = false; //change activity state of the brain to false, in order to avoid multiple detections on one collision
					   brains[i].style.visibility="hidden"; //hide the brain
					   score+=10; //increase the score by 10
					   comboCounter+=1; //increase the combo counter by 1
					   //Apply a visual effect of collision
					    $(nom).fadeIn();
						$(nom).css('visibility', 'visible');
						$(nom).fadeOut();
						$(nom).css('visibility', 'false');
					}
		
		}
}


if (j< specials.length) { //if the special brain array is not empty
		//for each special brain
		for (var i = 0; i < specials.length; ++i) {
			 if((detect == true) && (collides(specials[i],mouth)) && (specials[i].active == true)){
					   specials[i].active = false;
					   specials[i].style.visibility="hidden";
					   score+=150; //increase the score by 150
					   comboCounter+=1;
					    //Apply a visual effect of collision
					   $(wipeout).fadeIn('slow');
					   $(wipeout).css('visibility', 'visible');
					   $(wipeout).fadeOut('slow');
					   $(wipeout).css('visibility', 'false');
					   //Destroy all candy on the screen
					   len = candies.length;
						while (len--){
						candies[len].destroy();
						candies.splice(len,1);
						candyCount--;
						}
					}
		}
}

if (j< candies.length) {
		//for each candy
		for (var i = 0; i < candies.length; ++i) {
			 if((detect == true) && (collides(candies[i],mouth)) && (candies[i].active == true)){
					   candies[i].active = false;
					   candies[i].style.visibility="hidden";
					   comboCounter=0;
					     if (lifes == 3){ //if the player loses his first life
						  $(x1).fadeIn(); //display a visual confirmation
						  $(x1).css('visibility', 'visible');
						  lifes-=1; //minus one life
						  }
						  else if (lifes ==2){ //if the player loses his second life...
							  $(x2).fadeIn();
							  $(x2).css('visibility', 'visible');
							  lifes-=1;
						  }
						  else if (lifes ==1){  //if the player loses his third life and the current game is lost
						      
							  $(x3).fadeIn();
							  $(x3).css('visibility', 'visible');
							  isPaused=1;
							  $(started).fadeToggle(); //show the overlay menu
						
							  lifes=3; //reset lifes back to full
							  
							  //Check if the current score is greater than the best score and alter the best score if so
							  if (score > best_score){
							  localStorage.setItem (1, score + 10);
							  best_score = localStorage.getItem (1, score +10);
						
							  }
							  highscore_update(); //redraw the highscore
							  
							  //Clear the screen from any objects currently on it (candy, brains, special brains)
							    len = candies.length;
								while (len--){
								candies[len].destroy();
								candies.splice(len,1);
								candyCount--;
								}
								
								len = brains.length;
								while (len--){
								brains[len].destroy();
								brains.splice(len,1);
								brainCount--;
								}
								
								len = specials.length;
								while (len--){
								specials[len].destroy();
								specials.splice(len,1);
								specialCount--;
								}
							
							  score=0; //reset current score to 0
							  //Hide lost life indication
							  $(x1).fadeToggle();
							  $(x2).fadeToggle();
							  $(x3).fadeToggle();
							   
								
							  detect = false; //reset detection to false
							  //Reset zombie appearance accordingly
							  if (localStorage.getItem(2) == 0){
										$(zombie).css('background-image', 'url(img/zombie1.png)');
											}
							  if (localStorage.getItem(2) == 1){
										$(zombie).css('background-image', 'url(img/zombie3.png)');
								}							  
						  }
					}
		}
}

}


//----------------------------------------------OBJECT CREATION

//Declare arrays and variables to keep track of the number of on-screen objects:

var brains = [];
var brainCount = 0;

var candies = [];
var candyCount = 0;

var specials = [];
var specialCount = 0;





//Add a new brain function
function addBrain()
{
			brains[brainCount] = new Brain();
			brainCount++;
}

//Add a new candy function
function addCandy()
{
			candies[candyCount] = new Candy();
			candyCount++;
}

//Add a new special brain function
function addSpecial()
{
			specials[specialCount] = new SpecialBrain();
			specialCount++;
}

//Execute the addition of new items, if the count allows for it
function addItems() 
{
	if(brainCount < 30){
		if(Math.random() < bOccurence) {
			addBrain();
		}
		
		if(specialCount < 1){
		if(Math.random() < bfOccurence) {
			addSpecial();
		}
		}
		
		if(candyCount < 5){
		if(Math.random() < cOccurence) {
			addCandy();
		}
		}
	}
	
}

//Move the items on screen
function repositionSprite()
{
	if (!this) return;

		this.style.left = (this.x) + 'px';
		this.style.top = this.y + 'px';
}


//Destroy an object (candy, brain or special brain) through a DOM call function
function destroySprite()
{
	if (!this) return;
	this.parent.removeChild(this.element);
}



//Define Brain object function
function Brain(parentElement)
{

	//Define appearance and hierachical position of the brain through DOM calls:
	this.reposition = repositionSprite;
	this.destroy = destroySprite;
	this.parent = parentElement ? parentElement : area;
	this.element = document.createElement("div");
	this.element.className = 'brain';
	this.style = this.element.style;

	//Set initial position of the brain, accordingly to the screen dimensions:
	this.x = viewportW;
	this.y = Math.round(viewportH/2);

		
	//Calculate width and height of the brain, accordingly to the screen dimensions:
	this.width=Math.round(scaledWidth*0.13);
	this.height=Math.round(scaledHeight*0.16);
		
	//Define age attribute of the brain (this is random and different for each generated brain)
	this.age = Math.round(Math.random() * 32);
	
	//Set activity value to true
	this.active = true;
		
	//Assign reposition function to the brain
	this.reposition();
	//Give the brain a random X speed and a 0 Y speed:
	this.xSpeed = -(Math.round(Math.random() * (5 - 2 + 1)) + 2);
	this.ySpeed = 0;

	//Finally add the brain DIV to the HTML document
	this.parent.appendChild(this.element);
}

//Define Special Brain object function (similar to Brain)
function SpecialBrain(parentElement)
{
	this.reposition = repositionSprite;
	this.destroy = destroySprite;
	this.parent = parentElement ? parentElement : area;
	this.element = document.createElement("div");
	this.element.className = 'special';
	this.style = this.element.style;
	
	this.x = viewportW;
	this.y = Math.round(viewportH/2);

	this.width=Math.round(scaledWidth*0.13);
	this.height=Math.round(scaledHeight*0.16);
		
	this.age = Math.round(Math.random() * 32);
		
	this.active = true;
		
	this.reposition();

	this.xSpeed = -(Math.round(Math.random() * (8 - 2 + 1)) + 4);
	this.ySpeed = 0;

	this.parent.appendChild(this.element);
}

//Define Candy object function (similar to Brain)
function Candy(parentElement)
{
	this.reposition = repositionSprite;
	this.destroy = destroySprite;
	this.parent = parentElement ? parentElement : area;
	this.element = document.createElement("div");
	this.element.className = 'candy';
	this.style = this.element.style;

	//Choose a random number out of two
	which_sprite = Math.floor(Math.random() * 2) + 1;
		  
	//Case it is 1, give appearance 1 to the object
	if (which_sprite==1){
          this.style.background = "url('img/candy.png') no-repeat";
		  this.style.backgroundSize="100% 100%";
		  }
	else{ //give appearance 2 to the object
		  this.style.background = "url('img/candy2.png') no-repeat";
		  this.style.backgroundSize="100% 100%";
		  }
	
	this.x = viewportW;
	this.y = Math.round(viewportH/2);
		
	this.width=Math.round(scaledWidth*0.12);
	this.height=Math.round(scaledHeight*0.19);
		
	this.age = Math.round(Math.random() * 32);
		
	this.active = true;
		
	this.reposition();

	this.xSpeed = -(Math.round(Math.random() * (8 - 2 + 1)) + 2);
	this.ySpeed = 0;

	this.parent.appendChild(this.element);
}


//Define Zombie Mouth (collision detection rectangle) object function
function Mouth(parentElement)
{
	this.reposition = repositionSprite;
	this.parent = parentElement ? parentElement : area;
	this.element = document.createElement("div");
	this.element.className = 'mouth';
	this.style = this.element.style;

	//Determine if the device is a mobile device
	var isMobile = {
    Android: function() {return navigator.userAgent.match(/Android/i);},
    BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
    iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
    Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
    Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
    any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());}
	}



	//If its not a mobile device use window dimensions
	if(isMobile.any() == null) {
		var scaledHeight = $('[data-role="page"]').first().height();
		var scaledWidth = $('[data-role="page"]').first().width();
	}
	else{ //use screen dimensions
		var scaledWidth = screen.width;
		var scaledHeight = screen.height;
	}

	this.x = Math.round(scaledWidth*0.14);
	this.y = Math.round(viewportH/2);
		
	this.width=Math.round(scaledWidth*0.02);
	this.height=Math.round(scaledHeight*0.2);
		
	this.reposition();

	this.parent.appendChild(this.element);
}




//---------------------------------------------------MOVEMENT

//Objects animation function
function animateObjects()
{
	//Brains
	for (var loop=0; loop < brainCount; loop++) //for each brain on the screen
	{
	
		brains[loop].ySpeed = Math.round( -2.3 * Math.sin(brains[loop].age * Math.PI / 50)); //calculate new Y speed value
		brains[loop].age++; //increase age by 1
		
		brains[loop].x += brains[loop].xSpeed; //+= X speed
		brains[loop].y += brains[loop].ySpeed; //+= Y speed

		brains[loop].reposition();	//call the reposition function to perform the movement
	}
	
	//Special brains
	for (var loop=0; loop < specialCount; loop++)
	{
	
		specials[loop].ySpeed = Math.round( -2.3 * Math.sin(specials[loop].age * Math.PI / 50));
		specials[loop].age++;
		
		specials[loop].x += specials[loop].xSpeed;
		specials[loop].y += specials[loop].ySpeed;

		specials[loop].reposition();	
	}
	
	//Candy
	for (var loop=0; loop < candyCount; loop++)
	{
	
		candies[loop].ySpeed = Math.round( -1.7 * Math.sin(candies[loop].age * Math.PI / 120));
		candies[loop].age++;
		
		candies[loop].x += candies[loop].xSpeed;
		candies[loop].y += candies[loop].ySpeed;

		candies[loop].reposition();	
	}
}


//----------------------------------------------------CLEAR UNUSED OBJECTS

//Function clearing the objects on screen
function clearObjects()
{
var len = brains.length;
	//For each brain
	while (len--) {
			if (brains[len].x < 0){ //if there are any brains in the array
			if ((brains[len].active == true) && (score>0)) //if conditions are met (this only applies to active brains on reaching the left wall of the screen)
			{
			comboCounter=0; //reset combo counter
			score-=10; //decrease score by 10
			//Visual effect of losing points:
			$(brainPassed).fadeIn();
			$(brainPassed).css('visibility', 'visible');
			$(brainPassed).fadeOut();
			$(brainPassed).css('visibility', 'false');
			}
			//Destroy the brain
			brains[len].destroy();
			brains.splice(len,1);
			brainCount--;

			}
	}
	
len = candies.length;
	//For each candy
	while (len--){
		if (candies[len].x < 0){
					candies[len].destroy();
					candies.splice(len,1);
					candyCount--;
			}
	}

len = specials.length;
	//For each special brain
	while (len--){
		if (specials[len].x < 0){
					specials[len].destroy();
					specials.splice(len,1);
					specialCount--;
			}
	}
	
}

//--------------------------------------------------------------DIFFICULTY

//Function managing diffculty of the game
//The difficulty is based on score and increases with its value
//Difficulty is expressed by increased chance of object creation (more motion on screen)
function difficulty()
{
   if (score < 100){
		  bOccurence=0.007;
		  cOccurence=0.003;
		  bfOccurence=0.001;
		} 
		else if ((score > 100) && (score < 700)){
		  bOccurence=0.009;
		  cOccurence=0.006;
		  bfOccurence=0.002;
		} 
		else if ((score > 700) && (score < 1500)){
		  bOccurence=0.011;
		  cOccurence=0.008;
		  bfOccurence=0.003;
		} 
		else if ((score > 1500) && (score < 2200)){
		  bOccurence=0.013;
		  cOccurence=0.018;
		  bfOccurence=0.005;
		} 
		else if ((score > 2200) && (score < 3000)){
		  bOccurence=0.016;
		  cOccurence=0.021;
		  bfOccurence=0.006;
		} 
		else if (score > 3000){
		  bOccurence=0.024;
		  cOccurence=0.035;
		  bfOccurence=0.007;
		} 
		
		//Apply special conditions (difficulty) along with a visual indication if combo bar is full
		if (comboCounter >= 10){
		  $(frenzy).fadeIn('slow');
		  $(frenzy).css('visibility', 'visible');
		  bOccurence=0.04;
		  cOccurence=0.009;
		  bfOccurence=0.00;
		  }
	
		//Change combo bar appearance depending on the current combo value
		if (comboCounter == 0) {
		 $(frenzy).fadeOut('slow');
		  $(frenzy).css('visibility', 'false');
		$(frenzyBar).css('background-image', 'url(img/0.png)');
		}
		else if (comboCounter == 1) {
		$(frenzyBar).css('background-image', 'url(img/1.png)');
		}
		else if (comboCounter==2) {
		$(frenzyBar).css('background-image', 'url(img/2.png)');
		}
		else if (comboCounter==3) {
		$(frenzyBar).css('background-image', 'url(img/3.png)');
		}
		else if (comboCounter==4) {
		$(frenzyBar).css('background-image', 'url(img/4.png)');
		}
		else if (comboCounter==5) {
		$(frenzyBar).css('background-image', 'url(img/5.png)');
		}
		else if (comboCounter==6) {
		$(frenzyBar).css('background-image', 'url(img/6.png)');
		}
		else if (comboCounter==7) {
		$(frenzyBar).css('background-image', 'url(img/7.png)');
		}
		else if (comboCounter==8) {
		$(frenzyBar).css('background-image', 'url(img/8.png)');
		}
		else if (comboCounter==9) {
		$(frenzyBar).css('background-image', 'url(img/9.png)');
		}
		else if (comboCounter>=10) {
		$(frenzyBar).css('background-image', 'url(img/10.png)');
		}
	
}




//--------------------------------------------------------------GAME LOOP

//Paul Irish's  (Google) compatibility shim for requesting animation frame
if (!window.requestAnimationFrame) 
{
	window.requestAnimationFrame = (function() 
	{
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback,element) 
		{
			window.setTimeout(callback, 1000 / 60);
		};
	})();
}

//Variables need for operation of the FPS counter
var lastLoop = new Date;
var fps = 0;

//THE MAIN GAME LOOP
(function animate() 
{
var thisLoop = new Date; //get date for FPS counter
fps = 1000 / (thisLoop - lastLoop); //Calculcate FPS value
lastLoop = thisLoop; //update variable
requestAnimationFrame(animate); //call requestAnimationFrame recursively
if (isPaused == 0){ //if the game is not paused
	addItems(); //add new items
	handleCollisions(); //handle collisions
	animateObjects(); //animate objects
	clearObjects(); //redraw objects on screen
	mouth.reposition(); //reposition the collision detection rectangle accordingly to mouse/touch position
	score_update(); //update the displayed score
	difficulty(); //alter the difficulty
}
})();


//Update the FPS counter once every second
setInterval(function(){
	 $(fpsCounter).html("FPS: " + fps.toFixed(1));
}, 1000);
  	

	
			
},2000);        