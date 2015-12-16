/* pubsoup
 */

// TODO make pubsoup keep the events on the instance
import * as util from './util.js'
var topics = {}
var callbacks = {}

function find (query) {
  topics[query] = topics[query] || []
  return topics[query]
}

function subscribe (topic, subscriber, priority = 90) {
  var foundTopic = find(topic)
  subscriber._priority = priority
  foundTopic.push(subscriber)

  // sort subscribers on priority
  foundTopic.sort(function (a, b) {
    return (a._priority > b._priority) ? 1 : ((b._priority > a._priority) ? -1 : 0)
  })
}

function unsubscribe (topic, subscriber) {
  var foundTopic = find(topic)
  foundTopic.forEach(function (t) {
    // if no subscriber is specified
    // remove all subscribers
    if (!subscriber) {
      t.length = 0
      return
    }

    // find the subscriber in the topic
    var index = [].indexOf.call(t, subscriber)

    // show an error if we didn't find the subscriber
    if (index === -1) {
      return util.log('Subscriber not found in topic')
    }

    t.splice(index, 1)
  })
}

// sequentially runs a method on all plugins
// TODO when triggering a new change event,
// stop the previous `change` run somehow.
// create a sort of run queue, that is cleared on each publish
function publish (options) {
  return function (topic, params = {}) {
    var foundTopic = find(topic)
    var runList = []

    foundTopic.forEach(function (subscriber) {
      // debounce each function with the delay in options
      // so we don't have to use debounce in each individual plugin
      runList.push(util.debounce(subscriber, options.debounce))
    })

    util.seq(runList, params, runCallbacks(topic))
  }
}

// parallel run all .done callbacks
function runCallbacks (topic) {
  return function () {
    callbacks[topic] = callbacks[topic] || []

    for (let c of callbacks[topic]) {
      c.apply(this, arguments)
    }
  }
}

// attach a callback when a publish[topic] is done
function done (topic, callback = function () {}) {
  callbacks[topic] = callbacks[topic] || []
  callbacks[topic].push(callback)
}

export {
  subscribe,
  unsubscribe,
  publish,
  done
}
