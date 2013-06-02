$(function () {
    var scene;
    var renderer;
    var camera;
    var controls;

    var clock;
    var time;

    var hud = {
        element: $('#hud'),
        toggle: function () {
            if (this.element.css('visibility') === 'visible')
                this.element.css('visibility', 'hidden');
            else
                this.element.css('visibility', 'visible');
        }
    };

    var moon = {

        radius: 100,
        xSegments: 50,
        ySegments: 50,
        init: function (textureMap, normalMap) {

            /** Uniform variables passed into both vertex and fragment shaders,
            uniforms stay constant throughout each frame. */
            var uniforms = {
                lightPosition: { type: 'v3', value: light.position },
                textureMap: { type: 't', value: textureMap },
                normalMap: { type: 't', value: normalMap },
                uvScale: { type: 'v2', value: new THREE.Vector2(1.0, 1.0) }
            };

            /** Three.JS ShaderMaterial object accepts a reference to the object
                which holds our uniforms, these are passed to the vertex and
                fragment shaders, which are also loaded via jQuery here */
            var shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: $('#vertexShader').text(),
                fragmentShader: $('#fragmentShader').text()
            });

            /** Create the geometry for our moon */
            var sphere = new THREE.SphereGeometry(
                this.radius,
                this.xSegments,
                this.ySegments
            );

            /** Finally combine our shader material and geometry to create
                our moon mesh, make sure the normals are computed for the
                shader and add it to the scene. */
            moon = new THREE.Mesh(sphere, shaderMaterial);
            moon.geometry.computeTangents();
            moon.position.set(0, 0, 0);
            moon.rotation.x = 180;
            scene.add(moon);
        }
    };

    var skybox = {

        size: 15000,

        init: function (texture) {
            /** Create a skybox using the built in cube shader */
            var cubemap = THREE.ShaderLib["cube"];
            cubemap.uniforms["tCube"].value = texture;

            /** Create a Three.JS ShaderMaterial for the skycube using the
                cube shaders uniforms, fragment shader, and vertex shader */
            var spaceMat = new THREE.ShaderMaterial({
                fragmentShader: cubemap.fragmentShader,
                vertexShader: cubemap.vertexShader,
                uniforms: cubemap.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            /** Create the cube geometry for use in our skycube */
            var cube = new THREE.CubeGeometry(this.size, this.size, this.size);

            /** Create the skybox mesh using our newly created material and geometry
                and invert it so that the material is on the inside of the cube */
            skybox = new THREE.Mesh(cube, spaceMat);
            scene.add(skybox);
        }

    };

    /** This object will represent our light source in the scene */
    var light = {
        speed: 0.1,
        distance: 1000,
        position: new THREE.Vector3(0, 0, 0),

        orbit: function (obj) {
            this.position.x = 
                (obj.position.x + this.distance) * Math.sin(time * -this.speed);

            this.position.z =
                (obj.position.z + this.distance) * Math.cos(time * this.speed);
        }
    };

    var init = function () {
        /** Check for WebGL support */
        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true
            });
        }
        else {
            Detector.addGetWebGLMessage();
            return false;
        }

        /** Initialize our renderer and inject it into our container element */
        renderer.setClearColor(0x000000, 1);
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
        hud.element.append(stats.domElement);

        /** Bind jQuery event handlers */
        $(document).on('keydown', onDocumentKeyDown);
        $(window).on('resize', onWindowResize);

        /** Start the clock */
        clock = new THREE.Clock();

        return true;
    };


    /** Main animation loop callback to requestAnimFrame */
    var animate = function () {
        requestAnimationFrame(animate);

        /** Request a new time sample from our clock */
        time = clock.getElapsedTime();

        light.orbit(moon);

        /** Call updates to various other components */
        controls.update(camera);
        stats.update();

        /** Render a new frame only after calculating animation logic */
        renderer.render(scene, camera);
    };

    /** Event handler for the document object's 'keydown' event */
    var onDocumentKeyDown = function (event) {
        switch (event.keyCode) {
            case 'H'.charCodeAt(0):
                hud.toggle();
                break;
            case 'F'.charCodeAt(0):
                if (screenfull.enabled) screenfull.toggle();
                break;
            case 'P'.charCodeAt(0):
                window.open(encodePNG(renderer.domElement), 'screenshot');
                break;
        }
    };

    var onWindowResize = function () {
        /** Update renderer size to match the window */
        renderer.setSize(window.innerWidth, window.innerHeight);

        /** Update the camera's aspect ratio and projection matrix */
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };

    var encodePNG = function (element) {
        /** Get a base64 encoded data url of the element in PNG format */
        var mimeType = 'image/png';
        return element.toDataURL(mimeType);
    };

    /** Main entry point, begin loading assets, then immediately start
    initialization, animation will begin only when all assets have been
    loaded */
    $(window).on('load', function () {
        if (!init()) return;

        var path = 'img/maps/moon.jpg';
        var normPath = 'img/maps/normal.jpg';
        THREE.ImageUtils.loadTexture(path, new THREE.UVMapping(), function (textureMap) {

            THREE.ImageUtils.loadTexture(normPath, new THREE.UVMapping(), function (normalMap) {
                moon.init(textureMap, normalMap);

                var prefix = 'img/starfield/';
                var paths = [prefix + "front.png", prefix + "back.png",
                            prefix + "left.png", prefix + "right.png",
                            prefix + "top.png", prefix + "bottom.png"];

                THREE.ImageUtils.loadTextureCube(paths, null, function (texture) {
                    skybox.init(texture);

                    /** Animate only after all assets are loaded */
                    animate();
                });
            });
        });
    });
});
