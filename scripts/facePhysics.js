//TODO: Create Bound 
//TODO: Create Physics Based Movement 
const Scene = require('Scene');
const Time = require('Time');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
export const Diagnostics = require('Diagnostics');

let startGame = false; 
let speed = Reactive.vector(0,0.001,0); 
let offset = Reactive.vector(0,0,0); 
let previousTime = Reactive.val(0.0); 

function boundaryCheck(gameMesh, br, tl, max){
	let xScaler = 1; 
	let yScaler = 1; 

	let boundarySet = false; 
	//Diagnostics.watch("maxX", max.x); 

	if (!max.x.eq(0).pinLastValue()) {
		boundarySet = (true); 
	}

	if (boundarySet) {
		//Diagnostics.log("maxX"); 
		let topValueSignal = tl.y; 
		let bottomValueSignal = br.y;   
		// 0.1
		//Diagnostics.log(yScaler); 
		let currentYPos = gameMesh.worldTransform.position.y.pinLastValue(); 
		
		if (currentYPos >= topValueSignal.pinLastValue() -  0.1) {
			//Diagnostics.log(currentYPos); 
			//Diagnostics.log(topValueSignal.pinLastValue()); 
			//Diagnostics.log("=----=-="); 
			//gameMesh.transform.y = currentYPos + ySpeed;  
			//Diagnostics.log("fuck")
			//Diagnostics.log(topValueSignal.pinLastValue() )
			if (speed.y.pinLastValue() > 0) {
				yScaler = -1.0; 
			}
			//Diagnostics.log(ySpeed);
		}
		if (currentYPos < bottomValueSignal.pinLastValue()) {
			//gameMesh.transform.y = currentYPos + ySpeed;  
			if (speed.y.pinLastValue() < 0) {
				yScaler = -1.0; 
			}
			//Diagnostics.log(ySpeed);
		}
	}
	return Reactive.vector(xScaler, yScaler, 1); 
}


(async function () {  // Enables async/await in JS [part 1]

	const gameMesh = await Scene.root.findFirst('gameMesh');

            //const fixedTimeStep = 1.0 / 60.0;
            //const maxSubSteps = 3;
            //const timeInterval = 30;
	//Diagnostics.watch("position", gameMesh.worldTransform.position.y); 
	

	const start = Reactive.vector(0,0,0); 

	const max = await Reactive.point2d(
	  CameraInfo.previewSize.width,
	  CameraInfo.previewSize.height); 

	let screenWidth = 0; 
	let screenHeight = 0; 

	//const currentScreenPosSignal = await Scene.projectToScreen(gameMesh.worldTransform.position);  

	let currentBoundBottomRight =  await Scene.unprojectToFocalPlane(max);
	let currentBoundTopLeft =  await Scene.unprojectToFocalPlane(Reactive.point2d(0,0));

	const currentTime = Time.ms; 


	currentTime.monitor().subscribe((data) => {
		let delta = (data.newValue - data.oldValue); 
		//Diagnostics.log(delta); 
		let deltaOffset = Reactive.mul(speed, Reactive.val(delta));
		offset =  Reactive.add(deltaOffset, offset); 
		//Diagnostics.log(offset.y.pinLastValue(); 
		gameMesh.transform.position = Reactive.add(start, offset);  
		const speedScaler = boundaryCheck(gameMesh, currentBoundBottomRight, currentBoundTopLeft, max); 
		speed = Reactive.mul(speedScaler, speed); 
		//Diagnostics.watch("speed", speed.y);

	})


	
	//const speedScaler = Reactive.vector(1, yScaler, -1);

	//Patches.outputs.getPoint("facePos").then( (pointSignal) => {
			//Patches.inputs.setVector("speedScaler", speedScaler); 
		//}

	//)

	

	//let xSpeed = Math.random();  
	//let ySpeed = 0.1; 
	

	// Create a time interval loop for cannon
	    //Time.setInterval( (time) =>  {
		    ////gameMesh.transform.x = 0.01 * Math.sin(0.001 * time);
		//const currentXPos = gameMesh.transform.x.pinLastValue(); 
		//const currentYPos = gameMesh.transform.y.pinLastValue(); 
		    ////gameMesh.transform.x = currentXPos + xSpeed;  
		    //gameMesh.transform.y = currentYPos + ySpeed;  
		////const currentScreenPosSignal = Scene.projectToScreen(gameMesh.worldTransform.position);  

		//if (max.x.pinLastValue() !== 0 && screenWidth === 0) {
			//screenWidth = max.x.pinLastValue(); 
			//screenHeight = max.y.pinLastValue(); 

			//Diagnostics.log(screenHeight);
			//startGame = true; 
		//}
	//
		//if (startGame) {
			////Diagnostics.log(currentBoundTopLeft.y.pinLastValue());
			////Diagnostics.log(currentBoundBottomRight.y.pinLastValue());
			////Diagnostics.log("---------");
			//let topValue = currentBoundTopLeft.y.pinLastValue();
			//let bottomValue = currentBoundBottomRight.y.pinLastValue();   
			////Diagnostics.log(currentScreenPosSignal.y.pinLastValue());
			////let currentYScreenPos = currentScreenPosSignal.y.pinLastValue(); 
			////Diagnostics.log(currentYScreenPos);
			//if (gameMesh.worldTransform.position.y.pinLastValue() >= topValue - 0.1) {
				////gameMesh.transform.y = currentYPos + ySpeed;  
				//const currentYPos = gameMesh.transform.y.pinLastValue(); 
				    //gameMesh.transform.y = currentYPos - 0.1;  
				//ySpeed *= -1; 
				////Diagnostics.log(ySpeed);
			//}
			//if (gameMesh.worldTransform.position.y.pinLastValue() >= bottomValue + 0.1) {
				////gameMesh.transform.y = currentYPos + ySpeed;  
				//const currentYPos = gameMesh.transform.y.pinLastValue(); 
				    //gameMesh.transform.y = currentYPos - 0.1;  
				//ySpeed *= -1; 
				////Diagnostics.log(ySpeed);
			//}

		//}
		    ////gameMesh.transform.y = 0;
		    ////gameMesh.transform.z = 0;
		////Diagnostics.log('Console message logged from the script.');
	//}, 1);

})(); // Enables async/await in JS [part 2]
