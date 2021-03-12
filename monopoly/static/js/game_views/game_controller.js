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

        window.addEventListener('mousemove', onMouseMove, false);
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

    resizeBoard() {
        this.boardController.resize();
    }
}
