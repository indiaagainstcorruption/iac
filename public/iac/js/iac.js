/*!
 * forkit.js 0.2
 * http://lab.hakim.se/forkit-js
 * MIT licensed
 *
 * Created by Hakim El Hattab, http://hakim.se
 */
// (function(){

	var defaults = {
		closedText : 'Support Anna',
		detachedText: 'Drag me down',
		src: 'http://iac.debuggify.net/iac',
		tagBackgroundColor: "green",
		tagColor: "white",
		curtainBackgroundColor: 'null',
		prefetch: false
	};

	var options = (typeof __iac) ? extend(__iac, defaults) : defaults;

	function extend (target, source) {
		var output = target;
		for (var key in source) {
			if( source.hasOwnProperty(key) && typeof target[key] === 'undefined') {
				output[key] = source[key];
			}
		}	return target;
	}

	var STATE_CLOSED = 0,
		STATE_DETACHED = 1,
		STATE_OPENED = 2,

		TAG_HEIGHT = 30,
		TAG_WIDTH = 200,
		MAX_STRAIN = 40,

		ALLREADY_LOADED = false,

		// Factor of page height that needs to be dragged for the
		// curtain to fall
		DRAG_THRESHOLD = 0.36;

		VENDORS = [ 'Webkit', 'Moz', 'O', 'ms' ];

	var dom = {
		ribbon: null,
		ribbonString: null,
		ribbonTag: null,
		curtain: null,
		closeButton: null
	},

		// The current state of the ribbon
		state = STATE_CLOSED,

		// Ribbon text, correlates to states
		closedText = options.closedText || '',
		detachedText = options.detachedText || '',

		friction = 1.04;
		gravity = 1.5,

		// Resting position of the ribbon when curtain is closed
		closedX = TAG_WIDTH * 0.4,
		closedY = -TAG_HEIGHT * 0.5,

		// Resting position of the ribbon when curtain is opened
		openedX = TAG_WIDTH * 0.4,
		openedY = TAG_HEIGHT,

		velocity = 0,
		rotation = 45,

		curtainTargetY = 0,
		curtainCurrentY = 0,

		dragging = false,
		dragTime = 0,
		dragY = 0,

		anchorA = new Point( closedX, closedY ),
		anchorB = new Point( closedX, closedY ),

		mouse = new Point();



	function curtainTemplate() {
		return '<div class="close-button"></div>' +
			'<h2>India Against Corruption</h2>' +
			'<small>Support Team Anna </small>' +
			'<div id="forkit-photos"></div>' +

			'<div class="forkit-share-bar">' +
				'<div class="forkit-left addthis_toolbox addthis_default_style addthis_32x32_style" addthis:url="http://news.indiaagainstcorruption.org/" addthis:title="India Againt Corruption" addthis:description="Support Team Anna to fight against corruption">' +
					'<a class="addthis_button_preferred_1"></a>' +
					'<a class="addthis_button_preferred_2"></a>' +
					'<a class="addthis_button_preferred_3"></a>' +
					'<a class="addthis_button_preferred_4"></a>' +
					'<a class="addthis_button_compact"></a>' +
					'<a class="addthis_counter addthis_bubble_style"></a>' +
				'</div>' +

				'<div class="forkit-right">' +
					'<a href="https://github.com/indiaagainstcorruption/iac">Github</a>' +
					'<a href="https://www.facebook.com/IndiACor">Facebook</a>' +
				'</div>'  +
			'</div>';
	}

	function loadjscssfile (filename, filetype) {

		var fileref;

		//if filename is a external JavaScript file
		if (filetype === "js") {

			fileref = document.createElement('script');
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);

		} else if (filetype == "css") { //if filename is an external CSS file

			fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);

		}

		if (typeof fileref !== "undefined") {
			document.getElementsByTagName("head")[0].appendChild(fileref);
		}

	}

		function YQLQuery(query, callback) {
	  this.query = query;
	  this.callback = callback || function () {};
	  this.fetch = function () {

	    if (!this.query || !this.callback) {
	      throw new Error('YQLQuery.fetch(): Parameters may be undefined');
	    }

	    var scriptEl = document.createElement('script'),
	      uid = 'yql' + +new Date(),
	      encodedQuery = encodeURIComponent(this.query.toLowerCase()),
	      instance = this;

	    YQLQuery[uid] = function (json) {
	      instance.callback(json);
	      delete YQLQuery[uid];
	      document.body.removeChild(scriptEl);
	    };

	    scriptEl.src = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=YQLQuery.' + uid;
	    document.body.appendChild(scriptEl);

	  };
	}

	function installPhotoes() {
	  // var query = "select * from rss where url='somefeed.com' limit 1";
	  var query = 'select * from flickr.photos.search where text in ("%anna%hazzare%") and api_key="ad727a662d249945e1056362255f0133"';

	  // Define your callback:
	  var callback = function (data) {

	    var post = data.query.results.photo;
	    var temp;
	    for (temp in post) {
	      var theDiv = document.getElementById("forkit-photos");
	      // var content = document.createTextNode("<YOUR_CONTENT>");

	      var curr = post[temp];
	      // var string = ('<div><img src="http://farm'+ curr.farm +'.static.flickr.com/'+ curr.server +'/' + curr.id +'_' + curr.secret +'.jpg" alt="' + curr.title + '" /></div>');
	      // var string = '<img src="http://farm'+ curr.farm +'.static.flickr.com/'+ curr.server +'/' + curr.id +'_' + curr.secret +'.jpg" alt="' + curr.title + '" />';
	      var string = 'http://farm' + curr.farm + '.static.flickr.com/' + curr.server + '/' + curr.id + '_' + curr.secret + '.jpg';
	      var alt = curr.title;


	      var content = document.createElement('img');
	      content.src = string;
	      content.alt = alt;
	      content.width = 200;
	      content.height = 200;
	      theDiv.appendChild(content);

	    }
	    // alert(post.title);
	  };

			// Instantiate with the query:
		var firstFeedItem = new YQLQuery(query, callback);

		// If you're ready then go:
		firstFeedItem.fetch();

	}

	function installVideos(){
		var query = 'select * from youtube.search where q=".*anna.*Hazare.*" and diagnostics="true" and env = "store://datatables.org/alltableswithkeys" ';
		// Define your callback:
		var callback = function (data) {
			var videoArray = new Array ('http://www.youtube.com/watch?v=AdOw1-BTdJ8&feature=youtube_gdata_player', 'http://www.youtube.com/watch?v=v-987x9c154&feature=youtube_gdata_player');
			// var post = data.query.results.video;
			var temp;
			for (temp in videoArray) {
				var theDiv = document.getElementById("forkit-videos");
				var curr = videoArray[temp];
				var content = document.createElement('a');
				content.href = curr;
				theDiv.appendChild(content);
			}
		};
		var firstFeedItem = new YQLQuery(query, callback);
		// If you're ready then go:
		firstFeedItem.fetch();
	}



	function initialize() {

		dom.ribbon = document.querySelector( '.forkit' );
		dom.curtain = document.querySelector( '.forkit-curtain' );
		dom.closeButton = document.querySelector( '.forkit-curtain .close-button' );

		// Applying the template in the curtain
		dom.curtain.innerHTML = curtainTemplate();

		loadjscssfile(options.src + '/css/iac.css', 'css');

		if( dom.ribbon ) {

			// Fetch label texts from DOM
			// closedText = dom.ribbon.getAttribute( 'data-text' ) || '';
			// detachedText = dom.ribbon.getAttribute( 'data-text-detached' ) || closedText;

			// Construct the sub-elements required to represent the
			// tag and string that it hangs from
			dom.ribbon.innerHTML = '<span class="string"></span><span class="tag">' + closedText + '</span>';
			dom.ribbonString = dom.ribbon.querySelector( '.string' );
			dom.ribbonTag = dom.ribbon.querySelector( '.tag' );

			// Bind events
			dom.ribbon.addEventListener( 'click', onRibbonClick, false );
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mousedown', onMouseDown, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			window.addEventListener( 'resize', layout, false );

			if( dom.closeButton ) {
				dom.closeButton.addEventListener( 'click', onCloseClick, false );
			}

			// Start the animation loop
			animate();

		}

		if(options.prefetch) {
			installOnCurtain();
		}

	}

	function onMouseDown( event ) {
		if( dom.curtain && state === STATE_DETACHED ) {
			event.preventDefault();

			dragY = event.clientY;
			dragTime = Date.now();
			dragging = true;

		}
	}

	function onMouseMove( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	function onMouseUp( event ) {
		if( state !== STATE_OPENED ) {
			state = STATE_CLOSED;
			dragging = false;
		}
	}

	function onRibbonClick( event ) {
		if( dom.curtain ) {
			event.preventDefault();

			if( state === STATE_OPENED ) {
				close();
			}
			else if( Date.now() - dragTime < 300 ) {
				open();
			}
		}
	}

	function onCloseClick( event ) {
		event.preventDefault();
		close();
	}

	function layout() {
		if( state === STATE_OPENED ) {
			curtainTargetY = window.innerHeight;
			curtainCurrentY = curtainTargetY;
		}
	}

	function open() {
		installOnCurtain();
		dragging = false;
		state = STATE_OPENED;
	}

	function close() {
		dragging = false;
		state = STATE_CLOSED;
		dom.ribbonTag.innerHTML = closedText;
	}

	function detach() {
		state = STATE_DETACHED;
		dom.ribbonTag.innerHTML = detachedText;
	}

	function animate() {
		update();
		render();

		requestAnimFrame( animate );
	}

	function update() {
		// Distance between mouse and top right corner
		var distance = distanceBetween( mouse.x, mouse.y, window.innerWidth, 0 );

		// If we're OPENED the curtainTargetY should ease towards page bottom
		if( state === STATE_OPENED ) {
			curtainTargetY = Math.min( curtainTargetY + ( window.innerHeight - curtainTargetY ) * 0.2, window.innerHeight );
		}
		else {

			// Detach the tag when hovering close enough
			if( distance < TAG_WIDTH * 1.5 ) {
				detach();
			}
			// Re-attach the tag if the user moved away
			else if( !dragging && state === STATE_DETACHED && distance > TAG_WIDTH * 2 ) {
				close();
			}

			if( dragging ) {
				// Updat the curtain position while dragging
				curtainTargetY = Math.max( mouse.y - dragY, 0 );

				// If the threshold is crossed, open the curtain
				if( curtainTargetY > window.innerHeight * DRAG_THRESHOLD ) {
					open();
				}
			}
			else {
				curtainTargetY *= 0.8;
			}

		}

		// Ease towards the target position of the curtain
		curtainCurrentY += ( curtainTargetY - curtainCurrentY ) * 0.3;

		// If we're dragging or detached we need to simulate
		// the physical behavior of the ribbon
		if( dragging || state === STATE_DETACHED ) {

			// Apply forces
			velocity /= friction;
			velocity += gravity;

			var containerOffsetX = dom.ribbon.offsetLeft;

			var offsetX = Math.max( ( ( mouse.x - containerOffsetX ) - closedX ) * 0.2, -MAX_STRAIN );

			anchorB.x += ( ( closedX + offsetX ) - anchorB.x ) * 0.1;
			anchorB.y += velocity;

			var strain = distanceBetween( anchorA.x, anchorA.y, anchorB.x, anchorB.y );

			if( strain > MAX_STRAIN ) {
				velocity -= Math.abs( strain ) / ( MAX_STRAIN * 1.25 );
			}

			var dy = Math.max( mouse.y - anchorB.y, 0 ),
				dx = mouse.x - ( containerOffsetX + anchorB.x );

			// Angle the ribbon towards the mouse but limit it avoid extremes
			var angle = Math.min( 130, Math.max( 50, Math.atan2( dy, dx ) * 180 / Math.PI ) );

			rotation += ( angle - rotation ) * 0.1;
		}
		// Ease ribbon towards the OPENED state
		else if( state === STATE_OPENED ) {
			anchorB.x += ( openedX - anchorB.x ) * 0.2;
			anchorB.y += ( openedY - anchorB.y ) * 0.2;

			rotation += ( 90 - rotation ) * 0.02;
		}
		// Ease ribbon towards the CLOSED state
		else {
			anchorB.x += ( anchorA.x - anchorB.x ) * 0.2;
			anchorB.y += ( anchorA.y - anchorB.y ) * 0.2;

			rotation += ( 45 - rotation ) * 0.2;
		}
	}

	function render() {

		if( dom.curtain ) {
			dom.curtain.style.top = - 100 + Math.min( ( curtainCurrentY / window.innerHeight ) * 100, 100 ) + '%';
		}

		dom.ribbon.style[ prefix( 'transform' ) ] = transform( 0, curtainCurrentY, 0 );
		dom.ribbonTag.style[ prefix( 'transform' ) ] = transform( anchorB.x, anchorB.y, rotation );

		var dy = anchorB.y - anchorA.y,
			dx = anchorB.x - anchorA.x;

		var angle = Math.atan2( dy, dx ) * 180 / Math.PI;

		dom.ribbonString.style.width = anchorB.y + 'px';
		dom.ribbonString.style[ prefix( 'transform' ) ] = transform( anchorA.x, 0, angle );

		// Customize tag
		dom.ribbonTag.style.backgroundColor = options.tagBackgroundColor;
		dom.ribbonTag.style.color = options.tagColor;

		// Customizing curtain
		if(options.curtainBackgroundColor) {
			dom.curtain.style.backgroundColor = options.curtainBackgroundColor;
		}

		// dom.curtain.style.overflow = "scroll";
	}

	function prefix( property, el ) {
		var propertyUC = property.slice( 0, 1 ).toUpperCase() + property.slice( 1 );

		for( var i = 0, len = VENDORS.length; i < len; i++ ) {
			var vendor = VENDORS[i];

			if( typeof ( el || document.body ).style[ vendor + propertyUC ] !== 'undefined' ) {
				return vendor + propertyUC;
			}
		}

		return property;
	}

	function transform( x, y, r ) {
		return 'translate('+x+'px,'+y+'px) rotate('+r+'deg)';
	}

	function distanceBetween( x1, y1, x2, y2 ) {
		var dx = x1-x2;
		var dy = y1-y2;
		return Math.sqrt(dx*dx + dy*dy);
	}

	/**
	 * Defines a 2D position.
	 */
	function Point( x, y ) {
		this.x = x || 0;
		this.y = y || 0;
	}

	Point.prototype.distanceTo = function( x, y ) {
		var dx = x-this.x;
		var dy = y-this.y;
		return Math.sqrt(dx*dx + dy*dy);
	};

	Point.prototype.clone = function() {
		return new Point( this.x, this.y );
	};

	Point.prototype.interpolate = function( x, y, amp ) {
		this.x += ( x - this.x ) * amp;
		this.y += ( y - this.y ) * amp;
	};

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame 		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame		||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
					};
	})();

	initialize();

	function installTwitterFeed() {

		if(typeof TWTR === 'undefined') {
			setTimeout('installTwitterFeed()', 1000);
			return false;
		}
		new TWTR.Widget({
		  version: 2,
		  type: 'search',
		  search: '#iac',
		  interval: 30000,
		  title: 'India Against Corruption',
		  subject: 'Fight for freedom',
		  width: 250,
		  height: 300,
		  theme: {
		    shell: {
		      background: '#8ec1da',
		      color: '#ffffff'
		    },
		    tweets: {
		      background: '#ffffff',
		      color: '#444444',
		      links: '#1985b5'
		    }
		  },
		  features: {
		    scrollbar: false,
		    loop: true,
		    live: true,
		    behavior: 'default'
		  }
		}).render().start();
	}

// })();


	function installOnCurtain() {
		if(ALLREADY_LOADED) return false;
		ALLREADY_LOADED = true;

		// Install Addthis Sharing buttons
		loadjscssfile('http://s7.addthis.com/js/250/addthis_widget.js#pubid=xa-50269ca25571eb1f', 'js');

		// Install Twitter Feed
		loadjscssfile('http://widgets.twimg.com/j/2/widget.js', 'js');
		installPhotoes();
		// installVideos();

		// installTwitterFeed();
	}
