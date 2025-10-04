import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building2, Plus, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Alert, AlertDescription } from '../ui/alert';

export const OrganizationDropdown: React.FC = () => {
  const { organization: currentOrganization, isLoading: loading } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showOrgLimitMessage, setShowOrgLimitMessage] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowOrgLimitMessage(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateOrganization = () => {
    setShowOrgLimitMessage(true);
    setTimeout(() => setShowOrgLimitMessage(false), 4000);
  };

  if (loading) {
    return (
      <div className="bg-secondary/50 rounded-md px-3 py-2">
        <div className="text-sm font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-secondary/50 rounded-md px-3 py-2 flex items-center justify-between hover:bg-secondary/70 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {currentOrganization?.name || 'No Organization'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-tertiary border border-border rounded-lg shadow-lg">
          {showOrgLimitMessage && (
            <div className="p-3 border-b border-border">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  We have limited users to only one organization as we are in beta. Thank you for your understanding!
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="p-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
              Organizations
            </div>
            
            {currentOrganization && (
              <button
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left bg-indigo-50 text-indigo-600 rounded"
              >
                <Building2 className="w-4 h-4" />
                <span>{currentOrganization.name}</span>
              </button>
            )}

            <button 
              onClick={handleCreateOrganization}
              className="w-full flex items-center gap-2 px-2 py-2 mt-2 text-sm text-left text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Organization</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};