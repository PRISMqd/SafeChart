export default function RequiredDisclosure({ compact = false }: { compact?: boolean }) {
  const text = `SafeChart is a professional documentation support tool. It does not constitute legal advice. Use of this tool does not guarantee protection from employment consequences. Nurses should consult their Nurse Practice Act, union representative if applicable, and personal legal counsel regarding specific situations. All submissions are the nurse's own professional documentation. PRISMqd does not submit anything on your behalf without your explicit, confirmed authorization.`;

  if (compact) {
    return (
      <p className="text-xs text-gray-500 mt-2">{text}</p>
    );
  }

  return (
    <div className="bg-warm border border-gray-200 rounded-lg p-4 mt-6">
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
