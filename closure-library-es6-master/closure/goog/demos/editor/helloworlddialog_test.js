// Copyright 2008 The Closure Library Authors. All Rights Reserved.
// Use of this source code is governed by the Apache License, Version 2.0.

goog.provide('goog.demos.editor.HelloWorldDialogTest');
goog.setTestOnly('goog.demos.editor.HelloWorldDialogTest');

goog.require('goog.demos.editor.HelloWorldDialog');
goog.require('goog.dom.DomHelper');
goog.require('goog.events.EventHandler');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');
goog.require('goog.ui.editor.AbstractDialog.EventType');

let dialog;
let mockOkHandler;

const CUSTOM_MESSAGE = 'Hello, cruel world...';

function setUp() {
  mockOkHandler = new goog.testing.LooseMock(goog.events.EventHandler);
}

function tearDown() {
  dialog.dispose();
}

/**
 * Creates and shows the dialog to be tested.
 */
function createAndShow() {
  dialog = new goog.demos.editor.HelloWorldDialog(new goog.dom.DomHelper());
  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK,
                          mockOkHandler);
  dialog.show();
}

/**
 * Sets up the mock event handler to expect an OK event with the given
 * message.
 * @param {string} message Hello world message the OK event is expected to
 *     carry.
 */
function expectOk(message) {
  mockOkHandler.handleEvent(new goog.testing.mockmatchers.ArgumentMatcher(
      function(arg) {
        return arg.type == goog.ui.editor.AbstractDialog.EventType.OK &&
               arg.message == message;
      }));
}

/**
 * Tests that when you show the dialog, the input field has the correct
 * sample text in it.
 */
function testShow() {
  mockOkHandler.$replay();
  createAndShow();

  assertEquals('Input field has incorrect sample text',
               'Hello, world!',
               dialog.input_.value);
  mockOkHandler.$verify();
}

/**
 * Tests that clicking OK dispatches an event carying the entered message.
 */
function testOk() {
  expectOk(CUSTOM_MESSAGE);
  mockOkHandler.$replay();
  createAndShow();

  dialog.input_.value = CUSTOM_MESSAGE;
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  mockOkHandler.$verify(); // Verifies OK is dispatched with correct message.
}
