//TODO: Create Bound 
//TODO: Create Physics Based Movement 
const Scene = require('Scene');
const Time = require('Time');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
const FaceTracking = require('FaceTracking'); 
export const Diagnostics = require('Diagnostics');

let startGame = false; 
let speed = Reactive.vector(0.0002, 0.0006, 0); 
let offset = Reactive.vector(0,0,0); 
let previousTime = Reactive.val(0.0); 
let currentTime = Time.ms; 
let prevTime = Time.ms.history(1).at(0); 

function boundaryCheck(gameMesh, bottomLeft, topRight, max, dirty){
	let xScaler = 1; 
	let yScaler = 1; 

	let boundarySet = false; 

	if (!max.x.eq(0).pinLastValue()) {
		boundarySet = (true); 
	}

	if (boundarySet) {
		let leftValueSignalX = bottomLeft.x; 
		let rightValueSignalX = topRight.x;   


		let topValueSignalY = topRight.y; 
		let bottomValueSignalY = bottomLeft.y;   


		let xPosSignal = gameMesh.worldTransform.position.x; 
		let yPosSignal = gameMesh.worldTransform.position.y; 

		let above = yPosSignal.ge(topValueSignalY);  
		let below = yPosSignal.lt(bottomValueSignalY); 

		let right = xPosSignal.ge(rightValueSignalX); 
		let left = xPosSignal.lt(leftValueSignalX); 


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

		if (left.pinLastValue()) {
			if (speed.x.gt(0).pinLastValue()) {
				xScaler = -1.0; 
			}
		}
		if (right.pinLastValue()) {
			if (speed.x.lt(0).pinLastValue()) {
				xScaler = -1.0; 
			}

		}

			//Diagnostics.log(ySpeed);
		
	}
	return Reactive.vector(xScaler, yScaler, 1); 
}


(async function () {  // Enables async/await in JS [part 1]

	const gameMesh = await Scene.root.findFirst('gameMesh');
	const target = await Scene.root.findFirst('faceTracker0'); 
	const face = FaceTracking.face(0); 
	const targetPosSignal = face.cameraTransform.position; 
	

	const start = Reactive.vector(0,0,0); 

	const max = await Reactive.point2d(
	  CameraInfo.previewSize.width,
	  CameraInfo.previewSize.height); 

	let screenWidth = 0; 
	let screenHeight = 0; 

	//const currentScreenPosSignal = await Scene.projectToScreen(gameMesh.worldTransform.position);  

	let currentBoundBottomLeft =  await Scene.unprojectToFocalPlane(max);
	let currentBoundTopRight =  await Scene.unprojectToFocalPlane(Reactive.point2d(0,0));



	currentTime.monitor().subscribe((data) => {
		let delta = (data.newValue - data.oldValue); 
		let deltaOffset = Reactive.mul(speed, Reactive.val(delta));
		offset =  Reactive.add(deltaOffset, offset); 

		const currentPosition = Reactive.add(start, offset); 
		gameMesh.transform.position = currentPosition;  
		//gameMesh.transform.position.z = target.worldTransform.position.z; 
		const speedScaler = boundaryCheck(gameMesh, currentBoundBottomLeft, currentBoundTopRight, max); 
		speed = Reactive.mul(speedScaler, speed); 

	 	const xyPos = Reactive.vector(targetPosSignal.x, targetPosSignal.y, 0); 	
		const toTargetDistance = xyPos.add(gameMesh.transform.position.mul(-1)); 

		gameMesh.transform.rotation = face.cameraTransform.rotation; 


		if (toTargetDistance.magnitude().lt(0.05).pinLastValue() && currentTime.gt(2000).pinLastValue()) {
			//Diagnostics.log(toTargetDistance.magnitude().pinLastValue()); 
			//Diagnostics.log("getting close"); 
			speed = Reactive.mul(0, speed); 
		}

	})

	

})(); // Enables async/await in JS [part 2]
