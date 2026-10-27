# mods-launcher

A Claude Code mod that puts a single **Mods** button in the prompt footer. Pressing it opens a menu, drawn upward just above the prompt, that lists the slash commands of every installed mod, grouped by mod. Pressing a command closes the menu and runs it.

- `Mods` button in the footer, beside the mode labels. Press it again to close the menu.
- `/mods` opens a side panel with the same list (mods first, then their commands; `a` toggles showing skill bundles too).
- The list is built from the live command list, so a mod you install later shows up on its own. Plugins that only bundle skills or connectors (engineering, design, canva, anthropic-skills) are hidden unless you ask for all.

Mods without slash commands, such as ones that only draw a band, have nothing to list.

## Install

```
claude plugin marketplace add joshrubio/mods-launcher
claude plugin install mods-launcher@mods-launcher
```

Needs Claude Code 2.1.287 or newer. Restart Claude Code afterwards.

## Limits

The footer button is a native button on the desktop app, so its box and padding follow the app's style; the mod cannot restyle it.

## License

MIT
