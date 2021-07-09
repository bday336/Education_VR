
var debug = false;

var hands = [];
var colorArray = [];


var menu_options=[]

// var gravity = -0.0001;

var vrModeGamePadButtonPressed = false; // because of annoying way gamepad buttons work
var squeezing = false;
var pressedController = -1;

function doGrab_simple(){
	// HANDS!!!!
	if(controls.controllers[0]!==undefined){
		var left=controls.controllers[0];
		var right=controls.controllers[1];
	};
	for (j in controls.controllers) {
		if(debug) {
			console.time("controls");
		}


		var handControl = controls.controllers[j];

		if (!hands[j]) {
			//create a new hands[j] for each controller
			hands[j] = new THREE.Mesh(new THREE.OctahedronGeometry(.05), new THREE.MeshBasicMaterial({color: 0xEE0443, wireframe: true}));
			scene.add(hands[j]);
			colorArray[j] = new THREE.Color(1, 1/(2*(j+1)), 1/(2*j+1));
			hands[j].material.color.setRGB(colorArray[j].r, colorArray[j].g, colorArray[j].b);
		}
		if(handControl.pose){ //set hand vis at controller location
			hands[j].position.set(handControl.pose.position[0], handControl.pose.position[1], handControl.pose.position[2]);
			hands[j].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
		}

		//get vectors for things so that collision!
		if (handControl.pose){
			handPosVector.set(handControl.pose.position[0],handControl.pose.position[1],handControl.pose.position[2]);
		}
		for (var i = 0; i < grabbables.length; i++){
			if (grabbables[i]){
				relative[i] = new THREE.Vector3(everything.position.x + grabbables[i].position.x*everything.scale.x, everything.position.y + grabbables[i].position.y*everything.scale.y, everything.position.z + grabbables[i].position.z*everything.scale.z );
			}
		}



		//edit mode for grabbing and moving objects during scene setup:
		if (handControl.pose && handControl.buttons[1].pressed && editMode == true) { //grab stuff
			for (var i = 0; i < grabbables.length; i++){
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])){

//Added

					if(menu_options.includes(grabbables[i])){
						menu_options.splice(menu_options.indexOf(grabbables[i]),1);
					};

//Added_end

					grabbables[i].position.set((handControl.pose.position[0] - everything.position.x)/everything.scale.x, (handControl.pose.position[1] - everything.position.y)/everything.scale.y, (handControl.pose.position[2] - everything.position.z)/everything.scale.z);
					grabbables[i].grbbed=true;
					grabbables[i].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);					
					//Remove the object being held
					if(handControl.buttons[0].pressed&&handControl==right){
						grabbables[i].parent.remove(grabbables[i]);
						grabbables.splice(i,1);
						grabRadius.splice(i,1);


					}
					break;
				}
			}
		}
		if(debug) {
			console.timeEnd("controls");
			console.log(handControl.pose.position);
		}
	}
}


function doGrab_electric(){
	// HANDS!!!!
	if(controls.controllers[0]!==undefined){ //Resetup of the objects that can be grabbed and arrow refresh
		var left=controls.controllers[0];
		var right=controls.controllers[1];
		if(!left.buttons[1].pressed&&!right.buttons[1].pressed){ 
			clearInterval(arrow_refresh);		//Stops the arrow update when the sources are not being held
			fresh_arr=false;					
			grabbables.forEach(function(obj){	//Resets all grabbable objects to ungrabbed when trigger not pressed
				obj.grabbed=false;
			});
		};
		
	};
	for (j in controls.controllers) {
		if(debug) {
			console.time("controls");
		}


		var handControl = controls.controllers[j];

		if (!hands[j]) {
			//create a new hands[j] for each controller
			hands[j] = new THREE.Mesh(new THREE.OctahedronGeometry(.05), new THREE.MeshBasicMaterial({color: 0xEE0443, wireframe: true}));
			scene.add(hands[j]);
			colorArray[j] = new THREE.Color(1, 1/(2*(j+1)), 1/(2*j+1));
			hands[j].material.color.setRGB(colorArray[j].r, colorArray[j].g, colorArray[j].b);
		}
		if(handControl.pose){ //set hand vis at controller location
			hands[j].position.set(handControl.pose.position[0], handControl.pose.position[1], handControl.pose.position[2]);
			hands[j].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
		}

		//get vectors for things so that collision!
		if (handControl.pose){
			handPosVector.set(handControl.pose.position[0],handControl.pose.position[1],handControl.pose.position[2]);
		}
		for (var i = 0; i < grabbables.length; i++){
			if (grabbables[i]){
				relative[i] = new THREE.Vector3(everything.position.x + grabbables[i].position.x*everything.scale.x, everything.position.y + grabbables[i].position.y*everything.scale.y, everything.position.z + grabbables[i].position.z*everything.scale.z );
			}
		}



		//edit mode for grabbing and moving objects during scene setup:
		if (handControl.pose && handControl.buttons[1].pressed && editMode == true) { //grab stuff
			for (var i = 0; i < grabbables.length; i++){
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])){


//Added

					if(menu_options.includes(grabbables[i])){
						if(grabbables[i].group=="Source"){
							battery.push(grabbables[i]);
						}else if(grabbables[i].group=="Test"){
							test_battery.push(grabbables[i]);
						};
						menu_options.splice(menu_options.indexOf(grabbables[i]),1);
					};

//Added_end


					grabbables[i].position.set((handControl.pose.position[0] - everything.position.x)/everything.scale.x, (handControl.pose.position[1] - everything.position.y)/everything.scale.y, (handControl.pose.position[2] - everything.position.z)/everything.scale.z);
					grabbables[i].grabbed=true;
					grabbables[i].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);

					//Only update the arrow mesh when grabbing/moving a source charge (save computation)
					if(battery.includes(grabbables[i])&&!fresh_arr){
						console.log('changing')
						fresh_arr=true;
						arrow_refresh=setInterval(refresh_arr,50);
					};




					//Remove the object being held
					if(handControl.buttons[0].pressed&&handControl==right){
						var battery_count=0;
						battery.forEach(function(obj){
							console.log(obj);
							if(obj==grabbables[i]){
								console.log('charge killed')
								battery.splice(battery_count,1);
							};
							battery_count++;
						});
						var test_battery_count=0;
						test_battery.forEach(function(obj){
							if(obj==grabbables[i]){
								console.log('charge killed')
								test_battery.splice(test_battery_count,1);
							};
							test_battery_count++;
						});							
						
						grabbables[i].parent.remove(grabbables[i]);
						grabbables.splice(i,1);
						grabRadius.splice(i,1);

					}
					break;
				}
			}
		
		}



		if(debug) {
			console.timeEnd("controls");
			console.log(handControl.pose.position);
		}
	}

};



function experiment(){
			//experiment mode, tracking controller movement:
	if (editMode == false){
		for (j in controls.controllers) {//look at the controllers
			var handControl = controls.controllers[j];
			if (handControl.pose){
				point[currentPoint].position.set(handControl.pose.position[0], handControl.pose.position[1], handControl.pose.position[2]);	
				point[currentPoint].time = Date.now(); //milliseconds since 1970
				point[currentPoint].data.position.y = (point[currentPoint].position.y - everything.position.y)/2;
				var previousPoint = currentPoint - 1;
				if (previousPoint == -1){
					previousPoint = point.length - 1;
				}
				point[currentPoint].delta = point[currentPoint].position.distanceTo(point[previousPoint].position);
				point[currentPoint].data2.position.y = point[currentPoint].delta*2;
				var torusVertex = currentPoint + pointNumber + 1;
				torus.geometry.vertices[torusVertex].z = point[currentPoint].delta;
				if(currentPoint == 0){
					torus.geometry.vertices[pointNumber + pointNumber + 1].z = point[currentPoint].delta;
				}
				block[0].position.y = point[currentPoint].data.position.y;
				block[2].position.y = point[previousPoint].data.position.y;
				block[1].position.y = point[(currentPoint+(pointNumber-2))%pointNumber].data.position.y;
				stick.rotation.x = Math.PI*(point[(currentPoint+(pointNumber-2))%pointNumber].data.position.y - point[currentPoint].data.position.y);


				currentPoint = (currentPoint + 1)%pointNumber; //loop through the points, one per frame

			}



		}
	}
}