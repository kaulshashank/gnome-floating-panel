# floating-panel

Floats the panel while not viewing the Overview.

![image](https://github.com/kaulshashank/gnome-floating-panel/assets/29977318/1947d2ad-2b80-4d89-a209-3a6d34c2c997)

To customize color and opacity, you can change `background-color` in `stylesheet.css`.

## How to install

1. Clone repository to some local directory
2. Move the directory `floating-panel@kaulsh` to `~/.local/share/gnome-shell/extensions`.
3. Restart Gnome
   1. In X11: `Alt + F2` and run `r`.
   2. In Wayland: Sorry, but you're gonna have to logout. Don't forget to save your work!
      1. You can also run: `dbus-run-session -- gnome-shell --nested --wayland` to run a nested gnome shell where you can test the extension.
4. You should see it in the `Extensions` app. Enable and enjoy.

