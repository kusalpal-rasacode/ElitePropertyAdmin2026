interface ErrorMessageProps {
  error?: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>;
}
