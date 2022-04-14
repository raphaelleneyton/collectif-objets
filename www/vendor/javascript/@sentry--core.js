export{addBreadcrumb,captureEvent,captureException,captureMessage,configureScope,setContext,setExtra,setExtras,setTag,setTags,setUser,startTransaction,withScope}from"@sentry/minimal";import{addGlobalEventProcessor as e,getCurrentHub as t,Scope as n}from"@sentry/hub";export{Hub,Scope,Session,addGlobalEventProcessor,getCurrentHub,getHubFromCarrier,makeMain}from"@sentry/hub";import{makeDsn as r,urlEncode as o,dsnToString as s,logger as i,addNonEnumerableProperty as a,checkOrSetAlreadyCaught as u,isPrimitive as p,SyncPromise as d,uuid4 as c,dateTimestampInSeconds as l,resolvedSyncPromise as v,normalize as f,truncate as h,rejectedSyncPromise as g,SentryError as _,isThenable as m,isPlainObject as y,createEnvelope as E,serializeEnvelope as k,makePromiseBuffer as S,getEnvelopeType as b,isRateLimited as B,disabledUntil as x,eventStatusFromHttpCode as w,updateRateLimits as C}from"@sentry/utils";import{__spread as I,__values as A,__assign as P,__read as T}from"tslib";import{I as D}from"../_/d06c6758.js";export{initAndBind}from"./sdk.js";import{FunctionToString as M}from"./integrations/functiontostring.js";import{InboundFilters as O}from"./integrations/inboundfilters.js";var R="7";
/**
 * Helper class to provide urls, headers and metadata that can be used to form
 * different types of requests to Sentry endpoints.
 * Supports both envelopes and regular event requests.
 *
 * @deprecated Please use APIDetails
 **/var N=function(){function API(e,t,n){void 0===t&&(t={});this.dsn=e;this._dsnObject=r(e);this.metadata=t;this._tunnel=n}API.prototype.getDsn=function(){return this._dsnObject};API.prototype.forceEnvelope=function(){return!!this._tunnel};API.prototype.getBaseApiEndpoint=function(){return getBaseApiEndpoint(this._dsnObject)};API.prototype.getStoreEndpoint=function(){return getStoreEndpoint(this._dsnObject)};API.prototype.getStoreEndpointWithUrlEncodedAuth=function(){return getStoreEndpointWithUrlEncodedAuth(this._dsnObject)};API.prototype.getEnvelopeEndpointWithUrlEncodedAuth=function(){return getEnvelopeEndpointWithUrlEncodedAuth(this._dsnObject,this._tunnel)};return API}();function initAPIDetails(e,t,n){return{initDsn:e,metadata:t||{},dsn:r(e),tunnel:n}}function getBaseApiEndpoint(e){var t=e.protocol?e.protocol+":":"";var n=e.port?":"+e.port:"";return t+"//"+e.host+n+(e.path?"/"+e.path:"")+"/api/"}function _getIngestEndpoint(e,t){return""+getBaseApiEndpoint(e)+e.projectId+"/"+t+"/"}function _encodedAuth(e){return o({sentry_key:e.publicKey,sentry_version:R})}function getStoreEndpoint(e){return _getIngestEndpoint(e,"store")}function getStoreEndpointWithUrlEncodedAuth(e){return getStoreEndpoint(e)+"?"+_encodedAuth(e)}function _getEnvelopeEndpoint(e){return _getIngestEndpoint(e,"envelope")}function getEnvelopeEndpointWithUrlEncodedAuth(e,t){return t||_getEnvelopeEndpoint(e)+"?"+_encodedAuth(e)}function getRequestHeaders(e,t,n){var r=["Sentry sentry_version="+R];r.push("sentry_client="+t+"/"+n);r.push("sentry_key="+e.publicKey);e.pass&&r.push("sentry_secret="+e.pass);return{"Content-Type":"application/json","X-Sentry-Auth":r.join(", ")}}function getReportDialogEndpoint(e,t){var n=r(e);var o=getBaseApiEndpoint(n)+"embed/error-page/";var i="dsn="+s(n);for(var a in t)if("dsn"!==a)if("user"===a){if(!t.user)continue;t.user.name&&(i+="&name="+encodeURIComponent(t.user.name));t.user.email&&(i+="&email="+encodeURIComponent(t.user.email))}else i+="&"+encodeURIComponent(a)+"="+encodeURIComponent(t[a]);return o+"?"+i}var z=[];function filterDuplicates(e){return e.reduce((function(e,t){e.every((function(e){return t.name!==e.name}))&&e.push(t);return e}),[])}function getIntegrationsToSetup(e){var t=e.defaultIntegrations&&I(e.defaultIntegrations)||[];var n=e.integrations;var r=I(filterDuplicates(t));if(Array.isArray(n))r=I(r.filter((function(e){return n.every((function(t){return t.name!==e.name}))})),filterDuplicates(n));else if("function"===typeof n){r=n(r);r=Array.isArray(r)?r:[r]}var o=r.map((function(e){return e.name}));var s="Debug";-1!==o.indexOf(s)&&r.push.apply(r,I(r.splice(o.indexOf(s),1)));return r}function setupIntegration(n){if(-1===z.indexOf(n.name)){n.setupOnce(e,t);z.push(n.name);D&&i.log("Integration installed: "+n.name)}}
/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */function setupIntegrations(e){var t={};getIntegrationsToSetup(e).forEach((function(e){t[e.name]=e;setupIntegration(e)}));a(t,"initialized",true);return t}var j="Not capturing exception because it's already been captured.";var U=function(){
/**
     * Initializes this client instance.
     *
     * @param backendClass A constructor function to create the backend.
     * @param options Options for the client.
     */
function BaseClient(e,t){this._integrations={};this._numProcessing=0;this._backend=new e(t);this._options=t;t.dsn&&(this._dsn=r(t.dsn))}BaseClient.prototype.captureException=function(e,t,n){var r=this;if(!u(e)){var o=t&&t.event_id;this._process(this._getBackend().eventFromException(e,t).then((function(e){return r._captureEvent(e,t,n)})).then((function(e){o=e})));return o}D&&i.log(j)};BaseClient.prototype.captureMessage=function(e,t,n,r){var o=this;var s=n&&n.event_id;var i=p(e)?this._getBackend().eventFromMessage(String(e),t,n):this._getBackend().eventFromException(e,n);this._process(i.then((function(e){return o._captureEvent(e,n,r)})).then((function(e){s=e})));return s};BaseClient.prototype.captureEvent=function(e,t,n){if(!(t&&t.originalException&&u(t.originalException))){var r=t&&t.event_id;this._process(this._captureEvent(e,t,n).then((function(e){r=e})));return r}D&&i.log(j)};BaseClient.prototype.captureSession=function(e){if(this._isEnabled())if("string"===typeof e.release){this._sendSession(e);e.update({init:false})}else D&&i.warn("Discarded session because of missing or non-string release");else D&&i.warn("SDK not enabled, will not capture session.")};BaseClient.prototype.getDsn=function(){return this._dsn};BaseClient.prototype.getOptions=function(){return this._options};BaseClient.prototype.getTransport=function(){return this._getBackend().getTransport()};BaseClient.prototype.flush=function(e){var t=this;return this._isClientDoneProcessing(e).then((function(n){return t.getTransport().close(e).then((function(e){return n&&e}))}))};BaseClient.prototype.close=function(e){var t=this;return this.flush(e).then((function(e){t.getOptions().enabled=false;return e}))};BaseClient.prototype.setupIntegrations=function(){this._isEnabled()&&!this._integrations.initialized&&(this._integrations=setupIntegrations(this._options))};BaseClient.prototype.getIntegration=function(e){try{return this._integrations[e.id]||null}catch(t){D&&i.warn("Cannot retrieve integration "+e.id+" from the current Client");return null}};BaseClient.prototype._updateSessionFromEvent=function(e,t){var n,r;var o=false;var s=false;var i=t.exception&&t.exception.values;if(i){s=true;try{for(var a=A(i),u=a.next();!u.done;u=a.next()){var p=u.value;var d=p.mechanism;if(d&&false===d.handled){o=true;break}}}catch(e){n={error:e}}finally{try{u&&!u.done&&(r=a.return)&&r.call(a)}finally{if(n)throw n.error}}}var c="ok"===e.status;var l=c&&0===e.errors||c&&o;if(l){e.update(P(P({},o&&{status:"crashed"}),{errors:e.errors||Number(s||o)}));this.captureSession(e)}};BaseClient.prototype._sendSession=function(e){this._getBackend().sendSession(e)};
/**
     * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
     * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
     *
     * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
     * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
     * `true`.
     * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
     * `false` otherwise
     */BaseClient.prototype._isClientDoneProcessing=function(e){var t=this;return new d((function(n){var r=0;var o=1;var s=setInterval((function(){if(0==t._numProcessing){clearInterval(s);n(true)}else{r+=o;if(e&&r>=e){clearInterval(s);n(false)}}}),o)}))};BaseClient.prototype._getBackend=function(){return this._backend};BaseClient.prototype._isEnabled=function(){return false!==this.getOptions().enabled&&void 0!==this._dsn};
/**
     * Adds common information to events.
     *
     * The information includes release and environment from `options`,
     * breadcrumbs and context (extra, tags and user) from the scope.
     *
     * Information that is already present in the event is never overwritten. For
     * nested objects, such as the context, keys are merged.
     *
     * @param event The original event.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A new event with more information.
     */BaseClient.prototype._prepareEvent=function(e,t,r){var o=this;var s=this.getOptions(),i=s.normalizeDepth,a=void 0===i?3:i,u=s.normalizeMaxBreadth,p=void 0===u?1e3:u;var d=P(P({},e),{event_id:e.event_id||(r&&r.event_id?r.event_id:c()),timestamp:e.timestamp||l()});this._applyClientOptions(d);this._applyIntegrationsMetadata(d);var h=t;r&&r.captureContext&&(h=n.clone(h).update(r.captureContext));var g=v(d);h&&(g=h.applyToEvent(d,r));return g.then((function(e){e&&(e.sdkProcessingMetadata=P(P({},e.sdkProcessingMetadata),{normalizeDepth:f(a)+" ("+typeof a+")"}));return"number"===typeof a&&a>0?o._normalizeEvent(e,a,p):e}))};
/**
     * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
     * Normalized keys:
     * - `breadcrumbs.data`
     * - `user`
     * - `contexts`
     * - `extra`
     * @param event Event
     * @returns Normalized event
     */BaseClient.prototype._normalizeEvent=function(e,t,n){if(!e)return null;var r=P(P(P(P(P({},e),e.breadcrumbs&&{breadcrumbs:e.breadcrumbs.map((function(e){return P(P({},e),e.data&&{data:f(e.data,t,n)})}))}),e.user&&{user:f(e.user,t,n)}),e.contexts&&{contexts:f(e.contexts,t,n)}),e.extra&&{extra:f(e.extra,t,n)});e.contexts&&e.contexts.trace&&(r.contexts.trace=e.contexts.trace);r.sdkProcessingMetadata=P(P({},r.sdkProcessingMetadata),{baseClientNormalized:true});return r};
/**
     *  Enhances event using the client configuration.
     *  It takes care of all "static" values like environment, release and `dist`,
     *  as well as truncating overly long values.
     * @param event event instance to be enhanced
     */BaseClient.prototype._applyClientOptions=function(e){var t=this.getOptions();var n=t.environment,r=t.release,o=t.dist,s=t.maxValueLength,i=void 0===s?250:s;"environment"in e||(e.environment="environment"in t?n:"production");void 0===e.release&&void 0!==r&&(e.release=r);void 0===e.dist&&void 0!==o&&(e.dist=o);e.message&&(e.message=h(e.message,i));var a=e.exception&&e.exception.values&&e.exception.values[0];a&&a.value&&(a.value=h(a.value,i));var u=e.request;u&&u.url&&(u.url=h(u.url,i))};
/**
     * This function adds all used integrations to the SDK info in the event.
     * @param event The event that will be filled with all integrations.
     */BaseClient.prototype._applyIntegrationsMetadata=function(e){var t=Object.keys(this._integrations);if(t.length>0){e.sdk=e.sdk||{};e.sdk.integrations=I(e.sdk.integrations||[],t)}};
/**
     * Tells the backend to send this event
     * @param event The Sentry event to send
     */BaseClient.prototype._sendEvent=function(e){this._getBackend().sendEvent(e)};
/**
     * Processes the event and logs an error in case of rejection
     * @param event
     * @param hint
     * @param scope
     */BaseClient.prototype._captureEvent=function(e,t,n){return this._processEvent(e,t,n).then((function(e){return e.event_id}),(function(e){D&&i.error(e)}))};
/**
     * Processes an event (either error or message) and sends it to Sentry.
     *
     * This also adds breadcrumbs and context information to the event. However,
     * platform specific meta data (such as the User's IP address) must be added
     * by the SDK implementor.
     *
     *
     * @param event The event to send to Sentry.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
     */BaseClient.prototype._processEvent=function(e,t,n){var r=this;var o=this.getOptions(),s=o.beforeSend,i=o.sampleRate;var a=this.getTransport();function recordLostEvent(e,t){a.recordLostEvent&&a.recordLostEvent(e,t)}if(!this._isEnabled())return g(new _("SDK not enabled, will not capture event."));var u="transaction"===e.type;if(!u&&"number"===typeof i&&Math.random()>i){recordLostEvent("sample_rate","event");return g(new _("Discarding event because it's not included in the random sample (sampling rate = "+i+")"))}return this._prepareEvent(e,n,t).then((function(n){if(null===n){recordLostEvent("event_processor",e.type||"event");throw new _("An event processor returned null, will not send event.")}var r=t&&t.data&&true===t.data.__sentry__;if(r||u||!s)return n;var o=s(n,t);return _ensureBeforeSendRv(o)})).then((function(t){if(null===t){recordLostEvent("before_send",e.type||"event");throw new _("`beforeSend` returned `null`, will not send event.")}var o=n&&n.getSession&&n.getSession();!u&&o&&r._updateSessionFromEvent(o,t);r._sendEvent(t);return t})).then(null,(function(e){if(e instanceof _)throw e;r.captureException(e,{data:{__sentry__:true},originalException:e});throw new _("Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: "+e)}))};BaseClient.prototype._process=function(e){var t=this;this._numProcessing+=1;void e.then((function(e){t._numProcessing-=1;return e}),(function(e){t._numProcessing-=1;return e}))};return BaseClient}();function _ensureBeforeSendRv(e){var t="`beforeSend` method has to return `null` or a valid event.";if(m(e))return e.then((function(e){if(!(y(e)||null===e))throw new _(t);return e}),(function(e){throw new _("beforeSend rejected with "+e)}));if(!(y(e)||null===e))throw new _(t);return e}function getSdkMetadataForEnvelopeHeader(e){if(e.metadata&&e.metadata.sdk){var t=e.metadata.sdk,n=t.name,r=t.version;return{name:n,version:r}}}function enhanceEventWithSdkInfo(e,t){if(!t)return e;e.sdk=e.sdk||{};e.sdk.name=e.sdk.name||t.name;e.sdk.version=e.sdk.version||t.version;e.sdk.integrations=I(e.sdk.integrations||[],t.integrations||[]);e.sdk.packages=I(e.sdk.packages||[],t.packages||[]);return e}function createSessionEnvelope(e,t){var n=getSdkMetadataForEnvelopeHeader(t);var r=P(P({sent_at:(new Date).toISOString()},n&&{sdk:n}),!!t.tunnel&&{dsn:s(t.dsn)});var o="aggregates"in e?"sessions":"session";var i=[{type:o},e];var a=E(r,[i]);return[a,o]}function sessionToSentryRequest(e,t){var n=T(createSessionEnvelope(e,t),2),r=n[0],o=n[1];return{body:k(r),type:o,url:getEnvelopeEndpointWithUrlEncodedAuth(t.dsn,t.tunnel)}}function createEventEnvelope(e,t){var n=getSdkMetadataForEnvelopeHeader(t);var r=e.type||"event";var o=(e.sdkProcessingMetadata||{}).transactionSampling;var i=o||{},a=i.method,u=i.rate;enhanceEventWithSdkInfo(e,t.metadata.sdk);e.tags=e.tags||{};e.extra=e.extra||{};if(!(e.sdkProcessingMetadata&&e.sdkProcessingMetadata.baseClientNormalized)){e.tags.skippedNormalization=true;e.extra.normalizeDepth=e.sdkProcessingMetadata?e.sdkProcessingMetadata.normalizeDepth:"unset"}delete e.sdkProcessingMetadata;var p=P(P({event_id:e.event_id,sent_at:(new Date).toISOString()},n&&{sdk:n}),!!t.tunnel&&{dsn:s(t.dsn)});var d=[{type:r,sample_rates:[{id:a,rate:u}]},e];return E(p,[d])}function eventToSentryRequest(e,t){var n=getSdkMetadataForEnvelopeHeader(t);var r=e.type||"event";var o="transaction"===r||!!t.tunnel;var i=(e.sdkProcessingMetadata||{}).transactionSampling;var a=i||{},u=a.method,p=a.rate;enhanceEventWithSdkInfo(e,t.metadata.sdk);e.tags=e.tags||{};e.extra=e.extra||{};if(!(e.sdkProcessingMetadata&&e.sdkProcessingMetadata.baseClientNormalized)){e.tags.skippedNormalization=true;e.extra.normalizeDepth=e.sdkProcessingMetadata?e.sdkProcessingMetadata.normalizeDepth:"unset"}delete e.sdkProcessingMetadata;var d;try{d=JSON.stringify(e)}catch(t){e.tags.JSONStringifyError=true;e.extra.JSONStringifyError=t;try{d=JSON.stringify(f(e))}catch(e){var c=e;d=JSON.stringify({message:"JSON.stringify error after renormalization",extra:{message:c.message,stack:c.stack}})}}var l={body:d,type:r,url:o?getEnvelopeEndpointWithUrlEncodedAuth(t.dsn,t.tunnel):getStoreEndpointWithUrlEncodedAuth(t.dsn)};if(o){var v=P(P({event_id:e.event_id,sent_at:(new Date).toISOString()},n&&{sdk:n}),!!t.tunnel&&{dsn:s(t.dsn)});var h=[{type:r,sample_rates:[{id:u,rate:p}]},l.body];var g=E(v,[h]);l.body=k(g)}return l}var F=function(){function NoopTransport(){}NoopTransport.prototype.sendEvent=function(e){return v({reason:"NoopTransport: Event has been skipped because no Dsn is configured.",status:"skipped"})};NoopTransport.prototype.close=function(e){return v(true)};return NoopTransport}();var W=function(){function BaseBackend(e){this._options=e;this._options.dsn||D&&i.warn("No DSN provided, backend will not do anything.");this._transport=this._setupTransport()}BaseBackend.prototype.eventFromException=function(e,t){throw new _("Backend has to implement `eventFromException` method")};BaseBackend.prototype.eventFromMessage=function(e,t,n){throw new _("Backend has to implement `eventFromMessage` method")};BaseBackend.prototype.sendEvent=function(e){if(this._newTransport&&this._options.dsn&&this._options._experiments&&this._options._experiments.newTransport){var t=initAPIDetails(this._options.dsn,this._options._metadata,this._options.tunnel);var n=createEventEnvelope(e,t);void this._newTransport.send(n).then(null,(function(e){D&&i.error("Error while sending event:",e)}))}else void this._transport.sendEvent(e).then(null,(function(e){D&&i.error("Error while sending event:",e)}))};BaseBackend.prototype.sendSession=function(e){if(this._transport.sendSession)if(this._newTransport&&this._options.dsn&&this._options._experiments&&this._options._experiments.newTransport){var t=initAPIDetails(this._options.dsn,this._options._metadata,this._options.tunnel);var n=T(createSessionEnvelope(e,t),1),r=n[0];void this._newTransport.send(r).then(null,(function(e){D&&i.error("Error while sending session:",e)}))}else void this._transport.sendSession(e).then(null,(function(e){D&&i.error("Error while sending session:",e)}));else D&&i.warn("Dropping session because custom transport doesn't implement sendSession")};BaseBackend.prototype.getTransport=function(){return this._transport};BaseBackend.prototype._setupTransport=function(){return new F};return BaseBackend}();var L=30;
/**
 * Creates a `NewTransport`
 *
 * @param options
 * @param makeRequest
 */function createTransport(e,t,n){void 0===n&&(n=S(e.bufferSize||L));var r={};var flush=function(e){return n.drain(e)};function send(e){var o=b(e);var s="event"===o?"error":o;var i={category:s,body:k(e)};if(B(r,s))return g({status:"rate_limit",reason:getRateLimitReason(r,s)});var requestTask=function(){return t(i).then((function(e){var t=e.body,n=e.headers,o=e.reason,i=e.statusCode;var a=w(i);n&&(r=C(r,n));return"success"===a?v({status:a,reason:o}):g({status:a,reason:o||t||("rate_limit"===a?getRateLimitReason(r,s):"Unknown transport error")})}))};return n.add(requestTask)}return{send:send,flush:flush}}function getRateLimitReason(e,t){return"Too many "+t+" requests, backing off until: "+new Date(x(e,t)).toISOString()}var H="6.19.6";var q=Object.freeze(Object.defineProperty({__proto__:null,FunctionToString:M,InboundFilters:O},Symbol.toStringTag,{value:"Module"}));export{N as API,W as BaseBackend,U as BaseClient,q as Integrations,F as NoopTransport,H as SDK_VERSION,createTransport,eventToSentryRequest,getEnvelopeEndpointWithUrlEncodedAuth,getReportDialogEndpoint,getRequestHeaders,getStoreEndpointWithUrlEncodedAuth,initAPIDetails,sessionToSentryRequest};

