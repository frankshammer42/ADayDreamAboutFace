// TODO: Create on boarding 
// TODO: Create ending 
const Scene = require('Scene');
const Time = require('Time');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
const FaceTracking = require('FaceTracking'); 
export const Diagnostics = require('Diagnostics');

let faceCatched = false;
let gameStarted = false; 
const onBoardingSpeed = Reactive.vector(-0.0001, 0.0001, 0); 
const onBoardingBoundY = 0.15; 

let speed = Reactive.vector(0.0004, 0.0006, 0); 
let offset = Reactive.vector(0,0,0); 
let previousTime = Reactive.val(0.0); 
let currentTime = Time.ms; 
let prevTime = Time.ms.history(1).at(0); 

let currentSaturation = 0.0; 
let catchedTime = 0.0; 
let raisedDuration = 2000.0; 

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
	//Scene.addChild(gameMesh); 
	//target.removeChild(gameMesh); 

	
	gameMesh.transform.rotation = face.cameraTransform.rotation; 
	const justXy = face.cameraTransform.position.mul(Reactive.vector(1,1,0)).add(Reactive.vector(0,0,0.01)); 
	gameMesh.transform.position = justXy; 
	///gameMesh.transform.scale = face.cameraTransform.scale; 

	

	const start = Reactive.vector(0,0,0); 
	const max = await Reactive.point2d(
	  CameraInfo.previewSize.width,
	  CameraInfo.previewSize.height); 
	let screenWidth = 0; 
	let screenHeight = 0; 
	let currentBoundBottomLeft =  await Scene.unprojectToFocalPlane(max);
	let currentBoundTopRight =  await Scene.unprojectToFocalPlane(Reactive.point2d(0,0));




	currentTime.monitor().subscribe((data) => {
		if (gameStarted) {
			if (!faceCatched) {
				let delta = (data.newValue - data.oldValue); 
				let deltaOffset = Reactive.mul(speed, Reactive.val(delta));
				offset =  Reactive.add(deltaOffset, offset); 
				const currentPosition = Reactive.add(start, offset); 
				gameMesh.transform.position = currentPosition;  
				const speedScaler = boundaryCheck(gameMesh, currentBoundBottomLeft, currentBoundTopRight, max); 
				speed = Reactive.mul(speedScaler, speed); 
				const xyPos = Reactive.vector(targetPosSignal.x, targetPosSignal.y, 0); 	
				const toTargetDistance = xyPos.add(gameMesh.transform.position.mul(-1)); 
				if (toTargetDistance.magnitude().lt(0.045).pinLastValue() && currentTime.gt(2000).pinLastValue()) {
					speed = Reactive.mul(0, speed); 
					faceCatched = true; 
					Diagnostics.log("Face Catched"); 
					catchedTime = Time.ms.pinLastValue(); 
				}

			}
			else {
				gameMesh.transform.position = justXy; 
				let passedTime = Time.ms.pinLastValue() - catchedTime; 
				let durationPortion = passedTime / raisedDuration; 
				if (durationPortion <= 1.0) {
					currentSaturation = -1.0 + durationPortion; 
					Diagnostics.log(currentSaturation);
					Patches.inputs.setScalar('currentSaturation', currentSaturation);
					Patches.inputs.setScalar('effectVisibility', durationPortion);
				}
			}

		}
		else {
			let delta = (data.newValue - data.oldValue); 
			let deltaOffset = Reactive.mul(onBoardingSpeed, Reactive.val(delta));
			offset =  Reactive.add(deltaOffset, offset); 
			const currentPosition = Reactive.add(start, offset); 
			gameMesh.transform.position = currentPosition;  
			if (currentPosition.y.pinLastValue() > onBoardingBoundY) {
				Diagnostics.log("Start the game"); 
				gameStarted = true; 
			}

		}

	})



	

})(); // Enables async/await in JS [part 2]
