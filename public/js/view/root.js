define(['underscore', 'backbone', 'logger', 'model/user'],
function(_, Backbone, logger, UserModel) {

    'use strict';

    return Backbone.View.extend({
        tagName: 'div',

        initialize: function(options) {
            var self = this;
            var ids = [1,2,3,4];
            for (var id in ids) {
                var user = new UserModel({id: ids[id], view: this});
                user.fetch();
            }
        },

        render: function() {
            logger.log('RENDER:', 'root');
            this.$el.html("<h1>hello world from W-L-D</h1>Those are our users:<ul></ul>");
        }
    });
});
