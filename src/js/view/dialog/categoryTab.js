define([
    'underscore', 'marionette', 'bootbox', 'tree', 'tools/logger', 'tools/constants',
    'text!templates/partials/error.html'
], function(_, Marionette, Bootbox, Tree, logger, Constants, tplErrorPartial) {

    'use strict';

    // see more about jstree at http://luban.danse.us/jazzclub/javascripts/jquery/jsTree/reference/
    return Marionette.View.extend({
        templateError: _.template(tplErrorPartial),

        initialize: function(options) {
            this.categories = options.categories;
        },

        render: function() {
            try {
                var tree = this.options.categories.getJsTree();
                this.bindBehaviors(tree);
            } catch (error) {
                console.error(error);
                this.$el.html(this.templateError(Constants.treeError));
            }
            return this;
        },

        bindBehaviors: function(tree) {
            var self = this;
            this.$el.jstree({
                json_data : {
                    data : tree,
                    progressive_render : true
                },
                plugins : [ "themes", "json_data", "dnd", "crrm", "ui" ]
            })
            .bind("open_node.jstree close_node.jstree", function (event, data) {
                var state = event.type == "open_node" ? "open" : "closed";
                self.categories.setState(data.rslt.obj.attr("id"), state);
            })
            .bind("move_node.jstree", function (event, data) {
                var id = data.rslt.o.attr("id");
                var parentId = data.rslt.np.attr("id");
                // data.rslt.op.attr("id") - old parent
                // data.rslt.np.attr("id") - new parent
                // data.rslt.cp - current posision
                logger.log("jstree-test-log", id, parentId, event, data);
            })
            .bind("rename_node.jstree", function (event, data) {
                var id = data.rslt.obj.attr("id");
                var new_name = data.rslt.name;
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "I-dont-know", // FIXME: remove manual AJAX call and use backbone mechanisms
                    data: {
                        action: "renameNode",
                        id: id,
                        new_name: new_name
                    }
                }).done(function(response) {
                    self.categories.renameNode(id, new_name);
                }).fail(function(response) {
                    Bootbox.alert("rename node failed.");
                });
            })
            .bind("create_node.jstree", function (event, data) {
                var parentId = data.rslt.parent;
                if (parentId == -1) { parentId = null }
                var name = "some-name";
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "I-dont-know", // FIXME: remove manual AJAX call and use backbone mechanisms
                    data: {
                        action: "createNode",
                        parentId: parentId,
                        name: name,
                        type: self.categories.options.type
                    }
                }).done(function(response) {
                    new_id = response;
                    // update tree component
                    data.rslt.obj.attr("id", new_id);
                    self.categories.addNode(new_id, "some name", parentId);
                }).fail(function(response) {
                    Bootbox.alert("create node failed.");
                });
            })
            .bind("delete_node.jstree", function (event, data) {
                logger.log("jstree-test-log", event, data);
            });
        }
    });
});
