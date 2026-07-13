import katex from 'katex'

export function renderTex(tex: string, displayMode = false): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
    })
  }
  catch {
    return tex
  }
}
