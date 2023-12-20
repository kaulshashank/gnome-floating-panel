/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
'use strict';

// https://gjs.guide/extensions/overview/anatomy.html

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

class ConnectManager {
    constructor(list = []) {
        this.connections = [];

        list.forEach(c => {
            let [obj, signal, callback] = c;
            this.connect(obj, signal, callback);
        });
    }

    connect(obj, signal, callback) {
        this.connections.push({
            id: obj.connect(signal, callback),
            obj: obj
        })
    }

    disconnectAll() {
        this.connections.forEach(c => {
            c.obj.disconnect(c.id)
        })
    }
}

export default class Extension {
    constructor() {
    }

    enable() {
        this._windowSignals = new Map();

        this._connections = new ConnectManager([
            [Main.overview, 'showing', this._update.bind(this)],
            [Main.overview, 'hiding', this._update.bind(this)],
            [Main.sessionMode, 'updated', this._update.bind(this)],
            [global.window_manager, 'switch-workspace', this._update.bind(this)],
            [global.window_group, 'actor-added', this._onWindowAdded.bind(this)],
            [global.window_group, 'actor-removed', this._onWindowRemoved.bind(this)]
        ]);

        for (const window of global.get_window_actors()) {
            this._onWindowAdded(null, window);
        }

        this._update();
        Main.panel.add_style_class_name('floating');
    }

    disable() {
        this._connections.disconnectAll();
        this._connections = null;

        for (const [window, ids] of this._windowSignals) {
            for (const id of ids) {
                window.disconnect(id);
            }
        }
        this._windowSignals = null;
        this._overlap(false);
        Main.panel.remove_style_class_name('floating');
    }

    _onWindowAdded(_container, window) {
        this._windowSignals.set(window, [
            window.connect('notify::allocation', () => this._update()),
            window.connect('notify::visible', () => this._update()),
        ]);
        this._update();
    }

    _onWindowRemoved(_container, window) {
        for (const id of this._windowSignals.get(window)) {
            window.disconnect(id);
        }
        this._windowSignals.delete(window);
        this._update();
    }

    _update() {
        if (Main.panel.has_style_pseudo_class('overview'))
            return this._overlap(false);
        return this._overlap(true);
    }

    _overlap(b) {
        if (b) {
            Main.panel.add_style_pseudo_class('floating');
        } else {
            Main.panel.remove_style_pseudo_class('floating');
        }
    }
}

function init() {
    return new Extension();
}

