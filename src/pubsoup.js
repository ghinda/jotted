/* pubsoup
 */

import * as util from './util.js'

export default class PubSoup {
  constructor () {
    this.topics = {}
    this.callbacks = {}
  }

  find (query) {
    this.topics[query] = this.topics[query] || []
    return this.topics[query]
  }

  subscribe (topic, subscriber, priority = 90) {
    var foundTopic = this.find(topic)
    subscriber._priority = priority
    foundTopic.push(subscriber)

    // sort subscribers on priority
    foundTopic.sort(function (a, b) {
      return (a._priority > b._priority) ? 1 : ((b._priority > a._priority) ? -1 : 0)
    })
  }

  unsubscribe (topic, subscriber) {
    var foundTopic = this.find(topic)
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
  publish (topic, params = {}) {
    var foundTopic = this.find(topic)
    var runList = []

    foundTopic.forEach(function (subscriber) {
      runList.push(subscriber)
    })

    util.seq(runList, params, this.runCallbacks(topic))
  }

  // parallel run all .done callbacks
  runCallbacks (topic) {
    var pub = this
    return function () {
      pub.callbacks[topic] = pub.callbacks[topic] || []

      pub.callbacks[topic].forEach((c) => {
        c.apply(this, arguments)
      })
    }
  }

  // attach a callback when a publish[topic] is done
  done (topic, callback = function () {}) {
    this.callbacks[topic] = this.callbacks[topic] || []
    this.callbacks[topic].push(callback)
  }
}
