var
	nodes = [],
	nodesCount = 50,
	canvasSize = 700,
	gridBuilder = document.body.classList.contains( 'grid-builder' ),
	gridBuilderErase = false,
	aStar, bgclr;

function setup() {
	bgclr = color(241,241,241);

	var
		canvas = createCanvas( canvasSize, canvasSize );
	// Node props
	Node.radius = Math.floor( canvasSize/( nodesCount + 1 ) );

	for ( var i = 0; i < nodesCount; i ++ ) {
		if ( ! nodes[i] ) {
			nodes[i] = [];
		}
		for ( var j = 0; j < nodesCount; j ++ ) {
			nodes[i][j] = new Node( i, j );
		}
	}

	aStar = new AStar( nodes, nodes[0][0], nodes[nodesCount - 1][nodesCount - 1] );
}

function draw() {
	background( bgclr );
	strokeWeight( 2 );
	stroke( '#000' );
	noFill();
	rect( 25, 25, 650, 650 );

	strokeWeight( Node.radius * .9 );

	if ( gridBuilder ) {
		drawGridBuilder();
	} else {
		drawAlgo();
	}
}

function drawGridBuilder() {
	var xy;
	for ( i = 0; i < nodesCount; i ++ ) {
		for ( j = 0; j < nodesCount; j ++ ) {
			xy = nodes[i][j].coords();
			if ( nodes[i][j].blocked ) {
				nodes[i][j].show( color( 0, 0, 0 ) );
			}
			if ( mouseIsPressed ) {
				if (
					Math.abs( mouseX - xy[0] ) < 7 &&
					Math.abs( mouseY - xy[1] ) < 7
				) {
					nodes[i][j].blocked = ! gridBuilderErase;
				}
			}
		}
	}

	aStar.end.show( '#e84393' );
	aStar.start.show( '#0984e3' );

	noStroke();
	fill( '#000' );
	textSize( 32 );
	textAlign( CENTER );
	xy = [ canvasSize/2, canvasSize + 34 ]
	text( 'Click to start', xy[0], xy[1] );
}

function drawAlgo() {
	// Do the algo suff
	var i, j, coords, message;

	if ( ! message ) {
		message = aStar.iterate();
	}

	for ( i = 0; i < aStar.openSet.length; i ++ ) {
		aStar.openSet[i].show( '#74b9ff' );
	}

	for ( i = 0; i < aStar.closedSet.length; i ++ ) {
		aStar.closedSet[i].show( '#b2bec3' );
	}

	for ( i = 0; i < nodesCount; i ++ ) {
		for ( j = 0; j < nodesCount; j ++ ) {
			if ( nodes[i][j].blocked ) {
				nodes[i][j].show( color( 0, 0, 0 ) );
			}
		}
	}

	aStar.end.show( '#e84393' );

	var parent = aStar.currentNode;
	stroke( '#0984e3' );
	strokeWeight( Node.radius * .3 );
	beginShape();
	while ( parent ) {
//		parent.show( bgclr );
		coords = parent.coords();
		vertex( coords[0], coords[1] );
		parent = parent.parent;
	}
	endShape();

	if ( message ) {
		noStroke();
		fill( '#000' );
		textSize( 32 );
		textAlign( CENTER );
		text( message, canvasSize/2, canvasSize + 34 );
		noLoop();
	}

}

function switchGridBuilder() {
	gridBuilder = ! document.body.classList.contains( 'grid-builder' );

	if ( gridBuilder ) {
		document.body.classList.add( 'grid-builder' );
		// Reset nodes
		for ( var i = 0; i < nodesCount; i ++ ) {
			for ( var j = 0; j < nodesCount; j ++ ) {
				nodes[i][j].parent = null;
				nodes[i][j].estimate = null;
				nodes[i][j].fromStart = null;
			}
		}
		// Reset aStar object
		aStar = new AStar( nodes, nodes[0][0], nodes[nodesCount - 1][nodesCount - 1] );
	} else {
		document.body.classList.remove( 'grid-builder' );
	}
	loop(); // Run loop
}

function switchDrawErase() {
	gridBuilderErase = ! gridBuilderErase;
	if ( gridBuilderErase ) {
		return alert( "Setting changed click to erase obstacles now." )
	} else {
		return alert( "Setting changed click will add obstacles again now." )
	}
}

function exportObstacles() {
	var data = [], fileName;

	for ( var i = 0; i < nodesCount; i ++ ) {
		data[i] = [];
		for ( var j = 0; j < nodesCount; j ++ ) {
			data[i][j] = nodes[i][j].blocked ? 1 : 0;
		}
	}

	data = JSON.stringify( data );

	fileName = prompt( 'What would you like to save this file as ?', 'Name' );


	if ( fileName === null ) {
		return alert( 'Okay, will not export obstacles data.' )
	}

	var a = document.createElement("a");
	var file = new Blob([data], {type: 'text/json'});
	a.href = URL.createObjectURL(file);
	a.download = fileName + '.json';
	a.click();
}

function importObstacles() {
	var data = prompt( 'Please paste in the contents from export file (JSON format).' );

	if ( data === null ) {
		return alert( 'Okay, will not import anything.' )
	}

	try {
		data = JSON.parse( data );
	} catch (e) {
		return alert( "Can't understand the data. Are you sure this is copied and pasted from an exported file ?" )
	}

	if ( ! data || ! data.length ) {
		return alert( "The data seems to represent something else which can't understand." )
	}

	for ( var i = 0; i < data.length; i ++ ) {
		if ( ! data[i] || ! data[i].length ) {
			return alert( 'Sorry, can\'t understand the data.' )
		}
		for ( var j = 0; j < data[i].length; j ++ ) {
			nodes[i][j].blocked = !! data[i][j];
		}
	}

	alert( 'Understood the data, let\'s see if it can be solved.' )
}

function clearObstacles() {
	var numObstacles = 0;
	for ( var i = 0; i < nodesCount; i ++ ) {
		for ( var j = 0; j < nodesCount; j ++ ) {
			if ( nodes[i][j].blocked ) numObstacles++;
		}
	}

	if ( ! numObstacles ) {
		return alert( 'Hmm, can\'t see any obstacles drawn. Not able to help you to clear anything else at the moment.' );
	}

	if ( ! confirm( 'Are you sure you want to remove all obstacles ?' ) ) {
		return alert( 'Okay, leaving everything as is.' );
	}
	for ( var i = 0; i < nodesCount; i ++ ) {
		for ( var j = 0; j < nodesCount; j ++ ) {
			nodes[i][j].blocked = 0;
		}
	}
	alert( 'All obstacles cleared.' );
}

function randomObstacles() {
	var percentage  = prompt( 'How many obstacles should be there per 100 nodes (percent probability of a blocked node) ?' );

	if ( percentage === null ) {
		return alert( "Okay, keeping obstacles as is." );
	}

	percentage = parseFloat( percentage );

	if ( isNaN( percentage )  ) {
		percentage = 25;
		alert( "Oops, couldn't quite understand. Gonna use 25% for now." );
	} else if ( percentage > 100 ) {
		alert( "Are you sure, probability and percentage can't be over 100." );
	} else if ( percentage > 90 ) {
		alert( "Hmm, this is going to be unsolvable. Maybe you want to draw path instead of draw obstacles." );
	} else if ( percentage > 70 ) {
		alert( "This one is probably going to be unsolvable. Let's try this." );
	} else if ( percentage > 45 ) {
		alert( "Woah, this one seems a bit difficult. Let's try this." );
	} else if ( percentage > 25 ) {
		alert( "Woah, this one looks good. Let's try this." );
	} else {
		alert( 'Aah, that looks easy.' )
	}

	for ( var i = 0; i < nodesCount; i ++ ) {
		for ( var j = 0; j < nodesCount; j ++ ) {
			nodes[i][j].blocked = random() < percentage / 100;
		}
	}
}