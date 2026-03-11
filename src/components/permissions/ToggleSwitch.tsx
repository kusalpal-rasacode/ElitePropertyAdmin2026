export default function ToggleSwitch({ checked, onChange }: any) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <div
        className={`w-10 h-5 rounded-full relative ${
          checked ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
    </label>
  );
}