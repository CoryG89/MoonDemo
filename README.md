Moon Demo
============

A photorealistic 3D graphics demo of our Moon written in JavaScript and WebGL featuring real high-resolution satellite maps. Check out the [**live demo**][demo]! You'll need a modern browser with WebGL enabled in order to run it. I recommmend [**Google Chrome**][chrome].

## Dependencies

This demo uses the following open source libraries:

 - [**`mrdoob/three.js`**][three.js] -- 3D graphics library written in JavaScript and including renderers for WebGL, Canvas, SVG, etc.
 - [**`sindresorhus/screenfull.js`**][screenfull.js] -- Cross-browser library for working with the JavaScript Fullscreen API via a simplified interface.

## Credit

In order to satisfy my proposed goal of creating a photorealistic 3D demo of the moon I first began looking for the best texture map of our Moon that I could find. I found out that there is good data published through the Map a Planet initiative and available on the [**USGS PDS site**][USGS]. The best data we have for our Moon was actually gathered by the [**Clementine spacecraft**][Clementine]. It is possible to process a greyscale image of the entire surface of our Moon using this data, and as far as I know the best maps of the lunar surface we have today were derived from this data. All USGS data is considered public domain.

The best map I could find was processed by [**Jens Meyer**][Jens Meyer] and apparently also darkened up by [**Steve Albers**][Steve Albers]. It and other high quality freely available on Steve Albers homepage and available free for personal non-commercial use. I say this map is the 'best' in the sense that it has the highest resolution and detail compared to other maps I could find.

[![Moon Map](maps/moon.jpg)][maps/moon.jpg]

## Technical

This demo is an example of using WebGL with the Three.JS JavaScript library. GLSL shaders are used to create a material which is applied to the moon in order to simulate diffuse light calculated for each vertex on the Moon mesh. This allows the effect of the Moon changing phases. I also generated 6 randomized star patterns in order to create the skybox around the scene. If you wish to learn more about it, please check out my [**blog post**][blog post] for a more detailed technical explanation.

[demo]: https://coryg89.github.io/MoonDemo
[blog post]: https://coryg89.github.io/projects/MoonDemo
[chrome]: https://google.com/chrome
[three.js]: https://github.com/mrdoob/three.js/
[screenfull.js]: https://github.com/sindresorhus/screenfull.js/

[usgs]: http://pdsmaps.wr.usgs.gov/PDS/public/explorer/html/mmfront.htm

[Steve Albers]: http://laps.noaa.gov/albers/sos/sos.html
[Jens Meyer]: http://home.arcor.de/jimpage/earth.html
[USGS]: http://pdsmaps.wr.usgs.gov/PDS/public/explorer/html/mmfront.htm
[Clementine]: http://en.wikipedia.org/wiki/Clementine_(spacecraft)