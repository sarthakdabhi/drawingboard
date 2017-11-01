(function() {
	'use strict';

	// module
	angular
		.module('db', []);

	//controller
	angular
		.module('db') 
		.controller('DBCtrl', DBCtrl);

	DBCtrl.$inject = ['$scope'];

	function DBCtrl($scope) {
		var dbc = this;

		// variables
		dbc.appName = 'Drawing Board';
		dbc.canvas = new fabric.Canvas('drawingboard-canvas');
		dbc.canvas.setBackgroundColor('transparent', dbc.canvas.renderAll.bind(dbc.canvas));
		dbc.canvas.setHeight(480);
		dbc.canvas.setWidth(768);
		dbc.bgColor = 'red';
		dbc.borderColor = 'black';
		dbc.borderWidth	= 1;
		dbc.canvasBGCheck = true;
		dbc.canvasBGColor = '#000';
		dbc.opacitys = [{value: 1}, {value: 0.9}, {value: 0.8}, {value: 0.7}, {value: 0.6}, {value: 0.5}, {value: 0.4}, {value: 0.3}, {value: 0.2}, {value: 0.1}, {value: 0}];
		dbc.opacity = dbc.opacitys[0];
		dbc.text = '';
		dbc.fontFamilyList = ['arial', 'helvetica', 'myriad pro', 'delicious', 'verdana', 'georgia', 'courier', 'comic sans ms', 'impact', 'monaco', 'optima', 'hoefler text', 'plaster', 'engagement'];
		dbc.fontFamily = dbc.fontFamilyList[0];
		dbc.fontColor = '#000';
		dbc.fontStrokeColor = '#000';
		dbc.fontStrokeWidth = 1;
		dbc.fontSize = 24;
		dbc.fontBold = false;
		dbc.italic = false;
		dbc.underline = false;
		dbc.lineThrough = false;
		dbc.overline = false;
		dbc.textAlignList = ['left', 'center', 'right'];
		dbc.textAlign = dbc.textAlignList[0];
		dbc.textBackgroundColor = 'transparent';
		dbc.lineHeight = 1;

		$scope.$watch('dbc.canvasBGColor', function(current, original) {
		    if (current !== original) dbc.canvas.setBackgroundColor(current, dbc.canvas.renderAll.bind(dbc.canvas));
		});
		
		dbc.makeTransparent = function() {
			if (dbc.canvasBGCheck) dbc.canvas.setBackgroundColor('transparent', dbc.canvas.renderAll.bind(dbc.canvas));
		}

		// open modal
		dbc.openModal = function(id) {
			dbc.canvas.deactivateAll().renderAll();
			$('#' + id).modal('show');
		}

		// close modal
		dbc.closeModal = function(id) {
			$('#' + id).modal('hide');
		}

		// canvas selection
		dbc.selection = function(boolValue) {
			dbc.canvas.selection = boolValue;
		}

		// delete the selected object
		dbc.eventsOnCanvas = function() {

			$(document).on('keydown', function(e) {
				if(e.which === 8 || e.keyCode === 8) {

					var activeObject = dbc.canvas.getActiveObject(), activeGroup = dbc.canvas.getActiveGroup();
					if (activeObject) {
						$.confirm({
						    title: 'Are you sure?',
						    content: 'Do you want to delete selected object(s)?',
						    buttons: {
						        confirm: function () {
						            dbc.canvas.remove(activeObject);
						        },
						        cancel: function () {
						        	// 738 5257
						        }
						    }
						});
					}
					else if (activeGroup) {
						$.confirm({
						    title: 'Are you sure?',
						    content: 'Do you want to delete selected object(s)?',
						    buttons: {
						        confirm: function () {
							        var objectsInGroup = activeGroup.getObjects();
							        dbc.canvas.discardActiveGroup();
							        objectsInGroup.forEach(function(object) {
							        	dbc.canvas.remove(object);
							        });
						        },
						        cancel: function () {
						        	//
						        }
						    }
						});						
					}
				} 
			});

			document.getElementById('download').addEventListener('click', function() {
				dbc.canvas.deactivateAll().renderAll();
				dbc.downloadCanvas(this, 'drawingboard-canvas', 'canvas.png');
			}, false);
		}

		dbc.endDrawing = function() {
			dbc.canvas.isDrawingMode = false;
			dbc.selection(false);
			dbc.canvas.off('mouse:down');
			dbc.canvas.off('mouse:move');
			dbc.canvas.off('mouse:up');
			dbc.canvas.forEachObject(function(o) { o.setCoords() });			
		}

		dbc.addText	= function() {
			var text = new fabric.Text(dbc.text, { 
				left: 100,
				top: 100,
				fontFamily: dbc.fontFamily,
				fontSize: dbc.fontSize,
				fontWeight: (dbc.fontBold) ? 'bold' : 'normal',
				underline: dbc.underline,
				linethrough: dbc.lineThrough,
				overline: dbc.overline,
				fontStyle: (dbc.italic) ? 'italic' : '',
				textAlign: dbc.textAlign,
				textBackgroundColor: dbc.textBackgroundColor,
				lineHeight: dbc.lineHeight,
				fill: dbc.fontColor,
				stroke: dbc.fontStrokeColor,
				strokeWidth: dbc.fontStrokeWidth
			});
			dbc.canvas.add(text);
			dbc.text = '';
		}	

		dbc.drawCircle = function() {
			dbc.endDrawing();
			var circle, isDown, origX, origY;

			dbc.canvas.observe('mouse:down', function(o){
				isDown = true;
				var pointer = dbc.canvas.getPointer(o.e);
				origX = pointer.x;
				origY = pointer.y;
				circle = new fabric.Circle({
					left: pointer.x,
					top: pointer.y,
					radius: 1,
					strokeWidth: dbc.borderWidth,
					stroke: dbc.borderColor,
					fill: dbc.bgColor,
					selectable: true,
					originX: 'center', originY: 'center',
					opacity: dbc.opacity.value
				});
				dbc.canvas.add(circle);
			});

			dbc.canvas.observe('mouse:move', function(o){
				if (!isDown) return;
				var pointer = dbc.canvas.getPointer(o.e);
				circle.set({ radius: Math.abs(origX - pointer.x) });
				dbc.canvas.renderAll();
			});

			dbc.canvas.on('mouse:up', function(o){
				isDown = false;
				dbc.endDrawing();
			});
		}

		dbc.drawEllipse = function() {
			dbc.endDrawing();
			var ellip, isDown, origX, origY;

			dbc.canvas.observe('mouse:down', function(o){
				isDown = true;
				var pointer = dbc.canvas.getPointer(o.e);
				origX = pointer.x;
				origY = pointer.y;
				ellip = new fabric.Ellipse({
					left: pointer.x,
					top: pointer.y,
					strokeWidth: dbc.borderWidth,
					stroke: dbc.borderColor,
					fill: dbc.bgColor,
					selectable: true,
					originX: 'center', originY: 'center',
					rx: 5,
					ry: 1,
					opacity: dbc.opacity.value
				});
				dbc.canvas.add(ellip);
			});

			dbc.canvas.observe('mouse:move', function(o){
				if (!isDown) return;
				var pointer = dbc.canvas.getPointer(o.e);
				ellip.set({ rx: Math.abs(origX - pointer.x), ry: Math.abs(origY - pointer.y) });
				dbc.canvas.renderAll();
			});

			dbc.canvas.on('mouse:up', function(o){
				isDown = false;
				dbc.endDrawing();
			});
		}

		dbc.drawLine = function() {
			dbc.endDrawing();
			var line, isDown;

			dbc.canvas.on('mouse:down', function(o){
				isDown = true;
				var pointer = dbc.canvas.getPointer(o.e);
				var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
				line = new fabric.Line(points, {
					strokeWidth: dbc.borderWidth,
					fill: dbc.bgColor,
					stroke: dbc.borderColor,
					originX: 'center',
					originY: 'center',
					opacity: dbc.opacity.value
				});
				dbc.canvas.add(line);
			});

			dbc.canvas.on('mouse:move', function(o){
				if (!isDown) return;
				var pointer = dbc.canvas.getPointer(o.e);
				line.set({ x2: pointer.x, y2: pointer.y });
				dbc.canvas.renderAll();
			});

			dbc.canvas.on('mouse:up', function(o){
				isDown = false;
				dbc.endDrawing();				
			});			
		}

		dbc.drawRectangle = function() {
			dbc.endDrawing();
			var rect, isDown, origX, origY;

			dbc.canvas.observe('mouse:down', function(o){
				isDown = true;
				var pointer = dbc.canvas.getPointer(o.e);
				origX = pointer.x;
				origY = pointer.y;
				rect = new fabric.Rect({
					left: pointer.x,
					top: pointer.y,
					strokeWidth: dbc.borderWidth,
					stroke: dbc.borderColor,
					fill: dbc.bgColor,
					selectable: true,
					width: 1,
					height: 1,
					opacity: dbc.opacity.value
				});
				dbc.canvas.add(rect);
			});

			dbc.canvas.observe('mouse:move', function(o){
				if (!isDown) return;
				var pointer = dbc.canvas.getPointer(o.e);
				rect.set({ width: Math.abs(origX - pointer.x), height: Math.abs(origY - pointer.y) });
				dbc.canvas.renderAll();
			});

			dbc.canvas.on('mouse:up', function(o){
				isDown = false;
				dbc.endDrawing();
			});
		}

		dbc.drawTriangle = function() {
			dbc.endDrawing();
			var tri, isDown, origX, origY;

			dbc.canvas.observe('mouse:down', function(o){
				isDown = true;
				var pointer = dbc.canvas.getPointer(o.e);
				origX = pointer.x;
				origY = pointer.y;
				tri = new fabric.Triangle({
					left: pointer.x,
					top: pointer.y,
					strokeWidth: dbc.borderWidth,
					width:2,height:2,
					stroke: dbc.borderColor,
					fill: dbc.bgColor,
					selectable: true,
					originX: 'center',
					opacity: dbc.opacity.value
				});
				dbc.canvas.add(tri);
			});

			dbc.canvas.observe('mouse:move', function(o){
				if (!isDown) return;
				var pointer = dbc.canvas.getPointer(o.e);
				tri.set({ width: Math.abs(origX - pointer.x),height: Math.abs(origY - pointer.y)});
				dbc.canvas.renderAll();
			});

			dbc.canvas.on('mouse:up', function(o){
				isDown = false;
				dbc.endDrawing();
			});			
		}

		// to download the canvas, onclick on download button
		dbc.downloadCanvas = function(link, canvasId, filename) {
		    link.href = document.getElementById(canvasId).toDataURL();
		    link.download = filename;
		}

		dbc.eventsOnCanvas();

		$("#bg-color").spectrum({
			color: "#f00",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

		$("#border-color").spectrum({
			color: "#000",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

		$("#canvas-bg-color").spectrum({
			color: "#fff",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

		$("#font-color").spectrum({
			color: "#000",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

		$("#font-strock-color").spectrum({
			color: "#000",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

		$("#text-background-color").spectrum({
			color: "#000",
			change: function(color) {
				this.value = color.toHexString();
			}
		});

	}

})();