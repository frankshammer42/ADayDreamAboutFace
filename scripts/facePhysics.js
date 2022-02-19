//TODO: Create Bound 
//TODO: Create Physics Based Movement 
const Scene = require('Scene');
const Time = require('Time');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
export const Diagnostics = require('Diagnostics');

let startGame = false; 
let speed = Reactive.vector(0,0.0005,0); 
let offset = Reactive.vector(0,0,0); 
let previousTime = Reactive.val(0.0); 
let currentTime = Time.ms; 
let prevTime = Time.ms.history(1).at(0); 
let prevPos;  

function boundaryCheck(gameMesh, br, tl, max, dirty){
	//Diagnostics.log("fuck");
	let xScaler = 1; 
	let yScaler = 1; 

	let boundarySet = false; 
	//Diagnostics.watch("maxX", max.x); 

	if (!max.x.eq(0).pinLastValue()) {
		boundarySet = (true); 
	}

	if (boundarySet) {
		let topValueSignal = tl.y; 
		let bottomValueSignal = br.y;   


		let yPosSignal = gameMesh.worldTransform.position.y; 

		let above = yPosSignal.ge(topValueSignal);  
		let below = yPosSignal.lt(bottomValueSignal); 


		if (above.pinLastValue()) {
			if (speed.y.gt(0).pinLastValue()) {
				yScaler = -1.0; 
			}
		}

		if (below.pinLastValue()) {
			if (speed.y.lt(0).pinLastValue()) {
				yScaler = -1.0; 
			}
		}
			//Diagnostics.log(ySpeed);
		
	}
	return Reactive.vector(xScaler, yScaler, 1); 
}


(async function () {  // Enables async/await in JS [part 1]

	const gameMesh = await Scene.root.findFirst('gameMesh');
	prevPos = gameMesh.transform.position.history(1).at(0); 

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




	//let delta = currentTime.add(prevTime.mul(-1)).mul(0.1); 
	//Diagnostics.watch("diff", delta); 
	//let deltaOffset = Reactive.mul(speed, delta);
	//offset =  Reactive.add(deltaOffset, offset); 
	//gameMesh.transform.position = Reactive.add(prevPos, offset);  
	//gameMesh.transform.position.y.monitor().subscribe((data)=>{
		//let speedScaler= boundaryCheck(gameMesh, currentBoundBottomRight, currentBoundTopLeft, max, gameMesh.transform.position); 
		//speed = Reactive.mul(speedScaler, speed); 
	//}); 
	



	currentTime.monitor().subscribe((data) => {
		let delta = (data.newValue - data.oldValue); 
		let deltaOffset = Reactive.mul(speed, Reactive.val(delta));
		offset =  Reactive.add(deltaOffset, offset); 
		//Diagnostics.watch("offset", offset.y); 
		//Diagnostics.log(offset.y.pinLastValue(); 
		gameMesh.transform.position = Reactive.add(start, offset);  
		const speedScaler = boundaryCheck(gameMesh, currentBoundBottomRight, currentBoundTopLeft, max); 
		speed = Reactive.mul(speedScaler, speed); 
	})


	

})(); // Enables async/await in JS [part 2]
