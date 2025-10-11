import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  memberName: string;
  memberEmail: string;
  isPending: boolean;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  memberName,
  memberEmail,
  isPending
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete member:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const title = isPending ? 'Cancel Invitation' : 'Remove Member';
  const description = isPending 
    ? `Are you sure you want to cancel the invitation for ${memberName}? This will remove their pending access to the organization.`
    : `Are you sure you want to remove ${memberName} from the organization? This will revoke their access to all projects and data.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-tertiary rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-3">{description}</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{memberName}</p>
              <p className="text-sm text-gray-500">{memberEmail}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isPending ? 'Cancelling...' : 'Removing...'}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  {isPending ? 'Cancel Invitation' : 'Remove Member'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};