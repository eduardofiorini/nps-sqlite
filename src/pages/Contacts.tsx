import React, { useState, useEffect } from 'react';
import { Contact, Group } from '../types';
import { 
  getContacts, 
  saveContact, 
  deleteContact, 
  getGroups, 
  searchContacts,
  getContactsByGroup 
} from '../utils/supabaseStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Building,
  Tag,
  Download,
  Upload,
  Filter,
  X,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(8);

  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, selectedGroup, selectedTags]);

  const loadData = async () => {
    try {
      const loadedContacts = await getContacts();
      const loadedGroups = await getGroups();
      
      setContacts(loadedContacts);
      setGroups(loadedGroups);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchQuery) {
      filtered = searchContacts(searchQuery);
    }

    // Group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(contact => 
        contact.groupIds.includes(selectedGroup)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact =>
        (contact.tags || []).some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredContacts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSave = async () => {
    if (!currentContact.name || !currentContact.email || !currentContact.phone) {
      alert('Nome, email e telefone são obrigatórios');
      return;
    }

    try {
      const contactToSave: Contact = {
        id: currentContact.id || '',
        name: currentContact.name,
        email: currentContact.email,
        phone: currentContact.phone,
        groupIds: currentContact.groupIds || [],
        company: currentContact.company || '',
        position: currentContact.position || '',
        tags: currentContact.tags || [],
        notes: currentContact.notes || '',
        lastContactDate: currentContact.lastContactDate,
        createdAt: currentContact.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveContact(contactToSave);
      await loadData();
      setModalOpen(false);
      setCurrentContact({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Erro ao salvar contato. Tente novamente.');
    }
  };

  const handleEdit = (contact: Contact) => {
    setCurrentContact({
      ...contact,
      tags: contact.tags || [] // Ensure tags is always an array
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await deleteContact(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Erro ao excluir contato. Tente novamente.');
      }
    }
  };

  const handleOpenModal = () => {
    setCurrentContact({ 
      groupIds: [],
      tags: [] // Ensure tags is always an array
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleGroupToggle = (groupId: string) => {
    const currentGroups = currentContact.groupIds || [];
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter(id => id !== groupId)
      : [...currentGroups, groupId];
    
    setCurrentContact({ ...currentContact, groupIds: newGroups });
  };

  const handleTagAdd = (tag: string) => {
    const currentTags = currentContact.tags || [];
    if (tag.trim() && !currentTags.includes(tag.trim())) {
      const newTags = [...currentTags, tag.trim()];
      setCurrentContact({ ...currentContact, tags: newTags });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = currentContact.tags || [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentContact({ ...currentContact, tags: newTags });
  };

  const exportContacts = () => {
    // Create CSV with proper UTF-8 encoding
    const csvRows = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Grupos', 'Tags', 'Notas'].join(','),
      ...filteredContacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.email}"`,
        `"${contact.phone}"`,
        `"${contact.company || ''}"`,
        `"${contact.position || ''}"`,
        `"${contact.groupIds.map(id => groups.find(g => g.id === id)?.name).filter(Boolean).join('; ')}"`,
        `"${(contact.tags || []).join('; ')}"`,
        `"${contact.notes || ''}"`
      ].join(','))
    ];
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\r\n');

    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contatos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Import Excel functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      parseExcelFile(file);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          setImportStatus('error');
          setImportMessage('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
          return;
        }

        // Parse CSV (simplified - assumes comma-separated)
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

        setImportPreview(data.slice(0, 5)); // Show first 5 rows for preview
        setImportStatus('idle');
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Erro ao ler o arquivo. Verifique se é um arquivo CSV válido.');
      }
    };

    reader.readAsText(file);
  };

  const processImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportStatus('processing');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const cleanText = text.replace(/^\uFEFF/, ''); // Remove BOM if present
          const lines = cleanText.split(/\r?\n/);
          
          // Improved CSV parser that handles UTF-8 properly
          const parseCSVLine = (line: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              const nextChar = line[i + 1];
              
              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  current += '"';
                  i++; // Skip next quote
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
            return result;
          };
          
          const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
          
          let successCount = 0;
          let errorCount = 0;

          lines.slice(1).forEach(line => {
            if (!line.trim()) return;

            try {
              const values = parseCSVLine(line);
              const row: any = {};
              headers.forEach((header, index) => {
                // Properly decode the value and handle UTF-8
                const value = values[index] || '';
                row[header] = value;
              });

              // Map common column names
              const contact: Contact = {
                id: '',
                name: row.nome || row.name || row['nome completo'] || '',
                email: row.email || row['e-mail'] || row.mail || '',
                phone: row.telefone || row.phone || row.celular || row.fone || '',
                groupIds: groups.length > 0 ? [groups[0].id] : [], // Default to first group
                company: row.empresa || row.company || '',
                position: row.cargo || row.position || row.funcao || '',
                tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
                notes: row.notas || row.notes || row.observacoes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              if (contact.name && contact.email && contact.phone) {
                saveContact(contact);
                successCount++;
              } else {
                errorCount++;
              }
            } catch (error) {
              errorCount++;
            }
          });

          setImportStatus('success');
          setImportMessage(`Importação concluída! ${successCount} contatos importados com sucesso. ${errorCount > 0 ? `${errorCount} linhas com erro.` : ''}`);
          loadData();
          
          setTimeout(() => {
            setImportModalOpen(false);
            setImportFile(null);
            setImportPreview([]);
            setImportStatus('idle');
            setImportMessage('');
          }, 3000);

        } catch (error) {
          setImportStatus('error');
          setImportMessage('Erro ao processar o arquivo. Verifique o formato.');
        } finally {
          setIsImporting(false);
        }
      };

      // Read with UTF-8 encoding explicitly
      reader.readAsText(importFile, 'UTF-8');
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Erro ao processar o arquivo.');
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateRows = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Tags', 'Notas'].join(','),
      ['João Silva', 'joao@email.com', '(11) 99999-9999', 'Tech Corp', 'Gerente', 'cliente;vip', 'Cliente importante'].join(','),
      ['Maria Santos', 'maria@empresa.com', '(11) 88888-8888', 'Marketing Pro', 'Diretora', 'parceiro', 'Contato de marketing'].join(',')
    ];
    
    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const template = BOM + templateRows.join('\r\n');

    const blob = new Blob([template], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-contatos.csv';
    link.click();
  };

  // Get all unique tags
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags || [])));

  // Pagination
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="mr-3" size={32} />
            Contatos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus contatos e organize por grupos
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<Upload size={16} />}
            onClick={() => setImportModalOpen(true)}
          >
            Importar Excel
          </Button>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={exportContacts}
          >
            Exportar
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
          >
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone ou empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button
                variant="outline"
                icon={showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros
              </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Group Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filtrar por Grupo
                      </label>
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">Todos os grupos</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filtrar por Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-[#073143] text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#073143] dark:text-white">
              {filteredContacts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredContacts.length !== contacts.length ? 'Contatos Filtrados' : 'Total de Contatos'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {groups.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Grupos Ativos
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {allTags.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tags Únicas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contacts.filter(c => c.company).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Com Empresa
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {indexOfFirstContact + 1} a {Math.min(indexOfLastContact, filteredContacts.length)} de {filteredContacts.length} contatos
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-[#073143] text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={<ChevronRight size={16} />}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={`Contatos (${filteredContacts.length})`}
        />
        <CardContent>
          {currentContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {contacts.length === 0 ? 'Nenhum contato ainda' : 'Nenhum contato encontrado'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {contacts.length === 0 
                  ? 'Adicione seu primeiro contato para começar a organizar sua rede.'
                  : 'Tente ajustar os filtros para encontrar os contatos que procura.'
                }
              </p>
              {contacts.length === 0 && (
                <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenModal}>
                  Adicionar Primeiro Contato
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  {/* Contact Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#073143] text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {contact.name}
                        </h3>
                        {contact.position && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.position}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-1 text-gray-400 hover:text-[#073143] dark:hover:text-white transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail size={12} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone size={12} className="mr-2 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.company && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building size={12} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                    )}
                  </div>

                  {/* Groups */}
                  {contact.groupIds.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.groupIds.slice(0, 2).map(groupId => {
                          const group = groups.find(g => g.id === groupId);
                          return group ? (
                            <Badge key={groupId} variant="secondary" className="text-xs">
                              {group.name}
                            </Badge>
                          ) : null;
                        })}
                        {contact.groupIds.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{contact.groupIds.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-[#073143]/10 dark:bg-[#073143]/20 text-[#073143] dark:text-white text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Preview */}
                  {contact.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {contact.notes}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-400">
                    Criado em {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${isEditing ? 'Editar' : 'Novo'} Contato`}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Nome *"
                value={currentContact.name || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                fullWidth
                required
                className="pl-10"
              />
              <div className="absolute top-9 left-3 text-gray-400">
                <User size={16} />
              </div>
            </div>

            <div className="relative">
              <Input
                label="Email *"
                type="email"
                value={currentContact.email || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                fullWidth
                required
                className="pl-10"
              />
              <div className="absolute top-9 left-3 text-gray-400">
                <Mail size={16} />
              </div>
            </div>

            <div className="relative">
              <Input
                label="Telefone *"
                value={currentContact.phone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                fullWidth
                required
                className="pl-10"
              />
              <div className="absolute top-9 left-3 text-gray-400">
                <Phone size={16} />
              </div>
            </div>

            <div className="relative">
              <Input
                label="Empresa"
                value={currentContact.company || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                fullWidth
                className="pl-10"
              />
              <div className="absolute top-9 left-3 text-gray-400">
                <Building size={16} />
              </div>
            </div>

            <div className="relative md:col-span-2">
              <Input
                label="Cargo"
                value={currentContact.position || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, position: e.target.value })}
                fullWidth
                className="pl-10"
              />
              <div className="absolute top-9 left-3 text-gray-400">
                <Briefcase size={16} />
              </div>
            </div>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Grupos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {groups.map(group => (
                <label key={group.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentContact.groupIds?.includes(group.id) || false}
                    onChange={() => handleGroupToggle(group.id)}
                    className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(currentContact.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#073143]/10 dark:bg-[#073143]/20 text-[#073143] dark:text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Adicionar tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Tag size={14} />}
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input');
                    if (input?.value) {
                      handleTagAdd(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={currentContact.notes || ''}
              onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Adicione notas sobre este contato..."
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importar Contatos do Excel"
        size="lg"
        footer={
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              icon={<FileSpreadsheet size={16} />}
            >
              Baixar Template
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                Cancelar
              </Button>
              {importFile && importStatus === 'idle' && (
                <Button 
                  variant="primary" 
                  onClick={processImport}
                  isLoading={isImporting}
                  icon={<Upload size={16} />}
                >
                  Importar Contatos
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Instruções para Importação
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• O arquivo deve estar no formato CSV (separado por vírgulas)</li>
              <li>• Colunas aceitas: Nome, Email, Telefone, Empresa, Cargo, Tags, Notas</li>
              <li>• Nome, Email e Telefone são obrigatórios</li>
              <li>• Tags devem ser separadas por ponto e vírgula (;)</li>
              <li>• Baixe o template para ver o formato correto</li>
            </ul>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecionar Arquivo CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clique para selecionar um arquivo CSV ou arraste aqui
                </p>
                {importFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Arquivo selecionado: {importFile.name}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {importStatus === 'error' && (
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Erro na Importação</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{importMessage}</p>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Importação Concluída</h4>
                <p className="text-sm text-green-700 dark:text-green-300">{importMessage}</p>
              </div>
            </div>
          )}

          {importStatus === 'processing' && (
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Processando...</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Importando contatos, aguarde...</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {importPreview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pré-visualização (primeiras 5 linhas)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {Object.keys(importPreview[0] || {}).map(key => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {importPreview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;