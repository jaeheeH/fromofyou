'use client'

import { useState } from 'react'
import TitleInput from './components/TitleInput'
import SubtitleInput from './components/SubtitleInput'
import TagInput from './components/TagInput'
import EditorPanel from './components/EditorPanel'

const WritePage = () => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [tags, setTags] = useState<string[]>([])

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <TitleInput value={title} onChange={setTitle} />
          <SubtitleInput value={subtitle} onChange={setSubtitle} />
          <TagInput tags={tags} setTags={setTags} />
          <EditorPanel 
            title={title} 
            subtitle={subtitle} 
            tags={tags} 
            resetTitle={() => setTitle('')} 
            resetSubtitle={() => setSubtitle('')} 
            resetTags={() => setTags([])} 
          />
        </div>
      </div>
    </main>
  )
}

export default WritePage
