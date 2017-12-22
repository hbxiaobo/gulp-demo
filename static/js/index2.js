var camera, scene, renderer;
    var geometry, material, mesh;
    var target = new THREE.Vector3();

    var lon = 90, lat = 0;
    var phi = 0, theta = 0;

    var touchX, touchY;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

        scene = new THREE.Scene();
/** 次数是重点说明的
 * 这个sides对应的是六张图位于立体坐标轴内的位置，里面的position又包含x,y,三个轴
 * 然后ratation是三个轴上的变换
 */ 
        var sides = [
            {
                position: [ 512, 0, 0 ], // 1
                rotation: [ 0, -Math.PI / 2, 0 ]
            },
            {
                position: [ -512, 0, 0 ], // 2
                rotation: [ 0, Math.PI / 2, 0 ]
            },
            {
                position: [ 0,  512, 0 ], // 3
                rotation: [ Math.PI / 2, 0, Math.PI ]
            },
            {
                position: [ 0, -512, 0 ], // 4
                rotation: [ - Math.PI / 2, 0, Math.PI ]
            },
            {
                position: [ 0, 0,  512 ], // 5
                rotation: [ 0, Math.PI, 0 ]
            },
            {
                position: [ 0, 0, -512 ], // 6
                rotation: [ 0, 0, 0 ]
            }
        ];

        var canvas = document.createElement('canvas');
        var image = document.createElement('img');
        image.src = 'static/img/360photos.jpg'; // 画图，这里引入的这张图片，是一张图上集合了6张图片
        image.height = 6144;
        image.width = 1024;
        canvas.width = 1024;
        canvas.height = 1024;
        // 这里有判断image.onload，这里是判断创建的image节点是否把引入的图片加载进来
            image.onload = function() {
                for ( var i = 0; i < sides.length; i ++ ) { // 由于是六张图放在一张图片上，然后这里分割六张图片
                    var cxt = canvas.getContext("2d");
                    cxt.drawImage(image, 0, -1024*i);
                    var side = sides[ i ];

                    var element = document.createElement( 'img' );
                    element.width = 1026; // 2 pixels extra to close the gap.
                    document.getElementsByTagName('body')[0].appendChild(canvas);
                    var _img_url = canvas.toDataURL("image/png"); // 获取图片位置
                    element.src = _img_url;
                    var object = new THREE.CSS3DObject( element ); // 这里根据sides把图片放在坐标轴上进行渲染
                    object.position.fromArray( side.position );
                    object.rotation.fromArray( side.rotation );
                    scene.add( object );
                }
        }


        renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        //

        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );

    }

    function onDocumentMouseMove( event ) {

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        lon -= movementX * 0.1;
        lat += movementY * 0.1;

    }

    function onDocumentMouseUp( event ) {

        document.removeEventListener( 'mousemove', onDocumentMouseMove );
        document.removeEventListener( 'mouseup', onDocumentMouseUp );

    }

    function onDocumentMouseWheel( event ) {

        camera.fov -= event.wheelDeltaY * 0.05;
        camera.updateProjectionMatrix();

    }

    function onDocumentTouchStart( event ) {

        event.preventDefault();

        var touch = event.touches[ 0 ];

        touchX = touch.screenX;
        touchY = touch.screenY;

    }

    function onDocumentTouchMove( event ) {

        event.preventDefault();

        var touch = event.touches[ 0 ];

        lon -= ( touch.screenX - touchX ) * 0.1;
        lat += ( touch.screenY - touchY ) * 0.1;

        touchX = touch.screenX;
        touchY = touch.screenY;

    }

    function animate() {
        stop = requestAnimationFrame( animate );

        lon +=  0.1;
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );

        target.x = Math.sin( phi ) * Math.cos( theta );
        target.y = Math.cos( phi );
        target.z = Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( target );

        renderer.render( scene, camera );

    }