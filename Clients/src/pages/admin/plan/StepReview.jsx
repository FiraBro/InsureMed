export default function StepReview({ form }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Review Plan</h2>
      <pre className="bg-muted p-4 rounded text-sm">
        {JSON.stringify(form, null, 2)}
      </pre>
    </div>
  );
}
