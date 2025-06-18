'use client'

import { Editor } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import {
  Heading1, Heading2, Heading3, Heading4, Heading5,
  Bold, Italic, List, Quote, Image as ImageIcon, Link2
} from 'lucide-react'

const headingIcons = {
  1: <Heading1 size={16} className="mr-2" />, 
  2: <Heading2 size={16} className="mr-2" />, 
  3: <Heading3 size={16} className="mr-2" />, 
  4: <Heading4 size={16} className="mr-2" />, 
  5: <Heading5 size={16} className="mr-2" />,
}

type Props = {
  editor: Editor
  onImageUploadClick: () => void
}

const MenuBar = ({ editor, onImageUploadClick }: Props) => {
  const [open, setOpen] = useState(false)
  const [activeHeading, setActiveHeading] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const updateActiveHeading = () => {
    for (let level = 1; level <= 5; level++) {
      if (editor.isActive('heading', { level })) {
        setActiveHeading(level)
        return
      }
    }
    setActiveHeading(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    updateActiveHeading()
  }, [editor.state])

  const insertLink = () => {
    const url = window.prompt('링크 주소를 입력하세요')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const buttonStyle = (active: boolean) =>
    `p-2 rounded hover:bg-gray-100 text-gray-600 transition ${
      active ? 'bg-gray-900 text-white' : ''
    }`

  return (
    <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-200 bg-white">
      {/* Heading 드롭다운 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className={buttonStyle(false) + ' flex items-center gap-1'}
        >
          {activeHeading ? `H${activeHeading}` : 'Text'}
        </button>
        {open && (
          <div className="absolute left-0 mt-2 bg-white border rounded shadow z-10 w-36">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level }).run()
                  setOpen(false)
                }}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                  activeHeading === level ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                {headingIcons[level]} Heading {level}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonStyle(editor.isActive('bold'))}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonStyle(editor.isActive('italic'))}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonStyle(editor.isActive('bulletList'))}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonStyle(editor.isActive('blockquote'))}
      >
        <Quote size={16} />
      </button>
      <button
        onClick={onImageUploadClick}
        className={buttonStyle(false)}
      >
        <ImageIcon size={16} />
      </button>
      <button
        onClick={insertLink}
        className={buttonStyle(editor.isActive('link'))}
      >
        <Link2 size={16} />
      </button>
    </div>
  )
}

export default MenuBar