// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        cells:[],
        cellsPoint:[],
        CELL_WH:0,
        cant:50,
        offset:0,
        increment:0,
        deltaAngle:1,
        beginTouchPos:0,
        isTouchMoving:false,
        lastDirection:new cc.Vec3(0, 0, 0),
        lastAngle:0,
        beginScaleTouch0Pos:0,
        beginScaleTouch1Pos:0,
        radias:110,
        isScaleing:false,
        sprAtlas:cc.SpriteAtlas,
        initing:true,
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        

    },

    start () {
        this.isScaleing=false;
        this.cant = 50;
        this.offset = 2 / this.cant;
        this.increment = Math.PI * (3 - Math.sqrt(5));
        this.initing=true;
        this.CELL_WH = 20;
        this.createNodes();

        //init pos
        this.updatePos(0);

        this.isTouchMoving=false;

        var self = this;
        var listener1 = cc.EventListener.create({
          event: cc.EventListener.TOUCH_ALL_AT_ONCE,
          onTouchesBegan: function onTouchesBegan(touches, event) {
            if (touches.length >= 2) {
              self.beginScaleTouch0Pos = touches[0].getLocation();
              self.beginScaleTouch1Pos = touches[1].getLocation();
              self.isTouchMoving=false;
              self.isScaleing = true;
              self.beginTouchPos = 0;
            }else{
                self.isTouchMoving=true;
                self.isScaleing = false;
                self.beginTouchPos = touches[0].getLocation();
            }
            self.beginDist = 0;
            return true;
          },
          onTouchesMoved: function onTouchesMoved(touches, event) {
            if (touches.length >= 2) {
                self.beginScaleTouch0Pos = touches[0].getLocation();
                self.beginScaleTouch1Pos = touches[1].getLocation();

                var ydist = self.beginScaleTouch1Pos.y - self.beginScaleTouch0Pos.y;
                var xdist = self.beginScaleTouch1Pos.x - self.beginScaleTouch0Pos.x;

                var  newDist = Math.sqrt(ydist * ydist + xdist * xdist);

                if(self.beginDist ==0){
                        self.beginDist = newDist;
                }

                var scaleP = newDist / self.beginDist;

                self.beginDist = newDist;

                self.radias = Math.max(Math.min(120, self.radias * scaleP), 100);
                self.isScaleing = true;
                self.isTouchMoving=false;
            }else{

                if(self.isScaleing){
                    return;
                }

                self.isTouchMoving=true;

                let p = touches[0].getLocation();
                if(self.beginTouchPos==0){
                    self.beginTouchPos = p;
                }
                var a = self.beginTouchPos.y - p.y;
                var b = p.x - self.beginTouchPos.x;
        
                
                var direction = new cc.Vec3(a, b, 0);
                var dist = Math.sqrt(direction.x * direction.x + direction.y*direction.y);
                var angle  = Math.min(dist / (self.node.width), 0.7);
                self.rotationPos(direction, angle);
                self.beginTouchPos = p;
                self.lastDirection = direction;
                self.lastAngle = angle;
            }
            
          },
          onTouchesEnded: function onTouchesEnded(touches, event) {
           
            if(touches.length <=1 && self.isScaleing){
                self.beginDist = 0;
            }
            self.isTouchMoving=false;
          },

          onTouchesCancelled: function onTouchesCancelled(touches, event) {

            if(touches.length <=1 && self.isScaleing){
                self.beginDist = 0;
            }

            self.isTouchMoving=false;

          }
        });
        cc.eventManager.addListener(listener1, self.node);
    },

    getColor:function() {
        return new cc.color(Math.random(255), Math.random(255),Math.random(255));
    },

    createNodes:function() {
        this.cells = {};
        let windowSize=cc.view.getVisibleSize();

        for( var j = 0; j < this.cant; j++ ) {
                function add(p, j){
                    var fontSize = 20;
                    var b = new cc.Node("Sprite");
                    b.setAnchorPoint(0.5, 0.5);

                    if(j!=23){
                        var sp = b.addComponent(cc.Sprite);
                        sp.spriteFrame = p.sprAtlas.getSpriteFrame("img_4");
                        // sp.color = p.getColor();

                    }else{
                        var sp = b.addComponent(cc.Sprite);
                        var anim = sp.addComponent(cc.Animation);

                        var frames = p.sprAtlas.getSpriteFrames();
                        // frames 这是一个 SpriteFrame 的数组.
                        var clip = cc.AnimationClip.createWithSpriteFrames(frames, frames.length);
                        clip.name = "superplanet";
                        clip.speed = 0.5;
                        // clip.sample = 60;
            
                        clip.wrapMode = cc.WrapMode.Loop;

                        anim.addClip(clip);
                  
                        anim.play("superplanet");
                    }

                    var matchnode = new cc.Node("match");
                    matchnode.setAnchorPoint(0.5, 0.5);
                    
                    var tile = matchnode.addComponent(cc.Label);
                    tile.width = 40;
                    // tile.color = p.getColor();
                    tile.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
                    
                    tile.string = ("node"+j);
                    tile.fontSize = fontSize;
                    b.addChild(matchnode);


 
                    var r = j;
                    
                    b.on(cc.Node.EventType.TOUCH_END,function(t){p.cellHandle(r);}
                        ,p);

                    p.cells[j] = b;
                    p.cellsPoint[j] = [0, 0 , 0];
                  
                    p.node.addChild(b);
                }
            add(this, j);
        }
    },


    cellHandle:function(index) {
        // cc.log("click ok%d:%d", index);

        if (cc.sys.ANDROID == cc.sys.platform){
            var result = jsb.reflection.callStaticMethod("com/faceunity/fulivedemo/MainActivity", "clickNode", "(Ljava/lang/Integer;)V",index);
        }else if(cc.sys.IOS == cc.sys.platform){
            var result = jsb.reflection.callStaticMethod("NativeOcInfterface", "clickNode");
        }
    },

    rotationPos: function(direction, angle){

        function DBMatrixMake(column, row) {
            var matrix = {};
            matrix.column = column;
            matrix.row = row;
            matrix.matrix = [];
            for(var i = 0; i < column; i++){
                matrix.matrix[i] = [];
                for(var j = 0; j < row; j++){
                    matrix.matrix[i][j] = 0;
                }
            }
            return matrix;
        }

        function DBMatrixMakeFromArray(column, row, data) {
            var matrix = DBMatrixMake(column, row);
            for (var i = 0; i < column; i ++) {
                for (var j = 0; j < row; j++) {
                    matrix.matrix[i][j] = data[i][j];
                }
            }
            return matrix;
        };

        function DBMatrixMutiply(a, b) {
            var result = DBMatrixMake(a.column, b.row);
            for(var i = 0; i < a.column; i ++){
                for(var j = 0; j < b.row; j ++){
                    for(var k = 0; k < a.row; k++){
                        result.matrix[i][j] += a.matrix[i][k] * b.matrix[k][j];
                    }
                }
            }
            return result;
        };
        
        var result;

        for(var i = 0; i <  this.cant; i++){
      
            var cellPoint = this.cellsPoint[i];
            var temp2 = [[cellPoint[0], cellPoint[1], cellPoint[2], 1]];
            
            var  result = DBMatrixMakeFromArray(1, 4, temp2);
            
            if (direction.z * direction.z + direction.y * direction.y != 0) {
                var cos1 = direction.z / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
                var sin1 = direction.y / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
                var t1 = [[1, 0, 0, 0], [0, cos1, sin1, 0], [0, -sin1, cos1, 0], [0, 0, 0, 1]];
                var m1 = DBMatrixMakeFromArray(4, 4, t1);
                result = DBMatrixMutiply(result, m1);
            }

            if (direction.x * direction.x + direction.y * direction.y + direction.z * direction.z != 0) {
                var cos2 = Math.sqrt(direction.y * direction.y + direction.z * direction.z) / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
                var sin2 = -direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
                var t2 = [[cos2, 0, -sin2, 0], [0, 1, 0, 0], [sin2, 0, cos2, 0], [0, 0, 0, 1]];
                var m2 = DBMatrixMakeFromArray(4, 4, t2);
                result = DBMatrixMutiply(result, m2);
            }
            
            var cos3 = Math.cos(angle);
            var sin3 = Math.sin(angle);
            var t3 = [[cos3, sin3, 0, 0], [-sin3, cos3, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            var m3 = DBMatrixMakeFromArray(4, 4, t3);
            result = DBMatrixMutiply(result, m3);
            
            if (direction.x * direction.x + direction.y * direction.y + direction.z * direction.z != 0) {
                var cos2 = Math.sqrt(direction.y * direction.y + direction.z * direction.z) / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
                var sin2 = -direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
                var t2_ = [[cos2, 0, sin2, 0], [0, 1, 0, 0], [-sin2, 0, cos2, 0], [0, 0, 0, 1]];
                var m2_ = DBMatrixMakeFromArray(4, 4, t2_);
                result = DBMatrixMutiply(result, m2_);
            }
            
            if (direction.z * direction.z + direction.y * direction.y != 0) {
                var cos1 = direction.z / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
                var sin1 = direction.y / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
                var t1_ = [[1, 0, 0, 0], [0, cos1, -sin1, 0], [0, sin1, cos1, 0], [0, 0, 0, 1]];
                var m1_ = DBMatrixMakeFromArray(4, 4, t1_);
                result = DBMatrixMutiply(result, m1_);
            }
            
            
            result = new cc.Vec3(result.matrix[0][0], result.matrix[0][1], result.matrix[0][2]);
            
            this.cellsPoint[i][0] = result.x;
            this.cellsPoint[i][1] = result.y;
            this.cellsPoint[i][2] = result.z;

            if(i==this.cant){
                cc.log("haha");
            }

            var node = this.cells[i]; 
            var centerP = cc.v2(0, 100);
            node.x = (0 + result.x * this.radias);
            node.y = (100 + result.y * this.radias);
            node.scale = Math.min(Math.max(result.z, .2), .5);
            node.opacity = Math.max(50, result.z * 255);
      
        }
    },

    updatePos:function(dt){
        if(this.isTouchMoving) return;

        var x, y, z, r, a, scale, opacity, point, style;
        this.deltaAngle += .1;
        var angle =  this.deltaAngle * Math.PI / 180;
        
        for(var i = 0; i <  this.cant; i++){
      
          y = (i * this.offset - 1) + (this.offset / 2);
          r = Math.sqrt(1 - Math.pow(y, 2));
          a = ((i + 1) % this.cant) * this.increment + angle;

          x = Math.cos(a) * r ;
          z = Math.sin(a) * r ;

          var node = this.cells[i]; 

          this.cellsPoint[i][0] = x;
          this.cellsPoint[i][1] = y;
          this.cellsPoint[i][2] = z;

          var R = 0; 
          x = (R + x * this.radias);
          y = (100 + y * this.radias);
          node.y = 100;
          var scale = Math.min(Math.max(z, .2), .5);
          node.opacity = Math.max(50, z * 255);
            var atime = 0.4
            var s1 = cc.scaleTo(atime, scale);
            var mt = cc.moveTo(atime, cc.v2(x, y));
            var self = this;
            var seq = cc.sequence([s1,mt, cc.callFunc(function(){
                self.initing=false;
             })]);  //先缩小再放大
            node.runAction(seq)


                
        }
        this.lastDirection = new cc.Vec3(Math.random() * 100 % 10 - 5, Math.random() * 100 % 10 - 5, 0);


    },

    update (dt) {
        if(this.isTouchMoving || this.initing){
            return
        }
        this.lastAngle = Math.max(.005, this.lastAngle - 0.0005);
        this.rotationPos(this.lastDirection, this.lastAngle);

    },
});
