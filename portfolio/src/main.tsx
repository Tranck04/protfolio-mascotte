import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SceneManager } from './scenes/SceneManager'
import './styles/tokens.css'
import './styles/global.css'
import './styles/projects.css'
import './styles/journey.css'
import './styles/skills.css'
import './styles/contact.css'
import './styles/background.css'
import './styles/sceneLayout.css'

createRoot(document.getElementById('root')!).render(<StrictMode><SceneManager /></StrictMode>)
