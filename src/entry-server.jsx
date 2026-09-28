import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { LanguageProvider } from './context/LanguageContext'
import App from './App'

export function render(path) {
  return renderToString(
    <StaticRouter location={path}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StaticRouter>
  )
}
