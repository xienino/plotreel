import * as React from 'react'

import './Editor.sass'

export default function Header() {
  const [content, saveContent] = React.useState('123')

  return (
    <div className="editor-container">
      <textarea
        className="textarea"
        value={content}
        onChange={(e) => {
          saveContent(e.target.value)
        }}
      />
      <br />

      <button
        className="button"
        onClick={() => {
          ;(window as any).pywebview.api.save_content(content)
        }}
      >
        Save
      </button>
    </div>
  )
}
