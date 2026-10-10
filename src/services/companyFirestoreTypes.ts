/**
 * Tipos e Modelos de Dados para Gestão de Empresas e Membros (Multi-Tenancy)
 * WebErpMes Industrial — Fase 2B.2
 */

export type CompanyStatus = 'active' | 'suspended' | 'inactive';

export type CompanyMemberRole = 'admin' | 'member';

export type CompanyMemberStatus = 'active' | 'inactive' | 'pending';

/**
 * Modelo de documento da Empresa no Cloud Firestore (`companies/{companyId}`)
 */
export interface CompanyDocument {
  id: string;                    // Identificador estável (ID do documento)
  name: string;                  // Razão Social ou Nome Fantasia da Indústria
  tradeName?: string;            // Nome de exibição resumido
  cnpj?: string;                 // Cadastro Nacional de Pessoa Jurídica
  code?: string;                 // Código identificador único (ex: IND-01)
  status: CompanyStatus;         // Situação cadastral
  createdAt: string;             // ISO Timestamp de criação
  updatedAt?: string;            // ISO Timestamp da última alteração
  settings?: {
    defaultTimezone?: string;
    industrialSegment?: string;
  };
}

/**
 * Modelo de associação entre Empresa e Usuário Autenticado
 * Localização no Firestore: `companies/{companyId}/members/{uid}`
 */
export interface CompanyMemberDocument {
  uid: string;                   // Firebase Auth UID do usuário
  companyId: string;             // ID da empresa correspondente (chave estável)
  email: string;                 // E-mail registrado do usuário
  displayName?: string;          // Nome de exibição do operador/gestor
  role: CompanyMemberRole;       // Papel: 'admin' (gestor da empresa) ou 'member' (operador/engenheiro)
  status: CompanyMemberStatus;   // Situação do vínculo ('active', 'inactive', 'pending')
  joinedAt: string;              // ISO Timestamp de inclusão na empresa
  updatedAt?: string;            // ISO Timestamp da última atualização de cargo
  assignedByUid?: string;        // UID do administrador que vinculou o membro
}

/**
 * Estrutura combinada utilizada pela aplicação frontend após autenticação
 */
export interface UserActiveMembership {
  company: CompanyDocument;
  member: CompanyMemberDocument;
}
