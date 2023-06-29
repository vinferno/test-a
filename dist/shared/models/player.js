"use strict";
class Player {
    height = 3;
    decision = "";
    name = "";
    sockeet = null;
    playerType = '';
    constructor(name, playerType) {
        this.name = name;
        this.playerType = playerType;
    }
    takeLoss() {
        this.height -= 1;
    }
    makeADecision(value) {
        this.decision = value;
    }
}
//# sourceMappingURL=player.js.map