import React from "react";
import { Edge, Node } from "reactflow";
import { NODE_TYPES, getNodeOutputs } from "./WorkflowBuilder";

interface NodeEditPanelProps {
  node: Node | null;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
  edges: Edge[];
  nodes: Node[];
}

export const NodeEditPanel = ({
  node,
  onChange,
  onClose,
  edges,
  nodes,
}: NodeEditPanelProps) => {
  if (!node) {
    return null;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChange({ ...node.data, [name]: value });
  };

  const nodeOutputs = getNodeOutputs(node, edges, nodes);

  return (
    <div className="node-edit-panel">
      <button onClick={onClose}>Close</button>
      <h3>Edit Node</h3>
      <div>
        <label>
          Node Type:
          <select
            name="type"
            value={node.type}
            onChange={(event) =>
              onChange({ ...node.data, type: event.target.value })
            }
          >
            {Object.values(NODE_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Node Data:
          <input
            type="text"
            name="data"
            value={node.data?.data || ""}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div>
        <h4>Outputs</h4>
        <ul>
          {nodeOutputs.map((output, index) => (
            <li key={index}>{output}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
