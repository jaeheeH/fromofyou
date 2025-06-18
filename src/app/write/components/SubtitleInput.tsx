type Props = {
  value: string
  onChange: (val: string) => void
}

const SubtitleInput = ({ value, onChange }: Props) => (
  <input
    type="text"
    placeholder="소제목을 입력하세요"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-xl font-medium text-gray-800 placeholder-gray-400 border-b border-gray-100 pb-2 outline-none"
  />
)

export default SubtitleInput