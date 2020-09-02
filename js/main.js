$(function() {

  let config = {
    apiKey: "AIzaSyBr3UJb7Cq7e-N_VQLFSB0EM2jezV0OEeY",
    authDomain: "https://tarkov-interactive-map-9feef.firebaseapp.com",
    databaseURL: "https://tarkov-interactive-map-9feef.firebaseio.com",
    projectId: "tarkov-interactive-map-9feef",
    storageBucket: "",
    messagingSenderId: "341245900529",
  };

    firebase.initializeApp(config);

    $(".tools").draggable();

    let roomID = getUrlParameter('id') || "prueba";

    let uID = Math.floor(Math.random() * 100000).toString();

    let db = firebase.database();

    let rooms = db.ref('rooms');

    let currentRoom = rooms.child(roomID);

    let now = Date.now();

    let canvas = new fabric.Canvas('canvas', {
        isDrawingMode: true
    });

    canvas.selection = false;

    let drawingColor = $('#drawing-color'),
        drawingLineWidth = $('#drawing-line-width');

    var Circle = (function() {
        function Circle(canvas) {
            this.canvas = canvas;
            this.className = 'Circle';
            this.isDrawing = false;
            this.isActive = false;
            this.bindEvents();
        }

        let origX, origY;

        Circle.prototype.bindEvents = function() {
            let inst = this;
            inst.canvas.on('mouse:down', function(event) {
                if (inst.isActive) inst.onMouseDown(event);
            });
            inst.canvas.on('mouse:move', function(event) {
                if (inst.isActive) inst.onMouseMove(event);
            });
            inst.canvas.on('mouse:up', function(event) {
                if (inst.isActive) inst.onMouseUp(event);
            });
            inst.canvas.on('object:moving', function() {
                if (inst.isActive) inst.disable();
            })
        };

        Circle.prototype.onMouseUp = function() {
            let inst = this;
            if (inst.isEnable()) canvas.fire('object:finish', { target: inst.canvas.getActiveObject() });
            inst.disable();
        };

        Circle.prototype.onMouseMove = function(event) {
            let inst = this;
            if (!inst.isEnable()) {
                return;
            }

            let pointer = inst.canvas.getPointer(event.e);
            let activeObj = inst.canvas.getActiveObject();

            if (origX > pointer.x) {
                activeObj.set({ left: Math.abs(pointer.x) });
            }

            if (origY > pointer.y) {
                activeObj.set({ top: Math.abs(pointer.y) });
            }

            activeObj.set({
                rx: Math.abs(origX - pointer.x) / 2,
                ry: Math.abs(origY - pointer.y) / 2,
                width: Math.abs(origX - pointer.x),
                height: Math.abs(origY - pointer.y)
            });

            activeObj.setCoords();
            inst.canvas.renderAll();
        };

        Circle.prototype.onMouseDown = function(event) {
            let inst = this;
            inst.enable();

            let pointer = inst.canvas.getPointer(event.e);
            origX = pointer.x;
            origY = pointer.y;

            let ellipse = new fabric.Ellipse({
                top: origY,
                left: origX,
                originX: 'left',
                originY: 'top',
                width: pointer.x - origX,
                height: pointer.y - origY,
                rx: 0,
                ry: 0,
                transparentCorners: true,
                hasBorders: false,
                hasControls: false,
                stroke: drawingColor.val(),
                strokeWidth: parseInt(drawingLineWidth.val()),
                fill: 'rgba(0,0,0,0)',
                lockMovementX: true,
                lockMovementY: true
            });

            inst.canvas.add(ellipse).setActiveObject(ellipse)
        };

        Circle.prototype.isEnable = function() {
            return this.isDrawing;
        };

        Circle.prototype.enable = function() {
            this.isDrawing = true;
        };

        Circle.prototype.disable = function() {
            this.isDrawing = false;
        };

        Circle.prototype.active = function () {
            this.isActive = true;
        };

        Circle.prototype.desactive = function () {
            this.isActive = false;
        };

        return Circle;
    }());

    var Arrow = (function() {
        function Arrow(canvas) {
            this.canvas = canvas;
            this.className = 'Arrow';
            this.isDrawing = false;
            this.isActive = false;
            this.bindEvents();
        }

        Arrow.prototype.bindEvents = function() {
            let inst = this;
            inst.canvas.on('mouse:down', function(o) {
                if (inst.isActive) inst.onMouseDown(o);
            });
            inst.canvas.on('mouse:move', function(o) {
                if (inst.isActive) inst.onMouseMove(o);
            });
            inst.canvas.on('mouse:up', function(o) {
                if (inst.isActive) inst.onMouseUp(o);
            });
            inst.canvas.on('object:moving', function(o) {
                if (inst.isActive) inst.disable();
            })
        };

        Arrow.prototype.onMouseUp = function(o) {
            let inst = this;
            if (inst.isEnable()) canvas.fire('object:finish', { target: inst.canvas.getActiveObject() });
            inst.disable();
        };

        Arrow.prototype.onMouseMove = function(o) {
            let inst = this;
            if (!inst.isEnable()) {
                return;
            }

            let pointer = inst.canvas.getPointer(o.e);
            let activeObj = inst.canvas.getActiveObject();

            activeObj.set({
                x2: pointer.x,
                y2: pointer.y
            });

            activeObj.setCoords();
            inst.canvas.renderAll();
        };

        Arrow.prototype.onMouseDown = function(o) {
            let inst = this;
            inst.enable();

            let pointer = inst.canvas.getPointer(o.e);
            let points = [pointer.x, pointer.y, pointer.x, pointer.y];
            let line = new fabric.Arrow(points, {
                strokeWidth: parseInt(drawingLineWidth.val()),
                fill: drawingColor.val(),
                stroke: drawingColor.val(),
                originX: 'center',
                originY: 'center',
                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true
            });

            inst.canvas.add(line).setActiveObject(line);
        };

        Arrow.prototype.isEnable = function() {
            return this.isDrawing;
        };

        Arrow.prototype.enable = function() {
            this.isDrawing = true;
        };

        Arrow.prototype.disable = function() {
            this.isDrawing = false;
        };

        Arrow.prototype.active = function () {
            this.isActive = true;
        };

        Arrow.prototype.desactive = function () {
            this.isActive = false;
        };

        return Arrow;
    }());

    let c = new Circle(canvas),
        a = new Arrow(canvas);

    canvas.freeDrawingBrush.color = drawingColor.val();
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidth.val(), 10) || 1;

    $('#clear-canvas').on('click', function () {
        clear();
    });

    $('#background-options').on('change', function () {
        setBackground(this.value);
        clear();

        currentRoom.update({
            map: this.value
        });
    });

    drawingColor.on('change', function () {
        canvas.freeDrawingBrush.color = this.value;
    });

    drawingLineWidth.on('change mousemove', function () {
        canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
        $(".number-range").html(this.value + "px");
    });

    $(".colors div").on('click', function () {
        let value = $(this).attr('id');
        canvas.freeDrawingBrush.color = value;
        drawingColor.val(value);
    });

    $("#line-drawing").on('click', function () {
        canvas.isDrawingMode = true;
        c.desactive();
        a.desactive();
    });

    $("#circle-drawing").on('click', function () {
        canvas.isDrawingMode = false;
        c.active();
        a.desactive();
    });

    $("#arrow-drawing").on('click', function () {
        canvas.isDrawingMode = false;
        a.active();
        c.desactive();
    });

    function setBackground(backgroundImage) {
        if (backgroundImage === "none") {
            canvas.backgroundImage = 0;
            canvas.setBackgroundColor({source: 'img/none.png'}, function () {
                canvas.renderAll();
            });
        } else {
            fabric.Image.fromURL('img/' + backgroundImage + '.png', function (img) {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height
                });
            });
        }
    }

    function clear() {
        canvas.clear();
        setBackground($('#background-options').val());
    }


    $().on('keydown', null, 'F2', clear);

    currentRoom.child('content').once('value', function (data) {

        let sync = new Sync();

        currentRoom.child('map').on('value', function (map) {
            let value = map.val();
            let select = $('#background-options');

            if (select.val() !== value) {
                select.val(value);
                setBackground(value);
            }
        });

        let queueRef = currentRoom.child('queue');

        canvas.on('path:created', function(data) {

            if (sync.status) {
                return;
            }

            data.path.set({
                lockMovementX: true,
                lockMovementY: true
            });

            currentRoom.update({
                content: JSON.stringify(canvas)
            });

            queueRef.push().set({
                event: JSON.stringify(data.path),
                by: uID,
                time: Date.now().toString()
            });

        });

        canvas.on('object:finish', function(data) {

            if (sync.status) {
                return;
            }

            currentRoom.update({
                content: JSON.stringify(canvas)
            });

            queueRef.push().set({
                event: JSON.stringify(data.target),
                by: uID,
                time: Date.now().toString()
            });

        });

        canvas.on('object:added', function (data) {
            if (sync.status) {
                return;
            }

            data.target.set({
                lockMovementX: true,
                lockMovementY: true
            })
        });

        canvas.on('canvas:cleared', function () {

            if (sync.status) {
                return;
            }

            currentRoom.update({
                content: JSON.stringify(canvas)
            });

            queueRef.push().set({
                event: "clear",
                by: uID,
                time: Date.now().toString()
            }).then(() => {
                queueRef.remove()
            });

        });

        queueRef.on('child_added', function (child) {

            let value = child.val();
            let timestamp = value.time;

            if (now > timestamp || value.by === uID) {
                return;
            }

            sync.on();

            if (value.event === "clear") {
                clear();
            } else {
                let newObj = JSON.parse(value.event);
                new fabric[fabric.util.string.capitalize(newObj.type)].fromObject(newObj, function (obj) {
                    canvas.add(obj);
                });
            }

            sync.off();
        });

        let val = data.val();

        if (val === null) {
            val = JSON.stringify(canvas);

            rooms.child(roomID).set({
                content: val,
                map: "none",
                queue: {}
            });
        }

        sync.on();

        canvas.loadFromJSON(JSON.parse(val));
        currentRoom.child('map').once('value', function (content) {
            let val = content.val();
            setBackground(val);
        });

        sync.off();

        $("#loader").fadeOut();
        $("main").fadeIn();

    });

    function getUrlParameter(myParam) {
        let url = decodeURIComponent(window.location.search.substring(1));
        let urlParams = url.split('&');

        for (let i = 0; i < urlParams.length; i++) {
            let currentParam = urlParams[i].split('=');

            if (currentParam[0] === myParam) {
                return currentParam[1] === undefined ? true : currentParam[1];
            }
        }

        return null;
    }

    let Sync = (function() {
        function Sync() {
            this.status = false;
        }

        Sync.prototype.status = function() {
            return this.status;
        };

        Sync.prototype.on = function() {
            this.status = true;
        };

        Sync.prototype.off = function() {
            this.status = false;
        };

        return Sync;
    }());

});
