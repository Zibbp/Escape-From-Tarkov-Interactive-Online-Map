fabric.Arrow = fabric.util.createClass(fabric.Line, {

    type: 'Arrow',

    initialize: function(element, options) {
        options || (options = {});
        this.callSuper('initialize', element, options);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'));
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        if (this.width === 0 || this.height === 0 || !this.visible) return;

        ctx.save();

        let xDiff = this.x2 - this.x1;
        let yDiff = this.y2 - this.y1;
        let angle = Math.atan2(yDiff, xDiff);
        ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-2, 10);
        ctx.lineTo(-2, -10);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();

        ctx.restore();
    }
});

fabric.Arrow.fromObject = function(object, callback) {
    callback && callback(new fabric.Arrow([object.x1, object.y1, object.x2, object.y2], object));
};

fabric.Arrow.async = true;