/* pubsoup
 */

// TODO make pubsoup keep the events on the instance
import * as util from './util.js'
var topics = {}

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
function publish (topic, params = {}) {
  var foundTopic = find(topic)
  var runList = []

  foundTopic.forEach(function (subscriber) {
    runList.push(subscriber)
  })

  util.seq(runList, params)
}

export {
  subscribe,
  unsubscribe,
  publish
}
