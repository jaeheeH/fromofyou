type Props = {
  value: string
  onChange: (val: string) => void
}

const TitleInput = ({ value, onChange }: Props) => (
  <input
    type="text"
    placeholder="Untitled"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-b border-gray-200 pb-2 outline-none"
  />
)

export default TitleInput
