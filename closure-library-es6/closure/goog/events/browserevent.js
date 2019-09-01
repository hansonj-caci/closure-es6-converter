// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 * - pointerId      {number}    Pointer ID
 * - pointerType    {string}    Pointer type, e.g. 'mouse', 'pen', or 'touch'
 * - defaultPrevented {boolean} Whether the default action has been prevented
 * - state          {Object}    History state object
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');
goog.provide('goog.events.BrowserEvent.PointerType');

goog.require('goog.debug');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.reflect');
goog.require('goog.userAgent');

/**
   * Accepts a browser event object and creates a patched, cross browser event
   * object.
   * The content of this object will not be initialized if no event object is
   * provided. If this is the case, init() needs to be invoked separately.
   *
   *
   * 
   * 
   */
goog.events.BrowserEvent = class extends goog.events.Event {
  /**
  * Accepts a browser event object and creates a patched, cross browser event
  * object.
  * The content of this object will not be initialized if no event object is
  * provided. If this is the case, init() needs to be invoked separately.
  * @param {Event=} opt_e Browser event object.
  * @param {EventTarget=} opt_currentTarget Current target for event.
  *
   */
  constructor(opt_e, opt_currentTarget) {
    super( opt_e ? opt_e.type : '');

    /**
     * Target that fired the event.
     * @override
     * @type {Node}
     */
    this.target = null;

    /**
     * Node that had the listener attached.
     * @override
     * @type {Node|undefined}
     */
    this.currentTarget = null;

    /**
     * For mouseover and mouseout events, the related object for the event.
     * @type {Node}
     */
    this.relatedTarget = null;

    /**
     * X-coordinate relative to target.
     * @type {number}
     */
    this.offsetX = 0;

    /**
     * Y-coordinate relative to target.
     * @type {number}
     */
    this.offsetY = 0;

    /**
     * X-coordinate relative to the window.
     * @type {number}
     */
    this.clientX = 0;

    /**
     * Y-coordinate relative to the window.
     * @type {number}
     */
    this.clientY = 0;

    /**
     * X-coordinate relative to the monitor.
     * @type {number}
     */
    this.screenX = 0;

    /**
     * Y-coordinate relative to the monitor.
     * @type {number}
     */
    this.screenY = 0;

    /**
     * Which mouse button was pressed.
     * @type {number}
     */
    this.button = 0;

    /**
     * Key of key press.
     * @type {string}
     */
    this.key = '';

    /**
     * Keycode of key press.
     * @type {number}
     */
    this.keyCode = 0;

    /**
     * Keycode of key press.
     * @type {number}
     */
    this.charCode = 0;

    /**
     * Whether control was pressed at time of event.
     * @type {boolean}
     */
    this.ctrlKey = false;

    /**
     * Whether alt was pressed at time of event.
     * @type {boolean}
     */
    this.altKey = false;

    /**
     * Whether shift was pressed at time of event.
     * @type {boolean}
     */
    this.shiftKey = false;

    /**
     * Whether the meta key was pressed at time of event.
     * @type {boolean}
     */
    this.metaKey = false;

    /**
     * History state object, only set for PopState events where it's a copy of the
     * state object provided to pushState or replaceState.
     * @type {Object}
     */
    this.state = null;

    /**
     * Whether the default platform modifier key was pressed at time of event.
     * (This is control for all platforms except Mac, where it's Meta.)
     * @type {boolean}
     */
    this.platformModifierKey = false;

    /**
     * @type {number}
     */
    this.pointerId = 0;

    /**
     * @type {string}
     */
    this.pointerType = '';

    /**
     * The browser event object.
     * @private {Event}
     */
    this.event_ = null;

    if (opt_e) {
      this.init(opt_e, opt_currentTarget);
    }
  }

  /**
   * Accepts a browser event object and creates a patched, cross browser event
   * object.
   * @param {Event} e Browser event object.
   * @param {EventTarget=} opt_currentTarget Current target for event.
   */
  init(e, opt_currentTarget) {
    var type = this.type = e.type;

    /**
     * On touch devices use the first "changed touch" as the relevant touch.
     * @type {Touch}
     */
    var relevantTouch = e.changedTouches ? e.changedTouches[0] : null;

    // TODO(nicksantos): Change this.target to type EventTarget.
    this.target = /** @type {Node} */ (e.target) || e.srcElement;

    // TODO(nicksantos): Change this.currentTarget to type EventTarget.
    this.currentTarget = /** @type {Node} */ (opt_currentTarget);

    var relatedTarget = /** @type {Node} */ (e.relatedTarget);
    if (relatedTarget) {
      // There's a bug in FireFox where sometimes, relatedTarget will be a
      // chrome element, and accessing any property of it will get a permission
      // denied exception. See:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
      if (goog.userAgent.GECKO) {
        if (!goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) {
          relatedTarget = null;
        }
      }
    } else if (type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement;
    } else if (type == goog.events.EventType.MOUSEOUT) {
      relatedTarget = e.toElement;
    }

    this.relatedTarget = relatedTarget;

    if (!goog.isNull(relevantTouch)) {
      this.clientX = relevantTouch.clientX !== undefined ? relevantTouch.clientX : relevantTouch.pageX;
      this.clientY = relevantTouch.clientY !== undefined ? relevantTouch.clientY : relevantTouch.pageY;
      this.screenX = relevantTouch.screenX || 0;
      this.screenY = relevantTouch.screenY || 0;
    } else {
      // Webkit emits a lame warning whenever layerX/layerY is accessed.
      // http://code.google.com/p/chromium/issues/detail?id=101733
      this.offsetX = (goog.userAgent.WEBKIT || e.offsetX !== undefined) ? e.offsetX : e.layerX;
      this.offsetY = (goog.userAgent.WEBKIT || e.offsetY !== undefined) ? e.offsetY : e.layerY;
      this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
      this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
      this.screenX = e.screenX || 0;
      this.screenY = e.screenY || 0;
    }

    this.button = e.button;

    this.keyCode = e.keyCode || 0;
    this.key = e.key || '';
    this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
    this.ctrlKey = e.ctrlKey;
    this.altKey = e.altKey;
    this.shiftKey = e.shiftKey;
    this.metaKey = e.metaKey;
    this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
    this.pointerId = e.pointerId || 0;
    this.pointerType = goog.events.BrowserEvent.getPointerType_(e);
    this.state = e.state;
    this.event_ = e;
    if (e.defaultPrevented) {
      this.preventDefault();
    }
  }

  /**
   * Tests to see which button was pressed during the event. This is really only
   * useful in IE and Gecko browsers. And in IE, it's only useful for
   * mousedown/mouseup events, because click only fires for the left mouse button.
   *
   * Safari 2 only reports the left button being clicked, and uses the value '1'
   * instead of 0. Opera only reports a mousedown event for the middle button, and
   * no mouse events for the right button. Opera has default behavior for left and
   * middle click that can only be overridden via a configuration setting.
   *
   * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
   *
   * @param {goog.events.BrowserEvent.MouseButton} button The button
   *     to test for.
   * @return {boolean} True if button was pressed.
   */
  isButton(button) {
    if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
      if (this.type == 'click') {
        return button == goog.events.BrowserEvent.MouseButton.LEFT;
      } else {
        return !!(this.event_.button & goog.events.BrowserEvent.IE_BUTTON_MAP[button]);
      }
    } else {
      return this.event_.button == button;
    }
  }

  /**
   * Whether this has an "action"-producing mouse button.
   *
   * By definition, this includes left-click on windows/linux, and left-click
   * without the ctrl key on Macs.
   *
   * @return {boolean} The result.
   */
  isMouseActionButton() {
    // Webkit does not ctrl+click to be a right-click, so we
    // normalize it to behave like Gecko and Opera.
    return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
  }

  /**
   * @override
   */
  stopPropagation() {
    super.stopPropagation();
    if (this.event_.stopPropagation) {
      this.event_.stopPropagation();
    } else {
      this.event_.cancelBubble = true;
    }
  }

  /**
   * @override
   */
  preventDefault() {
    super.preventDefault();
    var be = this.event_;
    if (!be.preventDefault) {
      be.returnValue = false;
      if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {

        try {
          // Most keys can be prevented using returnValue. Some special keys
          // require setting the keyCode to -1 as well:
          //
          // In IE7:
          // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
          //
          // In IE8:
          // Ctrl+P, Crtl+O, Ctrl+F (F1-F12 cannot be stopped through the event)
          //
          // We therefore do this for all function keys as well as when Ctrl key
          // is pressed.
          var VK_F1 = 112;
          var VK_F12 = 123;
          if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
            be.keyCode = -1;
          }
        } catch (ex) {
          // IE throws an 'access denied' exception when trying to change
          // keyCode in some situations (e.g. srcElement is input[type=file],
          // or srcElement is an anchor tag rewritten by parent's innerHTML).
          // Do nothing in this case.
        }
      }
    } else {
      be.preventDefault();
    }
  }

  /**
   * @return {Event} The underlying browser event object.
   */
  getBrowserEvent() {
    return this.event_;
  }

  /**
   * Extracts the pointer type from the given event.
   * @param {!Event} e
   * @return {string} The pointer type, e.g. 'mouse', 'pen', or 'touch'.
   * @private
   */
  static getPointerType_(e) {
    if (goog.isString(e.pointerType)) {
      return e.pointerType;
    }
    // IE10 uses integer codes for pointer type.
    // https://msdn.microsoft.com/en-us/library/hh772359(v=vs.85).aspx
    return goog.events.BrowserEvent.IE_POINTER_TYPE_MAP[e.pointerType] || '';
  }
};



/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Normalized pointer type constants for pointer events.
 * @enum {string}
 */
goog.events.BrowserEvent.PointerType = {
  MOUSE: 'mouse',
  PEN: 'pen',
  TOUCH: 'touch'
};


/**
 * Static data for mapping mouse buttons.
 * @type {!Array<number>}
 * @deprecated Use `goog.events.BrowserEvent.IE_BUTTON_MAP` instead.
 */
goog.events.BrowserEvent.IEButtonMap = goog.debug.freeze([
  1,  // LEFT
  4,  // MIDDLE
  2   // RIGHT
]);


/**
 * Static data for mapping mouse buttons.
 * @const {!Array<number>}
 */
goog.events.BrowserEvent.IE_BUTTON_MAP = goog.events.BrowserEvent.IEButtonMap;


/**
 * Static data for mapping MSPointerEvent types to PointerEvent types.
 * @const {!Object<number, goog.events.BrowserEvent.PointerType>}
 */
goog.events.BrowserEvent.IE_POINTER_TYPE_MAP = goog.debug.freeze({
  2: goog.events.BrowserEvent.PointerType.TOUCH,
  3: goog.events.BrowserEvent.PointerType.PEN,
  4: goog.events.BrowserEvent.PointerType.MOUSE
});

