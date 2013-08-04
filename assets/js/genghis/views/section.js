define([
    'jquery', 'underscore', 'backbone', 'genghis/views/view', 'genghis/views', 'mousetrap', 'jquery.tablesorter', 'tablesorter-size-parser'
], function($, _, Backbone, View, Views, Mousetrap, _1, _2) {

    return Views.Section = View.extend({

        events: {
            'click .add-form-toggle button': 'showAddForm',
            'click .add-form button.add':    'submitAddForm',
            'click .add-form button.cancel': 'closeAddForm',
            'keyup .add-form input.name':    'updateOnKeyup'
        },

        initialize: function() {
            _.bindAll(
                this, 'render', 'updateTitle', 'showAddForm', 'submitAddForm',
                'closeAddForm', 'updateOnKeyup', 'addModel', 'addModelAndUpdate',
                'addAll', 'onRequest', 'onSync'
            );

            if (this.model) {
                this.model.bind('change', this.updateTitle);
            }

            if (this.collection) {
                this.collection.bind('reset', this.render);
                this.collection.bind('add',   this.addModelAndUpdate);
                this.collection.bind('request', this.onRequest);
                this.collection.bind('sync',    this.onSync);
            }

            this.render();
        },

        render: function() {
            this.$el.html(this.template({title: this.formatTitle(this.model)}));

            this.addForm      = this.$('.add-form');
            this.addButton    = this.$('.add-form button.add');
            this.addInput     = this.$('.add-form input');
            this.cancelButton = this.$('.add-form button.cancel');

            this.addAll();

            // Sort this bad boy.
            this.$('table').tablesorter({textExtraction: function(el) {
                return $('.value', el).text() || $(el).text();
            }});
            if (this.collection.size()) this.$('table').trigger('sorton', [[[0,0]]]);

            return this;
        },

        updateTitle: function() {
            this.$('> header h2').text(this.formatTitle(this.model));
        },

        showAddForm: function(e) {
            if (e && e.preventDefault()) {
                e.preventDefault();
            }

            this.$('.add-form-toggle').hide();
            this.addForm.show();
            this.addInput.select().focus();
        },

        submitAddForm: function() {
            this.collection.create({name: this.addInput.val()}, {
                wait:    true,
                success: this.closeAddForm,
                error:   function(model, response) {
                    window.app.alerts.handleError(response);
                }
            });
        },

        closeAddForm: function() {
            this.$('.add-form-toggle').show();
            this.addForm.hide();
            this.addInput.val('');
        },

        updateOnKeyup: function(e) {
            if (e.keyCode == 13) this.submitAddForm();  // enter
            if (e.keyCode == 27) this.closeAddForm();   // escape
        },

        addModel: function(model) {
            var view = new this.rowView({model: model});
            this.$('table tbody').append(view.render().el);
        },

        addModelAndUpdate: function(model) {
            this.addModel(model);
            this.$('table').trigger('update');
        },

        addAll: function() {
            this.$('table tbody').html('');
            this.collection.each(this.addModel);
        },

        show: function() {
            Mousetrap.bind('c', this.showAddForm);
            $('body').addClass('section-' + this.$el.attr('id'));
            this.$el.show();
            $(document).scrollTop(0);
        },

        hide: function() {
            Mousetrap.unbind('c');
            $('body').removeClass('section-' + this.$el.attr('id'));
            this.$el.hide();
        },

        onRequest: function() {
            this.$el.addClass('spinning');
        },

        onSync: function() {
            this.$el.removeClass('spinning');
        }
    });
});
