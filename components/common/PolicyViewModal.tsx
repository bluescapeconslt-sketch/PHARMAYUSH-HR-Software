import React from 'react';
import Modal from './Modal.tsx';
import { Policy } from '../../types.ts';

interface PolicyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

const PolicyViewModal: React.FC<PolicyViewModalProps> = ({ isOpen, onClose, policy }) => {
  if (!isOpen || !policy) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={policy.title}>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-semibold text-gray-500">Category</span>
          <p className="text-md text-gray-800">{policy.category}</p>
        </div>
        <div className="pt-4 border-t">
          <span className="text-sm font-semibold text-gray-500">Content</span>
          <div className="mt-2 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {policy.content}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PolicyViewModal;
