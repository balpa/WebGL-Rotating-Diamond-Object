"use strict";

var canvas;
var gl;
var NumVertices  = 36;
var points = [];
var colors = [];

var axis = 0;
var theta = [ 0, 0, 0 ];
var thetaLoc;

var near = -1;
var far = 1;
var radius = 0.3;   // FOV
var theta2 = 0.0;
var phi = 0.0;
var dr = (5.0 * Math.PI) / 180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;



var eye;
const at = vec3(0.05, -0.05, 0.0);
const up = vec3(0.0, 1.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();
    colorCube2();

    window.onkeydown = function(event){
        var keyCode = event.keyCode;
        var key = String.fromCharCode(keyCode);
        if (key == "B"){
        	for (var i = 0; i < 10000; i ++){
        			phi += 0.002;
        		}
        }
        else{
        	switch(key){
            case "D":
                phi -= 0.05;
                break;
            case "A":
                phi += 0.05;
                break;
            case "W":
                theta2 += 0.05;
                break;
            case "S":
                theta2 -= 0.05;
                break;
            case "H":
                left += 0.02;
                right += 0.02;
                break;
            case "J":
                left -= 0.02;
                right -= 0.02;
                break;
            case "O":
                bottom -= 0.02;
                ytop -= 0.02;
                break;
            case "L":
                bottom += 0.02;
                ytop += 0.02;
                break;
        }}}

    window.onmousedown = function(event){     // Mouse click reset
    	phi = 0.0;
    	theta2 = 0.0;
    	left = -1.0;
		right = 1.0;
    }


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1, 0.1, 0.1, 0.5 );

    gl.enable(gl.DEPTH_TEST);
  

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
 
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");   // CAM
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    then = Date.now();

    render();
}

function colorCube() // Şeklin üst tarafındaki üçgen prizma
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function colorCube2() // Şeklin alt tarafındaki üçgen prizma
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.1, -0.1,  0.1, 1.0 ),
        vec4( -0.001,  0.25,  0.001, 1.0 ),
        vec4(  0.001,  0.25,  0.001, 1.0 ),
        vec4(  0.1, -0.1,  0.1, 1.0 ),
        vec4( -0.1, -0.1, -0.1, 1.0 ),
        vec4( -0.001,  0.25, -0.001, 1.0 ),
        vec4(  0.001,  0.25, -0.001, 1.0 ),
        vec4(  0.1, -0.1, -0.1, 1.0 )
    ];

    var vertices2 = [
        vec4( 0.1, -0.1,  -0.1, 1.0 ),
        vec4( 0.001,  -0.5,  -0.001, 1.0 ),
        vec4(  -0.001,  -0.25,  -0.001, 0.5 ),
        vec4(  -0.1, -0.1,  -0.1, 1.0 ),
        vec4( 0.1, -0.1, 0.1, 1.0 ),
        vec4( 0.001,  -0.25, 0.001, 0.5 ),
        vec4(  -0.001,  -0.25, 0.001, 0.5 ),
        vec4(  -0.1, -0.1, 0.1, 1.0 )
        ];

    

    var vertexColors = [
        [ 0.8, 0.0, 0.4, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 0.5, 0.0, 1.0 ],  // yellow
        [ 0.8, 0.0, 0.4, 1.0 ],  // green
        [ 1.0, 0.0, 0.0, 1.0 ],  // blue
        [ 1.0, 0.5, 0.0, 1.0 ],  // magenta
        [ 0.8, 0.0, 0.4, 1.0 ],  // cyan
        [ 1.0, 0.0, 0.0, 1.0 ]   // white
    ];

    var vertexColors2 = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.5, 0.0, 1.0 ],  // red
        [ 0.8, 0.0, 0.4, 1.0 ],  // yellow
        [ 0.8, 0.0, 0.4, 1.0 ],  // green
        [ 1.0, 0.5, 0.0, 1.0 ],  // blue
        [ 0.8, 0.0, 0.4, 1.0 ],  // magenta
        [ 1.0, 0.0, 0.0, 1.0 ],  // cyan
        [ 0.3, 0.2, 1.0, 1.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) { //üstteki şekil için
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[a] );
    }

    for ( var i = 0; i < indices.length; ++i ) { //alttaki şekil için
        points.push( vertices2[indices[i]] );
        colors.push( vertexColors2[a] );
    }
}
    
var then;
var key;

function render()
{
	var now = Date.now();     //DeltaTime Animation
	var deltaTime = now-then;

	if (key == "B"){
		deltaTime = 0;
	}
		if (phi < 6.3){            //animation trick
			phi += (deltaTime/2000000);

		if (phi > 6.3){
				phi = 0;}
		}

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius * Math.sin(phi) * Math.cos(theta2), radius * Math.sin(phi) * Math.sin(theta2), radius * Math.cos(phi));
    
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}
