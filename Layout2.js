function LayoutItems(container)
{
    this.items = [];
    var item = container.firstChild;

    var style;
    if (container.currentStyle) {
        style = container.currentStyle;
    } else {
        style = window.getComputedStyle(container, null);
    }

    if (style.position !== "absolute") {
        container.style.position = "relative";
    }

    while(item) {
        if (item.nodeType === 1) {
            item.style.position = "absolute";
            this.items.push(item);
        }
        item = item.nextSibling;
    }

    this.padding = 0;
    if (this.items.length > 0) {
        var oldWidth = this.items[0].style.width;
        this.items[0].style.width = "0px";
        this.padding = this.items[0].offsetWidth;
        this.items[0].style.width = oldWidth;
    }

    this.length = this.items.length;
}

LayoutItems.prototype = {
    get: function(i) {
        return this.items[i];
    },

    setWidth: function(i, width) {
        this.items[i].style.width = "" + (width-this.padding) + "px";
    },

    getSize: function(i) {
        return {
            width: this.items[i].offsetWidth,
            height: this.items[i].offsetHeight
        }
    },

    moveTo: function(i, x, y) {
        this.items[i].style.left = "" + x + "px";
        this.items[i].style.top = "" + y + "px";
    },

    setCss: function(name, value) {
        for( var i = 0; i < this.items.length; i++ ) {
            this.items[i].style[name] = value;
        }
    }
};

function Layout(options)
{
    this.container = options.container;
    this.columnWidth = options.columnWidth || 200;
    this.margin = options.margin || 10;
    this.maxCols = options.maxCols || 0;
    this.fill = options.fill;
    this.items = new LayoutItems(options.container);
    this.items.setCss("-webkit-transition", "background 200ms, top 500ms, left 500ms, height 500ms");
    this.items.setCss("-moz-transition", "background 200ms, top 500ms, left 500ms, height 500ms");
    this.items.setCss("transition", "background 200ms, top 500ms, left 500ms, height 500ms");
    this.fills = [];
    this.go();

    var self = this;
    window.addEventListener("resize", function() {
        self.go();
    });
    window.addEventListener("load", function() {
        self.go();
    });
}

Layout.prototype = {
    go: function() {
        var i, j, col;
        //var scrollTop = document.body.scrollTop;
        for(i = 0; i < this.fills.length; i++) {
            this.container.removeChild(this.fills[i]);
        }
        this.fills.length = 0;

        // get the width of each column.
        var totalWidth = window.innerWidth;

        var numColumns = Math.floor((totalWidth - this.margin)/ (this.columnWidth +
                this.margin));

        var columnWidth = this.columnWidth;

        if (this.maxCols) {
            numColumns = Math.min(numColumns, this.maxCols);
        }


        if (this.margin*2+columnWidth > totalWidth || numColumns < 2) {
            columnWidth = totalWidth - this.margin * 2;   
            numColumns = 1;
        }

        var heights = [];

        for(i = 0; i < numColumns; i++) {
            heights.push(0);
        }

        for(i = 0; i < this.items.length; i++) {
            col = 0;
            cols = 1;
            if (this.items.get(i).className.indexOf("cols-2") >= 0 &&
                    columnWidth * 2 + 3 * this.margin < totalWidth) {
                cols = 2;
            }
            for(j = 1; j < heights.length; j++) {
                if (heights[j] < heights[col]) {
                    col = j;
                }
            }

            if ( cols > 1) {
                col = 0;
            }

            var x = col * (columnWidth + this.margin);
            var y = heights[col] + this.margin;
            this.items.setWidth(i, columnWidth * cols + (cols-1) *
                    this.margin);
            var height = this.items.getSize(i).height;
            for( j = 0; j < cols; j++ ) {
                heights[col+j] = y + height;
            }
            this.items.moveTo(i, x, y);
        }

        var maxHeight = heights[0];
        for(i = 1; i < heights.length; i++) {
            maxHeight = Math.max(maxHeight, heights[i]);
        }

        if (1 || this.fill) {
            var colours = ["#800", "#080", "#fc0", "#008"];

            for(i = 0; i < heights.length; i++) {
                if (heights[i] < maxHeight) {
                    var div = document.createElement("div");
                    var colour = colours[i % colours.length];
                    
                    div.style.position = "absolute";
                    div.style.background = colour;
                    div.style.top = "" + (heights[i] + this.margin) + "px";
                    div.style.left = "" + (i * (columnWidth + this.margin)) + "px";
                    div.style.width = "" + columnWidth + "px";
                    div.style.height = "" + (maxHeight - heights[i] -
                            this.margin) + "px";
                    this.container.appendChild(div);
                    this.fills.push(div);
                }
            }
        }

        this.container.style.width = "" + (numColumns * (columnWidth +
            this.margin) - this.margin) + "px";
        this.container.style.height = "" + (maxHeight) + "px";
        //console.log("Scrolltop was ", scrollTop);
        //console.log("Scrolltop now ", document.body.scrollTop);
    }
};


