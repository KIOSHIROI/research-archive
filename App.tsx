
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TopicIndex from './pages/TopicIndex';
import ProjectIndex from './pages/ProjectIndex';
import ContentDetail from './pages/ContentDetail';
import About from './pages/About';
import Speculative from './pages/Speculative';
import Admin from './pages/Admin';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ContentProvider } from './contexts/ContentContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ContentProvider>
            <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="topics" element={<TopicIndex />} />
                <Route path="projects" element={<ProjectIndex />} />
                <Route path="articles/:slug" element={<ContentDetail />} />
                <Route path="projects/:slug" element={<ContentDetail />} />
                <Route path="about" element={<About />} />
                <Route path="speculative" element={<Speculative />} />
                {/* Hidden Admin Route */}
                <Route path="admin" element={<Admin />} />
                </Route>
            </Routes>
            </HashRouter>
        </ContentProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
