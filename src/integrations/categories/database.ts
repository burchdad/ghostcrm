import { IntegrationTemplate } from '../types';

export const databaseIntegrations: IntegrationTemplate[] = [
  // Relational Databases
  {
    id: 'mysql',
    name: 'MySQL Database',
    description: 'Connect to MySQL database for custom data synchronization',
    category: 'Database',
    type: 'database',
    icon: '🗄️',
    color: 'bg-orange-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '3306' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'ssl', label: 'Use SSL', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      syncFrequency: '1hour',
      autoSync: true,
      maxConnections: 10
    }
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Database',
    description: 'Connect to PostgreSQL database for enterprise data integration',
    category: 'Database',
    type: 'database',
    icon: '🐘',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '5432' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'schema', label: 'Schema', type: 'text', required: false, placeholder: 'public' },
      { key: 'ssl', label: 'SSL Mode', type: 'select', required: false, options: ['disable', 'require', 'prefer'] }
    ],
    defaultSettings: {
      syncFrequency: '30min',
      autoSync: true,
      schema: 'public'
    }
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Connect to Supabase for real-time database, authentication, and API integration',
    category: 'Database',
    type: 'api-key',
    icon: '🚀',
    color: 'bg-green-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'url', label: 'Project URL', type: 'text', required: true, placeholder: 'https://your-project.supabase.co' },
      { key: 'anonKey', label: 'API Key (anon/public)', type: 'password', required: true, placeholder: 'Your anon public key' },
      { key: 'serviceKey', label: 'Service Role Key', type: 'password', required: false, placeholder: 'Your service role key (optional)' }
    ],
    defaultSettings: {
      syncFrequency: '5min',
      autoSync: true,
      realTimeEnabled: true
    }
  },
  {
    id: 'mssql',
    name: 'Microsoft SQL Server',
    description: 'Connect to Microsoft SQL Server for enterprise data management',
    category: 'Database',
    type: 'database',
    icon: '🏢',
    color: 'bg-blue-700',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Server', type: 'text', required: true },
      { key: 'port', label: 'Port', type: 'number', required: false, placeholder: '1433' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'instance', label: 'Instance', type: 'text', required: false },
      { key: 'encrypt', label: 'Encrypt Connection', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      syncFrequency: '1hour',
      autoSync: true,
      trustServerCertificate: true
    }
  },
  {
    id: 'oracle',
    name: 'Oracle Database',
    description: 'Connect to Oracle Database for enterprise applications',
    category: 'Database',
    type: 'database',
    icon: '🔴',
    color: 'bg-red-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '1521' },
      { key: 'serviceName', label: 'Service Name', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ],
    defaultSettings: {
      syncFrequency: '2hours',
      autoSync: false
    }
  },

  // NoSQL Databases
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Connect to MongoDB for flexible document-based data storage',
    category: 'Database',
    type: 'database',
    icon: '🍃',
    color: 'bg-green-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'connectionString', label: 'Connection String', type: 'text', required: true, placeholder: 'mongodb://localhost:27017/mydb' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'collection', label: 'Default Collection', type: 'text', required: false },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ],
    defaultSettings: {
      syncFrequency: '15min',
      autoSync: true,
      maxPoolSize: 10
    }
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'In-memory data structure store for caching and session management',
    category: 'Database',
    type: 'database',
    icon: '🔴',
    color: 'bg-red-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '6379' },
      { key: 'password', label: 'Password', type: 'password', required: false },
      { key: 'database', label: 'Database Number', type: 'number', required: false, placeholder: '0' },
      { key: 'ssl', label: 'Use SSL', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      timeout: 5000,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    }
  },
  {
    id: 'cassandra',
    name: 'Apache Cassandra',
    description: 'Distributed NoSQL database for handling large amounts of data',
    category: 'Database',
    type: 'database',
    icon: '⚡',
    color: 'bg-purple-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'contactPoints', label: 'Contact Points', type: 'text', required: true, placeholder: 'localhost:9042' },
      { key: 'keyspace', label: 'Keyspace', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false },
      { key: 'datacenter', label: 'Local Datacenter', type: 'text', required: false }
    ],
    defaultSettings: {
      consistency: 'LOCAL_QUORUM',
      timeout: 12000
    }
  },
  {
    id: 'couchdb',
    name: 'Apache CouchDB',
    description: 'Document-oriented NoSQL database with HTTP API',
    category: 'Database',
    type: 'database',
    icon: '🛋️',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'url', label: 'Database URL', type: 'url', required: true, placeholder: 'http://localhost:5984' },
      { key: 'database', label: 'Database Name', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ],
    defaultSettings: {
      timeout: 5000,
      autoSync: false
    }
  },

  // Cloud Databases
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    description: 'Fully managed NoSQL database service by AWS',
    category: 'Database',
    type: 'api-key',
    icon: '🚀',
    color: 'bg-yellow-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'region', label: 'AWS Region', type: 'select', required: true, options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
      { key: 'tableName', label: 'Default Table', type: 'text', required: false }
    ],
    defaultSettings: {
      consistentRead: false,
      maxRetries: 3
    }
  },
  {
    id: 'firestore',
    name: 'Google Firestore',
    description: 'Flexible, scalable NoSQL cloud database by Google',
    category: 'Database',
    type: 'api-key',
    icon: '🔥',
    color: 'bg-orange-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      { key: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea', required: true },
      { key: 'collection', label: 'Default Collection', type: 'text', required: false }
    ],
    defaultSettings: {
      timestampsInSnapshots: true,
      ignoreUndefinedProperties: true
    }
  },
  {
    id: 'cosmosdb',
    name: 'Azure Cosmos DB',
    description: 'Globally distributed, multi-model database service by Microsoft',
    category: 'Database',
    type: 'api-key',
    icon: '🌌',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'endpoint', label: 'Cosmos DB Endpoint', type: 'url', required: true },
      { key: 'key', label: 'Master Key', type: 'password', required: true },
      { key: 'databaseId', label: 'Database ID', type: 'text', required: true },
      { key: 'containerId', label: 'Container ID', type: 'text', required: false }
    ],
    defaultSettings: {
      consistencyLevel: 'Session',
      maxRetryAttempts: 9
    }
  },

  // Search & Analytics Databases
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    description: 'distributed search and analytics engine',
    category: 'Database',
    type: 'api-key',
    icon: '🔍',
    color: 'bg-yellow-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://localhost:9200' },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false },
      { key: 'index', label: 'Default Index', type: 'text', required: false },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false }
    ],
    defaultSettings: {
      maxRetries: 3,
      requestTimeout: 30000,
      sniffOnStart: false
    }
  },
  {
    id: 'solr',
    name: 'Apache Solr',
    description: 'Open-source enterprise-search platform',
    category: 'Database',
    type: 'api-key',
    icon: '☀️',
    color: 'bg-red-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'url', label: 'Solr URL', type: 'url', required: true, placeholder: 'http://localhost:8983/solr' },
      { key: 'core', label: 'Core/Collection', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ],
    defaultSettings: {
      timeout: 10000,
      autoCommit: true
    }
  },

  // Graph Databases
  {
    id: 'neo4j',
    name: 'Neo4j',
    description: 'Graph database management system for connected data',
    category: 'Database',
    type: 'database',
    icon: '🕸️',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'uri', label: 'Neo4j URI', type: 'url', required: true, placeholder: 'bolt://localhost:7687' },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'database', label: 'Database', type: 'text', required: false, placeholder: 'neo4j' }
    ],
    defaultSettings: {
      maxConnectionLifetime: 3600,
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 60000
    }
  },

  // Time-Series Databases
  {
    id: 'influxdb',
    name: 'InfluxDB',
    description: 'Time series database for metrics, events, and real-time analytics',
    category: 'Database',
    type: 'api-key',
    icon: '📈',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'url', label: 'InfluxDB URL', type: 'url', required: true, placeholder: 'http://localhost:8086' },
      { key: 'token', label: 'API Token', type: 'password', required: true },
      { key: 'org', label: 'Organization', type: 'text', required: true },
      { key: 'bucket', label: 'Default Bucket', type: 'text', required: false }
    ],
    defaultSettings: {
      timeout: 10000,
      precision: 'ns'
    }
  },

  // SQLite (File-based)
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Self-contained, serverless SQL database engine',
    category: 'Database',
    type: 'database',
    icon: '💾',
    color: 'bg-gray-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'filePath', label: 'Database File Path', type: 'text', required: true, placeholder: '/path/to/database.db' },
      { key: 'readOnly', label: 'Read Only', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      timeout: 5000,
      busyTimeout: 10000
    }
  }
];

export default databaseIntegrations;