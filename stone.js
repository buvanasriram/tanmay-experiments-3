class Stone extends BaseClass {
    constructor(x,y){
      super(x,y,50,50);
      this.body.label = 'stone'
      this.image = loadImage("sprites/stone.png");
    }
  }
  