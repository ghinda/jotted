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

  // removes a function from an array
  remover (arr, fn) {
    arr.forEach(function () {
      // if no fn is specified
      // clean-up the array
      if (!fn) {
        arr.length = 0
        return
      }

      // find the fn in the arr
      var index = [].indexOf.call(arr, fn)

      // we didn't find it in the array
      if (index === -1) {
        return
      }

      arr.splice(index, 1)
    })
  }

  unsubscribe (topic, subscriber) {
    // remove from subscribers
    var foundTopic = this.find(topic)
    this.remover(foundTopic, subscriber)

    // remove from callbacks
    this.callbacks[topic] = this.callbacks[topic] || []
    this.remover(this.callbacks[topic], subscriber)
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
