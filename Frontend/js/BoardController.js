CHECKERS.BoardController = function (options) {
    'use strict';
    
    options = options || {};
    
    /**********************************************************************************************/
    /* Private properties *************************************************************************/

    /**
     * The DOM Element in which the drawing will happen.
     * @type HTMLDivElement
     */
    var containerEl = options.containerEl || null;
    
    /** @type String */
    var assetsUrl = options.assetsUrl || '';
    
    /** @type THREE.WebGLRenderer */
    var renderer;

    /** @type THREE.Scene */
    var scene;
    
    /** @type THREE.PerspectiveCamera */
    var camera;
    
    /** @type THREE.OrbitControls */
    var cameraController;
    
	/** @type Object */
	var lights = {};
	    
	/** @type Object */
	var materials = {};
	
	/** @type THREE.Geometry */
	var pieceGeometry = null;
	
	/** @type THREE.Mesh */
	var boardModel;
	
	/** @type THREE.Mesh */
	var groundModel;
	
	/**
	 * The board square size.
	 * @type Number
	 * @constant
	 */
	var squareSize = 10;
	
	/**
     * The board representation.
     * @type Array
     */
    var board = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    var players=[];
    
    var cordinates=[[7.3,7],[7.3,6.2],[7.3,5.6],[7.3,4.9],[7.3,4.2],[7.3,3.5],[7.3,2.8],[7.3,2.1],[7.3,1.5],[7.3,0.8],[7.3,0],[6.2,-0.3],[5.6,-0.3],[4.9,-0.3],[4.2,-0.3],[3.5,-0.3],[2.8,-0.3],[2.1,-0.3],[1.4,-0.3],[0.7,-0.3],[0,-0.3],[-0.3,0.8],[-0.3,1.5],[-0.3,2.1],[-0.3,2.8],[-0.3,3.5],[-0.3,4.2],[-0.3,4.9],[-0.3,5.6],[-0.3,6.2],[-0.3,7],[0.7,7.3],[1.4,7.3],[2.1,7.3],[2.8,7.3],[3.5,7.3],[4.2,7.3],[4.9,7.3],[5.6,7.3],[6.2,7.3],[7,7.3]];
    /**********************************************************************************************/
    /* Public methods *****************************************************************************/
    
    /**
     * Draws the board.
     */
    this.drawBoard = function (callback) {
        initEngine();
        initLights();
        initMaterials();
        
        initObjects(function () {
            onAnimationFrame();
            
            callback();
        });
    };

    this.move= function (num,blocknum){

        players[num].position = boardToWorld(cordinates[blocknum]);
    }
    
    /**
     * Adds a piece to the board.
     * @param {Object} piece The piece properties.
     */
    this.addPiece = function (piece) {
	    var pieceMesh = new THREE.Mesh(pieceGeometry);
	    var pieceObjGroup = new THREE.Object3D();
	    //
	    if (piece.color === CHECKERS.WHITE) {
	        pieceObjGroup.color = CHECKERS.WHITE;
            pieceMesh.material = materials.whitePieceMaterial;
            
	    } else if(piece.color === CHECKERS.GREEN){
	        pieceObjGroup.color=CHECKERS.GREEN;
            pieceMesh.material = materials.greenPieceMaterial;
          
        }else{
            pieceObjGroup.color = CHECKERS.BLACK;
            pieceMesh.material = materials.blackPieceMaterial; 
        }
        pieceMesh.scale.x = 0.5; // SCALE
        pieceMesh.scale.y = 0.5; // SCALE
        pieceMesh.scale.z = 0.5; // SCALE
	 
	    // create shadow plane
	    var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(squareSize, squareSize, 1, 1), materials.pieceShadowPlane);
        shadowPlane.scale.x = 0.5; // SCALE
        shadowPlane.scale.y = 0.5; // SCALE
        shadowPlane.scale.z = 0.5; // SCALE
        shadowPlane.rotation.x = -90 * Math.PI / 180;

	    pieceObjGroup.add(pieceMesh);
	    pieceObjGroup.add(shadowPlane);
	 
	    pieceObjGroup.position = boardToWorld(piece.pos);
	 
	    //board[ piece.pos[0] ][ piece.pos[1] ] = pieceObjGroup;
        players.push(pieceObjGroup); 
        scene.add(pieceObjGroup);
        
	};
    
    
    /**********************************************************************************************/
    /* Private methods ****************************************************************************/

    /**
     * Initialize some basic 3D engine elements. 
     */
    function initEngine() {
        var viewWidth = containerEl.offsetWidth;
        var viewHeight = containerEl.offsetHeight;
        
        // instantiate the WebGL Renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(viewWidth, viewHeight);
        
        // create the scene
        scene = new THREE.Scene();
        
        // create camera
		camera = new THREE.PerspectiveCamera(35, viewWidth / viewHeight, 1, 1000);
		camera.position.set(squareSize * 4, 120, 120);
		cameraController = new THREE.OrbitControls(camera, containerEl);
		cameraController.center = new THREE.Vector3(squareSize * 4, 0, squareSize * 4);
        //
        scene.add(camera);
        
        containerEl.appendChild(renderer.domElement);
    }
    
    /**
     * Initialize the lights.
     */
	function initLights() {
	    // top light
        lights.topLight = new THREE.PointLight();
        lights.topLight.position.set(squareSize * 4, 150, squareSize * 4);
        lights.topLight.intensity = 0.4;
        
        // white's side light
        lights.whiteSideLight = new THREE.SpotLight();
        lights.whiteSideLight.position.set( squareSize * 4, 100, squareSize * 4 + 200);
        lights.whiteSideLight.intensity = 0.8;
        lights.whiteSideLight.shadowCameraFov = 55;

        // black's side light
        lights.blackSideLight = new THREE.SpotLight();
        lights.blackSideLight.position.set( squareSize * 4, 100, squareSize * 4 - 200);
        lights.blackSideLight.intensity = 0.8;
        lights.blackSideLight.shadowCameraFov = 55;
        
        // light that will follow the camera position
        lights.movingLight = new THREE.PointLight(0xf9edc9);
        lights.movingLight.position.set(0, 10, 0);
        lights.movingLight.intensity = 0.5;
        lights.movingLight.distance = 500;
        
        // add the lights in the scene
        scene.add(lights.topLight);
        scene.add(lights.whiteSideLight);
        scene.add(lights.blackSideLight);
        scene.add(lights.movingLight);
	}
	
	/**
     * Initialize the materials.
     */
	function initMaterials() {
	    // board material
	    materials.boardMaterial = new THREE.MeshLambertMaterial({
	        map: THREE.ImageUtils.loadTexture(assetsUrl + 'monopoly.jpg')
	    });
	 
	    // ground material
	    materials.groundMaterial = new THREE.MeshBasicMaterial({
	        transparent: true,
	        map: THREE.ImageUtils.loadTexture(assetsUrl + 'ground.png')
	    });
	 
	    // dark square material
	    materials.darkSquareMaterial = new THREE.MeshLambertMaterial({
	        map: THREE.ImageUtils.loadTexture(assetsUrl + 'square_dark_texture.jpg')
	    });
	    //
	    // light square material
	    materials.lightSquareMaterial = new THREE.MeshLambertMaterial({
	        map: THREE.ImageUtils.loadTexture(assetsUrl + 'square_light_texture.jpg')
	    });
	 
	    // white piece material
	    materials.whitePieceMaterial = new THREE.MeshPhongMaterial({
	        color: 0xe9e4bd,
	        shininess: 20
	    });
	 
	    // black piece material
	    materials.blackPieceMaterial = new THREE.MeshPhongMaterial({
	        color: 0x9f2200,
	        shininess: 20
        });
        
        materials.greenPieceMaterial = new THREE.MeshPhongMaterial({
	        color: 0x45d95e,
	        shininess: 20
	    });
        
	    // pieces shadow plane material
	    materials.pieceShadowPlane = new THREE.MeshBasicMaterial({
	        transparent: true,
	        map: THREE.ImageUtils.loadTexture(assetsUrl + 'piece_shadow.png')
	    });
	}
    
    /**
     * Initialize the objects.
     * @param {Object} callback Function to call when the objects have been loaded.
     */
	function initObjects(callback) {
	    var loader = new THREE.JSONLoader();
	    var totalObjectsToLoad = 2; // board + the piece
	    var loadedObjects = 0; // count the loaded pieces
	 
	    // checks if all the objects have been loaded
	    function checkLoad() {
	        loadedObjects++;
	 
	        if (loadedObjects === totalObjectsToLoad && callback) {
	            callback();
	        }
	    }
	 
	    // load board
	    loader.load(assetsUrl + 'xboard.js', function (geom) {
			
			boardModel = new THREE.Mesh(geom, materials.boardMaterial);
			//boardModel.scale.set( 100, 500, 1,1 );
	        boardModel.position.y = -0.02;
	 
	        scene.add(boardModel);
	 
	        checkLoad();
	    });
	 
	    // load piece
	    loader.load(assetsUrl + 'piece.js', function (geometry) {
            
	        pieceGeometry = geometry;
	 
	        checkLoad();
	    });
	    
	    // add ground
		groundModel = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), materials.groundMaterial);
		groundModel.position.set(squareSize * 4, -1.52, squareSize * 4);
		groundModel.rotation.x = -90 * Math.PI / 180;
		//
		scene.add(groundModel);
		 
		// create the board squares
		var squareMaterial;
		//
		for(var i=0;i<5;i++){

		}
	
	 
	    //scene.add(new THREE.AxisHelper(200));
	}
    
    /**
     * The render loop.
     */
    function onAnimationFrame() {
        requestAnimationFrame(onAnimationFrame);
        
        cameraController.update();
        
        // update moving light position
        lights.movingLight.position.x = camera.position.x;
        lights.movingLight.position.z = camera.position.z;
        
        renderer.render(scene, camera);
    }
    
    /**
     * Converts the board position to 3D world position.
     * @param {Array} pos The board position.
     * @returns {THREE.Vector3}
     */
    function boardToWorld (pos) {
	    var x = (1 + pos[1]) * squareSize - squareSize / 2;
	    var z = (1 + pos[0]) * squareSize - squareSize / 2;
	 
	    return new THREE.Vector3(x, 0, z);
	}
};

