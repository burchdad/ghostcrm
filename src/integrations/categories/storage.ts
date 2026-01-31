import { IntegrationTemplate } from '../types';

export const storageIntegrations: IntegrationTemplate[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'File storage and synchronization service',
    category: 'Storage',
    type: 'oauth',
    icon: '📁',
    color: 'bg-yellow-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'folderId', label: 'Default Folder ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoUpload: false,
      folderStructure: 'organized',
      sharePermissions: 'view',
      enableVersioning: true
    }
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'File hosting service',
    category: 'Storage',
    type: 'oauth',
    icon: '📦',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'folderId', label: 'Default Folder', type: 'text', required: false, placeholder: '/CRM Files' }
    ],
    defaultSettings: {
      autoSync: true,
      enableSharing: false,
      compressionLevel: 'medium'
    }
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'File hosting service operated by Microsoft',
    category: 'Storage',
    type: 'oauth',
    icon: '☁️',
    color: 'bg-blue-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'folderId', label: 'Default Folder ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoSync: true,
      enableVersionHistory: true,
      shareByDefault: false
    }
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Cloud content management and file sharing service',
    category: 'Storage',
    type: 'oauth',
    icon: '📁',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'folderId', label: 'Default Folder ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoSync: true,
      enableWatermarking: false,
      retentionPolicy: 'indefinite'
    }
  },
  {
    id: 'aws-s3',
    name: 'Amazon S3',
    description: 'Object storage service offered by AWS',
    category: 'Storage',
    type: 'api-key',
    icon: '🪣',
    color: 'bg-orange-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
      { key: 'bucketName', label: 'Bucket Name', type: 'text', required: true }
    ],
    defaultSettings: {
      enableEncryption: true,
      storageClass: 'STANDARD',
      enableVersioning: false,
      publicRead: false
    }
  }
];

export default storageIntegrations;