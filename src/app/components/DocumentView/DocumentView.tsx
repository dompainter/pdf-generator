import React from 'react';

const DocumentView = () => {
  const onGenerate = () => {
    fetch('/api/generate', {
      method: 'GET',
    });
  };

  return (
    <div className="px-12 py-6">
      <div className="flex gap-3">
        <button
          className="bg-blue-100 p-4 mt-4 ring-2 rounded-lg ring-blue-500"
          onClick={onGenerate}
        >
          Generate
        </button>
      </div>
    </div>
  );
};

export default DocumentView;
