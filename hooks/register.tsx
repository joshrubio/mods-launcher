import { atom, read, update } from 'claude-code'
import type { CommandInfo, Register } from 'claude-code'

const PANE = 'mods-launcher'
const SELF = 'mods-launcher'
const group = atom({ plugin: 'mods-launcher', key: 'group' } as const, null)
const isOpen = atom({ plugin: 'mods-launcher', key: 'isOpen' } as const, false)
const isAll = atom({ plugin: 'mods-launcher', key: 'isAll' } as const, false)

// Plugins that bundle skills or connectors rather than mods; hidden unless "all" is on.
const SKILL_BUNDLES = new Set(['engineering', 'design', 'canva', 'anthropic-skills'])

const byPlugin = (commands: CommandInfo[], showAll: boolean) => {
  const groups = new Map<string, CommandInfo[]>()

  for (const command of commands) {
    const owner = command.plugin

    if (command.source !== 'plugin' || !owner || owner === SELF) {
      continue
    }

    if (!showAll && SKILL_BUNDLES.has(owner)) {
      continue
    }

    groups.set(owner, [...(groups.get(owner) ?? []), command])
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'mods',
      description: 'Open the panel with every installed mod and its commands',
    })

    return next(e)
  })

  on('command.run', { command: 'mods' }, async $ => {
    await update($, group, () => null)
    await $.ui.open({ id: PANE, title: 'Mods', focus: true, closeOnEscape: true })

    return { text: 'Mods panel opened.' }
  })

  // The footer's mode labels (`focus`, `memory paused`) live in `SessionMode`;
  // the engine's labels are redrawn here so the button sits beside them.
  on('ui.render', { component: 'SessionMode' }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const modes = e.props.modes
    const isMenuOpen = await read($, isOpen)

    return (
      <Box paddingX="md" gap="sm">
        {modes.length > 0 && <Text dimColor>{modes.join(' & ')}</Text>}
        <Button key="mods" label="Mods" plain onPress={() => update($, isOpen, wasOpen => !wasOpen)}>
          <Text color="#FFFFFF">Mods</Text>
        </Button>
      </Box>
    )
  })

  // The menu opens upward: a list in the band directly above the prompt.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isOpen))) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const groups = byPlugin(await $.command.list(), await read($, isAll))

    const run = async (name: string) => {
      await update($, isOpen, () => false)
      await $.command.run({ command: name })
    }

    return (
      <Box flexDirection="column" rowGap="md" paddingX="md" paddingY="sm">
        {groups.length === 0 && <Text dimColor>No mods with commands found.</Text>}
        {groups.map(([name, commands]) => (
          <Box key={name} gap="md">
            <Text bold>{name}</Text>
            {commands.map(command => (
              <Button key={command.name} label={`/${command.name}`} onPress={() => run(command.name)} />
            ))}
          </Box>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const showAll = await read($, isAll)
    const open = await read($, group)
    const groups = byPlugin(await $.command.list(), showAll)
    const current = groups.find(([name]) => name === open)

    const run = async (name: string) => {
      await $.ui.close({ id: PANE })
      await $.command.run({ command: name })
    }

    if (current) {
      const [name, commands] = current

      return (
        <Box flexDirection="column">
          <Box>
            <Button key="back" label="< Back" hotkey="b" onPress={() => update($, group, () => null)} />
            <Text bold> {name}</Text>
          </Box>
          {commands.map(command => (
            <Box key={command.name}>
              <Button key={command.name} label={`/${command.name}`} onPress={() => run(command.name)} />
              <Text dimColor> {command.description}</Text>
            </Box>
          ))}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" rowGap="md" paddingX="md" paddingY="sm">
        {groups.length === 0 && <Text dimColor>No mods with commands found.</Text>}
        {groups.map(([name, commands]) => (
          <Box key={name}>
            <Button key={name} label={name} onPress={() => update($, group, () => name)} />
            <Text dimColor> {commands.length} {commands.length === 1 ? 'command' : 'commands'}</Text>
          </Box>
        ))}
        <Box>
          <Button
            key="all"
            label={showAll ? 'Only mods' : 'Show all plugins'}
            hotkey="a"
            dimColor
            onPress={() => update($, isAll, wasAll => !wasAll)}
          />
        </Box>
      </Box>
    )
  })
}
