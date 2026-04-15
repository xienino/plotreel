export class Log {
  static console = true

  log(title, text) {
    if (!Log.console) return
    const color = '#09c'
    console.log(
      `%c ${title} %c ${text} %c`,
      `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
      `border:1px solid ${color}; padding: 1px; border-radius: 0 2px 2px 0; color: ${color};`,
      'background:transparent',
    )
  }

  closeConsole() {
    Log.console = false
  }
}
