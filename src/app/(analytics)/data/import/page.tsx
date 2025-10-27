"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DataImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState("leads");
  const [mappingStep, setMappingStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const importTypes = [
    { value: "leads", label: "Leads", icon: "👤", description: "Import potential customers" },
    { value: "contacts", label: "Contacts", icon: "📞", description: "Import contact information" },
    { value: "companies", label: "Companies", icon: "🏢", description: "Import company data" },
    { value: "deals", label: "Deals", icon: "💰", description: "Import sales opportunities" },
    { value: "tasks", label: "Tasks", icon: "✅", description: "Import task lists" },
    { value: "products", label: "Products", icon: "📦", description: "Import product catalog" }
  ];

  const sampleColumns = {
    leads: ["First Name", "Last Name", "Email", "Phone", "Company", "Source", "Status"],
    contacts: ["First Name", "Last Name", "Email", "Phone", "Company", "Title", "Department"],
    companies: ["Company Name", "Industry", "Size", "Website", "Phone", "Address", "City"],
    deals: ["Deal Name", "Company", "Contact", "Value", "Stage", "Close Date", "Probability"],
    tasks: ["Task Title", "Description", "Assigned To", "Due Date", "Priority", "Status"],
    products: ["Product Name", "SKU", "Category", "Price", "Description", "Stock"]
  };

  const [columnMappings, setColumnMappings] = useState<{[key: string]: string}>({});
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate file preview
      setPreviewData([
        { "First Name": "John", "Last Name": "Smith", "Email": "john@example.com", "Phone": "(555) 123-4567", "Company": "Acme Corp" },
        { "First Name": "Jane", "Last Name": "Doe", "Email": "jane@example.com", "Phone": "(555) 987-6543", "Company": "Tech Inc" },
        { "First Name": "Bob", "Last Name": "Johnson", "Email": "bob@example.com", "Phone": "(555) 456-7890", "Company": "Sales Co" }
      ]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleColumnMapping = (csvColumn: string, crmField: string) => {
    setColumnMappings(prev => ({ ...prev, [csvColumn]: crmField }));
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const renderStep = () => {
    switch (mappingStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Import Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">1. Select Import Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importTypes.map(type => (
                  <div
                    key={type.value}
                    onClick={() => setImportType(type.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      importType === type.value 
                        ? "border-blue-300 bg-blue-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium text-slate-800">{type.label}</span>
                    </div>
                    <div className="text-sm text-slate-600">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">2. Upload Your File</h3>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="text-4xl">📄</div>
                    <div>
                      <div className="font-medium text-slate-800">{selectedFile.name}</div>
                      <div className="text-sm text-slate-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl">📁</div>
                    <div>
                      <div className="text-lg font-medium text-slate-800">Drop your file here</div>
                      <div className="text-slate-600">or click to browse</div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                    <div className="text-xs text-slate-500">
                      Supports CSV, Excel (.xlsx), and Google Sheets
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="flex justify-end">
                <button
                  onClick={() => setMappingStep(2)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: Map Columns →
                </button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">3. Map Your Columns</h3>
              <button
                onClick={() => setMappingStep(1)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back
              </button>
            </div>

            {/* Column Mapping */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-slate-800 mb-4">Your File Columns</h4>
                <div className="space-y-3">
                  {previewData.length > 0 && Object.keys(previewData[0]).map(column => (
                    <div key={column} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-800">{column}</div>
                      <div className="text-sm text-slate-600">
                        Sample: {previewData[0][column]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-4">Map to CRM Fields</h4>
                <div className="space-y-3">
                  {previewData.length > 0 && Object.keys(previewData[0]).map(column => (
                    <div key={column}>
                      <select
                        value={columnMappings[column] || ""}
                        onChange={(e) => handleColumnMapping(column, e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select CRM field...</option>
                        {sampleColumns[importType as keyof typeof sampleColumns]?.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="font-medium text-slate-800 mb-4">Data Preview</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(previewData[0] || {}).map(column => (
                        <th key={column} className="text-left py-3 px-4 font-medium text-slate-700">
                          {column}
                          {columnMappings[column] && (
                            <div className="text-xs text-blue-600 font-normal">
                              → {columnMappings[column]}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-3 px-4 text-slate-600">{value as string}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setMappingStep(1)}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setMappingStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Review & Import →
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">4. Review & Import</h3>
              <button
                onClick={() => setMappingStep(2)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back
              </button>
            </div>

            {/* Import Summary */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h4 className="font-medium text-slate-800 mb-4">Import Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-600">Import Type</div>
                  <div className="font-medium text-slate-800 capitalize">{importType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">File</div>
                  <div className="font-medium text-slate-800">{selectedFile?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Records</div>
                  <div className="font-medium text-slate-800">~500 records</div>
                </div>
              </div>
            </div>

            {/* Import Options */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="font-medium text-slate-800 mb-4">Import Options</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="skipDuplicates" className="w-4 h-4 text-blue-600" defaultChecked />
                  <label htmlFor="skipDuplicates" className="text-sm text-slate-700">
                    Skip duplicate records (based on email)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="updateExisting" className="w-4 h-4 text-blue-600" />
                  <label htmlFor="updateExisting" className="text-sm text-slate-700">
                    Update existing records with new data
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="sendNotification" className="w-4 h-4 text-blue-600" defaultChecked />
                  <label htmlFor="sendNotification" className="text-sm text-slate-700">
                    Send notification when import is complete
                  </label>
                </div>
              </div>
            </div>

            {isProcessing ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <div className="text-lg font-medium text-slate-800 mb-2">Importing Data...</div>
                <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-slate-600">{uploadProgress}% complete</div>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  onClick={() => setMappingStep(2)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleImport}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <span>🚀</span>
                  Start Import
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📥</span>
            Data Import
          </h1>
          <p className="text-slate-600 mt-2">Import your data from CSV, Excel, or other sources</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= mappingStep 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 ${
                    step < mappingStep ? "bg-blue-600" : "bg-slate-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>Select & Upload</span>
            <span>Map Columns</span>
            <span>Review & Import</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStep()}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>💡</span>
            Import Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">File Format</div>
              <div className="text-sm text-blue-700">
                Use CSV or Excel files. Ensure the first row contains column headers.
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-2">Data Quality</div>
              <div className="text-sm text-green-700">
                Clean your data before import. Remove empty rows and fix formatting issues.
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-800 mb-2">Duplicates</div>
              <div className="text-sm text-purple-700">
                We'll detect duplicates based on email addresses to prevent data duplication.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
