declare module 'claude-code' {
  interface PluginState {
    'mods-launcher': {
      /** The plugin whose commands the panel lists, or null for the plugin list. */
      group: string | null
      /** True to list every plugin's commands, not only the mods'. */
      isAll: boolean
      /** True while the upward menu above the prompt is open. */
      isOpen: boolean
    }
  }
}
