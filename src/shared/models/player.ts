

class Player {
    height: number = 3;
    decision: string = "";
    name: string = "";
    sockeet: string | null = null;
    playerType: 'local' | 'socket' | 'computer' | '' = '';
    constructor(name: string, playerType: 'local' | 'socket' | 'computer' | '') {
        this.name = name;
        this.playerType = playerType;
    }


    takeLoss() {
        this.height -= 1;
    }

    makeADecision(value: string) {

        this.decision = value;
    }
}