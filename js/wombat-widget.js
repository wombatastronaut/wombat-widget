;(function($, window, document, undefined) {
	'use strict'

	var pluginName = 'wombatWidget';
	var defaults = {
		width: 4,
		minWidth: 3,
		maxWidth: 12,
		height: 4,
		minHeight: 3,
		maxHeight: 6,
		settingsWidth: 5,
		settingsHeight: 4,
		headingTitle: 'Heading Title',
        toggleIcon: 'fa fa-ellipsis-v',
        iconClass: 'panel-control-icon',
        unpin: {
            icon: 'fa fa-arrows-alt',
            tooltip: 'Unpin'
        },
        openInNewTab: {
            icon: 'fa fa-external-link',
            tooltip: 'New tab'
        },
        expand: {
            icon: 'fa fa-expand',
            icon2: 'fa fa-compress',
            tooltip: 'Fullscreen'
        },
        settings: {
            icon: 'fa fa-cog',
            tooltip: 'Settings',
        },
        settingsContentTemplate: 'Settings',
        close: {
            icon: 'fa fa-times',
            tooltip: 'Close'
        }
	};

	function Plugin(el, options, grid) {
		var self = this;

        self.$el = el;
        self.$grid = grid;
		self.$options = self._processInput(options);
		self._generateBody();

        self._init();
	}

	$.extend(Plugin.prototype, {
        _processInput: function (options) {
            options = $.extend({}, defaults, options);

            return options;
        },

		_init: function() {
            var self = this;

        	self.$el.addClass('wombat-widget');
			self.$heading = self.$el.find('.panel-heading');
			self.$heading.append(self._generateControls());
			self.$body = self.$el.find('.panel-body');
			self.$widgetContent = self.$body.html();
			self._generateWidgetBody();
			self._attachGridEvents();

			if(typeof self.$options.onAdded !== 'undefined') {
				self.$options.onAdded();
			}
		},

		_generateBody: function() {
            var self = this;
            var body = '<div class="grid-stack-item-content panel panel-default">';
                    body += '<div class="panel-heading"><div class="panel-title">' + self.$options.headingTitle + '</div></div>';
                    body += '<div class="panel-body"></div>';
                body += '</div>';

            self.$el.append(body);

            if(self.$options.x !== null && self.$options.y !== null) {
                self.$grid.addWidget(
                	self.$el,
                	self.$options.x,
                	self.$options.y,
                	self.$options.width,
                	self.$options.height,
                	false,
                	self.$options.minWidth,
                	self.$options.maxWidth,
                	self.$options.minHeight,
                	self.$options.maxHeight
                );
            } else {
                self.$grid.addWidget(
                	self.$el,
                	0,
                	0,
                	self.$options.width,
                	self.$options.height,
                	true,
                	self.$options.minWidth,
                	self.$options.maxWidth,
                	self.$options.minHeight,
                	self.$options.maxHeight
                );
            }

            if(!self._checkIfResizable()) {
                return self.$grid.resizable(self.$el, false);
            }

            return self.$grid.resizable(self.$el, true);
		},

		_checkIfResizable: function() {
			var self = this;

			return !(self.$options.minWidth === self.$options.width && self.$options.maxWidth === self.$options.width && self.$options.minHeight === self.$options.height && self.$options.maxHeight === self.$options.height);
		},

		_attachGridEvents: function() {
			var self = this;
			var grid = self.$grid.container;

			// Drag stop event
			if(self.$options.onDragStop !== undefined) {
				grid.on('dragstop', function(event, ui) {
					self.$options.onDragStop(event, ui, self.$el);
				});
			}

			// Resize stop  event
			if(self.$options.onResizeStop !== undefined) {
				grid.on('resizestop', function(event, ui) {
				    self.$options.onResizeStop(event, ui, self.$el);
				});
			}
		},

        // Genrate controls
        _generateControls: function() {
        	var self = this;
            var dropdown = self._generateDropdown();
            var menu = dropdown.find('.dropdown-menu');

            if(self.$options.openInNewTab !== false) {
                menu.append(self._generateOpenInNewTab());
            }

            if(self.$options.settings !== false) {
                menu.append(self._generateSettings());
            }

            if(self.$options.close !== false) {
                menu.append(self._generateClose());
            }

            menu.find('li>a').on('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            });

            return dropdown;
        },

        _generateDropdown() {
            var self = this;

            return $('<div class="dropdown"></div>')
                .append('<div class="dropdown-toggle" data-toggle="dropdown"><span class="' + self.$options.iconClass + ' ' + self.$options.toggleIcon + '"></div>')
                .append('<ul class="dropdown-menu dropdown-menu-right"></ul>');
        },

        _generateUnpin: function() {
            var self = this;
            var options = self.$options.unpin;
            var control = $('<a data-func="unpin"></a>');

            control.append('<i class="' + self.$options.iconClass + ' fa ' + options.icon + '"></i>');

            if(options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-tooltip', options.tooltip);
            }

            self._attachUnpinClickListener(control);

            return $('<li></li>').append(control);
        },

        _attachUnpinClickListener: function(control) {
            var self = this;

            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });

            control.on('click', function() {
                self.doTogglePin();
            });
        },

        _generateOpenInNewTab: function() {
            var self = this;
            var options = self.$options.openInNewTab;
            var control = $('<a data-func="openInNewTab"></a>');
            var url = self.$options.newTabUrl;

            control.append('<i class="' + self.$options.iconClass + ' fa ' + options.icon + '"></i>');

            if(options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-tooltip', options.tooltip);
            }

            self._attachOpenNewTabClickListener(control, url);

            return $('<li></li>').append(control);
        },

        _attachOpenNewTabClickListener: function(control, url) {
            var self = this;

            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });

            control.on('click', function() {

				if(typeof self.$options.onOpenNewTab !== 'undefined') {
					self.$options.onOpenNewTab();
				}

            });
        },

        _generateSettings: function() {
            var self = this;
            var options = self.$options.settings;
            var control = $('<a data-func="settings"></a>');

            control.append('<i class="' + self.$options.iconClass + ' fa ' + options.icon + '"></i>');

            if(options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-tooltip', options.tooltip);
            }

            self._attachSettingsClickListener(control);

            return $('<li></li>').append(control);
        },

        _attachSettingsClickListener: function(control) {
            var self = this;

            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });

            control.on('click', function(ev) {
               self.toggleSettings();
            });
        },

        _generateClose: function() {
            var self = this;
            var options = self.$options.close;
            var control = $('<a data-func="close"></a>');

            control.append('<i class="' + self.$options.iconClass + ' fa ' + options.icon + '"></i>');

            if(options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-tooltip', options.tooltip);
            }

            self._attachCloseClickListener(control);

            return $('<li></li>').append(control);
        },

        _attachCloseClickListener: function(control) {
            var self = this;

            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });

            control.on('click', function(ev) {
                self.close();
            });
        },

        _generateWidgetBody: function() {
            var self = this;

            self.$body.html('');
            self.$body.append(self._wrapWidgetContent());
        	self.$body.append(self._generateSettingsContent());
        },

        _wrapWidgetContent: function() {
        	var self = this;

            return '<div class="widget-content">' + self.$widgetContent + '</div>';
        },

        _generateSettingsContent: function() {
            var self = this;
            var options = self.$options.settingsContentTemplate;
            var widgetBody = self.$el.find('.panel-body');
            var content = null;

            if(options && typeof options === 'string') {
                content = options;
            }

            return '<div class="widget-settings">' + content + '</div>';
        },

        toggleSettings: function() {
            var self = this;

            if(self.isSettingsActive()) {
                self.activateSettings();
            } else {
                self.deactivateSettings();
            }

            return self;
        },

        isSettingsActive: function() {
            var self = this;

            return !self.$el
                        .find('.widget-settings')
                        .hasClass('active');
        },

        activateSettings: function() {
            var self = this;

        	self.$el.find('.widget-content').hide();
            self.$el.find('.widget-settings').addClass('active').fadeIn();

			if(typeof self.$options.onOpenSettings !== 'undefined') {
				self.$options.onOpenSettings();
			}
        },

        deactivateSettings: function() {
            var self = this;

        	self.$el.find('.widget-settings').removeClass('active').hide();
        	self.$el.find('.widget-content').fadeIn();

			if(typeof self.$options.onCloseSettings !== 'undefined') {
				self.$options.onCloseSettings();
			}
        },

        close: function() {
            var self = this;

			if(typeof self.$options.onClose !== 'undefined') {
				self.$options.onClose();
			}

            self.$grid.removeWidget(self.$el);

            return self;
        },

	});

	$.fn[pluginName] = function(options, grid) {
		var self = this;

		return self.each(function() {
            var self = this;
			var $this = $(self);

			if(!$.data(self, 'plugin_' + pluginName)) {
				$.data(self, 'plugin_' +
					pluginName, new Plugin($this, options, grid));
			}
		});
    };

})(jQuery, window, document);