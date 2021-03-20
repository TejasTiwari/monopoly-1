"use strict";

class GameController {

    constructor(options) {
        this.initGame(options);
    }

    initGame(options) {
        const {containerEl, assetsUrl, onBoardPainted} = options;

        this.boardController = new BoardController({
            containerEl: containerEl,
            assetsUrl: assetsUrl
        });

        this.boardController.drawBoard(onBoardPainted);
        const onMouseMove = event => {
            this.boardController.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.boardController.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }
        window.addEventListener("click", onMouseMove, false)
    }

    addPlayer(count, initPos) {
        return this.boardController.drawPlayers(count, initPos);
    }

    movePlayer(playerIndex, newTileId) {
        // TODO: change viewport
        this.boardController.movePlayer(playerIndex, newTileId);
    }

    addProperty(type, tileId, playerIndex) {
        if (type === PropertyManager.PROPERTY_OWNER_MARK) {
            this.boardController.addLandMark(playerIndex, tileId);
        } else {
            this.boardController.addProperty(type, tileId);
        }
    }
    removeProperty(type, tileId, playerIndex) {
        
            this.boardController.removeLandMark(playerIndex, tileId);
       
    }

    resizeBoard() {
        this.boardController.resize();
    }
}


// export const addObjectClickListener = (
//     camera,
//     scene,
//     raycaster,
//     objectToWatch,
//     onMouseClick,
//   ) => {
//     const objectToWatchId = objectToWatch.uuid;
//     let mouse = new THREE.Vector2();

//     document.addEventListener(
//       "click",
//       (event) => {
//         mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//         raycaster.setFromCamera(mouse, camera);

//         const intersects = raycaster.intersectObjects(scene.children);

//         const isIntersected = intersects.find(
//           (intersectedEl) => intersectedEl.object.uuid === objectToWatchId
//         );

//         if (isIntersected) {
//           onMouseClick();
//         }
//       },
//       false
//     );
//   };