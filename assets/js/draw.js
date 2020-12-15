/**
 * Function scope wrapper.
 */
(function () {

    // region Drawer
    /**
     * An object that holds shapes and current settings
     */
    let drawer = {
        // A list of shapes on the canvas
        shapes: [],
        // If any shapes are undone they are kept here temporarily
        undoneShapes: [],
        // The shape currently selected
        selectedShape: 'lineList',
        // Canvas DOM element
        canvas: document.getElementById('canvas'),
        // The context of the canvas
        ctx: document.getElementById('canvas').getContext('2d'),

        canvasres: document.getElementById('canvasres'),
        resctx: document.getElementById('canvasres').getContext('2d'),
        // The element currently being drawn
        selectedElement: null,
        // The shapes we can choose from
        availableShapes: {
            RECTANGLE: 'rectangle',
            OVAL: 'oval',
            CIRCLE: 'circle',
            LINE: 'line',
            LINE_LIST: 'lineList',
            DrawnText: 'text',
            MOVE: 'move' // TODO
        },
        // Settings for selectedElement
        settings: {
            color: '#000000',
            filled: false,
            width: 1,
            font: '12pt sans-serif'
        },

        inited : false,
        init: function(){
            if(!this.inited){
                this.shapes.push(new Rectangle({x:0, y:0}, {
                    color: '#FFFFFF',
                    filled: true,
                    width: 1,
                    font: '12pt sans-serif'
                }, this.ctx.canvas.width, this.ctx.canvas.height));
                this.redraw();
                this.inited = true
            }
        },
        bgimg: new Image(),

        selectedimg: {},

        // order of layer
        layerOrder: [],

        display: function() {

            drawer.resctx.fillStyle = "#ffffff";
            drawer.resctx.strokeStyle = "#ffffff";
            drawer.resctx.fillRect(0, 0, drawer.resctx.canvas.width, drawer.resctx.canvas.height)

            var tbody = $('#layer-table > tbody');
            tbody.text('');

            makeRow = function(idx, col, src) {
                var c1 = $('<th>').attr('scope', 'row').text(idx);
                var colorSquare = $('<div>').attr('class','box').attr('style','background-color:'+col+'; cursor: pointer;').click(function(){
                    $("#color-selector").val(col);
                    // trigger color change event
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, true);
                    var el = document.getElementById("color-selector");
                    el.dispatchEvent(evt);
                });
                var c2 = $('<td>').append($('<span>').attr('title',col).append(colorSquare));
                var c3 = $('<td>').append($('<img>').attr('src',src).attr('width',30).attr('height',30));
                return $('<tr>').attr('data-id', idx).append(c1,c2,c3);
            };

            for (var i of drawer.layerOrder){
            // for (var i=1;i<drawer.shapes.length;i++) {
                if(i >= 0 && i < drawer.shapes.length && (drawer.shapes[i] instanceof Rectangle)){
                    let col = drawer.shapes[i].settings.color
                    if(col in drawer.selectedimg){
                        var x = drawer.shapes[i].position.x
                        var y = drawer.shapes[i].position.y
                        var w = drawer.shapes[i].width
                        var h = drawer.shapes[i].height
                        drawer.resctx.drawImage(drawer.selectedimg[col], x, y, w, h)

                        tbody.append(makeRow(i, col, drawer.selectedimg[col].getAttribute('src')));
                    }
                }
            }
        },

        drawResult: function (){
            
            drawer.display();
            // drawer.resctx.fillStyle = "#ffffff";
            // drawer.resctx.strokeStyle = "#ffffff";
            // drawer.resctx.fillRect(0, 0, drawer.resctx.canvas.width, drawer.resctx.canvas.height)

            // for(let id=1;id<drawer.shapes.length;id++){
            //     let i = drawer.layerOrder[id];
            //     if(drawer.shapes[i] instanceof Rectangle){
            //         let col = drawer.shapes[i].settings.color
            //         if(col in drawer.selectedimg){
            //             var x = drawer.shapes[i].position.x
            //             var y = drawer.shapes[i].position.y
            //             var w = drawer.shapes[i].width
            //             var h = drawer.shapes[i].height
            //             drawer.resctx.drawImage(drawer.selectedimg[col], x, y, w, h)
            //         }
            //     }
            // }
        },
        
        /**
         * Deep copy of settings.
         *
         * @returns {{color: string, filled: boolean, width: number, font: string}}
         */
        currentSettings: function () {
            return {
                color: drawer.settings.color.slice(0, drawer.settings.color.length),
                filled: drawer.settings.filled,
                width: drawer.settings.width,
                font: drawer.settings.font.slice(0, drawer.settings.font.length)
            };
        },
        /**
         * Draw all stored shapes.
         */
        drawAllStoredShapes: function () {
            //draw white background
            drawer.shapes[0].render(drawer.ctx)
            //draw background image
            
            if(this.bgimg){
                drawer.ctx.drawImage(this.bgimg, 0, 0, drawer.ctx.canvas.width, drawer.ctx.canvas.height);
            }
            
            for (let i = 1; i < drawer.shapes.length; i++) {
                if (drawer.shapes[i]) {
                    drawer.shapes[i].render(drawer.ctx);
                }
            }
        },
        /**
         * Draw the selected shape in its current state.
         */
        drawSelected: function () {
            if (drawer.selectedElement) {
                drawer.selectedElement.render(drawer.ctx);
            }
        },
        /**
         * Redraws all elements to the canvas.
         */
        redraw: function () {
            // Wipe everything off the canvas
            drawer.ctx.clearRect(0, 0, drawer.ctx.canvas.width, drawer.ctx.canvas.height);
            drawer.drawAllStoredShapes();
            drawer.drawSelected();
        },
        /**
         * Add the last undone shape back to the list of shapes.
         */
        redo: function () {
            if (drawer.undoneShapes.length > 0) {
                drawer.shapePush(drawer.undoneShapes.pop());
                drawer.redraw();
                drawer.drawResult();
            }
        },
        /**
         * Remove the last shape drawn and place in temporary redo storage.
         */
        undo: function () {
            if (drawer.shapes.length > 0) {
                drawer.undoneShapes.push(drawer.shapePop());
                drawer.redraw();
                drawer.drawResult();
            }
        },
        /**
         * Wrapper for drawer.shapes.push
         */
        shapePush: function (item) {
            drawer.layerOrder.push(drawer.shapes.length);
            drawer.shapes.push(item);
            console.log(drawer.layerOrder);
        },
        /**
         * Wrapper for drawer.shapes.pop
         */
        shapePop: function () {
            let popped = drawer.shapes.pop();
            const idx = drawer.layerOrder.indexOf(drawer.shapes.length);
            if (idx > -1) drawer.layerOrder.splice(idx,1);
            console.log(drawer.layerOrder);
            return popped;
        }
    };
    // endregion

    drawer.resctx.fillStyle = "#ffffff";
    drawer.resctx.strokeStyle = "#ffffff";
    drawer.resctx.fillRect(0, 0, drawer.resctx.canvas.width, drawer.resctx.canvas.height)
    // region Mouse events
    // region Mouse down
    drawer.canvas.addEventListener('mousedown',
        /**
         * Starts drawing the chosen shape.
         *
         * @param mouseEvent The event that trigger this callback
         */
        function (mouseEvent) {
            drawer.init()
            let pos = {x: mouseEvent.offsetX, y: mouseEvent.offsetY};
            switch (drawer.selectedShape) {
                case drawer.availableShapes.RECTANGLE:
                    drawer.selectedElement = new Rectangle(pos, drawer.currentSettings(), 0, 0);
                    break;
                case drawer.availableShapes.OVAL:
                    drawer.selectedElement = new Oval(pos, drawer.currentSettings(), 0, 0);
                    break;
                case drawer.availableShapes.CIRCLE:
                    drawer.selectedElement = new Circle(pos, drawer.currentSettings(), 0);
                    break;
                case drawer.availableShapes.LINE:
                    drawer.selectedElement = new Line(pos, drawer.currentSettings(), pos);
                    break;
                case drawer.availableShapes.LINE_LIST:
                    drawer.selectedElement = new LineList(pos, drawer.currentSettings());
                    break;

                case drawer.availableShapes.DrawnText:
                  /*
                    // If we are already drawing text, store that one
                    if (drawer.selectedElement) {
                        drawer.shapePush(drawer.selectedElement);
                        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                    }
                    drawer.selectedElement = new DrawnText(pos, drawer.currentSettings());
                    */
                    
                    console.log(drawer.currentSettings().color);
                    
                    
                    var fillup = new Fillup(pos, drawer.currentSettings());
                    drawer.selectedElement = fillup

                    pixelStack = [[pos.x, pos.y]];
                    var canvasWidth = drawer.ctx.canvas.width
                    var canvasHeight = drawer.ctx.canvas.height
                    var colorLayer = drawer.ctx.getImageData(0,0,canvasWidth,canvasHeight)
                    var startCol = drawer.ctx.getImageData(pos.x, pos.y, 1, 1)
                    var pickedCol = hexToRgb(drawer.currentSettings().color)

                    if(startCol.data[0]==pickedCol.r && startCol.data[1]==pickedCol.g && startCol.data[2]==pickedCol.b) break;

                    var count = 0
                    /*
                    expand(pos)
                    function expand(pos){
                        var x = pos.x
                        var y = pos.y
                        if(x<0 || y<0 || x>canvasWidth || y>canvasHeight){
                            return
                        }
                        pixelPos = (y*canvasWidth + x) * 4;
                        var r = colorLayer.data[pixelPos];
                        var g = colorLayer.data[pixelPos+1];
                        var b = colorLayer.data[pixelPos+2];
                        if(matchStartColor(pixelPos)){
                            fillup.add(pos)
                            colorPixel(pixelPos)
                            //expand({x: x-1, y: y-1})
                            expand({x: x, y: y-1})
                            //expand({x: x+1, y: y-1})
                            expand({x: x-1, y: y})
                            expand({x: x+1, y: y})
                           // expand({x: x-1, y: y+1})
                            expand({x: x, y: y+1})
                           // expand({x: x+1, y: y+1})
                        }
                    }
                    */
                    
                    while(pixelStack.length)
                    {
                      var newPos, x, y, pixelPos, reachLeft, reachRight;
                      newPos = pixelStack.pop();
                      x = newPos[0];
                      y = newPos[1];

                      pixelPos = (y*canvasWidth + x) * 4;
                      while(y-- >= 0 && matchStartColor(pixelPos))
                      {
                        pixelPos -= canvasWidth * 4;
                      }
                      pixelPos += canvasWidth * 4;
                      ++y;
                      reachLeft = false;
                      reachRight = false;
                      var starty = null;
                      while(y++ < canvasHeight-1 && matchStartColor(pixelPos))
                      {
                        colorPixel(pixelPos);
                        if(!starty){
                            starty = y;
                        }
                        if(x > 0)
                        {
                          if(matchStartColor(pixelPos - 4))
                          {
                            if(!reachLeft){
                              pixelStack.push([x - 1, y]);
                              reachLeft = true;
                            }
                          }
                          else if(reachLeft)
                          {
                            reachLeft = false;
                          }
                        }

                        if(x < canvasWidth-1)
                        {
                          if(matchStartColor(pixelPos + 4))
                          {
                            if(!reachRight)
                            {
                              pixelStack.push([x + 1, y]);
                              reachRight = true;
                            }
                          }
                          else if(reachRight)
                          {
                            reachRight = false;
                          }
                        }

                        pixelPos += canvasWidth * 4;
                      }

                      fillup.add({x:x, y:starty}, y-starty)
                    }
                    

                    drawer.ctx.putImageData(colorLayer, 0, 0);

                    function hexToRgb(hex) {
                        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return result ? {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                        } : null;
                    }

                    function matchStartColor(pixelPos)
                    {
                      var r = colorLayer.data[pixelPos];
                      var g = colorLayer.data[pixelPos+1];
                      var b = colorLayer.data[pixelPos+2];

                      return (r == startCol.data[0] && g == startCol.data[1] && b == startCol.data[2]);
                    }

                    function colorPixel(pixelPos)
                    {
                      colorLayer.data[pixelPos] = hexToRgb(drawer.currentSettings().color).r;
                      colorLayer.data[pixelPos+1] = hexToRgb(drawer.currentSettings().color).g;
                      colorLayer.data[pixelPos+2] = hexToRgb(drawer.currentSettings().color).b;
                      colorLayer.data[pixelPos+3] = 255;
                    }

                    break;
                case drawer.availableShapes.MOVE:
                    // TODO
                    break;
            }
        }
    );
    // endregion

    // region Mouse move
    drawer.canvas.addEventListener('mousemove',
        /**
         * If any shape other than text is being drawn, we resize it.
         *
         * @param mouseEvent The event that trigger this callback
         */
        function (mouseEvent) {
            if (drawer.selectedElement && drawer.selectedShape !== drawer.availableShapes.DrawnText) {
                drawer.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
                drawer.redraw();
            }
        }
    );
    // endregion

    // region Mouse up
    document.addEventListener('mouseup',
        /**
         * If any element is being drawn and it's not text, then
         * we store it when the mouse is released.
         *
         * @param mouseEvent  The event that trigger this callback
         */
        function (mouseEvent) {
            //if (drawer.selectedElement && drawer.selectedShape !== drawer.availableShapes.DrawnText) {
            if (drawer.selectedElement) {
                drawer.shapePush(drawer.selectedElement);
                drawer.selectedElement = null;
                drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                drawer.drawResult();
            }
        }
    );
    // endregion
    // endregion

    // region Key events
    /**
     * If we are drawing a text and we press Enter, then
     * we store the text and stop drawing it. Otherwise the
     * key pressed is added to it.
     *
     * @param key A key that was pressed
     */
    function textKeyPress(key) {
        if (key === 'Enter') {
            drawer.shapePush(drawer.selectedElement);
            drawer.selectedElement = null;
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
        } else {
            drawer.selectedElement.resize(key);
            drawer.redraw();
        }
    }

    document.addEventListener('keypress',
        /**
         * If a key is pressed, we first check to see if a text
         * is being drawn and if so, handle that accordingly. If
         * not, we check for undo and redo combos.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            if (drawer.selectedShape === drawer.availableShapes.DrawnText && drawer.selectedElement) {
                textKeyPress(evt.key);
            } else if (evt.key.toUpperCase() === 'Z' && evt.ctrlKey) {
                if (evt.shiftKey) {
                    drawer.redo();
                } else {
                    drawer.undo();
                }
            }
        }
    );
    // endregion

    // region OnClick events

    // region Undo and Redo
    // Undo and redo can also be done from the navigation bar by clicking icons
    document.getElementById('btn-undo').addEventListener('click', drawer.undo);
    document.getElementById('btn-redo').addEventListener('click', drawer.redo);
    // endregion

    // region Select element
    // Add click events to the shape part of our navigation bar
    document.querySelectorAll('#shape-list li').forEach(
        /**
         * Foreach function that is applied to all elements from the query selector.
         *
         * @param elem The current element of the query selector
         */
        function (elem) {
            elem.addEventListener('click',
                /**
                 * If the shape is changed, we begin by checking to see
                 * if the previous one was a text and if so, store it as is.
                 * Then we change the selected shape and toggle the DOM element
                 * class list for the class active, for both the previously selected
                 * DOM and the new one.
                 *
                 * @param evt The event that triggered this callback
                 */
                function (evt) {
                    let clickedShape = elem.dataset.shape;
                    if (clickedShape !== drawer.selectedShape) {
                        if (drawer.selectedElement && drawer.selectedShape === drawer.availableShapes.DrawnText) {
                            drawer.shapePush(drawer.selectedElement);
                            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                        }
                        drawer.selectedElement = null;
                        drawer.selectedShape = clickedShape;

                        document.querySelectorAll('#shape-list li.active')[0].classList.toggle('active');
                        elem.classList.toggle('active');
                    }
                }
            );
        }
    );
    // endregion

    // region Filled setting
    // On click event for the star (which is either filled or not)
    let filled = document.getElementById('fill-toggle');
    console.log(filled.firstChild);
    filled.addEventListener('click',
        /**
         * A boolean value for filled is toggled by clicking
         * the star and the glyph is toggled as well, between
         * a filled star and a hollow one.
         *
         * @param evt The event that triggered this callback.
         */
        function (evt) {
            filled.firstElementChild.classList.toggle('far');
            filled.firstElementChild.classList.toggle('fas');
            if (filled.dataset['filled'] === 'no') {
                filled.dataset['filled'] = 'yes';
                drawer.settings.filled = true;
            } else {
                filled.dataset['filled'] = 'no';
                drawer.settings.filled = false;
            }
        }
    );
    // endregion

    // region Color picker
    // HTML5 color picker, black by default
    let colorPicker = document.getElementById('color-selector');
    colorPicker.value = '#000000';
    colorPicker.addEventListener('change',
        /**
         * Set the color settings to the chosen color.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            drawer.settings.color = colorPicker.value;
        }
    );
    // endregion

    // region Size settings
    // region Line width
    // The DOM elements within the modal belonging to line width
    let widthSetting = document.getElementById('width-row');
    let widthDecrease = widthSetting.querySelectorAll('td > a.decrease')[0];
    let widthIncrease = widthSetting.querySelectorAll('td > a.increase')[0];
    let widthValue = widthSetting.querySelectorAll('td.value-data')[0];
    widthDecrease.addEventListener('click',
        /**
         * Decrease the value of the text node down to a minimum of 1.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthValue.innerHTML = Math.max(1, parseInt(widthValue.innerHTML) - 1);
        }
    );
    widthIncrease.addEventListener('click',
        /**
         * Increase the value of the text node up to a maximum of 50.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthValue.innerHTML = Math.min(50, parseInt(widthValue.innerHTML) + 1);
        }
    );
    // endregion

    // region Font size
    // The DOM elements within the modal belonging to font size
    let fontSetting = document.getElementById('font-row');
    let fontDecrease = fontSetting.querySelectorAll('td > a.decrease')[0];
    let fontIncrease = fontSetting.querySelectorAll('td > a.increase')[0];
    let fontValue = fontSetting.querySelectorAll('td.value-data')[0];
    fontDecrease.addEventListener('click',
        /**
         * Decrease the value of the text node down to a minimum of 6.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            fontValue.innerHTML = ((s) => Math.max(6, parseInt(s.slice(0, s.length - 2)) - 1) + 'pt')(fontValue.innerHTML);
        }
    );
    fontIncrease.addEventListener('click',
        /**
         * Increase the value of the text node up to a maximum of 42.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            fontValue.innerHTML = ((s) => Math.min(42, parseInt(s.slice(0, s.length - 2)) + 1) + 'pt')(fontValue.innerHTML);
        }
    );
    // endregion

    // region Modal
    let sizeModal = document.getElementById('size-modal');
    // DOM elements that will cancel the changes made to line width and font size
    let sizeAbort = sizeModal.querySelectorAll('button.abort');
    for (let i = 0; i < sizeAbort.length; i++) {
        sizeAbort[i].addEventListener('click',
            /**
             * Change the text nodes back to the value they had
             * when the modal was opened (the actual value is
             * stored in a data set within the node).
             *
             * @param evt The event that triggered this callback
             */
            function (evt) {
                widthValue.innerHTML = widthSetting.dataset['value'];
                fontValue.innerHTML = fontSetting.dataset['value'];
            }
        );
    }
    // The DOM element that will confirm the changes made to line width and font size
    sizeModal.querySelectorAll('button.confirm')[0].addEventListener('click',
        /**
         * Update both the data set containing the actual value
         * and the settings object in our drawer.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthSetting.dataset['value'] = widthValue.innerHTML;
            drawer.settings.width = parseInt(widthValue.innerHTML);
            fontSetting.dataset['value'] = fontValue.innerHTML;
            drawer.settings.font =  fontValue.innerHTML + ' ' + drawer.settings.font.split(' ')[1];
        }
    );
    // endregion
    // endregion

    // region FILE IO
    // region Save
    /**
     * Creates a json object and from it a file blob. The json object
     * additionally adds types of the shapes it holds since json does
     * not store functions.
     *
     * @returns {Blob} A file blob with all the shapes in a json format.
     */
    function createJsonBlob() {
        let lst = [];
        for (let i = 0; i < drawer.shapes.length; i++) {
            let tmp = JSON.parse(JSON.stringify(drawer.shapes[i]));
            tmp['type'] = drawer.shapes[i].__proto__.constructor.name;
            lst.push(tmp);
        }
        return new Blob([JSON.stringify(lst)], {type: 'application/json'});
    }

    /**
     * Create a temporary anchor to download a blob, click it
     * and then remove it.
     */
    function saveAsJsonFile() {
        let tmp = window.document.createElement('a');
        tmp.href = window.URL.createObjectURL(createJsonBlob());
        tmp.download = 'image.json';
        document.body.appendChild(tmp);
        tmp.click();
        document.body.removeChild(tmp);
    }

    // Add download event for anchor in navigation bar.
    //document.getElementById('img-save').addEventListener('click', saveAsJsonFile);
    // endregion

    // region Load
    /**
     * Convert a json object to its corresponding shape
     * and add it to the list of shapes to draw.
     *
     * @param jsonShape Json equivalent of a shape
     */
    function createShapeFromJson(jsonShape) {
        switch (jsonShape.type) {
            case 'Rectangle':
                drawer.shapePush(new Rectangle(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.width,
                    jsonShape.height
                ));
                break;
            case 'Oval':
                drawer.shapePush(new Oval(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.xRadius,
                    jsonShape.yRadius
                ));
                break;
            case 'Circle':
                drawer.shapePush(new Circle(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.xRadius
                ));
                break;
            case 'Line':
                drawer.shapePush(new Line(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.endPosition
                ));
                break;
            case 'LineList':
                let ll = new LineList(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.xList.length; j++) {
                    ll.resize(jsonShape.xList[j], jsonShape.yList[j]);
                }
                drawer.shapePush(ll);
                break;
            case 'DrawnText':
                let dt = new DrawnText(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.chars.length; j++) {
                    dt.resize(jsonShape.chars[j]);
                }
                drawer.shapePush(dt);
                break;
        }
    }

    /**
     * Parses the json object, which should be an
     * array of shape objects. Also restarts the
     * canvas and redraws it.
     *
     * @param e On file loaded event
     */
    function constructShapesFromFile(e) {
        let contents = e.target.result;
        let tmpList = JSON.parse(contents);
        drawer.selectedElement = null;
        drawer.shapes.splice(0, drawer.shapes.length);
        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
        for (let i = 0; i < tmpList.length; i++) {
            createShapeFromJson(tmpList[i]);
        }
        drawer.redraw();
    }

    /**
     * Uses the first file (if multiples), reads
     * it and adds a callback for the event of
     * being done reading it.
     *
     * @param evt The event of uploading a file.
     */
    function uploadFile(evt) {
        let file = evt.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.addEventListener('load', function(){
            var url = window.URL || window.webkitURL
            var src = url.createObjectURL(file);
            var img = new Image();
            img.src = src;
            img.onload = function() {
                drawer.bgimg.src = img.src
                drawer.ctx.drawImage(img, 0, 0, drawer.ctx.canvas.width, drawer.ctx.canvas.height);
                url.revokeObjectURL(src);
            }
        });
        reader.readAsText(file);
    }

    /**
     * Create temporary file input node, click it
     * and handle the event for uploading one.
     * Then it will be removed.
     */
    function createTemporaryFileLoader() {
        let inp = window.document.createElement('input');
        inp.type = 'file';
        document.body.appendChild(inp);
        inp.style.visibility = "hidden";
        inp.addEventListener('change', uploadFile, false);
        inp.click();
        document.body.removeChild(inp);
    }

    // Add upload event for anchor in navigation bar.
    document.getElementById('img-load').addEventListener('click', createTemporaryFileLoader);
    // endregion


    function setImage(evt) {
        let file = evt.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.addEventListener('load', function(){
            var url = window.URL || window.webkitURL
            var src = url.createObjectURL(file);
            var img = new Image();
            img.src = src;
            img.onload = function() {
                drawer.selectedimg[drawer.currentSettings().color]=img;
                drawer.drawResult();
            }
        });
        reader.readAsText(file);
    }

    /**
     * Create temporary file input node, click it
     * and handle the event for uploading one.
     * Then it will be removed.
     */
    function createTemporaryFileLoader2() {
        // let inp = window.document.createElement('input');
        // inp.type = 'file';
        // document.body.appendChild(inp);
        // inp.style.visibility = "hidden";
        // inp.addEventListener('change', setImage, false);
        // inp.click();
        // document.body.removeChild(inp);
    }

    // document.getElementById('img-select').addEventListener('click', createTemporaryFileLoader2);


    // load object list images of selected button
    function loadObjectImages(name) {
        console.log("Clicked!");
        
        // <label>
        //     <input type="radio" name="test" value="small" checked>
        //     <img src="data:image/png;base64, <base64>" height="128">
        // </label>
        makeLabel = function(idx, img) {
            let newLab = document.createElement('label');
            let newInput = document.createElement('input');
            newInput.setAttribute('type', 'radio');
            newInput.setAttribute('name', name+"_radio");
            newInput.setAttribute('value', idx);
            let newImg = document.createElement('img');
            newImg.setAttribute('src', 'data:image/png;base64, '+img);
            newImg.setAttribute('height', '128');
            newLab.appendChild(newInput);
            newLab.appendChild(newImg);
            return newLab;
        }

        let imgList = document.getElementById('object-images');
        imgList.innerText = '';

        $.ajax({
            url:'/obj/get/'+name+'?from=0&to=-1',
            type:'GET',
            success:function(data){
                jsonData = JSON.parse(data);
                if (jsonData.error) {
                    if (jsonData.error.code == "ENOENT")
                        imgList.innerText = name + ' : no such class exists';
                    else if (jsonData.error.code == "EOUTOFBOUND")
                        imgList.innerText = name + ' : no images found';
                    else 
                        imgList.innerText = 'Unknown Error Occured! :(';
                    return;
                }
                // For now, paste all images
                // TODO : Use lazy loading
                for (i in jsonData.data) {
                    imgList.appendChild(makeLabel(i, jsonData.data[i]));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERR!");
                console.log(errorThrown);
            }
        });
    }

    function objectSelected() {
        $("#selected-object")[0].innerHTML = $(this)[0].innerText + "   <span class=\"caret\"></span>";
        loadObjectImages($(this)[0].innerText);
    }

    // get object list and make dropdown option (e.g. chiken, cup, ...)
    function getObjectList() {
        // dropdown list
        var list = document.getElementById('object-list');
        list.textContent = '';

        let makeDropdownOption = function(content, link) {
            let newItem = document.createElement('a');
            newItem.setAttribute('role', 'menuitem');
            newItem.setAttribute('tabindex', '-1');
            newItem.setAttribute('href', link);
            newItem.innerText = content;
            let listItem = document.createElement('li');
            listItem.setAttribute('role', 'presentation');
            listItem.appendChild(newItem);
            return listItem;
        }
        
        // dummy option
        list.appendChild(makeDropdownOption("Loading...", "#!"));

        // get option list from server
        $.ajax({
            url:'/obj/list',
            type:'GET',
            success:function(data){
                list.textContent = '';
                const obj = JSON.parse(data);
                
                for (var names of obj.list) {
                    list.appendChild(makeDropdownOption(names, "#!"));
                }

                // add event listener for 
                $('#object-list a').on('click', objectSelected);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERR!");
                console.log(errorThrown);

            }
        });
    }

    $('#object-modal').on('show.bs.modal', getObjectList);

    function setImage2() {
        var checked = $('#object-images input[type=radio]:checked');
        if (!checked) {
            return;
        }
        var img = checked.next()[0];
        drawer.selectedimg[drawer.currentSettings().color]=img;
        drawer.drawResult();
        $('#object-modal').modal('hide');
    }

    $('#upload-image').on('click', setImage2);

    let layerList = $('#layer-table > tbody')[0];
    let sortableLayer = Sortable.create(layerList, {
        onEnd: function() {
            var order = this.toArray().map(Number);
            drawer.layerOrder = Array.from(order);
            console.log(drawer.layerOrder);
            drawer.display();
        }
    });

    // region New image
    document.getElementById('img-clear').addEventListener('click',
        /**
         * Restart the drawing.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            drawer.selectedElement = null;
            drawer.shapes.splice(0, drawer.shapes.length);
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
            drawer.redraw();
        }
    );
    // endregion
    // endregion
    // endregion

})();
