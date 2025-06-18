'use client'

import { useState, useEffect, useRef } from 'react'
import { EditorContent, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './MenuBar'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase' // storage 추가
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

// 👉 추가한 확장 기능들
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Heading from '@tiptap/extension-heading'

type Props = {
  title: string
  subtitle: string
  tags: string[]
  resetTitle: () => void
  resetSubtitle: () => void
  resetTags: () => void
}

const EditorPanel = ({ title, subtitle, tags, resetTitle, resetSubtitle, resetTags }: Props) => {
  const [isClient, setIsClient] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem,
      Highlight,
      Heading.configure({ levels: [1, 2, 3, 4, 5] })
    ],
    content: '',
  })

  if (!isClient || !editor) return null

  const handleSave = async () => {
    if (!title.trim() || !editor.getHTML().trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    await addDoc(collection(db, 'posts'), {
      title: title.trim(),
      subtitle: subtitle.trim(),
      tags,
      content: editor.getHTML(),
      createdAt: serverTimestamp(),
    })

    alert('글이 저장되었습니다!')
    resetTitle()
    resetSubtitle()
    resetTags()
    editor.commands.clearContent()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const storageRef = ref(storage, `images/${Date.now()}-${file.name}`)
    try {
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <MenuBar editor={editor} onImageUploadClick={() => fileInputRef.current?.click()} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageUpload}
      />
      <div className="prose prose-base max-w-none min-h-[300px] p-4">
        <EditorContent editor={editor} className="outline-none" />
      </div>
      <div className="pt-4 text-right">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
        >
          Publish
        </button>
      </div>
    </div>
  )
}

export default EditorPanel