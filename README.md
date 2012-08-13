# IAC.js
========
A ribbon which reveals a curtain of content, which user

Curious about how this looks in action? [Check out the demo page](http://iac.debuggify.net/iac/index.html).

All  user needs to add the following piece of code
    
    <div class="forkit-curtain"></div>
    <a class="forkit" href="http://www.indiaagainstcorruption.org"></a>
    
    <script type="text/javascript">
    	var __iac = {
    	    closedText : 'Support Anna',
    		detachedText: 'Drag me down',
    		tagBackgroundColor: 'red',
    		tagColor: 'black',
    		curtainBackgroundColor: 'gray',
    		prefetch: true,
    		src: document.location.href + 'public/iac'
    	};

        (function() {
    	    var iac = document.createElement('script');
            iac.type = 'text/javascript';
            iac.async = true;
            iac.src = 'public/iac/js/iac.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(iac, s);
        })();
    </script>

### Terminalogy ###

![][Terminalogy]

		The red color tag in right corner is ribbon.
		On clicking ribbon the curtain comes down.
		When the mouse is on ribbon , it gets in detached stage

    
### Options ###
    
   - closedText - display text in the ribbon
   - detachedText - display text of the ribbon when in floating state(on hover)
   - tagBackgroundColor - color of th ribbon
   - tagColor - color of the display text on ribbon
   - curtainBackgroundColor - color of the curtain
   - prefetch - when set prefetches the content of the curtain
   - src - give path for where to get resources(css,js) from
         
## Inspirations ##
  - [forkit.js]
  - [sopablackout]

#### Author: [@Agarwal_Ankur] ####

  [forkit.js]: https://github.com/hakimel/forkit.js
  [@Agarwal_Ankur]: http://twitter.com/Agarwal_Ankur
  [sopablackout]: http://sopablackout.org/
  [Terminalogy]: http://iac.debuggify.net/iac/images/IndiaAgainstCorruption.jpg "Terminalogy"