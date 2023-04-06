export default {

  /**
   *  Assign runtime callbacks
   */
  beforeCreate() {
    if (!this.sockets) this.sockets = {};

    this.sockets.subscribe = (event, callback) => {
      this.$onlineState.emitter.addListener(event, callback, this);
    };

    this.sockets.unsubscribe = (event) => {
      this.$onlineState.emitter.removeListener(event, this);
    };
  },

  /**
   * Register all socket events
   */
  mounted() {
    if (this.$options.sockets) {
      Object.keys(this.$options.sockets).forEach(event => {

        if (event !== 'subscribe' && event !== 'unsubscribe') {
          this.$onlineState.emitter.addListener(event, this.$options.sockets[event], this);
        }
      });
    }
  },

  /**
   * unsubscribe when component unmounting
   */
  beforeDestroy() {
    if (this.$options.sockets) {
      Object.keys(this.$options.sockets).forEach(event => {

        this.$onlineState.emitter.removeListener(event, this);
      });
    }
  }
};