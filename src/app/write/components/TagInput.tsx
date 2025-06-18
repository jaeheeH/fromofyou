import { useState, KeyboardEvent } from 'react'

type Props = {
  tags: string[]
  setTags: (tags: string[]) => void
}

const TagInput = ({ tags, setTags }: Props) => {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()])
      }
      setInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      <input
        type="text"
        placeholder="태그 입력 후 Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full border-b border-gray-100 pb-2 outline-none text-sm text-gray-600"
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-sm rounded-full flex items-center gap-1"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-black">×</button>
          </span>
        ))}
      </div>

    </div>
  )
}

export default TagInput
