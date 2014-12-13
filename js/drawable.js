/*globals pick, canvas, context, console */

// Pick a value - return a if it is defined, else default to b
// e.g. var colour = pick( params.colour, 'red' );
function pick(a, b) {
	'use strict';

	if (typeof a !== 'undefined') {
		return a;
	} else {
		return b;
	}
}

// Drawable Super Class
function Drawable(params) {
	'use strict';

	// Common Properties
	this.x = pick(params.x, 0);
	this.y = pick(params.y, 0);
	this.fillColour = pick(params.fillColour, '#000');
	this.strokeColour = pick(params.strokeColour, 'transparent');
	this.strokeWidth = pick(params.strokeWidth, 0);
	this.context = pick(params.context, null);
    this.animations = pick(params.animations, {});

	// Draw
	this.draw = function () {
		console.log("I don't know how to draw");
	};

	// Setup context
	this.setupContext = function () {
		this.context.fillStyle = this.fillColour;
		this.context.strokeStyle = this.strokeColour;
		this.context.lineWidth = this.strokeWidth;
	};


	// ANIMATION
	this.removeAnimation = function (property) {
        delete this.animations[property];
    };

	this.addContinuousAnimation = function (params) {
        // e.g. change my x position by -5px every second, continuously
        if (typeof params.property === 'undefined') {
			console.log("No property specified for addContinuousAnimation");
			return;
		}

		var changePerSecond = pick(params.changePerSecond, 1),
			wholeNumbersOnly = pick(params.wholeNumbersOnly, false);

		// Remove any existing animations
        this.removeAnimation(params.property);

        // Add this animation, so we can use this information later
        this.animations[params.property] = {
            kind: 'changecontinuous',
            changePerSecond: changePerSecond,
			wholeNumbersOnly: wholeNumbersOnly
        };

    };

    this.addChangeTowardsAnimation = function (params) {
        // e.g. change my height to 200px, taking 2.5 seconds to do so - addChangeTowardsAnimation('height', 200, 2.5)
        if (typeof params.property === 'undefined') {
			console.log("No property specified for addChangeTowardsAnimation");
			return;
		} else if (typeof params.targetValue === 'undefined') {
			console.log("No targetValue specified for addChangeTowardsAnimation");
			return;
		}


		var totalTimeSeconds = pick(params.totalTimeSeconds, 1),
			wholeNumbersOnly = pick(params.wholeNumbersOnly, false),
			// What time did the animation start, and what time should it end?
			animationStart = Date.now(),
			animationEnd = animationStart + (totalTimeSeconds * 1000),
			// What was the original value of the property?
			startValue = this[params.property];    // e.g. this['y'] or this['radius']

        // Remove any existing animations
        this.removeAnimation(params.property);



        // Add this animation, so that we can use this information later
        this.animations[params.property] = {
            kind: 'changetowards',
            animationStart: animationStart,
            animationEnd: animationEnd,
            startValue: startValue,
            targetValue: params.targetValue,
			wholeNumbersOnly: wholeNumbersOnly
        };
    };


	// Apply animations, knowing how many seconds have elapsed since last time.
	this.applyAnimations = function (secondsElapsed) {

		// Moved variable declarations here to satisfy JSHint
		var property, animation, changeBy, valueRange, timeRange, timeSinceStarted, currentTimePosition, currentValue;

		// A for-in loop - loop over all properties in an object
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
		for (property in this.animations) {

			// When using a for-in loop, this is important
			// http://brianflove.com/2013/09/05/javascripts-hasownproperty-method/
			if (this.animations.hasOwnProperty(property)) {

				animation = this.animations[property];

				// What kind of animation is this?
				if (animation.kind === 'changecontinuous') {
					// Change by X amount per second

					// How much should we change by? (e.g. 5 per second * 0.7 seconds elapsed = change by 3.5
					changeBy = animation.changePerSecond * secondsElapsed;

					// Apply the new value to the property
					this[property] += changeBy;

				} else if (animation.kind === 'changetowards') {
					// Change towards X value over Y seconds

					// What is the range of values? e.g. animating from 5px to 15px, the range is 10
					valueRange = animation.targetValue - animation.startValue;

					// What is the range in timings (how long does the animation run over)?
					timeRange = animation.animationEnd - animation.animationStart;

					// How long has it been since the animation started?
					timeSinceStarted = Date.now() - animation.animationStart;

					// How far through the time range are we? (e.g. 0.5 = 50% of the way through)
					currentTimePosition = timeSinceStarted / timeRange;

					// Therefore, what value should we be using
					currentValue = (currentTimePosition * valueRange) + animation.startValue;


					if (timeSinceStarted >= timeRange) {
						// Animation has ended!

						// Make sure we always end exactly on the targetValue
						currentValue = animation.targetValue;

						// Remove this animation
						this.removeAnimation(property);
					}

					this[property] = currentValue;
				}

				// Adjust the new value to be a whole number if required
				if (animation.wholeNumbersOnly === true) {
					this[property] = Math.round(this[property]);
				}

			}
		}
	};
}


// Compound Drawable Super Class
// Requires Drawable
function CompoundDrawable(params) {
	'use strict';

	// Apply Drawable as a superclass
	Drawable.apply(this, arguments);

	// Properties of a CompoundDrawable
	// Array of constituent parts - all Drawables
	this.parts = pick(params.parts, []);

	// Draw
	this.draw = function () {
		var i = 0;

		// New: Translate the context prior to drawing
		this.context.save();
		this.context.translate(this.x, this.y);

		for (i = 0; i < this.parts.length; i += 1) {
			this.parts[i].draw();
		}

		// Restore the context
		this.context.restore();

	};
}