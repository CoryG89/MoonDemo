$(function () {
    /** Core scene components and other important globals */
    var camera, controls, scene, renderer;
    var clock, time;

    /** Constant Settings */
    var WEBGL_REQUIRED = true;

    /** Dynamic flags */
    var webglEnabled = false;
    var hudVisible = true;

    /** Skybox variables */
    var skybox, texCube;
    var urlPrefix = "img/starfield/";
    var urls = [urlPrefix + "front.png", urlPrefix + "back.png",
                urlPrefix + "left.png", urlPrefix + "right.png",
                urlPrefix + "top.png", urlPrefix + "bottom.png"];

    /** Moon variables */
    var mapPath = 'img/maps/moon.jpg';
    var moon, moonTex, shaderMat, uniforms;

    /** Global vector representing the light source in-scene, ie 'The Sun' */
    var lightPosition = new THREE.Vector3(0, 0, 0);

    /** This function is responsible for loading all assets and files
        from storage before calling the init function and animating */
    $(window).load(function () {
        moonTex = THREE.ImageUtils.loadTexture(mapPath, null, function () {
            createMoon();
            texCube = THREE.ImageUtils.loadTextureCube(urls, null, function () {
                createSkybox();
                animate();
            });
        });
        init();
    });

    var createMoon = function () {
        /** Uniform variables passed into both vertex and fragment shaders,
            uniforms stay constant throughout each frame. */
        uniforms = {
            lightPosition: { type: "v3", value: lightPosition },
            texture: { type: "t", value: 0, texture: moonTex },
            uvScale: { type: "v2", value: new THREE.Vector2(1.0, 1.0) }
        };

        /** Three.JS ShaderMaterial object accepts a reference to the object
            which holds our uniforms, these are passed to the vertex and
            fragment shaders, which are also loaded via jQuery here */
        shaderMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: $('#vertexShader').text(),
            fragmentShader: $('#fragmentShader').text()
        });

        /** Create the geometry for our moon */
        var radius = 100;
        var xSegments = 50;
        var ySegments = 50;
        var sphere = new THREE.SphereGeometry(radius, xSegments, ySegments);

        /** Finally combine our shader material and geometry to create
            our moon mesh, make sure the normals are computed for the
            shader and add it to the scene. */
        moon = new THREE.Mesh(sphere, shaderMat);
        moon.geometry.computeVertexNormals;
        moon.geometry.computeFaceNormals();
        moon.position.set(0, 0, 0);
        scene.add(moon);
    }

    var createSkybox = function () {

        /** Use the cube shader included with the Three.JS */
        var cubeShader = THREE.ShaderUtils.lib["cube"];
        cubeShader.uniforms["tCube"].texture = texCube;

        /** Create a Three.JS ShaderMaterial for the skycube using the
            cube shaders uniforms, fragment shader, and vertex shader */
        var spaceMat = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms
        });

        /** Create the cube geometry for use in our skycube */
        var size = 15000;
        var cube = new THREE.CubeGeometry(size, size, size);

        /** Create the skybox mesh using our newly created material and geometry
            and invert it so that the material is on the inside of the cube */
        skybox = new THREE.Mesh(cube, spaceMat);
        skybox.flipSided = true;
        scene.add(skybox);
    };

    function init() {

        /** Check browser support, display message if needed */
        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true
            });
            webglEnabled = true; // set flag 
        }
        else if (WEBGL_REQUIRED) {
            Detector.addGetWebGLMessage();
        }
        else {
            renderer = new THREE.CanvasRenderer();
            webglEnabled = false; // set flag 
        }

        /** Initialize our renderer and inject it into our container element */
        renderer.setClearColorHex(0x000000, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        $('#container').append(renderer.domElement);

        /** Create a new Three.JS scene object */
        scene = new THREE.Scene();

        /** Create virtual camera, set position, add to scene */
        camera = new THREE.PerspectiveCamera(35,
            window.innerWidth / window.innerHeight, 1, 65536);
        camera.position.set(0, 0, 800);
        scene.add(camera);

        /** Initialize the trackball controls with our camera */
        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 0.5;
        controls.dynamicDampingFactor = 0.5;

        /** Initialize Stats.js FPS display */
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        $("#hud").append(stats.domElement);

        /** Output renderer type used to the inlineDoc at bottom of HUD */
        if (webglEnabled) $('#inlineDoc').append('WebGL Renderer');
        else $('#inlineDoc').append('Canvas Renderer');

        /** Bind jQuery event handlers */
        $(document).on('keydown', onDocumentKeyDown);
        $(window).on('resize', onWindowResize);

        /** Start the clock */
        clock = new THREE.Clock();
    }


    /** Our main animation loop implemented as a function that has a callback
        through the below function which is implemented by modern browsers */
    function animate() {

        /** Callback to requestAnimFrame, optimized for modern browsers */
        requestAnimationFrame(animate);

        /** Request a new time sample from our clock */
        time = clock.getElapsedTime();

        /** Light source will orbit around around the moon at a given distance
            on the XY-plane, giving the effect of the moon changing phases */
        var speed = 0.1;
        var distance = 1000;
        lightPosition.x = moon.position.x + distance * Math.sin(time * -speed);
        lightPosition.z = moon.position.z + distance * Math.cos(time * speed);
        lightPosition.normalize();

        /** Call updates to various other components */
        controls.update(camera);
        stats.update();

        /** Render a new frame only after calculating animation logic */
        renderer.render(scene, camera);
    }

    /** Event handler for the document object's 'keydown' event */
    function onDocumentKeyDown(event) {
        event.preventDefault();
        switch (event.keyCode) {
            case 'H'.charCodeAt(0):
                if (hudVisible) {
                    $('#hud').css('visibility', 'hidden');
                    hudVisible = false;
                }
                else {
                    $('#hud').css('visibility', 'visible');
                    hudVisible = true;
                }
                break;
            case 'F'.charCodeAt(0):
                if (THREEx.FullScreen.available()) THREEx.FullScreen.toggle();
                break;
            case 'P'.charCodeAt(0):
                THREEx.Screenshot.takeScreen(renderer);
                break;
        }
    }

    /** Event handler for the window object's 'resize' event */
    function onWindowResize() {

        /** Update renderer size to match window on resize */
        renderer.setSize(window.innerWidth, window.innerHeight);

        /** Update the aspect ratio and projection matrix */
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});