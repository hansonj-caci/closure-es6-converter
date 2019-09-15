// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The SafeUrl type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeUrl');

goog.require('goog.asserts');
goog.require('goog.fs.url');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');

/**
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeUrl = class {
  /**
   * A string that is safe to use in URL context in DOM APIs and HTML documents.
   *
   * A SafeUrl is a string-like object that carries the security type contract
   * that its value as a string will not cause untrusted script execution
   * when evaluated as a hyperlink URL in a browser.
   *
   * Values of this type are guaranteed to be safe to use in URL/hyperlink
   * contexts, such as assignment to URL-valued DOM properties, in the sense that
   * the use will not result in a Cross-Site-Scripting vulnerability. Similarly,
   * SafeUrls can be interpolated into the URL context of an HTML template (e.g.,
   * inside a href attribute). However, appropriate HTML-escaping must still be
   * applied.
   *
   * Note that, as documented in `goog.html.SafeUrl.unwrap`, this type's
   * contract does not guarantee that instances are safe to interpolate into HTML
   * without appropriate escaping.
   *
   * Note also that this type's contract does not imply any guarantees regarding
   * the resource the URL refers to.  In particular, SafeUrls are <b>not</b>
   * safe to use in a context where the referred-to resource is interpreted as
   * trusted code, e.g., as the src of a script tag.
   *
   * Instances of this type must be created via the factory methods
   * (`goog.html.SafeUrl.fromConstant`, `goog.html.SafeUrl.sanitize`),
   * etc and not by invoking its constructor.  The constructor intentionally
   * takes no parameters and the type is immutable; hence only a default instance
   * corresponding to the empty string can be obtained via constructor invocation.
   *
   * @see goog.html.SafeUrl#fromConstant
   * @see goog.html.SafeUrl#from
   * @see goog.html.SafeUrl#sanitize
   */
  constructor() {
    /**
     * The contained value of this SafeUrl.  The field has a purposely ugly
     * name to make (non-compiled) code that attempts to directly access this
     * field stand out.
     * @private {string}
     */
    this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

    /**
     * A type marker used to implement additional run-time type checking.
     * @see goog.html.SafeUrl#unwrap
     * @const {!Object}
     * @private
     */
    this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
    /**
     * @override
     * @const
     */
    this.implementsGoogStringTypedString = true;
    /**
     * @override
     * @const
     */
    this.implementsGoogI18nBidiDirectionalString = true;
  }

  /**
   * Returns this SafeUrl's value a string.
   *
   * IMPORTANT: In code where it is security relevant that an object's type is
   * indeed `SafeUrl`, use `goog.html.SafeUrl.unwrap` instead of this
   * method. If in doubt, assume that it's security relevant. In particular, note
   * that goog.html functions which return a goog.html type do not guarantee that
   * the returned instance is of the right type. For example:
   *
   * <pre>
   * var fakeSafeHtml = new String('fake');
   * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
   * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
   * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
   * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml instanceof
   * // goog.html.SafeHtml.
   * </pre>
   *
   * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
   * behavior of browsers when interpreting URLs. Values of SafeUrl objects MUST
   * be appropriately escaped before embedding in a HTML document. Note that the
   * required escaping is context-sensitive (e.g. a different escaping is
   * required for embedding a URL in a style property within a style
   * attribute, as opposed to embedding in a href attribute).
   *
   * @see goog.html.SafeUrl#unwrap
   * @override
   */
  getTypedStringValue() {
    return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  }

  /**
   * Returns this URLs directionality, which is always `LTR`.
   * @override
   */
  getDirection() {
    return goog.i18n.bidi.Dir.LTR;
  }

  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeUrl, use
   * `goog.html.SafeUrl.unwrap`.
   *
   * @see goog.html.SafeUrl#unwrap
   * @override
   */
  toString() {
    return 'SafeUrl{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  }

  /**
   * Performs a runtime check that the provided object is indeed a SafeUrl
   * object, and returns its value.
   *
   * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
   * behavior of  browsers when interpreting URLs. Values of SafeUrl objects MUST
   * be appropriately escaped before embedding in a HTML document. Note that the
   * required escaping is context-sensitive (e.g. a different escaping is
   * required for embedding a URL in a style property within a style
   * attribute, as opposed to embedding in a href attribute).
   *
   * @param {!goog.html.SafeUrl} safeUrl The object to extract from.
   * @return {string} The SafeUrl object's contained string, unless the run-time
   *     type check fails. In that case, `unwrap` returns an innocuous
   *     string, or, if assertions are enabled, throws
   *     `goog.asserts.AssertionError`.
   */
  static unwrap(safeUrl) {
    // Perform additional Run-time type-checking to ensure that safeUrl is indeed
    // an instance of the expected type.  This provides some additional protection
    // against security bugs due to application code that disables type checks.
    // Specifically, the following checks are performed:
    // 1. The object is an instance of the expected type.
    // 2. The object is not an instance of a subclass.
    // 3. The object carries a type marker for the expected type. "Faking" an
    // object requires a reference to the type marker, which has names intended
    // to stand out in code reviews.
    if (safeUrl instanceof goog.html.SafeUrl && safeUrl.constructor === goog.html.SafeUrl && safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
      return safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
    } else {
      goog.asserts.fail('expected object of type SafeUrl, got \'' + safeUrl + '\' of type ' + goog.typeOf(safeUrl));
      return 'type_error:SafeUrl';
    }
  }

  /**
   * Creates a SafeUrl object from a compile-time constant string.
   *
   * Compile-time constant strings are inherently program-controlled and hence
   * trusted.
   *
   * @param {!goog.string.Const} url A compile-time-constant string from which to
   *         create a SafeUrl.
   * @return {!goog.html.SafeUrl} A SafeUrl object initialized to `url`.
   */
  static fromConstant(url) {
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
  }

  /**
   * Creates a SafeUrl wrapping a blob URL for the given `blob`.
   *
   * The blob URL is created with `URL.createObjectURL`. If the MIME type
   * for `blob` is not of a known safe audio, image or video MIME type,
   * then the SafeUrl will wrap {@link #INNOCUOUS_STRING}.
   *
   * @see http://www.w3.org/TR/FileAPI/#url
   * @param {!Blob} blob
   * @return {!goog.html.SafeUrl} The blob URL, or an innocuous string wrapped
   *   as a SafeUrl.
   */
  static fromBlob(blob) {
    var url = goog.html.SafeUrl.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ? goog.fs.url.createObjectUrl(blob) : goog.html.SafeUrl.INNOCUOUS_STRING;
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
  }

  /**
   * Creates a SafeUrl wrapping a data: URL, after validating it matches a
   * known-safe audio, image or video MIME type.
   *
   * @param {string} dataUrl A valid base64 data URL with one of the whitelisted
   *     audio, image or video MIME types.
   * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
   *     wrapped as a SafeUrl if it does not pass.
   */
  static fromDataUrl(dataUrl) {
    // RFC4648 suggest to ignore CRLF in base64 encoding.
    // See https://tools.ietf.org/html/rfc4648.
    // Remove the CR (%0D) and LF (%0A) from the dataUrl.
    var filteredDataUrl = dataUrl.replace(/(%0A|%0D)/g, '');
    // There's a slight risk here that a browser sniffs the content type if it
    // doesn't know the MIME type and executes HTML within the data: URL. For this
    // to cause XSS it would also have to execute the HTML in the same origin
    // of the page with the link. It seems unlikely that both of these will
    // happen, particularly in not really old IEs.
    var match = filteredDataUrl.match(goog.html.SafeUrl.DATA_URL_PATTERN_);
    var valid = match && goog.html.SafeUrl.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(valid ? filteredDataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
  }

  /**
   * Creates a SafeUrl wrapping a tel: URL.
   *
   * @param {string} telUrl A tel URL.
   * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
   *     wrapped as a SafeUrl if it does not pass.
   */
  static fromTelUrl(telUrl) {
    // There's a risk that a tel: URL could immediately place a call once
    // clicked, without requiring user confirmation. For that reason it is
    // handled in this separate function.
    if (!goog.string.caseInsensitiveStartsWith(telUrl, 'tel:')) {
      telUrl = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(telUrl);
  }

  /**
   * Creates a SafeUrl wrapping a sip: URL. We only allow urls that consist of an
   * email address. The characters '?' and '#' are not allowed in the local part
   * of the email address.
   *
   * @param {string} sipUrl A sip URL.
   * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
   *     wrapped as a SafeUrl if it does not pass.
   */
  static fromSipUrl(sipUrl) {
    if (!goog.html.SafeUrl.SIP_URL_PATTERN_.test(decodeURIComponent(sipUrl))) {
      sipUrl = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(sipUrl);
  }

  /**
   * Creates a SafeUrl wrapping a sms: URL.
   *
   * @param {string} smsUrl A sms URL.
   * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
   *     wrapped as a SafeUrl if it does not pass.
   */
  static fromSmsUrl(smsUrl) {
    if (!goog.string.caseInsensitiveStartsWith(smsUrl, 'sms:') || !goog.html.SafeUrl.isSmsUrlBodyValid_(smsUrl)) {
      smsUrl = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(smsUrl);
  }

  /**
   * Validates SMS URL `body` parameter, which is optional and should appear at
   * most once and should be percent-encoded if present. Rejects many malformed
   * bodies, but may spuriously reject some URLs and does not reject all malformed
   * sms: URLs.
   *
   * @param {string} smsUrl A sms URL.
   * @return {boolean} Whether SMS URL has a valid `body` parameter if it exists.
   * @private
   */
  static isSmsUrlBodyValid_(smsUrl) {
    var hash = smsUrl.indexOf('#');
    if (hash > 0) {
      smsUrl = smsUrl.substring(0, hash);
    }
    var bodyParams = smsUrl.match(/[?&]body=/gi);
    // "body" param is optional
    if (!bodyParams) {
      return true;
    }
    // "body" MUST only appear once
    if (bodyParams.length > 1) {
      return false;
    }
    // Get the encoded `body` parameter value.
    var bodyValue = smsUrl.match(/[?&]body=([^&]*)/)[1];
    if (!bodyValue) {
      return true;
    }
    try {
      decodeURIComponent(bodyValue);
    } catch (error) {
      return false;
    }
    return /^(?:[a-z0-9\-_.~]|%[0-9a-f]{2})+$/i.test(bodyValue);
  }

  /**
   * Creates a SafeUrl from TrustedResourceUrl. This is safe because
   * TrustedResourceUrl is more tightly restricted than SafeUrl.
   *
   * @param {!goog.html.TrustedResourceUrl} trustedResourceUrl
   * @return {!goog.html.SafeUrl}
   */
  static fromTrustedResourceUrl(trustedResourceUrl) {
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl));
  }

  /**
   * Creates a SafeUrl object from `url`. If `url` is a
   * goog.html.SafeUrl then it is simply returned. Otherwise the input string is
   * validated to match a pattern of commonly used safe URLs.
   *
   * `url` may be a URL with the http, https, mailto or ftp scheme,
   * or a relative URL (i.e., a URL without a scheme; specifically, a
   * scheme-relative, absolute-path-relative, or path-relative URL).
   *
   * @see http://url.spec.whatwg.org/#concept-relative-url
   * @param {string|!goog.string.TypedString} url The URL to validate.
   * @return {!goog.html.SafeUrl} The validated URL, wrapped as a SafeUrl.
   */
  static sanitize(url) {
    if (url instanceof goog.html.SafeUrl) {
      return url;
    } else if (typeof url == 'object' && url.implementsGoogStringTypedString) {
      url = /** @type {!goog.string.TypedString} */ (url).getTypedStringValue();
    } else {
      url = String(url);
    }
    if (!goog.html.SafeUrl.SAFE_URL_PATTERN_.test(url)) {
      url = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
  }

  /**
   * Creates a SafeUrl object from `url`. If `url` is a
   * goog.html.SafeUrl then it is simply returned. Otherwise the input string is
   * validated to match a pattern of commonly used safe URLs.
   *
   * `url` may be a URL with the http, https, mailto or ftp scheme,
   * or a relative URL (i.e., a URL without a scheme; specifically, a
   * scheme-relative, absolute-path-relative, or path-relative URL).
   *
   * This function asserts (using goog.asserts) that the URL matches this pattern.
   * If it does not, in addition to failing the assert, an innocous URL will be
   * returned.
   *
   * @see http://url.spec.whatwg.org/#concept-relative-url
   * @param {string|!goog.string.TypedString} url The URL to validate.
   * @return {!goog.html.SafeUrl} The validated URL, wrapped as a SafeUrl.
   */
  static sanitizeAssertUnchanged(url) {
    if (url instanceof goog.html.SafeUrl) {
      return url;
    } else if (typeof url == 'object' && url.implementsGoogStringTypedString) {
      url = /** @type {!goog.string.TypedString} */ (url).getTypedStringValue();
    } else {
      url = String(url);
    }
    if (!goog.asserts.assert(goog.html.SafeUrl.SAFE_URL_PATTERN_.test(url))) {
      url = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
  }

  /**
   * Package-internal utility method to create SafeUrl instances.
   *
   * @param {string} url The string to initialize the SafeUrl object with.
   * @return {!goog.html.SafeUrl} The initialized SafeUrl object.
   * @package
   */
  static createSafeUrlSecurityPrivateDoNotAccessOrElse(url) {
    var safeUrl = new goog.html.SafeUrl();
    safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = url;
    return safeUrl;
  }
};


/**
 * The innocuous string generated by goog.html.SafeUrl.sanitize when passed
 * an unsafe URL.
 *
 * about:invalid is registered in
 * http://www.w3.org/TR/css3-values/#about-invalid.
 * http://tools.ietf.org/html/rfc6694#section-2.2.1 permits about URLs to
 * contain a fragment, which is not to be considered when determining if an
 * about URL is well-known.
 *
 * Using about:invalid seems preferable to using a fixed data URL, since
 * browsers might choose to not report CSP violations on it, as legitimate
 * CSS function calls to attr() can result in this URL being produced. It is
 * also a standard URL which matches exactly the semantics we need:
 * "The about:invalid URI references a non-existent document with a generic
 * error condition. It can be used when a URI is necessary, but the default
 * value shouldn't be resolveable as any type of document".
 *
 * @const {string}
 */
goog.html.SafeUrl.INNOCUOUS_STRING = 'about:invalid#zClosurez';

if (goog.DEBUG) {
}

/**
 * A pattern that matches Blob or data types that can have SafeUrls created
 * from URL.createObjectURL(blob) or via a data: URI.
 * @const
 * @private
 */
goog.html.SafeUrl.SAFE_MIME_TYPE_PATTERN_ = new RegExp(
    // Note: Due to content-sniffing concerns, only add MIME types for
    // media formats.
    '^(?:audio/(?:3gpp2|3gpp|aac|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-wav|wav|webm)|' +
        'image/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|' +
        // TODO(b/68188949): Due to content-sniffing concerns, text/csv should
        // be removed from the whitelist.
        'text/csv|' +
        'video/(?:mpeg|mp4|ogg|webm|quicktime))$',
    'i');

/**
 * Matches a base-64 data URL, with the first match group being the MIME type.
 * @const
 * @private
 */
goog.html.SafeUrl.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;

/**
 * Matches a sip/sips URL. We only allow urls that consist of an email address.
 * The characters '?' and '#' are not allowed in the local part of the email
 * address.
 * @const
 * @private
 */
goog.html.SafeUrl.SIP_URL_PATTERN_ = new RegExp(
    '^sip[s]?:[+a-z0-9_.!$%&\'*\\/=^`{|}~-]+@([a-z0-9-]+\\.)+[a-z0-9]{2,63}$',
    'i');

/**
 * A pattern that recognizes a commonly useful subset of URLs that satisfy
 * the SafeUrl contract.
 *
 * This regular expression matches a subset of URLs that will not cause script
 * execution if used in URL context within a HTML document. Specifically, this
 * regular expression matches if (comment from here on and regex copied from
 * Soy's EscapingConventions):
 * (1) Either a protocol in a whitelist (http, https, mailto or ftp).
 * (2) or no protocol.  A protocol must be followed by a colon. The below
 *     allows that by allowing colons only after one of the characters [/?#].
 *     A colon after a hash (#) must be in the fragment.
 *     Otherwise, a colon after a (?) must be in a query.
 *     Otherwise, a colon after a single solidus (/) must be in a path.
 *     Otherwise, a colon after a double solidus (//) must be in the authority
 *     (before port).
 *
 * @private
 * @const {!RegExp}
 */
goog.html.SafeUrl.SAFE_URL_PATTERN_ =
    /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;

/**
 * Public version of goog.html.SafeUrl.SAFE_URL_PATTERN_. Updating
 * goog.html.SafeUrl.SAFE_URL_PATTERN_ doesn't seem to be backward compatible.
 * Namespace is also changed to goog.html.SafeUrl so it can be imported using
 * goog.require('goog.dom.SafeUrl').
 *
 * TODO(bangert): Remove SAFE_URL_PATTERN_
 * @const {!RegExp}
 */
goog.html.SafeUrl.SAFE_URL_PATTERN = goog.html.SafeUrl.SAFE_URL_PATTERN_;

/**
 * Type marker for the SafeUrl type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

/**
 * A SafeUrl corresponding to the special about:blank url.
 * @const {!goog.html.SafeUrl}
 */
goog.html.SafeUrl.ABOUT_BLANK =
    goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
        'about:blank');
