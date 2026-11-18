import { handleTryCatch } from '../../../ts-app/src/main';
import * as vscode from 'vscode'
import * as path from 'path'

interface TInspectionResult {
  handlerSearcOn: boolean
  handlerFilePath: string
  handlerExported: boolean
  makeGlobalLog: boolean
  cancellApp: boolean
}

let rootUri: vscode.Uri | undefined
// take position early as cursor couls change position
let position: vscode.Position | undefined = undefined
const setupGlobalLog = 'Yes, Setup Global log/err'
const varLog = 'var log: typeof console.log;'
const varErr = 'var err: typeof console.error;'

const state: TInspectionResult = {
  handlerSearcOn: false,
  handlerFilePath: '',
  handlerExported: false,
  makeGlobalLog: false,
  cancellApp: false,
}
let logLine = ''
let declareGlobal = ''
export const capitalizes = (str: string) => {
  if (!str) {
    return
  }
  str = str.replace(/_/gm, ' ').trim()
  let s = (str[0] as string)?.toUpperCase() + str.slice(1)
  return s.replace(/\s+[a-z](?=[a-z]{2})/g, (char: string) => char.toUpperCase())
}

const channel = vscode.window.createOutputChannel('TryCatchWrapper')
const channelShow = (msg: string | string[], show: boolean = false) => {
  channel.appendLine(Array.isArray(msg) ? msg.join('\n') : msg)
  // if (show) {
  channel.show()
  // }
}

async function readFileContent(uri: vscode.Uri): Promise<string | null> {
  try {
    const fileBuffer = await vscode.workspace.fs.readFile(uri)
    return Buffer.from(fileBuffer).toString('utf-8')
  } catch {
    return null
  }
}

async function writeFileContent(uri: vscode.Uri, content: string): Promise<boolean> {
  try {
    const fileBuffer = Buffer.from(content, 'utf-8')
    await vscode.workspace.fs.writeFile(uri, fileBuffer)
    return true
  } catch (err) {
    console.error(`Failed to write file to ${uri.toString()}`, err)
    return false
  }
}

async function setupSupportFiles(): Promise<void> {
  if (!rootUri) {
    channelShow('setupSupportFiles -- no rootUri', true)
    return
  }

  if (!state.handlerFilePath) {
    const helpersUri = vscode.Uri.joinPath(rootUri, 'src/lib/utils/helpers.ts')
    const defaultHelpersContent = `
/*
  try/catch block sends error object and a function name, in
  which it is defined, to the handleTryCatch function, which
  outputs via console.log the function name and error message
  to reveal the function in which the error occurred.
*/

export type THandleTryCatch = (err: unknown, info?: string) => void
export const handleTryCatch = (err: unknown, info?: string) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(info, msg)
}
\n
`
    let content = await readFileContent(helpersUri)
    if (content) {
      const updatedContent = defaultHelpersContent + content
      if (!await writeFileContent(helpersUri, updatedContent)) {
        channelShow(`Failed to define handleTryCatch in ${helpersUri.fsPath}`, true)
      }
    } else {
      await writeFileContent(helpersUri, defaultHelpersContent)
    }
  }
}

function extractFunctionName(document: vscode.TextDocument, selection: vscode.Selection): string {
  const startLine = selection.start.line
  const maxSearchLines = Math.max(0, startLine - 40)

  const namedFuncRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/
  const arrowFuncRegex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([\s\S]*?\)\s*=>/
  const svelteMethodRegex = /([a-zA-Z0-9_$]+)\s*\([\s\S]*?\)\s*\{/

  for (let i = startLine; i >= maxSearchLines; i--) {
    const lineText = document.lineAt(i).text

    let match = namedFuncRegex.exec(lineText)
    if (match && match[1]) {
      return match[1]
    }

    match = arrowFuncRegex.exec(lineText)
    if (match && match[1]) {
      return match[1]
    }

    match = svelteMethodRegex.exec(lineText)
    if (match && match[1]) {
      return match[1]
    }
  }
  return 'anonymous context'
}

function findEnclosingFunction(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position
): vscode.DocumentSymbol | undefined {
  let candidate: vscode.DocumentSymbol | undefined
  for (const symbol of symbols) {
    if (!symbol.range.contains(position)) {
      continue
    }

    const nested = findEnclosingFunction(symbol.children, position)
    if (nested) {
      return nested
    }

    if (symbol.kind === vscode.SymbolKind.Function || symbol.kind === vscode.SymbolKind.Method) {
      return symbol
    }
    if (symbol.kind === vscode.SymbolKind.Variable || symbol.kind === vscode.SymbolKind.Constant) {
      candidate = symbol
    }
  }
  return candidate
}

async function getWorkspaceRootUri(): Promise<vscode.Uri | undefined> {
  const folders = vscode.workspace.workspaceFolders
  if (!folders || folders.length === 0) {
    return undefined
  }

  if (folders.length > 1) {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const activeWorkspace = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri)
      if (activeWorkspace) {
        return activeWorkspace.uri
      }
    }
  }

  return folders[0].uri
}
function s() {
  const x = 1;
}
// Lightweight text/structure analysis instead of full compiler API parsing
function inspectHandlerImplementation(content: string): { state: boolean; exported: boolean } {
  const hasHandlerDef = /(?:function\s+handleTryCatch|const\s+handleTryCatch\s*=|let\s+handleTryCatch\s*=)/.test(content)
  const isExported = /export\s+(?:function\s+handleTryCatch|const\s+handleTryCatch)/.test(content)
  return { state: hasHandlerDef, exported: isExported }
}

async function manageHookFiles(
  uri: vscode.Uri,
  content: string | null,
  CSType: string,
  correctPath: string
): Promise<void> {
  const initTemplate = `
//  ${CSType}-side global handleTryCatch definition
export const init: ${CSType}Init = () => {
  globalThis.handleTryCatch = handleTryCatch
};`

  let updatedContent = content || ''

  const importRegex = new RegExp(`import\\s+type\\s+\\{\\s*${CSType}Init\\s*\\}\\s+from\\s+['"]@sveltejs/kit['"];?`)
  if (!importRegex.test(updatedContent)) {
    updatedContent = `import type { ${CSType}Init } from '@sveltejs/kit';\n` + updatedContent
  }

  const handlerImportRegex = /import\s+\{\s*handleTryCatch\s*\}\s+from\s+['"]([^'"]+)['"];?/
  const match = updatedContent.match(handlerImportRegex)

  if (match) {
    const currentPath = match[1]
    if (currentPath !== correctPath) {
      updatedContent = updatedContent.replace(
        handlerImportRegex,
        `import { handleTryCatch } from '${correctPath}';`
      )
    }
  } else {
    updatedContent = `import { handleTryCatch } from '${correctPath}';\n` + updatedContent
  }

  if (!updatedContent.includes('globalThis.handleTryCatch = handleTryCatch')) {
    if (!updatedContent.endsWith('\n')) {
      updatedContent += '\n'
    }
    updatedContent += initTemplate + '\n'
  }

  await writeFileContent(uri, updatedContent)
}

async function setHooksFiles() {
  channelShow(`setHooksFiles`)
  for (const cs of ['client', 'server']) {
    const uri = vscode.Uri.joinPath(rootUri as vscode.Uri, 'src', `hooks.${cs}.ts`)
    const CS = capitalizes(cs) as string
    const content = await readFileContent(uri)
    await manageHookFiles(uri, content, CS, state.handlerFilePath)
  }
}

async function redeclareHandler(content: string): Promise<string> {
  const cleanContent = content
    .split('\n')
    .filter(line => !/(TH|h)andleTryCatch/.test(line))
    .join('\n')

  // const newDeclaration = `export type THandleTryCatch = (err: unknown, info?: string) => void;\ndeclare global {\n\tvar handleTryCatch: THandleTryCatch;`
  if (/declare global\s*\{/.test(cleanContent)) {
    return cleanContent.replace(/declare global\s*\{/, declareGlobal)
  }
  return cleanContent + '\n' + declareGlobal
}

// TODO If *.d.ts uri state.makeGlobalLog is true and 
async function manageAppDTsFile(uri: vscode.Uri, logLine: string) {
  channelShow('manageAppDTsFile')
  const content = await readFileContent(uri)
  //   const newDeclare = `export type THandleTryCatch = typeof handleTryCatch
  // declare global {
  //   ${logLine}
  //   var handleTryCatch: THandleTryCatch
  // `
  if (content) {
    await writeFileContent(uri, await redeclareHandler(content))
  } else {
    // await writeFileContent(uri, newDeclare)
    await writeFileContent(uri, declareGlobal)
  }
}

async function inspectWorkspace(root: vscode.Uri): Promise<TInspectionResult> {
  const files = await vscode.workspace.findFiles(
    '**/*.{ts,tsx,js,jsx}',
    '**/{node_modules,.svelte-kit,build,dist,coverage}/**'
  )

  for (const uri of files) {
    if (!uri.fsPath.startsWith(root.fsPath)) {
      continue
    }

    const content = await readFileContent(uri)
    if (!content) {
      continue
    }
    if (!state.handlerSearcOn) {
      const handler = inspectHandlerImplementation(content)
      if (handler.state && handler.exported) {
        const rp = path.relative(root.fsPath, uri.fsPath)
        state.handlerSearcOn = true
        state.handlerFilePath = rp.replace(/\s*\/?src/, '.')
        state.handlerExported = handler.exported
        vscode.window.showInformationMessage(`handlerPath is ${state.handlerFilePath}`, { modal: true }, 'OK')
        if (!state.handlerExported) {
          vscode.window.showInformationMessage(
            `The handleTryCatch implementation is state at ${state.handlerFilePath} but is not exported. Please export it.`,
            { modal: true },
            'OK'
          )
          state.cancellApp = true
          return state
        }
      }
    }
  }
  // if handler is not found create one as default lib/utils/helpers.ts
  if (!state.handlerFilePath) {
    // ensure the path src/lib/utils exists
    const targetDirUri = vscode.Uri.joinPath(root, 'src', 'lib', 'utils');
  }
  await setHooksFiles()
  return state
}

async function wrapSelectedBlock(editor: vscode.TextEditor): Promise<void> {

  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[] | undefined>(
    'vscode.executeDocumentSymbolProvider',
    editor.document.uri
  )

  const enclosingSymbol = findEnclosingFunction(symbols ?? [], position as vscode.Position)
  let funcName = enclosingSymbol ? enclosingSymbol.name : ''

  if (!funcName) {
    funcName = extractFunctionName(editor.document, editor.selection)
  }

  if (!funcName) {
    channelShow('No enclosing function declaration was found.', true)
    return
  }

  const firstLineText = editor.document.lineAt(editor.selection.start.line).text
  const matchIndentation = firstLineText.match(/^\s*/)
  const baseIndent = '';  //matchIndentation ? matchIndentation[0] : ''
  const bodyIndent = baseIndent + (editor.options.insertSpaces ? ' '.repeat(editor.options.tabSize as number) : '\t')

  const selectedText = editor.document.getText(editor.selection)
  const lines = selectedText.split(/\r?\n/)
  const indentedBody = lines
    .map((line, index) => (index === 0 && line.startsWith(baseIndent) ? line.slice(baseIndent.length) : line))
    .map(line => bodyIndent + line)
    .join('\n')

  const snippet = new vscode.SnippetString()
  snippet.appendText(`${baseIndent}try {
${indentedBody}
${baseIndent}} catch (err: unknown) {
${bodyIndent}handleTryCatch(err, '`)
  snippet.appendPlaceholder(funcName)
  snippet.appendText(`')
${baseIndent}}`
  )

  await editor.insertSnippet(snippet, editor.selection)
}

async function checkForGlobals(rootUri: vscode.Uri): Promise<vscode.Uri | null> {
  for (const p of ['src/app.d.ts', 'src/global.d.ts', 'srx/routes/+layout.svelte']) {
    const gPath = vscode.Uri.joinPath(rootUri, p)
    if (await readFileContent(gPath)) {
      return gPath
    }
  }
  return null
}
// the only global file found is at the globalPath
// are global log and err defined there and in hooks.clien.servet.ts as well
async function defInDtsLayout(globalPath: vscode.Uri) {
  const logRx = /.*var\s+log\:\s+typeof\s+console.log\;?/
  const errRx = /.*var\s+err\:\s+typeof\s+console.error\;?/
  const content = await readFileContent(globalPath) as string
  return logRx.test(content) && errRx.test(content)
}

async function wrapTryCatch(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  let validationMessage = ''

  if (!editor) {
    validationMessage = 'No active code windows open.'
  } else if (!['typescript', 'javascript', 'svelte', 'typescriptreact', 'javascriptreact'].includes(editor.document.languageId)) {
    validationMessage = 'Supported file types: TypeScript, JavaScript, and Svelte.'
  } else if (!editor.selections.some(selection => !selection.isEmpty)) {
    validationMessage = 'Please select a code block to wrap inside a try/catch container.'
  }

  if (validationMessage) {
    vscode.window.showErrorMessage(validationMessage, { modal: true }, 'OK')
    return
  }

  // @ts-expect-error but there is a check if(!editor) above
  position = editor.selection.active as vscode.Position
  rootUri = await getWorkspaceRootUri()
  if (!rootUri) {
    channelShow(
      'Unable to locate workspace root folder.\nPlease use File -> Save Workspace As... to navigate and bind your application root folder.',
      true
    )
    return
  }

  // is there any app.d.ts, global.d.ts or /routes/+layout.svelte
  // where declare global { exists to held var handleTryCatch, log and err
  const globalPath = await checkForGlobals(rootUri)
  // dTsLayoutOK

  if (globalPath) {
    const content = await readFileContent(globalPath) as string
    const globsOK = /.*var\s+log\:\s+typeof\s+console.log\;?/.test(content) && /.*var\s+err\:\s+typeof\s+console.error\;?/.test(content)
    if (!globsOK) {
      // this question must be asked somewhere so ask here
      const answer = await vscode.window.showInformationMessage(
        'Set up global log and err (console.log/error) for this project?',
        { modal: true },
        setupGlobalLog,
      )
      // based on the answer prepare globals for log and err or left an empty string
      logLine = (answer !== setupGlobalLog) ? '' :
        `var log: typeof console.log
  var err: typeof console.error;`
      declareGlobal = `export type THandleTryCatch = typeof handleTryCatch
declare global {
  ${logLine}
  var handleTryCatch: THandleTryCatch
`;

      const appdtsUri = vscode.Uri.joinPath(rootUri, 'src', 'app.d.ts')
      state.makeGlobalLog = false;  // just done
      channelShow(declareGlobal + '\n}')
      await writeFileContent(appdtsUri, declareGlobal + '}')
    } else {
      manageAppDTsFile(globalPath, logLine)
    }
  }
  channelShow(`next inspectWorkspace`)
  await inspectWorkspace(rootUri)
  if (state.cancellApp) {
    return
  }
  await wrapSelectedBlock(editor as vscode.TextEditor)
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('try-catch-wrapper.extension', wrapTryCatch)
  context.subscriptions.push(disposable)
}

export function deactivate(): void { }