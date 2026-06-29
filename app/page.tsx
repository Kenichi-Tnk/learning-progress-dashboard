import { LearningRecordForm } from '@/src/components/learning-record-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Learning Progress Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Start by defining typed data and capturing records from a form.
        </p>
      </div>
      <LearningRecordForm />
    </main>
  );
}
