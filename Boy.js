class Boy extends BaseClass {
  constructor(x,y, w,h){ //added w,h
    super(x,y,w,h); // removed 50,50
    Matter.Body.setStatic(this.body, true) //added
    this.image = loadImage("sprites/boy.png");
    //this.smokeImage = loadImage("sprites/smoke.png");
    //this.trajectory =[];
  }
  // deleted display()
}
