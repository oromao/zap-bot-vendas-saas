interface WorkflowTestModalProps {
  open: boolean;
  onClose: () => void;
  steps: string[];
}

export const WorkflowTestModal = ({
  open,
  onClose,
  steps,
}: WorkflowTestModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[350px] max-w-[90vw]">
        <h2 className="font-bold text-xl mb-4">
          Resultado do Teste do Workflow
        </h2>
        <ol className="list-decimal pl-6 space-y-1 text-gray-800">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <button
          className="mt-6 bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold text-base shadow hover:bg-primary/90 transition w-full"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
