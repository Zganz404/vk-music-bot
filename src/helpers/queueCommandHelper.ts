import {
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js'
import Utils from '../utils.js'
import CustomPlayer from '../kagazumo/CustomPlayer.js'

export function generateQueueResponse(
  page: number,
  player: CustomPlayer | undefined
): InteractionReplyOptions | InteractionUpdateOptions {
  if (!player)
    return {
      embeds: [Utils.generateErrorMessage('Сейчас ничего не играет.')],
      ephemeral: true,
      components: []
    }

  const queue = player.queue
  const embed = new MessageEmbed().setAuthor({ name: 'Треки в очереди' }).setColor(0x5181b8)

  const multiple = 10
  page = page < 0 ? 1 : page

  const end = page * multiple
  const start = end - multiple

  const tracks = queue.slice(start, end)

  if (queue.current)
    embed.addFields({
      name: 'Сейчас играет',
      value: `${queue.current.author} — ${queue.current.title} (${Utils.formatTime(player.position)}/${Utils.formatTime(
        queue.current.length ?? 0
      )})`
    })
  //console.log(queue.current)

  if (!tracks.length) embed.setDescription(`Нет треков на странице \`${page}\`.`)
  else {
    embed.setDescription(
      tracks
        .map((track, i) => `${start + ++i}. ${Utils.escapeFormat(track.author)} — ${Utils.escapeFormat(track.title)}`)
        .join('\n')
    )
  }

  const maxPages = Math.ceil(queue.length / multiple)

  embed.setFooter({
    text: `Страница ${page > maxPages ? maxPages : page} из ${maxPages}`
  })

  const buttons = []

  if (page - 1 > 0) {
    buttons.push(
      new MessageButton()
        .setCustomId(`queue_${page - 1}`)
        .setEmoji('◀️')
        .setStyle('PRIMARY')
    )
  }

  if (page + 1 <= maxPages) {
    buttons.push(
      new MessageButton()
        .setCustomId(`queue_${page + 1}`)
        .setEmoji('▶️')
        .setStyle('PRIMARY')
    )
  }

  const components = []

  if (buttons.length > 0) {
    const row = new MessageActionRow().addComponents(buttons)
    components.push(row)
  }

  return { embeds: [embed], components }
}
